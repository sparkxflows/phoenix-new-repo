# Feature Audit — Phoenix Tattooz Clone

Source baseline: public repository `livecutex-gif/tatto`, commit `87ec1da`, deployed as `tatto-gilt.vercel.app`.
Clone target: `/home/user/phoenix-tattooz-clone`.

Legend: **Exact** = same source code/content/style; **Exact+fixed** = same UI and behavior with a dead external asset or backend key repaired; **Verified** = exercised locally.

---

## 1. Routes and page-level features

| Route | Status | Included features |
|---|---|---|
| `/` | Exact+fixed, Verified | Sticky navbar, hero background video with poster/fallback, floating trust badges, Google-review link, hygiene badge, philosophy ticker, animated heritage stats, recent-works grid, full-gallery CTA, consultation strip, gift-card and referral sections, studio photo strip, about block, experience cards, artist cards, academy CTA, studio creed, review tabs/filters, review media lightboxes, contact details, embedded map, contact form, footer, mobile bottom bar, left booking launcher, AI chatbot |
| `/about` | Exact, Verified | About hero, founding story, philosophy, timeline, studio values, image/lightbox treatments, CTA links |
| `/artists` | Exact, Verified | Responsive artist roster, specialty tags, ratings, experience metadata, bio/work links, booking CTAs |
| `/artists/rohit-sharma` | Exact+fixed, Verified | Founder biography, career timeline, core specialties, statistics, portfolio grid, lightbox, booking CTA |
| `/experience` | Exact, Verified | Service experience cards, process sections, imagery, hygiene messaging, consultation CTAs |
| `/gallery` | Exact+fixed, Verified | 16 built-in photos, category filters, photo/video gallery tabs, 6 video items, photo lightbox, video lightbox, studio promises sidebar, piercing shortcuts, custom-category filtering, view counters, artist/tag metadata |
| `/reviews` | Exact+fixed, Verified | 8 seeded reviews, aggregate rating, photo/video review media, filters (`All`, `With Photos/Videos`, `Tattoos`, `Cosmetic`, `Academy`), studio replies, verified badges, review-submission CTA, philosophy tab |
| `/contact` | Exact, Verified | Address, phone, hours, map embed, service-aware contact form, local inquiry storage, WhatsApp/call links |
| `/admin` | Exact, Verified | Secure sign-in screen, full dashboard shell, backend diagnostics and SQL helper |
| `*` | Exact, Verified | Unknown paths fall back to the home page, matching the original SPA |

---

## 2. Global UI and interaction systems

| Feature | Status | Notes |
|---|---|---|
| Responsive navbar | Exact, Verified | Desktop links, active-route indication, Rewards entry, Gallery dropdown, Reviews dropdown, mobile menu, sticky behavior |
| Footer | Exact, Verified | Social links, map/contact details, navigation, admin shortcut, newsletter/contact CTA |
| Mobile bottom quick bar | Exact, Verified | Call, WhatsApp, booking and rewards shortcuts |
| Left floating booking launcher | Exact, Verified | Expandable contact card with direct call/WhatsApp/booking actions |
| AI Studio chatbot | Exact, Verified | Minimizable floating window, quick prompts, conversation history, typing state, Gemini endpoint with knowledge-base fallback, booking handoff |
| Global appointment modal | Exact, Verified | Four booking categories (tattoo, laser removal, academy training, piercing), sub-services, artists, placement, size, jewelry, course and removal options, date/time picker, notes, validation, booking code, WhatsApp confirmation, success receipt, SQL helper |
| Global member auth modal | Exact, Verified | Sign in / sign up modes, full name, email, password, confirm password, birth date, show/hide password, validation, custom reward-triggered titles/subtitles, post-auth reward flow |
| Global gifts & rewards modal | Exact, Verified | Birthday gift card, 15% one-time voucher, referral tab, generated referral code, WhatsApp sharing, copy invitation, authentication gates |
| Lightboxes | Exact, Verified | Photo detail modal and video detail modal with metadata, navigation and media playback |
| Section background videos | Exact+fixed, Verified | Local video source with poster and graceful fallback |
| Branding system | Exact, Verified | Dynamic logo shape/border/background settings, persisted via content API |
| Animations and micro-interactions | Exact, Verified | Motion-based reveals, hover states, modal transitions, marquee/ticker, counters, dropdowns, scroll-to-top/hash handling |

---

## 3. Data, content and CMS features

### Public content hooks

- Artists: local storage + Express content API + Supabase fallback + custom update events.
- Gallery: local storage auto-merge for piercing items + Express content API + Supabase fallback + custom update events.
- Videos: local storage + Express content API + Supabase fallback + custom update events.
- Home hero: editable media type, image, background video, overlay opacity, slogan, headings, badges and alt text.
- About settings: editable home/about copy, images, badges, taglines and story sections.
- Studio philosophy: editable heading, subtitle, founder quote/image and four creed pillars.
- Logo: editable image, shape, border color and background color.
- Reviews: seeded reviews, client submissions, approval toggles, editing, deletion, reset and restore behavior.
- Rewards: editable coupon/discount settings and one-time member claims.
- Site settings: JSON content store with automatic primary/backup persistence.

