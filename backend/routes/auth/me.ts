import { send, methodNotAllowed, serverError } from '../../lib/http.js';
import { sbSelect } from '../../lib/sb.js';
import { publicMember, readToken, verifyMemberToken } from '../../lib/auth.js';

/** GET /api/auth/me — resolves the signed token back to a member profile. */
export default async function handler(req: any, res: any) {
  if (req.method !== 'GET' && req.method !== 'POST') {
    methodNotAllowed(res, ['GET']);
    return;
  }

  try {
    const payload = verifyMemberToken(readToken(req));
    if (!payload) {
      send(res, 401, { success: false, authenticated: false, error: 'Not authenticated' });
      return;
    }

    const found = await sbSelect('member_users', {
      select: '*',
      id: `eq.${payload.sub}`,
      limit: '1',
    });

    const user = found.data?.[0];
    if (!user) {
      send(res, 401, { success: false, authenticated: false, error: 'Member account no longer exists.' });
      return;
    }

    send(res, 200, { success: true, authenticated: true, user: publicMember(user) });
  } catch (err) {
    serverError(res, err, 'Member profile lookup failed');
  }
}
