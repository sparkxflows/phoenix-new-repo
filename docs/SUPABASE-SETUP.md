# Supabase setup — Phoenix Tattooz clone

Deploy karne se pehle ye 3 cheezein karni hain: **schema run karo → keys add karo → website ko remote mode me switch karo**.

---

## 1. SQL Editor me ye file run karo

Supabase Dashboard → **SQL Editor** → **New query** → `supabase-schema.sql` ka poora content paste karke **Run**.

File idempotent hai — dobara run karne par error nahi degi.

### Kya-kya create hota hai

| Table | Kya store hota hai | Kaun likhta hai |
|---|---|---|
| `appointments` | Book Appointment form ke saare bookings | Website + Admin panel |
| `contact_inquiries` | Contact page / Home form ke messages | Website + Admin panel |
| `site_settings` | Poora CMS: hero, about, artists, gallery, videos, logo, reviews, philosophy, gifts & rewards | Admin panel (JSONB) |
| `admin_users` | Admin login record (password **hash**, plain password nahi) | Sirf server / manual SQL |
| `member_users` | Member club signups + birthday/referral claim codes | API layer |
| `member_activity_log` | Signup / signin activity feed (Admin → Members) | API layer |
| `storage.buckets: studio-uploads` | Optional image/video uploads | Admin panel |

`site_settings` me ye keys use hoti hain:

```
custom_home_hero
custom_about_content
custom_artists
custom_gallery
custom_videos
custom_logo
custom_gifts_rewards
customer_reviews
studio_philosophy
```

### RLS policies (file me already included)

- **appointments** — public insert / read / update / delete (admin dashboard browser se hi kaam karta hai)
- **contact_inquiries** — public insert / read / delete
- **site_settings** — public read + write (CMS)
- **admin_users** — anon ke liye completely closed (login server-side hota hai)
- **member_users / member_activity_log** — closed, sirf service role / API layer

> Note: ye policies "website se hi manage karne" wale setup ke liye hain, jaisa app ka admin panel expect karta hai. Agar aap security tight karna chahte ho to admin panel ko Supabase Auth ke saath jodo aur policies ko `auth.role() = 'authenticated'` par shift karo.

---

## 2. Admin password banana (optional)

`admin_users` table blank aata hai. Admin banane ke liye SQL file ke **section 9** ko uncomment karke apna email/password daalo:

```sql
insert into public.admin_users (email, full_name, role, password_hash)
values (
  'admin@yourdomain.com',
  'Studio Administrator',
  'super_admin',
  encode(extensions.digest('YourStrongPassword' || 'phoenix_tattooz_secure_2019_hisar', 'sha256'), 'hex')
)
on conflict (email) do update
  set password_hash = excluded.password_hash,
      full_name     = excluded.full_name;
```

App ka hash formula: `sha256(password + 'phoenix_tattooz_secure_2019_hisar')`.

---

## 3. Vercel me environment variables

Vercel → Project → **Settings → Environment Variables**:

```env
VITE_USE_REMOTE_SUPABASE=true
VITE_SUPABASE_URL=https://YOUR-PROJECT-REF.supabase.co
VITE_SUPABASE_ANON_KEY=your-publishable-anon-key

# Full-stack Node server ke liye
NODE_ENV=production
APP_URL=https://your-domain.vercel.app
ADMIN_EMAIL=admin@yourdomain.com
ADMIN_PASSWORD=YourStrongPassword
GEMINI_API_KEY=optional
```

Repo me `.env` me `VITE_USE_REMOTE_SUPABASE="false"` hai — production me `true` karna zaroori hai, warna site apne local file store par chalegi.

---

## 4. Deploy ke baad verify

```bash
# 1. Site load ho rahi hai
curl -s -o /dev/null -w "%{http_code}\n" https://your-domain.vercel.app/

# 2. Ek test booking bhejo, phir Supabase me check karo
#    SQL Editor: select * from public.appointments order by created_at desc limit 5;
```

Supabase Table Editor me:

- `appointments` me naya row aaya → booking ✅
- `contact_inquiries` me row aaya → contact form ✅
- `site_settings` me `custom_home_hero` jaisi key aayi (admin panel se kuch save karne par) → CMS ✅

---

## 5. Important deployment note

Static frontend (`phoenix-tattooz-clone-static.zip`) sirf UI chalata hai. Ye features **Node API layer** maangte hain:

- `/api/auth/*`, `/api/rewards/*` (member club + rewards)
- `/api/admin/members`
- `/api/upload-image`, `/api/upload-video`
- `/api/chat` (AI chatbot fallback)

Vercel par poora feature set chahiye to `server.ts` ke handlers ko Vercel Serverless Functions me port karo (ya Render/Railway jaise Node host par deploy karo). Sirf Supabase tables add karne se ye API endpoints apne aap nahi banenge.

---

## 6. Jaldi wala checklist

- [ ] `supabase-schema.sql` SQL Editor me run
- [ ] Table Editor me 6 tables dikh rahe hain
- [ ] `VITE_USE_REMOTE_SUPABASE=true` set
- [ ] `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY` set
- [ ] Redeploy
- [ ] Test booking → Supabase row verify
- [ ] Admin login → `/admin`
