import { send, methodNotAllowed } from '../../lib/http.js';

/**
 * POST /api/auth/signout
 * Tokens are stateless, so there is nothing to revoke server-side — the app
 * clears localStorage. This endpoint keeps the frontend contract intact.
 */
export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    methodNotAllowed(res, ['POST']);
    return;
  }
  send(res, 200, { success: true, message: 'Signed out successfully' });
}
