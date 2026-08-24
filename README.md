# Dynamx Workout

A deliberately small workout generator for one or more people. Pick the profiles, format, and available equipment; the app creates a single printable overview table with a prescription for each person.

## Product rules

- `3 × 3` means 3 blocks of 3 exercises; `4 × 3` and `4 × 2` follow the same pattern.
- No selected equipment means bodyweight-only.
- Exercises are curated in `src/data/exercises.ts`.
- A profile level changes only the tight rep/time prescription in the table.
- Profiles and generated workouts are stored in Cloudflare D1.

## Local development

```sh
npm install
npm run dev
```

Vite development uses a local, seeded Oliver + Katrin session so the interface can be developed without OAuth. Production always uses Google OAuth.
Append `?login=1` locally to preview the signed-out screen.

## Verification

```sh
npm run check
```

## Cloudflare Pages

The production Pages project and D1 database are both named `dynamx-workout`. Apply migrations with Wrangler, configure the Google client ID in `wrangler.jsonc`, set `GOOGLE_CLIENT_SECRET` as a Pages secret, build, then deploy.

The authorized OAuth redirect URI is:

```text
https://workout.dynamx.io/api/auth/callback
```
