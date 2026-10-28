import { send, readBody, methodNotAllowed, serverError } from '../../lib/http.js';
import { sbInsert, sbSelect } from '../../lib/sb.js';
import { hashAdminPassword } from '../../lib/auth.js';

/**
 * POST /api/admin/register — one-time administrator claim.
 * Locked as soon as an admin_users row exists.
 */
export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    methodNotAllowed(res, ['POST']);
    return;
  }

  try {
    const existing = await sbSelect('admin_users', { select: 'id', limit: '1' });
    if (existing.data && existing.data.length > 0) {
      send(res, 400, {
        success: false,
        error:
          'Registration is locked. The administrative slot for Phoenix Tattooz has already been claimed.',
      });
      return;
    }

    const { email, password, fullName } = readBody(req);
    if (!email || !password || !fullName) {
      send(res, 400, { success: false, error: 'All fields are required.' });
      return;
    }
    if (String(password).length < 6) {
      send(res, 400, { success: false, error: 'Password must be at least 6 characters long.' });
      return;
    }

    const adminUser = {
      id: `admin_${Math.random().toString(36).substring(2, 10)}`,
      email: String(email).trim().toLowerCase(),
      full_name: String(fullName).trim(),
      role: 'super_admin',
      password_hash: hashAdminPassword(String(password)),
      created_at: new Date().toISOString(),
    };

    const inserted = await sbInsert('admin_users', [adminUser]);
    if (inserted.error) {
      send(res, 500, { success: false, error: inserted.error.message });
      return;
    }

    send(res, 200, {
      success: true,
      user: {
        id: adminUser.id,
        email: adminUser.email,
        full_name: adminUser.full_name,
        role: adminUser.role,
        created_at: adminUser.created_at,
      },
    });
  } catch (err) {
    serverError(res, err, 'Admin registration failed');
  }
}