### Admin dashboard managers

All source admin managers are included:

- `AdminAboutManager`
- `AdminArtistsManager`
- `AdminBookingsModal`
- `AdminGalleryManager`
- `AdminHeroManager`
- `AdminLogoManager`
- `AdminMembersManager`
- `AdminReviewsManager`
- `AdminRewardsManager`
- `AdminVideoGalleryManager`
- `AdminWebsitePreview`

Their capabilities include create/edit/delete flows, image and video uploads, gallery reordering metadata, review moderation, artist CRUD, reward configuration, member activity, appointment status changes/deletion, contact inquiry viewing, live website preview and SQL/schema helper actions.

---

## 4. Backend API inventory

Implemented in `server.ts` and verified by `scripts/api-smoke.mjs`:

| Endpoint | Methods | Purpose |
|---|---|---|
| `/api/app-info` | GET | App version/heartbeat |
| `/api/content/:key` | GET, POST | Generic persistent CMS content |
| `/api/reviews` | GET, POST | Review list, add, toggle, update, delete, reset, sync |
| `/api/admin/status` | GET | Admin slot status |
| `/api/admin/register` | POST | One-time local admin registration |
| `/api/admin/login` | POST | Local admin authentication |
| `/api/auth/signup` | POST | Member registration and birthday voucher |
| `/api/auth/signin` | POST | Member sign-in and activity logging |
| `/api/auth/me` | GET | Current member profile |
| `/api/auth/signout` | POST | Member sign-out |
| `/api/rewards/claim` | POST | One-time birthday/referral/welcome claim |
| `/api/rewards/my-claims` | GET | Member's claimed vouchers |
| `/api/admin/members` | GET | Member directory and activity log |
| `/api/admin/members/:id` | DELETE | Remove a member |
| `/api/chat` | POST | Gemini chatbot or knowledge-base fallback |
| `/api/upload-image` | POST | Binary/base64 image upload |
| `/api/upload-video` | POST | Binary/base64 video upload |
| `/uploads/*` | GET | Static uploads with range support |
| `/__local-supabase/rest/v1/:table` | GET, POST, PATCH, PUT, DELETE | Local PostgREST shim for appointments, inquiries, site settings, admin users and fallback tables |
| `/__local-supabase/auth/v1/*` | ALL | Local Auth shim that routes admin login to the Express fallback |
| `/*` | GET | SPA fallback to `dist/index.html` in production |

The Express store writes to `data/studio_store.json` and mirrors to `data/studio_store.backup.json`. Member sessions are held in memory; member records and reward claims persist to disk.

---

## 5. Booking and form features

- Appointment categories: custom tattoo, laser tattoo removal, tattoo academy, body piercing.
- Dynamic service summaries, price hints, placement, size, artist, course, jewelry and side selection.
- Date defaults to tomorrow; time-slot selector; free-form notes.
- Required name and 10-digit phone validation.
- Unique `PTZ-######` booking code.
- Local persistence through the Supabase-compatible shim.
- Success receipt with selected service, expert, date/time, dimensions, pricing and studio address.
- Optional one-click WhatsApp confirmation with the full appointment payload.
- Contact form on `/contact` with name, phone, email, service and message.
- Home-page quick contact form.
- Contact inquiries are stored locally and visible in the admin dashboard.

---

## 6. Member rewards and referral behavior

- Sign-up with optional birth date automatically creates a personalized 15% birthday voucher.
- Birthday and referral rewards are strictly one-time per member.
- Referral codes use `REF-<INITIALS>-<RANDOM>` format.
- Birthday codes use `PHX15-<INITIALS>-<RANDOM>` format.
- Reward claims update local storage, current member state and the persistent server store.
- Referral invitation text can be copied and shared through WhatsApp.
- Unauthenticated visitors are routed into the member auth modal with contextual titles.
- Admin dashboard shows member claims, sign-in counts and activity history.

---

## 7. Media and asset parity

- Local logo files and `/assets/aistudio/unnamed__3__df6a950e.png`.
- Local 8-second 1920×1080 hero/background video with range streaming.
- All working Unsplash images from the source remain linked exactly as before.
- Two dead Unsplash image IDs were replaced with local Unsplash-sourced repair images.
- Nine dead Mixkit video URLs were replaced with the bundled local hero video using distinct `#t=` start positions.
- Admin video presets, review videos and gallery videos now all resolve successfully.
- Original unmodified store snapshot retained at `data/studio_store.original.json`.

---

## 8. Verification performed

### Build and static analysis

