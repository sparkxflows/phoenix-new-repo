-- ============================================================================
-- PHOENIX TATTOOZ STUDIO & ACADEMY — COMPLETE SUPABASE SCHEMA
-- Paste this whole file into: Supabase Dashboard → SQL Editor → New query → Run
-- Safe to re-run: every statement is idempotent.
-- ============================================================================


-- ---------------------------------------------------------------------------
-- 0. EXTENSIONS
-- ---------------------------------------------------------------------------
create extension if not exists pgcrypto with schema extensions;


-- ---------------------------------------------------------------------------
-- 1. APPOINTMENTS  (Book Appointment form + Admin → Bookings & Appointments)
-- ---------------------------------------------------------------------------
create table if not exists public.appointments (
  id               uuid primary key default gen_random_uuid(),
  booking_code     text not null unique,
  client_name      text not null,
  client_phone     text not null,
  service          text not null,
  artist           text,
  placement        text,
  size             text,
  appointment_date text not null,
  time_slot        text not null,
  notes            text default '',
  status           text not null default 'pending'
                     check (status in ('pending', 'confirmed', 'completed', 'cancelled')),
  created_at       timestamptz not null default now()
);

alter table public.appointments
  drop constraint if exists appointments_status_check;
alter table public.appointments
  add constraint appointments_status_check
  check (status in ('pending', 'confirmed', 'completed', 'cancelled'));

create unique index if not exists appointments_booking_code_idx
  on public.appointments (booking_code);
create index if not exists appointments_created_at_idx
  on public.appointments (created_at desc);
create index if not exists appointments_status_idx
  on public.appointments (status);


-- ---------------------------------------------------------------------------
-- 2. CONTACT INQUIRIES  (Contact page + Home quick form + Admin → Inquiries)
-- ---------------------------------------------------------------------------
create table if not exists public.contact_inquiries (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  phone      text not null,
  email      text,
  service    text,
  message    text,
  created_at timestamptz not null default now()
);

create index if not exists contact_inquiries_created_at_idx
  on public.contact_inquiries (created_at desc);


-- ---------------------------------------------------------------------------
-- 3. SITE SETTINGS  (All CMS content: hero, about, artists, gallery,
--    videos, logo, reviews, philosophy, gifts & rewards)
--    Keys used by the site:
--      custom_home_hero, custom_about_content, custom_artists,
--      custom_gallery, custom_videos, custom_logo, custom_gifts_rewards,
--      customer_reviews, studio_philosophy
-- ---------------------------------------------------------------------------
create table if not exists public.site_settings (
  key        text primary key,
  value      jsonb not null,
  updated_at timestamptz not null default now()
);

create index if not exists site_settings_updated_at_idx
  on public.site_settings (updated_at desc);

-- Keep updated_at fresh on every write
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists site_settings_touch_updated_at on public.site_settings;
create trigger site_settings_touch_updated_at
  before insert or update on public.site_settings
  for each row execute function public.touch_updated_at();


-- ---------------------------------------------------------------------------
-- 4. ADMIN USERS  (optional server-side admin login table)
--    Login is verified by the Node/API layer or Supabase Auth, never by the
--    browser, so anon access stays closed.
--    password_hash = sha256(password + 'phoenix_tattooz_secure_2019_hisar')
-- ---------------------------------------------------------------------------
create table if not exists public.admin_users (
  id            uuid primary key default gen_random_uuid(),
  email         text not null unique,
  full_name     text not null default 'Studio Administrator',
  role          text not null default 'super_admin',
  password_hash text not null,
  created_at    timestamptz not null default now()
);


