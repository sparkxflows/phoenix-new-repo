import { send, readBody, readRawBody, methodNotAllowed, serverError } from '../lib/http.js';
import { sbUpload } from '../lib/sb.js';

const MIME_BY_EXT: Record<string, string> = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
};

function extFromMime(mime: string): string {
  if (mime.includes('jpeg') || mime.includes('jpg')) return '.jpg';
  if (mime.includes('webp')) return '.webp';
  if (mime.includes('svg')) return '.svg';
  if (mime.includes('gif')) return '.gif';
  return '.png';
}

function filterName(raw: string, fallbackExt: string): string {
  const base = String(raw || '')
    .replace(/^.*[\\/]/, '')
    .replace(/\.[^.]+$/, '')
    .replace(/[^a-zA-Z0-9_-]/g, '_')
    .slice(0, 30);
  return `${base || 'image'}${fallbackExt}`;
}

/**
 * POST /api/upload-image?type=logo&filename=hero.png
 * Accepts either a JSON { dataUrl } payload or a raw binary body and stores the
 * file in the public `studio-uploads` Supabase Storage bucket.
 */
export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    methodNotAllowed(res, ['POST']);
    return;
  }

  try {
    // 1. JSON body with a base64 data URL
    let body: any = null;
    try {
      body = readBody(req);
    } catch {
      body = null;
    }

    if (body && typeof body === 'object' && typeof body.dataUrl === 'string') {
      const matches = body.dataUrl.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
      const mime = matches ? matches[1].toLowerCase() : 'image/png';
      const buffer = Buffer.from(matches ? matches[2] : body.dataUrl, 'base64');
      const ext = matches ? extFromMime(mime) : '.png';
      const prefix = body.type ? `${String(body.type).replace(/[^a-zA-Z0-9_-]/g, '_')}_` : 'img_';
      const filename = `${prefix}${Date.now()}_${Math.random().toString(36).slice(2, 7)}${ext}`;

      const uploaded = await sbUpload(`images/${filename}`, buffer, MIME_BY_EXT[ext] || 'image/png');
      if (uploaded.error || !uploaded.data) {
        send(res, 500, { success: false, error: uploaded.error?.message || 'Upload failed' });
        return;
      }

      send(res, 200, { success: true, url: uploaded.data.url, filename, size: buffer.length, storage: 'supabase' });
      return;
    }

    // 2. Raw binary body
    const buffer = await readRawBody(req);
    if (!buffer || buffer.length === 0) {
      send(res, 400, { success: false, error: 'Empty file payload' });
      return;
    }

    const typePrefix = req.query?.type ? `${String(req.query.type).replace(/[^a-zA-Z0-9_-]/g, '_')}_` : 'img_';
    const rawName = String(req.query?.filename || 'image.png');
    const ext = (rawName.match(/\.[a-zA-Z0-9]+$/) || ['.png'])[0].toLowerCase();
    const safeExt = MIME_BY_EXT[ext] ? ext : '.png';
    const filename = `${typePrefix}${Date.now()}_${Math.random().toString(36).slice(2, 7)}${safeExt}`;

    const uploaded = await sbUpload(`images/${filename}`, buffer, MIME_BY_EXT[safeExt] || 'image/png');
    if (uploaded.error || !uploaded.data) {
      send(res, 500, { success: false, error: uploaded.error?.message || 'Upload failed' });
      return;
    }

    send(res, 200, { success: true, url: uploaded.data.url, filename, size: buffer.length, storage: 'supabase' });
  } catch (err) {
    serverError(res, err, 'Image upload failed');
  }
}