- `npm install --legacy-peer-deps` — passed.
- `npm run lint` (`tsc --noEmit`) — passed.
- `npm run build` (Vite 8 production build) — passed.
- The pre-polish production CSS hash matched the live site exactly (`index-C3DIWXCC.css`). The current build uses `index-DcskkAnz.css` after the intentional responsive and modern-UI changes.
- All nine SPA routes and an unknown route return the correct HTML shell.

### Browser parity

Automated Chromium captures at 1440×1000 and 390×844:

- Page titles, visible text and full-page scroll heights match the live site on all routes at desktop size. Mobile/tablet scroll heights intentionally differ after the UI polish.
- `/about`, `/experience`, `/contact` and `/admin` are pixel-identical.
- Remaining routes differ only in repaired images/video frames.
- No browser console errors remain on the clone.

### Browser interaction smoke test

8/8 automated Chromium UI checks passed:

1. Booking modal opens, validates, submits and persists an appointment.
2. Contact form submits successfully.
3. Reward CTA opens member signup, creates the instant birthday voucher and then opens the rewards modal.
4. AI chatbot opens and answers a pricing question.
5. Gallery video tab and video lightbox render a working player.
6. Reviews filter and philosophy/creed tab work.
7. Admin login opens the full dashboard with all 11 sections.
8. Mobile navigation and bottom quick actions render correctly.

No browser console errors remain after the local admin authentication path was routed directly to the Express fallback.

A separate responsive UI smoke test (`npm run ui:smoke`) passed **16/16** checks at 720×1080 and 510×1080. It verifies the hero, hidden mobile launcher, header/hero/bottom-bar booking CTAs, compact chatbot window, mobile navigation drawer and absence of unexpected console errors.

Desktop parity was measured before the mobile/tablet polish in section 9; those changes do not affect the 1440px desktop layout, but mobile/tablet scroll heights are now intentionally shorter.

### API and feature smoke test

`npm run smoke` covers:

- heartbeat and all SPA routes
- static media and range requests
- default 16-photo gallery fallback
- review add/delete
- generic CMS content read/write
- admin status/login
- appointment insert/read/update/delete
- contact inquiry insert/read/delete
- member signup/profile/rewards/signout/signin
- admin member directory and deletion
- chatbot fallback
- image/video upload
- Supabase Auth shim fallback

---

## 9. Deliberate clone-only differences

These changes preserve the source experience while making the clone independent and functional:

1. **Local backend shim** — prevents the clone from writing to the source website's public database.
2. **Seeded local admin** — makes the admin dashboard usable without access to the source Supabase Auth project.
3. **Working publishable key fallback** — avoids the source deployment's invalid legacy JWT.
4. **Repaired dead media URLs** — eliminates broken images/videos inherited from the source.
5. **`custom_gallery: null`** — restores the original static site's 16-photo gallery instead of the development store's 10-item override.
6. **Vite preview host settings** — `host: 0.0.0.0` and `allowedHosts` for the Arena live preview; no visual effect.
7. **Mobile/tablet UI polish** — responsive breakpoint collisions below `md` were fixed: duplicate header icons removed, the left booking launcher hidden on mobile and minimized by default on desktop, the chatbot launcher made compact below `md`, hero spacing/overlay tightened, and emoji calendar CTAs replaced with Lucide icons. These changes affect layout only; all handlers and APIs remain.
8. **Modern UI layer** — the header navigation is now a glass capsule with gold hover/active pills (matching the supplied reference screenshots), and every CTA gains a unified lift + glow + shine hover via `ModernCtaEffects`. `html`/`#root` use `overflow-x: clip` so the sticky header works. Presentation only; no handlers or APIs changed.
9. **Sticky header fix** — `overflow-x: hidden` on `html` previously turned the page into a scroll container and left the header pinned to the document top. Switching to `clip` restores the intended sticky behaviour.

The original source behavior can be restored by copying `data/studio_store.original.json` back to the active store and setting `VITE_USE_REMOTE_SUPABASE=true` with the original project credentials.

---

## 10. Supabase schema verification

`supabase-schema.sql` was executed against PostgreSQL 18 (with Supabase-compatible `anon`, `authenticated` and `service_role` roles, an `extensions` schema, a `supabase_realtime` publication and a `storage.buckets` stub) and validated:

- schema runs cleanly twice (idempotent)
- anon booking insert → update → read works; invalid `status` is rejected by the CHECK constraint
- anon contact inquiry insert/read works
- anon `site_settings` upsert works and `updated_at` is auto-touched on insert and update
- anon cannot read `admin_users`, `member_users` or `member_activity_log` (0 rows)
- service role can insert member records and activity entries
- admin login hash `sha256(password + 'phoenix_tattooz_secure_2019_hisar')` matches and rejects wrong passwords

Step-by-step deployment instructions live in `SUPABASE-SETUP.md`.
