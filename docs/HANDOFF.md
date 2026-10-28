# Handoff — read this first

This repo is ready to push to GitHub and deploy to Vercel.

## Local run

```bash
npm install          # .npmrc already handles peer deps
npm run dev          # http://localhost:3000
```

Runs in **local mode** by default — no Supabase needed. Bookings, members and CMS content
are stored in `data/studio_store.json`.

Local admin: `/admin` → `admin@phoenixtattooz.local` / `PhoenixClone2026!`

## Tests

```bash
npm run lint        # TypeScript
npm run build       # production bundle
npm run api:smoke   # 23 API checks (no live project needed)
npm run smoke       # 14 full-app checks  (needs `npm run dev` running)
npm run ui:smoke    # 16 mobile/tablet UI checks (needs dev server + Playwright browsers)
```

## Deploy

Follow [`DEPLOY-VERCEL.md`](./DEPLOY-VERCEL.md). Short version:

1. Run `supabase-schema.sql` in the Supabase SQL Editor.
2. Create an admin user in Supabase → Authentication → Users (Auto Confirm).
3. Vercel env vars: `VITE_USE_REMOTE_SUPABASE`, `VITE_SUPABASE_URL`,
   `VITE_SUPABASE_ANON_KEY` (browser) + `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` (server).
4. Deploy, then open `/api/health` to confirm everything is wired.

## Architecture in one line

`dist/` (static SPA) + **one** serverless function `api/[...all].ts` that routes into
`backend/routes/*` and talks to Supabase with the service-role key.
