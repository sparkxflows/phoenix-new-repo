# Deploy to Vercel — complete checklist

Ye guide zero se live site tak le jaati hai. Har step copy-paste ready hai.

---

## 0. Kya-kya live jayega

| Layer | Kahan chalta hai | Kaam |
|---|---|---|
| React SPA (Vite) | Vercel static (`dist/`) | Saare pages, animations, CMS UI |
| `/api/*` | **1** Vercel Serverless Function (`api/[...all].ts` → `backend/routes/`) | Members, rewards, uploads, admin, chatbot, CMS |
| Database + Storage | Supabase | Bookings, inquiries, members, settings, images/videos |

> Pehle sirf frontend deploy hota tha — members/rewards/upload/chatbot **kaam nahi karte the**.
> Ab `api/` folder in sab ko Vercel functions bana deta hai, isliye **poora feature set** live hoga.

---

## 1. Supabase (one time)

### 1.1 Schema run karo

Supabase dashboard → **SQL Editor** → **New query** → `supabase-schema.sql` ka poora content paste → **Run**.

Banta hai: `appointments`, `contact_inquiries`, `site_settings`, `admin_users`, `member_users`, `member_activity_log` + indexes + RLS + realtime + `studio-uploads` bucket.

File idempotent hai — dobara run karne par error nahi degi.

### 1.2 Admin user banao

Supabase → **Authentication** → **Users** → **Add user** → **Create new user**
- Email + strong password
- ✅ **Auto Confirm User** tick karo

Isi email/password se site ke `/admin` par login hoga.

### 1.3 Keys copy karo

**Project Settings → API** se teen cheezein:

| Cheez | Kahan milegi | Kahan use hogi |
|---|---|---|
| Project URL | `https://xxxxx.supabase.co` | dono jagah |
| Publishable / anon key | `sb_publishable_...` | browser (`VITE_`) |
| Service role / secret key | `sb_secret_...` | **sirf server** |

⚠️ `sb_secret_...` kabhi `VITE_` prefix ke saath mat daalna — wo browser bundle me chala jayega.

---

## 2. Vercel environment variables

Vercel → Project → **Settings → Environment Variables**.
Har variable par **Production + Preview** dono tick karo.

### 2.1 Browser variables (build-time)

```
VITE_USE_REMOTE_SUPABASE = true
VITE_SUPABASE_URL        = https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY   = sb_publishable_...
```

### 2.2 Server variables (runtime, secret)

```
SUPABASE_URL              = https://xxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY = sb_secret_...
```

### 2.3 Optional

```
GEMINI_API_KEY      = ...        # chatbot ke real AI answers ke liye
AUTH_TOKEN_SECRET   = ...        # member token signing (default: service key)
```

> **Supabase integration ne apne aap jo variables daale hain** (`SUPABASE_ANON_KEY`,
> `NEXT_PUBLIC_*`, `POSTGRES_*`) wo is project me kaam nahi aate — par rehne do, harmless hain.
> Vite sirf `VITE_` prefix padhta hai, isliye 2.1 wale variables **zaroori** hain.

---

## 3. GitHub + Vercel

```bash
cd phoenix-tattooz-clone
git init
git add .
git commit -m "Phoenix Tattooz — full stack deploy"
git branch -M main
git remote add origin https://github.com/USERNAME/phoenix-tattooz.git
git push -u origin main
```

Vercel → **Add New → Project → Import** repo.

`vercel.json` me sab set hai, par confirm kar lo:

| Setting | Value |
|---|---|
| Framework Preset | **Vite** |
| Build Command | `npm run build` |
| Output Directory | `dist` |
| Install Command | `npm install` |

**Deploy** dabao.

---

## 4. Deploy ke baad verify (5 minute)

### Step 1 — API live hai?

Browser me kholo:

```
https://your-site.vercel.app/api/health
```

Expected:

```json
{
  "config": {
    "supabaseUrl": "https://xxxxx.supabase.co",
    "serviceRoleKey": "present",
    "publicKey": "present"
  },
  "database": { "reachable": true }
}
```

`serviceRoleKey: "MISSING"` → 2.2 wale variables add karke **Redeploy** karo.
`reachable: false` → SQL schema run nahi hua.

### Step 2 — feature by feature

| Test | Kaise | Kahan dikhega |
|---|---|---|
| Booking | Site par **Book Appointment** bharo | Supabase → `appointments` |
| Contact | Contact form bhejo | Supabase → `contact_inquiries` |
| Admin login | `/admin` → email/password | Dashboard khulna chahiye |
| CMS save | Admin → hero/gallery edit → save | page reload ke baad bhi rehna chahiye |
| Member signup | Rewards section → sign up | Supabase → `member_users` |
| Reward claim | Birthday/referral claim | `member_users.claims` me code |
| Upload | Admin → image/video upload | Storage → `studio-uploads` |
| Chatbot | Chat icon → kuch poocho | Turant reply |

### Step 3 — console clean?

Site kholo → **F12 → Console** → koi laal error nahi hona chahiye.
Agar `VITE_USE_REMOTE_SUPABASE is true but ... missing` dikhe to env vars apply nahi hue — redeploy karo.

