import { send, readBody, methodNotAllowed, serverError } from '../lib/http.js';
import { SUPABASE_URL, SERVICE_KEY, UPLOAD_BUCKET, HAS_SUPABASE } from '../lib/env.js';

/**
 * POST /api/upload-sign
 *   body: { filename, contentType?, folder? }
 *   ->  { success, uploadUrl, publicUrl, path, token }
 *
 * Returns a short-lived **signed upload URL** so the browser can PUT the file
 * straight into Supabase Storage.
 *
 * Why: Vercel caps serverless request bodies at ~4.5 MB, so a hero video can
 * never travel through /api/upload-video on the Hobby plan. Uploading directly
 * to Storage removes that limit and keeps the function payload tiny.
 */
function extFromName(name: string, fallback: string): string {
  const match = String(name || '').match(/\.[a-zA-Z0-9]+$/);
  return match ? match[0].toLowerCase() : fallback;
}

function safeBase(name: string): string {
  return (
    String(name || 'file')
      .replace(/^.*[\\/]/, '')
      .replace(/\.[^.]+$/, '')
      .replace(/[^a-zA-Z0-9_-]/g, '_')
      .slice(0, 30) || 'file'
  );
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    methodNotAllowed(res, ['POST']);
    return;
  }

  try {
    if (!HAS_SUPABASE) {
      send(res, 503, {
        success: false,
        error: 'Supabase Storage is not configured on the server.',
        hint: 'Add SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in Vercel, then redeploy.',
      });
      return;
    }

    const { filename, contentType, folder } = readBody(req);
    if (!filename) {
      send(res, 400, { success: false, error: 'filename is required.' });
      return;
    }

    const isVideo = String(contentType || '').startsWith('video/') || /\.(mp4|webm|mov|ogg)$/i.test(filename);
    const dir = folder === 'videos' || (!folder && isVideo) ? 'videos' : 'images';
    const ext = extFromName(filename, isVideo ? '.mp4' : '.png');
    const path = `${dir}/${safeBase(filename)}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}${ext}`;

    const signRes = await fetch(`${SUPABASE_URL}/storage/v1/object/upload/sign/${UPLOAD_BUCKET}/${path}`, {
      method: 'POST',
      headers: {
        apikey: SERVICE_KEY,
        Authorization: `Bearer ${SERVICE_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({}),
    });

    const signBody: any = await signRes.json().catch(() => null);

    if (!signRes.ok || !signBody?.url) {
      send(res, 500, {
        success: false,
        error: signBody?.message || `Could not create a signed upload URL (HTTP ${signRes.status}).`,
        hint: 'Make sure the `studio-uploads` bucket exists (supabase-schema.sql creates it).',
      });
      return;
    }

    send(res, 200, {
      success: true,
      path,
      token: signBody.token || null,
      uploadUrl: `${SUPABASE_URL}${signBody.url}`,
      publicUrl: `${SUPABASE_URL}/storage/v1/object/public/${UPLOAD_BUCKET}/${path}`,
    });
  } catch (err) {
    serverError(res, err, 'Signed upload URL failed');
  }
}
