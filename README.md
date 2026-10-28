# Phoenix Tattooz Studio & Academy

Full-stack website + studio management platform for **Phoenix Tattooz Studio & Academy**, Hisar (Haryana).

React 19 · TypeScript · Tailwind CSS v4 · Vite · Supabase · Express · Vercel Serverless Functions

---

## What's inside

### Public Site
- **Home**: Dynamic hero with video/image backgrounds, studio overview, featured tattoos, artist showcase, video wall, philosophy, and real-time customer reviews.
- **Appointment Booking Flow**: Multi-step booking engine (service, artist, placement, dimensions, preferred date/time slot, and instant WhatsApp confirmation).
- **Studio Club & Member Portal**: Member signup/signin, birthday perks, and referral rewards system with auto-generated single-use voucher codes.
- **AI Studio Chatbot**: Built-in intelligent chatbot equipped with studio knowledge base and optional Google Gemini API integration.
- **Review Wall & Submission**: Interactive customer review showcase with client submission modal and admin moderation.
- **Contact & Location**: Interactive Google Maps integration, one-tap calling, and direct WhatsApp chat.

### Admin Dashboard (`/admin`)
- **Bookings & Inquiries**: Real-time management of client appointment bookings and contact inquiries.
- **Member Management**: Track studio club members, reward vouchers, and member activity log.
- **Full CMS Suite**: Live visual customization of Hero banner, Studio Logo, Artists, Tattoo Gallery, Video Showcase, Customer Reviews, and Philosophy section.
- **Realtime Sync**: Live refresh via Supabase Realtime when connected to remote database.

---

## Quick Start (Local Run)

The repository comes pre-configured for **instant local execution** with a file-backed store (`data/studio_store.json`), meaning **no database setup is required to run and test locally**.

```bash
# 1. Install dependencies
npm install

# 2. Start the development server (Vite frontend + Express API)
npm run dev
```

Open your browser at:
- **Public Site**: [http://localhost:3000](http://localhost:3000)
- **Admin Panel**: [http://localhost:3000/admin](http://localhost:3000/admin)

> **Default Local Admin Credentials:**
> - Email: `admin@phoenixtattooz.local`
> - Password: `PhoenixClone2026!`

---

## Project Structure

```text
phoenix/
├── api/                       # Vercel Serverless Function entry point
│   └── [...all].ts            # Single catch-all router for /api/* requests
├── backend/                   # Backend API logic & handlers
│   ├── routes/                # Endpoint handlers (auth, rewards, admin, content, reviews, chat)
│   └── lib/                   # Auth helpers, Supabase REST client, HTTP utilities, AI brain
├── docs/                      # Comprehensive guides and documentation
│   ├── DEPLOY-VERCEL.md       # Step-by-step Vercel deployment guide
│   ├── FEATURE-AUDIT.md       # Parity audit and full feature matrix
│   ├── HANDOFF.md             # Quick handoff checklist & deployment notes
│   ├── README-CLONE.md        # Architecture & rebuild notes
│   └── SUPABASE-SETUP.md      # Database schema, tables, and RLS policies
├── data/                      # Local JSON store & fallback content
│   └── studio_store.json      # File-backed local database
├── public/                    # Static assets, logos, and studio video files
├── scripts/                   # Test runners, mock emulator, and utility scripts
├── src/                       # React frontend application
│   ├── components/            # UI components and Admin CMS managers
│   ├── data/                  # Static studio seed data
│   ├── lib/                   # Client auth, Supabase integration, and state management
│   ├── pages/                 # Application page views
│   ├── App.tsx                # Application routes and main layout
│   └── main.tsx               # Client entry point
├── .env                       # Local environment variables
├── .env.example               # Environment variables template
├── package.json               # NPM scripts and dependencies
├── server.ts                  # Local Express development server
├── supabase-schema.sql        # Supabase PostgreSQL schema & RLS setup
└── vite.config.ts             # Vite build configuration
```

---

## Connect Supabase & Deploy

When you are ready to transition from local file-store mode to a live Supabase database:

1. Create a Supabase project at [supabase.com](https://supabase.com).
2. Go to **SQL Editor** -> Paste and execute [`supabase-schema.sql`](./supabase-schema.sql).
3. Under **Authentication -> Users**, create your admin user (select *Auto Confirm*).
4. Update your `.env` (or Vercel environment variables):

```env
VITE_USE_REMOTE_SUPABASE="true"
VITE_SUPABASE_URL="https://YOUR-PROJECT.supabase.co"
VITE_SUPABASE_ANON_KEY="your-anon-publishable-key"
SUPABASE_URL="https://YOUR-PROJECT.supabase.co"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-secret-key"
```

For complete step-by-step instructions, see:
- [`docs/DEPLOY-VERCEL.md`](./docs/DEPLOY-VERCEL.md) - Full deployment guide for Vercel + Supabase
- [`docs/SUPABASE-SETUP.md`](./docs/SUPABASE-SETUP.md) - Database configuration details

---

## Available Scripts

| Script | Command | Description |
|---|---|---|
| `npm run dev` | `node ./node_modules/tsx/dist/cli.mjs server.ts` | Start Vite & Express on `http://localhost:3000` |
| `npm run build` | `vite build` | Build production bundle into `dist/` |
| `npm start` | `node ./node_modules/tsx/dist/cli.mjs server.ts` | Serve production build via Express |
| `npm run lint` | `tsc --noEmit` | Check TypeScript type validity |
| `npm run clean` | Cross-platform cleanup | Remove `dist` and generated artifacts |
| `npm run api:smoke` | `node scripts/api-functions-smoke.mjs` | Run 23 automated offline API & auth tests |
| `npm run smoke` | `node scripts/api-smoke.mjs` | 14 full-application functional checks |
| `npm run ui:smoke` | `node scripts/ui-smoke.mjs` | Mobile and responsive UI validation |

---

## Documentation Index

All extended documentation is organized under the [`docs/`](./docs) directory:

- 📖 [**Handoff Guide**](./docs/HANDOFF.md) — Quick summary and release notes.
- 🚀 [**Vercel Deployment Guide**](./docs/DEPLOY-VERCEL.md) — Production deployment instructions.
- 🗄️ [**Supabase Setup Guide**](./docs/SUPABASE-SETUP.md) — Database schema, tables, and settings.
- 📋 [**Feature Parity Audit**](./docs/FEATURE-AUDIT.md) — Detailed feature checklist and audit report.
- 🛠️ [**Clone Architecture Notes**](./docs/README-CLONE.md) — Rebuild architecture and design decisions.

---

## License

This project is open-source under the Apache-2.0 License.
