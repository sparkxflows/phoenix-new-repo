import { send, methodNotAllowed, serverError } from '../../lib/http.js';
import { sbSelect } from '../../lib/sb.js';

/** GET /api/admin/status — is an administrator already configured? */
export default async function handler(req: any, res: any) {
  if (req.method !== 'GET') {
    methodNotAllowed(res, ['GET']);
    return;
  }

  try {
    const found = await sbSelect('admin_users', {
      select: 'id,email,full_name,role,created_at',
      limit: '1',
    });

    const admin = found.data?.[0];
    if (admin) {
      send(res, 200, { claimed: true, adminInfo: admin });
      return;
    }
    send(res, 200, { claimed: false });
  } catch (err) {
    serverError(res, err, 'Admin status check failed');
  }
}
