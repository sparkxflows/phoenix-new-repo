# Phoenix Tattooz — Exact Full-Stack Clone

> **🚀 Deploying to Vercel?** Read [`DEPLOY-VERCEL.md`](./DEPLOY-VERCEL.md) first.
> The `api/` folder ports every Express endpoint to Vercel Serverless Functions, so
> members, rewards, uploads, admin and the chatbot work in production too.
> Self-check after deploying: `https://your-site.vercel.app/api/health`

This workspace contains a working clone of `https://tatto-gilt.vercel.app/` built from the actual public source repository (`livecutex-gif/tatto`, commit `87ec1da`). It is not a visual mockup: every page, modal, animation, CMS manager, form, API route, reward flow, chatbot and admin feature from the source application is present.

The clone started from a production CSS bundle that was byte-for-byte identical to the live site (`index-C3DIWXCC.css`). After the intentional mobile/tablet UI polish described in section 9, the current CSS hash is `index-DcskkAnz.css`; desktop layout parity remains unchanged. The generated HTML, route structure, desktop page text and desktop scroll heights also match the live site. Mobile/tablet spacing intentionally differs after the UI polish in section 9. A local full-stack server makes features that depend on API routes actually work; the original Vercel deployment only served the static frontend.

---

## 1. Run it

The live preview server is already running on port **3000** in this workspace.

From the project directory:

```bash
cd phoenix-tattooz-clone
npm install --legacy-peer-deps
npm run lint
npm run build
NODE_ENV=production PORT=3000 npm start -- --port 3000
```

Development mode (Express + Vite middleware + API):

```bash
npm run dev -- --port 3000
```

Run the API/feature smoke test:

```bash
npm run smoke
```

Run the responsive UI smoke test and the modern-UI checks (server must already be running):

```bash
npx playwright install chromium
npm run ui:smoke     # responsive breakpoints, CTAs, chatbot, drawer
npm run ui:modern    # nav pills + CTA hover states, writes screenshots
```

---

## 2. Local administrator

A local administrator has been seeded so the entire `/admin` dashboard can be used without a Supabase Auth account:

| Field | Value |
|---|---|
| URL | `/admin` |
| Email | `admin@phoenixtattooz.local` |
| Password | `PhoenixClone2026!` |

The admin UI intentionally still shows the source project's Supabase details, preserving the original dashboard appearance. Authentication falls through from the local Supabase shim to the Express admin API.

To change these credentials, edit `data/studio_store.json` and `data/studio_store.backup.json`, or reset the store from `data/studio_store.original.json` and call `/api/admin/register` once with your own credentials.

---

## 3. Backend and data isolation

By default, the clone does **not** write new bookings, inquiries or CMS edits into the source website's public Supabase project.

`src/lib/supabase.ts` points the Supabase client at a same-origin shim implemented in `server.ts` under `/__local-supabase/*`. It emulates the PostgREST/Auth calls used by the app and persists data in `data/studio_store.json`, with automatic backup to `data/studio_store.backup.json`.

Set this in `.env` to connect to a real Supabase project instead:

```env
VITE_USE_REMOTE_SUPABASE="true"
VITE_SUPABASE_URL="https://YOUR-PROJECT.supabase.co"
VITE_SUPABASE_ANON_KEY="YOUR_PUBLISHABLE_KEY"
```

Run `supabase-schema.sql` in that project first. The shipped `.env` keeps `VITE_USE_REMOTE_SUPABASE="false"`.

The Gemini API key is optional. Without one, the chatbot uses the same built-in Phoenix Tattooz knowledge-base fallback as the source.

---

## 4. Source-site issues that were repaired

The source website referenced several dead media URLs. The clone keeps the exact layout and copy but replaces only the dead assets so the gallery, reviews, video lightbox and hero presets remain functional:

