import { send, methodNotAllowed, serverError } from '../../lib/http.js';
import { sbSelect } from '../../lib/sb.js';
import { readToken, verifyMemberToken } from '../../lib/auth.js';

/** GET /api/rewards/my-claims — every voucher this member has already claimed. */
export default async function handler(req: any, res: any) {
  if (req.method !== 'GET') {
    methodNotAllowed(res, ['GET']);
    return;
  }

  try {
    const payload = verifyMemberToken(readToken(req));
    if (!payload) {
      send(res, 401, { success: false, error: 'Not authenticated' });
      return;
    }

    const found = await sbSelect('member_users', { select: 'claims', id: `eq.${payload.sub}`, limit: '1' });
    send(res, 200, { success: true, claims: found.data?.[0]?.claims || {} });
  } catch (err) {
    serverError(res, err, 'Rewards lookup failed');
  }
}
