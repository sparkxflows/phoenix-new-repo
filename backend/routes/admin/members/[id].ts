import { send, methodNotAllowed, serverError } from '../../../lib/http.js';
import { sbDelete } from '../../../lib/sb.js';

/** DELETE /api/admin/members/:id — removes a Studio Club member (activity cascades). */
export default async function handler(req: any, res: any) {
  if (req.method !== 'DELETE') {
    methodNotAllowed(res, ['DELETE']);
    return;
  }

  try {
    const id = String(req.query?.id || '').trim();
    if (!id) {
      send(res, 400, { success: false, error: 'Member id is required.' });
      return;
    }

    const removed = await sbDelete('member_users', { id: `eq.${id}` });
    if (removed.error) {
      send(res, 500, { success: false, error: removed.error.message });
      return;
    }

    send(res, 200, { success: true, message: 'Member account removed.' });
  } catch (err) {
    serverError(res, err, 'Failed to delete member');
  }
}
