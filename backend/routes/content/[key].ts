import { send, readBody, methodNotAllowed, serverError } from '../../lib/http.js';
import { sbGetSetting, sbSetSetting } from '../../lib/sb.js';

/**
 * GET  /api/content/:key  -> { success, key, value, updatedAt }
 * POST /api/content/:key  -> saves { value } into site_settings
 *
 * Keys used by the site: home_hero, custom_artists, custom_gallery,
 * custom_videos, custom_logo, custom_about_content, studio_philosophy,
 * custom_gifts_rewards, customer_reviews.
 */
export default async function handler(req: any, res: any) {
  const key = String(req.query?.key || '').trim();
  if (!key) {
    send(res, 400, { success: false, error: 'Content key is required.' });
    return;
  }

  try {
    if (req.method === 'GET') {
      const { data, error } = await sbGetSetting(key);
      if (error) {
        send(res, 200, { success: true, key, value: null, updatedAt: null, warning: error.message });
        return;
      }
      const row = data && data[0];
      send(res, 200, {
        success: true,
        key,
        value: row?.value ?? null,
        updatedAt: row?.updated_at ?? null,
      });
      return;
    }

    if (req.method === 'POST' || req.method === 'PUT') {
      const body = readBody(req);
      if (!('value' in body)) {
        send(res, 400, { success: false, error: 'Payload must include a "value" field.' });
        return;
      }
      const { error } = await sbSetSetting(key, body.value);
      if (error) {
        send(res, 500, { success: false, error: error.message });
        return;
      }
      send(res, 200, { success: true, key, value: body.value, updatedAt: new Date().toISOString() });
      return;
    }

    methodNotAllowed(res, ['GET', 'POST']);
  } catch (err) {
    serverError(res, err, 'Content endpoint failed');
  }
}
