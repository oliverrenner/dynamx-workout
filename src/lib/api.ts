import type { Level, Profile, SessionPayload, Workout } from '../types';

const LOCAL_USER = { id: 'local-user', email: 'oliver@example.com', name: 'Oliver Renner' };
const LOCAL_PROFILE_KEY = 'dynamx.local.profiles';
const LOCAL_WORKOUT_KEY = 'dynamx.local.workouts';

function localProfiles(): Profile[] {
  const stored = localStorage.getItem(LOCAL_PROFILE_KEY);
  if (stored) return JSON.parse(stored) as Profile[];
  const seeded: Profile[] = [
    { id: 'oliver', name: 'Oliver', level: 'regular', createdAt: new Date().toISOString() },
    { id: 'katrin', name: 'Katrin', level: 'regular', createdAt: new Date().toISOString() },
  ];
  localStorage.setItem(LOCAL_PROFILE_KEY, JSON.stringify(seeded));
  return seeded;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, {
    ...init,
    headers: { 'content-type': 'application/json', ...init?.headers },
  });
  if (!response.ok) {
    const body = await response.json().catch(() => ({ error: 'Something went wrong.' })) as { error?: string };
    throw new Error(body.error || 'Something went wrong.');
  }
  return response.json() as Promise<T>;
}

export const api = {
  async session(): Promise<SessionPayload | null> {
    if (import.meta.env.DEV) {
      if (new URLSearchParams(window.location.search).has('login')) return null;
      return { user: LOCAL_USER, profiles: localProfiles() };
    }
    const response = await fetch('/api/me');
    if (response.status === 401) return null;
    if (!response.ok) throw new Error('Could not load your account.');
    return response.json() as Promise<SessionPayload>;
  },
  async addProfile(name: string, level: Level): Promise<Profile> {
    if (import.meta.env.DEV) {
      const profile = { id: crypto.randomUUID(), name, level, createdAt: new Date().toISOString() };
      localStorage.setItem(LOCAL_PROFILE_KEY, JSON.stringify([...localProfiles(), profile]));
      return profile;
    }
    return request<Profile>('/api/profiles', { method: 'POST', body: JSON.stringify({ name, level }) });
  },
  async updateProfile(id: string, name: string, level: Level): Promise<Profile> {
    if (import.meta.env.DEV) {
      const profiles = localProfiles().map((profile) => profile.id === id ? { ...profile, name, level } : profile);
      localStorage.setItem(LOCAL_PROFILE_KEY, JSON.stringify(profiles));
      return profiles.find((profile) => profile.id === id)!;
    }
    return request<Profile>(`/api/profiles/${id}`, { method: 'PATCH', body: JSON.stringify({ name, level }) });
  },
  async deleteProfile(id: string): Promise<void> {
    if (import.meta.env.DEV) {
      localStorage.setItem(LOCAL_PROFILE_KEY, JSON.stringify(localProfiles().filter((profile) => profile.id !== id)));
      return;
    }
    await request<{ ok: true }>(`/api/profiles/${id}`, { method: 'DELETE' });
  },
  async saveWorkout(workout: Workout): Promise<void> {
    if (import.meta.env.DEV) {
      const workouts = JSON.parse(localStorage.getItem(LOCAL_WORKOUT_KEY) || '[]') as Workout[];
      localStorage.setItem(LOCAL_WORKOUT_KEY, JSON.stringify([workout, ...workouts].slice(0, 20)));
      return;
    }
    await request<{ ok: true }>('/api/workouts', { method: 'POST', body: JSON.stringify(workout) });
  },
  async workouts(): Promise<Workout[]> {
    if (import.meta.env.DEV) return JSON.parse(localStorage.getItem(LOCAL_WORKOUT_KEY) || '[]') as Workout[];
    return request<Workout[]>('/api/workouts');
  },
};