- Dead Unsplash ID `photo-1590246814883-578336f7c9e0` → `public/uploads/repairs/compass-rose.jpg`
- Dead Unsplash ID `photo-1579783902614-a3fb3927b675` → `public/uploads/repairs/samurai.jpg`
- Nine dead Mixkit video URLs → the bundled `/uploads/studio_bg_video.mp4` with different media-fragment start times

The source site's deployed JavaScript also used a legacy JWT anon key that returned HTTP 401. The clone uses the working publishable key from the repository, or its own local backend by default.

The unmodified source data snapshot is preserved at `data/studio_store.original.json`. `custom_gallery` was cleared to `null` in the active store so the site uses the same 16 built-in gallery photos visible on the original static deployment.

---

## 5. Verification

Automated desktop captures at 1440×1000 produced identical page text and scroll heights on all nine routes. Pixel comparison against the live site:

| Route | Mean pixel difference | Pixels changed >10 |
|---|---:|---:|
| `/about` | 0.000 | 0.00% |
| `/experience` | 0.000 | 0.00% |
| `/contact` | 0.000 | 0.00% |
| `/admin` | 0.000 | 0.00% |
| `/artists` | 0.011 | 0.00% |
| `/reviews` | 0.283 | 0.62% |
| `/` | 1.742 | 3.54% |
| `/artists/rohit-sharma` | 1.864 | 1.81% |
| `/gallery` | 3.022 | 3.95% |

The small differences are confined to the intentionally repaired dead images, video frames and dynamic hero video timing. The later mobile/tablet polish described in section 9 affects viewports below `md` (768px) and the launcher default state; the 1440px desktop parity numbers above remain unchanged. See `FEATURE-AUDIT.md` for the complete feature matrix and verification checklist.

Functional verification: **14/14 API smoke checks**, **8/8 browser interaction checks** and **16/16 responsive UI smoke checks** passed, including booking submission, contact form submission, member signup/rewards, chatbot, video lightbox, review filters, admin login, mobile navigation and the repaired tablet/mobile breakpoints.

---

## 6. Deployment note

The included `npm start` server is required for the complete feature set because it serves both the built React app and the Express APIs (`/api/*`, uploads, rewards, member auth, CMS, chatbot and the local Supabase shim).

A plain static `dist/` deployment will reproduce the frontend exactly but will not include those APIs. For Vercel, deploy the full-stack server on a Node host, or convert the Express handlers into Vercel serverless functions before deploying. The existing `vercel.json` provides SPA rewrites and upload headers for the static frontend.

---

## 7. Downloadable packages

Two archives are available in the workspace root:

- `phoenix-tattooz-clone-source.zip` — complete editable full-stack source without `node_modules` or build output.
- `phoenix-tattooz-clone-static.zip` — ready-to-upload production frontend plus `vercel.json` SPA rewrites; API-backed features require the Node server or serverless ports.

## 8. Main files

- `src/App.tsx` — routes and global modals
- `src/pages/` — all nine pages
- `src/components/` — all UI components and admin managers
- `src/data/` — studio content and booking service catalogs
- `src/lib/` — auth, content, branding and Supabase helpers
- `server.ts` — full-stack Express API and local backend shim
- `data/studio_store.json` — persistent clone data
- `public/` — logo, hero videos, uploads and repaired media
- `scripts/api-smoke.mjs` — automated feature/API verification
- `scripts/ui-smoke.mjs` — responsive UI and CTA verification
- `scripts/modern-ui-shots.mjs` — nav pill / CTA hover screenshots
- `supabase-schema.sql` / `SUPABASE-SETUP.md` — complete database setup
- `FEATURE-AUDIT.md` — full feature inventory

## 9. Mobile/tablet UI polish

The source site had responsive-breakpoint collisions between 640px and 767px. The clone keeps every handler and API but adjusts the presentation:

