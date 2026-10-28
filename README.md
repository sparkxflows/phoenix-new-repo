# Phoenix Tattooz Studio & Academy

Full-stack website + studio management platform for **Phoenix Tattooz Studio & Academy**, Hisar (Haryana).

React 19 · TypeScript · Tailwind v4 · Vite · Supabase · Vercel Serverless Functions

---

## What's inside

**Public site**
- Home with animated hero (video/image background), artists, gallery, video wall, philosophy, reviews, contact and booking
- Multi-step **Book Appointment** flow with service, artist, placement, size, date/time slot and WhatsApp confirmation
- Contact form, Google Maps embed, call/WhatsApp links, mobile bottom bar
- "Phoenix AI" chatbot widget
- Studio Club: member signup/signin, birthday & referral rewards with one-time voucher codes
- Review wall

**Admin (`/admin`)**
- Dashboard with bookings, inquiries, members and activity log
- CMS managers: hero (text + video upload), logo, artists, gallery, video gallery, reviews, philosophy, gifts & rewards
- Live refresh via Supabase Realtime

---

## Quick start (local)

```bash
npm install            # .npmrc already sets legacy-peer-deps=true
cp .env.example .env   # then fill in your values (optional for local mode)

npm run dev            # http://localhost:3000  (Vite + Express API)
```

Out of the box the app runs in **local mode** — bookings, members, CMS and uploads are stored in
`data/studio_store.json` and `data/uploads/`, so you can explore everything without a Supabase
project.

Default local admin: `/admin` → `admin@phoenixtattooz.local` / `PhoenixClone2026!`

---

## Connect Supabase

1. Create a project → **SQL Editor** → paste and run [`supabase-schema.sql`](./supabase-schema.sql)
   (creates 6 tables, indexes, RLS policies, realtime publication and the `studio-uploads` bucket).
2. Create your admin under **Authentication → Users → Add user** (tick *Auto Confirm*).
3. Copy the project URL, **publishable** key and **service role** key into `.env`.

Full walkthrough, including Vercel: **[`DEPLOY-VERCEL.md`](./DEPLOY-VERCEL.md)**

---

## Environment variables

| Variable | Scope | Purpose |
|---|---|---|
| `VITE_USE_REMOTE_SUPABASE` | browser | `true` = use Supabase, `false` = local file store |
| `VITE_SUPABASE_URL` | browser | project URL |
| `VITE_SUPABASE_ANON_KEY` | browser | **publishable** key only |
| `SUPABASE_URL` | server | project URL for the API layer |
| `SUPABASE_SERVICE_ROLE_KEY` | server | full DB access — never expose |
| `GEMINI_API_KEY` | server | optional, enables real AI chatbot answers |
| `AUTH_TOKEN_SECRET` | server | optional, signs member sessions |

`VERCEL`'s Supabase integration may inject `SUPABASE_*`, `NEXT_PUBLIC_*` and `POSTGRES_*` names.
The server layer accepts those, but **Vite only reads `VITE_*`**, so the three browser variables are
always required.

---

## Project structure

```
api/
└── [...all].ts          single Vercel Serverless Function (catch-all router)

backend/
├── routes/              one file per endpoint (see the ROUTES table in api/[...all].ts)
│   ├── auth/            signup · signin · me · signout
│   ├── rewards/         claim · my-claims
│   ├── admin/           login · status · register · members
│   ├── content/         CMS read/write (site_settings)
│   ├── reviews · chat · health · app-info
│   └── upload-image · upload-video · upload-sign
└── lib/                 env · supabase REST client · HMAC tokens · http helpers · AI brain

src/
├── components/          UI + admin managers
├── pages/               route pages
├── lib/                 supabase client, content stores, auth, direct upload
└── data/                seed artists, gallery, reviews

server.ts                Express server for local development (same /api contract)
supabase-schema.sql      complete, idempotent database schema
```

> **Why one API function?** Vercel's Hobby plan allows at most 12 Serverless Functions per
> deployment. A single catch-all router keeps the whole backend in one function. Adding a new
> endpoint = one file in `backend/routes/` + one line in `api/[...all].ts`.

---

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Vite + Express on :3000 |
| `npm run build` | production bundle → `dist/` |
| `npm start` | serve the built app via Express |
| `npm run lint` | TypeScript check (`tsc --noEmit`) |
| `npm run api:dev` | run only the Vercel API layer on :4000 |
| `npm run api:smoke` | 23 end-to-end API checks against a mock Supabase |
| `npm run smoke` | 14 full-app checks (Express + storage + auth + rewards) |
| `npm run ui:smoke` | 16 mobile/tablet UI checks (Playwright) |

`api:smoke` never touches a real project — it boots `scripts/mock-supabase.mjs`, so the whole flow
is verifiable offline.

---

## Security notes

- Only the **publishable** Supabase key is bundled into the browser build.
- `SUPABASE_SERVICE_ROLE_KEY` lives only in server environment variables.
- `admin_users`, `member_users` and `member_activity_log` have no anonymous RLS policies — they are
  reachable only through `/api/*` with the service role.
- Admin passwords are verified server-side (Supabase Auth first, then the
  `admin_users` hash: `sha256(password + 'phoenix_tattooz_secure_2019_hisar')`).
- Member sessions are HMAC-signed tokens, so they survive serverless cold starts.
- Large uploads go **browser → Supabase Storage** through a signed URL, avoiding the ~4.5 MB
  serverless request-body limit.

---

## Docs

- [`DEPLOY-VERCEL.md`](./DEPLOY-VERCEL.md) — deploy checklist, verification steps, troubleshooting
- [`SUPABASE-SETUP.md`](./SUPABASE-SETUP.md) — database, `site_settings` keys, env reference
- [`README-CLONE.md`](./README-CLONE.md) — how this project was rebuilt from the original site
- [`FEATURE-AUDIT.md`](./FEATURE-AUDIT.md) — feature-by-feature parity audit
