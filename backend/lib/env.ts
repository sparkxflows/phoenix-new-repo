/**
 * Environment resolver for the Vercel serverless API layer.
 *
 * Supabase's Vercel integration injects different variable names depending on
 * the preset (NEXT_PUBLIC_*, SUPABASE_*). The Vite build only sees VITE_*
 * variables, so on the server every common spelling is accepted and the first
 * one that is actually filled in wins.
 */

function pick(...names: string[]): string {
  for (const name of names) {
    const value = process.env[name];
    if (typeof value === 'string' && value.trim()) return value.trim();
  }
  return '';
}

function cleanUrl(url: string): string {
  return url.replace(/\/+$/, '').replace(/\/rest\/v1$/, '').replace(/\/$/, '');
}

/** Rejects the placeholder values shipped in .env.example. */
function isPlaceholder(value: string): boolean {
  if (!value) return true;
  if (/^https?:\/\/(127\.0\.0\.1|localhost)/.test(value)) return false;
  return /YOUR-|YOUR_|xxxx|MY_GEMINI/i.test(value);
}

const RAW_URL = cleanUrl(
  pick(
    'SUPABASE_URL',
    'VITE_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_URL',
    'SUPABASE_PROJECT_URL',
    'NEXT_PUBLIC_SUPABASE_PROJECT_URL'
  )
);

export const SUPABASE_URL = isPlaceholder(RAW_URL) ? '' : RAW_URL;

/** Server-only key. Never expose this to the browser. */
export const SERVICE_KEY = pick(
  'SUPABASE_SERVICE_ROLE_KEY',
  'SUPABASE_SECRET_KEY',
  'SUPABASE_SERVICE_KEY',
  'SUPABASE_SECRET'
);

/** Public key, used only for the admin Supabase-Auth sign-in attempt. */
export const ANON_KEY = pick(
  'VITE_SUPABASE_ANON_KEY',
  'SUPABASE_ANON_KEY',
  'SUPABASE_PUBLISHABLE_KEY',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY'
);

export const GEMINI_API_KEY = pick('GEMINI_API_KEY', 'GOOGLE_API_KEY', 'GOOGLE_GENAI_API_KEY');

/** Secret used to sign member session tokens (stateless, survives cold starts). */
export const TOKEN_SECRET =
  pick('AUTH_TOKEN_SECRET', 'MEMBER_TOKEN_SECRET') || SERVICE_KEY || 'phoenix-tattooz-fallback-secret';

export const HAS_SUPABASE = Boolean(SUPABASE_URL && SERVICE_KEY);

export const UPLOAD_BUCKET = pick('SUPABASE_UPLOAD_BUCKET') || 'studio-uploads';

/** Password salt used by the original studio app for admin password hashes. */
export const ADMIN_SALT = 'phoenix_tattooz_secure_2019_hisar';