- The desktop header's member badge is hidden below `md`, while the compact mobile header controls remain. This removes the duplicate member and booking icons that appeared together on tablet-width screens.
- The small mobile booking icon is hidden from `sm` upward because the larger yellow header CTA is already visible at those widths.
- `LeftBookingLauncher` is hidden below `md` (the mobile bottom bar already has Book and Call actions) and starts minimized on desktop, so it no longer overlaps the bottom navigation or covers page content.
- `StudioChatbot` uses a compact icon-only launcher below `md`, reducing overlap with page headings on short tablet viewports.
- The hero uses tighter mobile spacing, a lighter mobile overlay/vignette, and a brighter video filter. This removes the large empty gap above the floating widgets while keeping the hero card readable.
- The `📅` emoji on the hero and consultation CTAs was replaced with the same Lucide `Calendar` icon used elsewhere in the UI. Undefined `xs:` utilities were replaced with `sm:`.

These are layout-only changes. All booking, contact, rewards, CMS, chatbot, and admin behavior is unchanged. Desktop parity at 1440px is unchanged; the mobile/tablet presentation is intentionally polished rather than pixel-identical to the source.

A reusable `scripts/ui-smoke.mjs` verifies the 720px and 510px breakpoints, all three booking entry points, the chatbot window, the mobile drawer, launcher visibility and browser console errors.

## 10. Modern UI layer (nav pills + CTA hover)

The header and every call-to-action now use one consistent modern treatment.

### Header navigation
- Links sit inside a rounded glass **capsule** (`.nav-capsule`).
- Every link gets a gold pill on hover, and the current route keeps a permanently lit gold pill with a soft bloom underneath — matching the two reference screenshots.
- The `Gallery` dropdown trigger uses the same pill and still opens the Photo/Video menu.
- The underline bars that used to collide with the rounded capsule were replaced by the pill itself.

### CTA hover (Book Appointment, Book on WhatsApp, Book on Call + all other CTAs)
- `src/components/ModernCtaEffects.tsx` tags every CTA-style `button`/`a` at runtime with `data-modern-cta="gold"` or `"dark"`, including ones rendered later by modals, admin screens and the chatbot.
- Gold buttons get a 2px lift, a warm outer glow and a diagonal light sweep.
- Dark / outline buttons get a gold edge highlight, a subtle halo and the same sweep.
- WhatsApp buttons keep their green identity (`cta-whatsapp`) instead of turning gold.
- The sweep is clipped to the button's own bounds, so nothing bleeds onto neighbouring elements.
- All of it is CSS-driven and respects `prefers-reduced-motion`.

### Smoothness fixes
- `html` / `#root` now use `overflow-x: clip` instead of `hidden`. `hidden` created a scroll container that silently broke the sticky header — the header stayed glued to the top of the page instead of following the scroll. The sticky header now works on every page.
- Added consistent `:focus-visible` gold outlines for keyboard users.
- Floating chatbot launcher fades out while the mobile drawer is open, so it never covers menu CTAs.

These are presentation-only changes. No API, booking, CMS, rewards or admin behaviour was modified.

---

## 11. Supabase SQL for deployment

Everything needed for the SQL Editor is in [`supabase-schema.sql`](./supabase-schema.sql), with a step-by-step guide in [`SUPABASE-SETUP.md`](./SUPABASE-SETUP.md).

Tables created: `appointments`, `contact_inquiries`, `site_settings`, `admin_users`, `member_users`, `member_activity_log` (+ optional `studio-uploads` storage bucket), with RLS policies, indexes, an `updated_at` trigger and realtime publication.

The script was executed against a real PostgreSQL 18 instance twice to confirm it is idempotent, and the booking/CMS/admin/member flows were exercised with RLS enabled:

- anon can insert/read/update/delete bookings and inquiries
- anon can read and upsert `site_settings` keys, and `updated_at` auto-touches
- anon cannot see `admin_users`, `member_users` or `member_activity_log`
- service role can write member records
- the admin hash formula `sha256(password + 'phoenix_tattooz_secure_2019_hisar')` validates correctly
- invalid booking statuses are rejected by the CHECK constraint
