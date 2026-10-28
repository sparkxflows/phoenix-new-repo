import { send, readBody, readRawBody, methodNotAllowed, serverError } from '../lib/http.js';
import { sbUpload } from '../lib/sb.js';

const MIME_BY_EXT: Record<string, string> = {
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.mov': 'video/quicktime',
  '.ogg': 'video/ogg',
};

/**
 * POST /api/upload-video?filename=bg.mp4
 * Accepts a JSON { dataUrl } payload or a raw binary body and stores the file
 * in the public `studio-uploads` Supabase Storage bucket.
 */
export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    methodNotAllowed(res, ['POST']);
    return;
  }

  try {
    let body: any = null;
    try {
      body = readBody(req);
    } catch {
      body = null;
    }

    // 1. Base64 JSON payload
    if (body && typeof body === 'object' && typeof body.dataUrl === 'string') {
      const matches = body.dataUrl.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
      const mime = matches ? matches[1].toLowerCase() : 'video/mp4';
      let ext = '.mp4';
      if (mime.includes('webm')) ext = '.webm';
      else if (mime.includes('quicktime')) ext = '.mov';
      else if (mime.includes('ogg')) ext = '.ogg';

      const buffer = Buffer.from(matches ? matches[2] : body.dataUrl, 'base64');
      const filename = `bg_video_${Date.now()}_${Math.random().toString(36).slice(2, 7)}${ext}`;

      const uploaded = await sbUpload(`videos/${filename}`, buffer, MIME_BY_EXT[ext]);
      if (uploaded.error || !uploaded.data) {
        send(res, 500, { success: false, error: uploaded.error?.message || 'Upload failed' });
        return;
      }

      send(res, 200, { success: true, url: uploaded.data.url, filename, size: buffer.length, storage: 'supabase' });
      return;
    }

    // 2. Raw binary stream
    const buffer = await readRawBody(req);
    if (!buffer || buffer.length === 0) {
      send(res, 400, { success: false, error: 'Empty file payload' });
      return;
    }

    const rawName = String(req.query?.filename || 'video.mp4');
    const ext = (rawName.match(/\.[a-zA-Z0-9]+$/) || ['.mp4'])[0].toLowerCase();
    const safeExt = MIME_BY_EXT[ext] ? ext : '.mp4';
    const filename = `bg_video_${Date.now()}_${Math.random().toString(36).slice(2, 7)}${safeExt}`;

    const uploaded = await sbUpload(`videos/${filename}`, buffer, MIME_BY_EXT[safeExt]);
    if (uploaded.error || !uploaded.data) {
      send(res, 500, { success: false, error: uploaded.error?.message || 'Upload failed' });
      return;
    }

    send(res, 200, { success: true, url: uploaded.data.url, filename, size: buffer.length, storage: 'supabase' });
  } catch (err) {
    serverError(res, err, 'Video upload failed');
  }
}
