interface Env {
  DB: D1Database;
  APP_URL: string;
  GOOGLE_CLIENT_ID: string;
  GOOGLE_CLIENT_SECRET: string;
}

type Authed = { id: string; email: string; name: string; picture: string | null };
const COOKIE = '__Host-dynamx_session';
const STATE_COOKIE = '__Host-dynamx_oauth_state';

const json = (value: unknown, status = 200, headers: HeadersInit = {}) => new Response(JSON.stringify(value), {
  status,
  headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store', ...headers },
});

const base64url = (bytes: Uint8Array) => btoa(String.fromCharCode(...bytes)).replaceAll('+', '-').replaceAll('/', '_').replaceAll('=', '');
const randomToken = (size = 32) => base64url(crypto.getRandomValues(new Uint8Array(size)));
const sha256 = async (value: string) => base64url(new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value))));
const cookieValue = (request: Request, name: string) => request.headers.get('cookie')?.split(';').map((part) => part.trim()).find((part) => part.startsWith(`${name}=`))?.slice(name.length + 1);
const futureIso = (days: number) => new Date(Date.now() + days * 86400000).toISOString();
const safeName = (value: unknown) => typeof value === 'string' ? value.trim().slice(0, 32) : '';
const safeLevel = (value: unknown) => ['beginner', 'regular', 'advanced'].includes(String(value)) ? String(value) : 'regular';

async function currentUser(request: Request, env: Env): Promise<Authed | null> {
  const token = cookieValue(request, COOKIE);
  if (!token) return null;
  return env.DB.prepare(`
    SELECT users.id, users.email, users.name, users.picture
    FROM sessions JOIN users ON users.id = sessions.user_id
    WHERE sessions.token_hash = ? AND sessions.expires_at > ?
  `).bind(await sha256(token), new Date().toISOString()).first<Authed>();
}

async function readBody(request: Request): Promise<Record<string, unknown>> {
  if (!request.headers.get('content-type')?.includes('application/json')) throw new Error('Expected JSON.');
  return request.json<Record<string, unknown>>();
}

async function login(env: Env): Promise<Response> {
  const state = randomToken();
  const verifier = randomToken(48);
  const challenge = await sha256(verifier);
  await env.DB.prepare('DELETE FROM oauth_states WHERE expires_at <= ?').bind(new Date().toISOString()).run();
  await env.DB.prepare('INSERT INTO oauth_states (state_hash, code_verifier, expires_at) VALUES (?, ?, ?)')
    .bind(await sha256(state), verifier, futureIso(1 / 24)).run();
  const callback = `${env.APP_URL}/api/auth/callback`;
  const params = new URLSearchParams({
    client_id: env.GOOGLE_CLIENT_ID,
    redirect_uri: callback,
    response_type: 'code',
    scope: 'openid email profile',
    state,
    code_challenge: challenge,
    code_challenge_method: 'S256',
    prompt: 'select_account',
  });
  return new Response(null, {
    status: 302,
    headers: {
      location: `https://accounts.google.com/o/oauth2/v2/auth?${params}`,
      'set-cookie': `${STATE_COOKIE}=${state}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=3600`,
      'cache-control': 'no-store',
    },
  });
}

async function callback(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);
  const state = url.searchParams.get('state');
  const code = url.searchParams.get('code');
  if (!state || !code || cookieValue(request, STATE_COOKIE) !== state) return Response.redirect(`${env.APP_URL}/?auth=failed`, 302);

  const stateHash = await sha256(state);
  const stored = await env.DB.prepare('SELECT code_verifier FROM oauth_states WHERE state_hash = ? AND expires_at > ?')
    .bind(stateHash, new Date().toISOString()).first<{ code_verifier: string }>();
  if (!stored) return Response.redirect(`${env.APP_URL}/?auth=expired`, 302);
  await env.DB.prepare('DELETE FROM oauth_states WHERE state_hash = ?').bind(stateHash).run();

  const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: env.GOOGLE_CLIENT_ID,
      client_secret: env.GOOGLE_CLIENT_SECRET,
      code,
      code_verifier: stored.code_verifier,
      grant_type: 'authorization_code',
      redirect_uri: `${env.APP_URL}/api/auth/callback`,
    }),
  });
  if (!tokenResponse.ok) return Response.redirect(`${env.APP_URL}/?auth=failed`, 302);
  const tokens = await tokenResponse.json<{ access_token: string }>();
  const infoResponse = await fetch('https://openidconnect.googleapis.com/v1/userinfo', { headers: { authorization: `Bearer ${tokens.access_token}` } });
  if (!infoResponse.ok) return Response.redirect(`${env.APP_URL}/?auth=failed`, 302);
  const info = await infoResponse.json<{ sub: string; email: string; name: string; given_name?: string; picture?: string }>();

  let user = await env.DB.prepare('SELECT id FROM users WHERE google_sub = ?').bind(info.sub).first<{ id: string }>();
  if (!user) {
    user = { id: crypto.randomUUID() };
    await env.DB.batch([
      env.DB.prepare('INSERT INTO users (id, google_sub, email, name, picture) VALUES (?, ?, ?, ?, ?)').bind(user.id, info.sub, info.email, info.name, info.picture || null),
      env.DB.prepare('INSERT INTO profiles (id, user_id, name, level) VALUES (?, ?, ?, ?)').bind(crypto.randomUUID(), user.id, safeName(info.given_name || info.name.split(' ')[0]) || 'Me', 'regular'),
    ]);
  } else {
    await env.DB.prepare("UPDATE users SET email = ?, name = ?, picture = ?, updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now') WHERE id = ?")
      .bind(info.email, info.name, info.picture || null, user.id).run();
  }

  const session = randomToken(48);
  await env.DB.prepare('INSERT INTO sessions (token_hash, user_id, expires_at) VALUES (?, ?, ?)')
    .bind(await sha256(session), user.id, futureIso(30)).run();
  const headers = new Headers({ location: `${env.APP_URL}/`, 'cache-control': 'no-store' });
  headers.append('set-cookie', `${COOKIE}=${session}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=2592000`);
  headers.append('set-cookie', `${STATE_COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`);
  return new Response(null, { status: 302, headers });
}