-- ---------------------------------------------------------------------------
-- 5. MEMBER CLUB  (signup / signin / birthday + referral rewards)
--    Used by the API layer (/api/auth/*, /api/rewards/*, /api/admin/members)
-- ---------------------------------------------------------------------------
create table if not exists public.member_users (
  id              text primary key,
  name            text not null,
  email           text not null unique,
  birthdate       text,
  salt            text,
  password_hash   text,
  claims          jsonb not null default '{}'::jsonb,
  sign_in_count   integer not null default 1,
  last_login      timestamptz,
  sign_in_history jsonb not null default '[]'::jsonb,
  created_at      timestamptz not null default now()
);

create index if not exists member_users_created_at_idx
  on public.member_users (created_at desc);

create table if not exists public.member_activity_log (
  id               text primary key,
  member_id        text references public.member_users (id) on delete cascade,
  member_name      text,
  member_email     text,
  type             text,
  birthdate        text,
  instant_discount boolean default false,
  discount_code    text,
  "timestamp"      timestamptz not null default now()
);

create index if not exists member_activity_log_timestamp_idx
  on public.member_activity_log ("timestamp" desc);


-- ---------------------------------------------------------------------------
-- 6. UPLOADS (optional — only if you move image/video uploads to Supabase
--    Storage instead of the Node server's /api/upload-* endpoints)
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('studio-uploads', 'studio-uploads', true)
on conflict (id) do nothing;

drop policy if exists "Public read studio uploads" on storage.objects;
create policy "Public read studio uploads"
  on storage.objects for select
  using (bucket_id = 'studio-uploads');

drop policy if exists "Authenticated write studio uploads" on storage.objects;
create policy "Authenticated write studio uploads"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'studio-uploads');


-- ---------------------------------------------------------------------------
-- 7. ROW LEVEL SECURITY
-- ---------------------------------------------------------------------------
alter table public.appointments        enable row level security;
alter table public.contact_inquiries   enable row level security;
alter table public.site_settings       enable row level security;
alter table public.admin_users         enable row level security;
alter table public.member_users        enable row level security;
alter table public.member_activity_log enable row level security;

-- APPOINTMENTS: visitors may book; the admin dashboard may read/update/delete.
drop policy if exists "appointments public insert" on public.appointments;
drop policy if exists "appointments public read"   on public.appointments;
drop policy if exists "appointments public update" on public.appointments;
drop policy if exists "appointments public delete" on public.appointments;

create policy "appointments public insert"
  on public.appointments for insert with check (true);
create policy "appointments public read"
  on public.appointments for select using (true);
create policy "appointments public update"
  on public.appointments for update using (true) with check (true);
create policy "appointments public delete"
  on public.appointments for delete using (true);

-- CONTACT INQUIRIES: visitors may submit; the admin dashboard may read.
drop policy if exists "inquiries public insert" on public.contact_inquiries;
drop policy if exists "inquiries public read"   on public.contact_inquiries;
drop policy if exists "inquiries public delete" on public.contact_inquiries;

create policy "inquiries public insert"
  on public.contact_inquiries for insert with check (true);
create policy "inquiries public read"
  on public.contact_inquiries for select using (true);
create policy "inquiries public delete"
  on public.contact_inquiries for delete using (true);

-- SITE SETTINGS: the public site reads content; the CMS writes it.
drop policy if exists "settings public read"  on public.site_settings;
drop policy if exists "settings public write" on public.site_settings;

create policy "settings public read"
  on public.site_settings for select using (true);
create policy "settings public write"
  on public.site_settings for all using (true) with check (true);

-- ADMIN USERS: no anon access at all (login happens server-side).
drop policy if exists "admin users server only" on public.admin_users;

-- MEMBER CLUB: only the API layer / service role touches these tables.
drop policy if exists "members server only"        on public.member_users;
drop policy if exists "member activity server only" on public.member_activity_log;


-- ---------------------------------------------------------------------------
-- 8. REALTIME (live admin dashboard refresh)
-- ---------------------------------------------------------------------------
do $$
begin
  begin
    alter publication supabase_realtime add table public.appointments;
  exception when duplicate_object then null;
  end;
  begin
    alter publication supabase_realtime add table public.contact_inquiries;
  exception when duplicate_object then null;
  end;
  begin
    alter publication supabase_realtime add table public.site_settings;
  exception when duplicate_object then null;
  end;
end;
$$;


-- ---------------------------------------------------------------------------
-- 9. OPTIONAL: create your first administrator
--    Replace the email/password below, then uncomment and run.
--    The hash format matches the app: sha256(password + salt)
-- ---------------------------------------------------------------------------
-- insert into public.admin_users (email, full_name, role, password_hash)
-- values (
--   'admin@yourdomain.com',
--   'Studio Administrator',
--   'super_admin',
--   encode(extensions.digest('YourStrongPassword' || 'phoenix_tattooz_secure_2019_hisar', 'sha256'), 'hex')
-- )
-- on conflict (email) do update
--   set password_hash = excluded.password_hash,
--       full_name     = excluded.full_name;


-- ---------------------------------------------------------------------------
-- 10. VERIFY (run these manually after the schema is created)
-- ---------------------------------------------------------------------------
-- select table_name from information_schema.tables
--   where table_schema = 'public'
--   order by table_name;
--
-- select schemaname, tablename, policyname, cmd
--   from pg_policies
--   where schemaname = 'public'
--   order by tablename, cmd;
--
-- select * from public.site_settings;
-- select * from public.appointments order by created_at desc limit 20;
-- select * from public.contact_inquiries order by created_at desc limit 20;