---

## 5. Env change ke baad

`VITE_` variables **build ke waqt** bundle me fix hote hain. Isliye har change ke baad:

**Deployments → ⋯ → Redeploy**

Sirf env save karke chhod dene se kuch nahi badlega. Ye sabse common galti hai.

---

## 6. Local testing (deploy se pehle)

```bash
npm install --legacy-peer-deps --include=dev

npm run lint        # TypeScript
npm run build       # production bundle
npm run api:smoke   # 21 API checks (signup, rewards, CMS, upload, admin, chat)
npm run smoke       # 14 Express/full-app checks
npm run ui:smoke    # 16 mobile/tablet UI checks

npm start           # full app on http://localhost:3000
npm run api:dev     # Vercel functions only on http://localhost:4000/api/health
```

`api:smoke` ek mock Supabase par chalta hai — real project ko touch nahi karta, isliye
bina credentials bhi poora flow verify ho jata hai.

---

## 7. Troubleshooting

| Symptom | Wajah | Fix |
|---|---|---|
| Admin login: "Invalid admin credentials" | user Supabase Auth me nahi hai, ya email confirm nahi hua | Authentication → Users → **Add user** + **Auto Confirm** |
| Booking "table missing" | schema run nahi hua | SQL Editor me `supabase-schema.sql` run karo |
| `/api/health` par `reachable: false` | service role key galat | `SUPABASE_SERVICE_ROLE_KEY` dobara copy karo |
| Upload fail | bucket nahi bana | Storage → New bucket → `studio-uploads` → **Public** |
| Members/rewards 500 | `SUPABASE_URL` missing on server | 2.2 wale variables add karo |
| Purana project ref bundle me | env apply nahi hua | Redeploy karo |
| Chatbot sirf fixed answers de raha | `GEMINI_API_KEY` missing | optional — knowledge base bhi kaam karta hai |
| Build log me `TS2688: Cannot find type definition file` | `tsconfig.json` ka `types` allow-list Vercel ke function compiler ko resolve nahi hota | Already fixed — `types` hata diya, `src/vite-env.d.ts` add kiya. Bas redeploy karo |
| `Warning: Provided memory setting ... is ignored` | Active CPU billing | harmless — `vercel.json` se `memory` hata diya hai |
| `Warning: engines node >=20` | open-ended range | `22.x` pin kar diya hai |

---

## 8. Security notes

- `VITE_*` = public. Sirf project URL aur **publishable** key.
- `SUPABASE_SERVICE_ROLE_KEY` har cheez ka access deta hai — sirf Vercel server env me.
- `admin_users`, `member_users`, `member_activity_log` par koi anon policy nahi — browser se padhe nahi ja sakte, saara access `/api/*` se hota hai.
- `site_settings` par public write khula hai (original app ka design, taaki CMS browser se seedha save kar sake). Agar aap chaho to ise admin-only kar sakte hain — us case me saara CMS write `/api/content/:key` (service role) se hi karna padega.

---

## 9. Function limit + file size (Hobby plan)

Vercel Hobby par ek deployment me **maximum 12 Serverless Functions** allowed hain.
Isliye poora backend **ek hi function** me hai:

```
api/[...all].ts        ← the only Serverless Function (catch-all router)
backend/routes/**      ← individual handlers (NOT deployed as functions)
backend/lib/**         ← shared helpers (env, Supabase client, HMAC tokens)
```

Naye endpoint add karne ho to `backend/routes/` me file banao aur `api/[...all].ts`
ke `ROUTES` array me ek line add karo — function count 1 hi rahega.

### File size limit

Serverless functions ka request body **~4.5 MB** tak seemit hai (Hobby).
Isliye bade video/image **seedha Supabase Storage** me jaate hain:

```
browser ──POST /api/upload-sign──► signed URL
        ──PUT file ─────────────► Supabase Storage   (koi size limit nahi)
        ──public URL save ──────► CMS
```

Chhoti files ke liye purana `/api/upload-image` / `/api/upload-video` fallback bhi maujood hai.

## 10. Architecture quick view

```
Browser (Vite SPA)
   │
   ├── Supabase JS ─────────► Supabase REST (bookings, inquiries, site_settings)
   │
   ├── PUT signed URL ──────► Supabase Storage (large files only)
   │
   └── fetch('/api/...') ───► api/[...all].ts ──► Supabase (service role)
                                 ├─ /api/auth/*        member signup / signin / me
                                 ├─ /api/rewards/*     one-time vouchers
                                 ├─ /api/admin/*       login, members, status
                                 ├─ /api/content/:key  CMS read/write
                                 ├─ /api/reviews       review wall + moderation
                                 ├─ /api/upload-sign   signed URL for big files
                                 ├─ /api/upload-*      small-file fallback
                                 ├─ /api/chat          Gemini + knowledge base
                                 └─ /api/health        self-check
```

Local Express server (`server.ts`) abhi bhi same kaam karta hai — `npm start` par wahi
`/api/*` routes chalti hain, isliye development aur production behaviour same rehta hai.