async function logout(request: Request, env: Env): Promise<Response> {
  const token = cookieValue(request, COOKIE);
  if (token) await env.DB.prepare('DELETE FROM sessions WHERE token_hash = ?').bind(await sha256(token)).run();
  return new Response(null, { status: 302, headers: { location: env.APP_URL, 'set-cookie': `${COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0` } });
}

async function route(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);
  const path = url.pathname;
  if (request.method === 'GET' && path === '/api/auth/login') return login(env);
  if (request.method === 'GET' && path === '/api/auth/callback') return callback(request, env);
  if (request.method === 'GET' && path === '/api/auth/logout') return logout(request, env);

  const user = await currentUser(request, env);
  if (!user) return json({ error: 'Not signed in.' }, 401);

  if (request.method === 'GET' && path === '/api/me') {
    const result = await env.DB.prepare('SELECT id, name, level, created_at AS createdAt FROM profiles WHERE user_id = ? ORDER BY created_at').bind(user.id).all();
    return json({ user, profiles: result.results });
  }

  if (request.method === 'POST' && path === '/api/profiles') {
    const count = await env.DB.prepare('SELECT COUNT(*) AS count FROM profiles WHERE user_id = ?').bind(user.id).first<{ count: number }>();
    if ((count?.count || 0) >= 8) return json({ error: 'You can save up to 8 people.' }, 400);
    const body = await readBody(request);
    const name = safeName(body.name);
    const level = safeLevel(body.level);
    if (!name) return json({ error: 'Name is required.' }, 400);
    const profile = { id: crypto.randomUUID(), name, level, createdAt: new Date().toISOString() };
    await env.DB.prepare('INSERT INTO profiles (id, user_id, name, level, created_at) VALUES (?, ?, ?, ?, ?)').bind(profile.id, user.id, name, level, profile.createdAt).run();
    return json(profile, 201);
  }

  const profileMatch = path.match(/^\/api\/profiles\/([^/]+)$/);
  if (profileMatch && request.method === 'PATCH') {
    const body = await readBody(request);
    const name = safeName(body.name);
    const level = safeLevel(body.level);
    if (!name) return json({ error: 'Name is required.' }, 400);
    const found = await env.DB.prepare("UPDATE profiles SET name = ?, level = ?, updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now') WHERE id = ? AND user_id = ? RETURNING id, name, level, created_at AS createdAt")
      .bind(name, level, profileMatch[1], user.id).first();
    return found ? json(found) : json({ error: 'Person not found.' }, 404);
  }
  if (profileMatch && request.method === 'DELETE') {
    await env.DB.prepare('DELETE FROM profiles WHERE id = ? AND user_id = ?').bind(profileMatch[1], user.id).run();
    return json({ ok: true });
  }

  if (request.method === 'POST' && path === '/api/workouts') {
    const body = await readBody(request);
    if (!['3x3', '4x2'].includes(String(body.format)) || !Array.isArray(body.blocks) || !Array.isArray(body.people)) return json({ error: 'Invalid workout.' }, 400);
    const payload = JSON.stringify(body);
    if (payload.length > 50000) return json({ error: 'Workout is too large.' }, 413);
    await env.DB.prepare('INSERT INTO workouts (id, user_id, format, equipment_json, workout_json, created_at) VALUES (?, ?, ?, ?, ?, ?)')
      .bind(String(body.id), user.id, String(body.format), JSON.stringify(body.equipment || []), payload, String(body.createdAt || new Date().toISOString())).run();
    return json({ ok: true }, 201);
  }

  if (request.method === 'GET' && path === '/api/workouts') {
    const result = await env.DB.prepare("SELECT workout_json FROM workouts WHERE user_id = ? AND format IN ('3x3', '4x2') ORDER BY created_at DESC LIMIT 20").bind(user.id).all<{ workout_json: string }>();
    return json(result.results.map((row) => JSON.parse(row.workout_json)));
  }

  return json({ error: 'Not found.' }, 404);
}

export const onRequest: PagesFunction<Env> = async ({ request, env }) => {
  try {
    const response = await route(request, env);
    const headers = new Headers(response.headers);
    headers.set('x-content-type-options', 'nosniff');
    headers.set('referrer-policy', 'strict-origin-when-cross-origin');
    headers.set('permissions-policy', 'camera=(), microphone=(), geolocation=()');
    return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
  } catch (error) {
    console.error(error);
    return json({ error: 'Something went wrong.' }, 500);
  }
};
