/**
 * Thin Supabase REST client for the serverless functions.
 *
 * Uses the service-role key so RLS cannot block member login, rewards,
 * admin listings or CMS writes. Falls back to plain `fetch` against the
 * PostgREST endpoint so the functions stay dependency-light.
 */
import { SUPABASE_URL, SERVICE_KEY, HAS_SUPABASE } from './env.js';

export interface SbError {
  message: string;
  code?: string;
}

export interface SbResult<T> {
  data: T | null;
  error: SbError | null;
}

function assertConfigured(): void {
  if (!HAS_SUPABASE) {
    throw new Error(
      'Supabase is not configured on the server. Add SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to your Vercel environment variables.'
    );
  }
}

function headers(extra: Record<string, string> = {}): Record<string, string> {
  return {
    apikey: SERVICE_KEY,
    Authorization: `Bearer ${SERVICE_KEY}`,
    'Content-Type': 'application/json',
    ...extra,
  };
}

async function parse<T>(res: Response): Promise<SbResult<T>> {
  const text = await res.text();
  let body: any = null;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    body = text;
  }
  if (!res.ok) {
    return {
      data: null,
      error: {
        message: body?.message || body?.error_description || `HTTP ${res.status}`,
        code: body?.code,
      },
    };
  }
  return { data: body as T, error: null };
}

export async function sbSelect<T = any>(
  table: string,
  query: Record<string, string>
): Promise<SbResult<T[]>> {
  assertConfigured();
  const qs = new URLSearchParams(query).toString();
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${qs}`, {
    headers: headers(),
    cache: 'no-store',
  });
  return parse<T[]>(res);
}

export async function sbInsert<T = any>(
  table: string,
  rows: any[],
  options: { returning?: boolean; onConflict?: string; upsert?: boolean } = {}
): Promise<SbResult<T[]>> {
  assertConfigured();
  const prefer: string[] = [];
  if (options.returning !== false) prefer.push('return=representation');
  if (options.upsert) prefer.push('resolution=merge-duplicates');
  const qs = options.onConflict ? `?on_conflict=${encodeURIComponent(options.onConflict)}` : '';
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}${qs}`, {
    method: 'POST',
    headers: headers({ Prefer: prefer.join(',') }),
    body: JSON.stringify(rows),
  });
  return parse<T[]>(res);
}

export async function sbUpdate<T = any>(
  table: string,
  query: Record<string, string>,
  patch: Record<string, any>
): Promise<SbResult<T[]>> {
  assertConfigured();
  const qs = new URLSearchParams(query).toString();
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${qs}`, {
    method: 'PATCH',
    headers: headers({ Prefer: 'return=representation' }),
    body: JSON.stringify(patch),
  });
  return parse<T[]>(res);
}

export async function sbDelete<T = any>(
  table: string,
  query: Record<string, string>
): Promise<SbResult<T[]>> {
  assertConfigured();
  const qs = new URLSearchParams(query).toString();
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${qs}`, {
    method: 'DELETE',
    headers: headers({ Prefer: 'return=representation' }),
  });
  return parse<T[]>(res);
}

/** Upsert a CMS value into site_settings. */
export async function sbSetSetting(key: string, value: any): Promise<SbResult<any>> {
  return sbInsert(
    'site_settings',
    [{ key, value, updated_at: new Date().toISOString() }],
    { onConflict: 'key', upsert: true }
  );
}

export async function sbGetSetting(key: string): Promise<SbResult<any[]>> {
  return sbSelect('site_settings', { select: 'value,updated_at', key: `eq.${key}`, limit: '1' });
}

/** Upload a file buffer into the public studio-uploads bucket. */
export async function sbUpload(
  path: string,
  body: Buffer | Uint8Array,
  contentType: string
): Promise<SbResult<{ url: string; path: string }>> {
  assertConfigured();
  const { UPLOAD_BUCKET } = await import('./env.js');
  const res = await fetch(`${SUPABASE_URL}/storage/v1/object/${UPLOAD_BUCKET}/${path}`, {
    method: 'POST',
    headers: {
      apikey: SERVICE_KEY,
      Authorization: `Bearer ${SERVICE_KEY}`,
      'Content-Type': contentType,
      'x-upsert': 'true',
    },
    body: body as any,
  });

  if (!res.ok) {
    const text = await res.text();
    let message = `HTTP ${res.status}`;
    try {
      message = JSON.parse(text)?.message || message;
    } catch {
      message = text || message;
    }
    return { data: null, error: { message } };
  }

  return {
    data: {
      url: `${SUPABASE_URL}/storage/v1/object/public/${UPLOAD_BUCKET}/${path}`,
      path,
    },
    error: null,
  };
}
