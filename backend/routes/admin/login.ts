import { send, readBody, methodNotAllowed, serverError } from '../../lib/http.js';
import { sbSelect } from '../../lib/sb.js';
import { hashAdminPassword } from '../../lib/auth.js';
import { ANON_KEY, SUPABASE_URL, HAS_SUPABASE } from '../../lib/env.js';

/**
 * POST /api/admin/login
 *
 * Two server-side strategies, same order as the original app:
 *   1. Supabase Auth (dashboard-managed users) — needs the public key.
 *   2. admin_users table + sha256(password + salt) fallback.
 *
 * The password never leaves the server unverified and no secret is bundled
 * into the browser build.
 */
export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    methodNotAllowed(res, ['POST']);
    return;
  }

  try {
    const { email, password } = readBody(req);
    if (!email || !password) {
      send(res, 400, { success: false, error: 'Email and password are required.' });
      return;
    }

    const cleanEmail = String(email).trim().toLowerCase();
    const rawPassword = String(password);

    // 1. Supabase Auth
    if (SUPABASE_URL && ANON_KEY) {
      try {
        const authRes = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
          method: 'POST',
          headers: { apikey: ANON_KEY, 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: cleanEmail, password: rawPassword }),
        });

        const authBody: any = await authRes.json().catch(() => null);
        if (authRes.ok && authBody?.access_token) {
          const meta = authBody.user?.user_metadata || {};
          send(res, 200, {
            success: true,
            via: 'supabase-auth',
            session: {
              token: authBody.access_token,
              email: authBody.user?.email || cleanEmail,
              full_name: meta.full_name || meta.name || 'Studio Administrator',
              role: meta.role || 'admin',
              loggedInAt: new Date().toISOString(),
            },
          });
          return;
        }
      } catch {
        // fall through to the table check
      }
    }

    // 2. admin_users table
    if (HAS_SUPABASE) {
      const found = await sbSelect('admin_users', { select: '*', email: `eq.${cleanEmail}`, limit: '1' });
      const admin = found.data?.[0];

      if (admin && admin.password_hash === hashAdminPassword(rawPassword)) {
        send(res, 200, {
          success: true,
          via: 'admin_users',
          session: {
            token: `tok_${Math.random().toString(36).slice(2)}${Date.now()}`,
            email: admin.email,
            full_name: admin.full_name || 'Studio Administrator',
            role: admin.role || 'super_admin',
            loggedInAt: new Date().toISOString(),
          },
        });
        return;
      }
    }

    send(res, 401, {
      success: false,
      error:
        'Invalid admin credentials. Create this user in Supabase → Authentication → Users, or add a row to the admin_users table.',
    });
  } catch (err) {
    serverError(res, err, 'Admin login failed');
  }
}
