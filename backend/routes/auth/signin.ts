import { send, readBody, methodNotAllowed, serverError } from '../../lib/http.js';
import { sbInsert, sbSelect, sbUpdate } from '../../lib/sb.js';
import { hashWithSalt, publicMember, signMemberToken } from '../../lib/auth.js';

/** POST /api/auth/signin — verifies the password and returns a signed token. */
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

    const normalizedEmail = String(email).trim().toLowerCase();
    const found = await sbSelect('member_users', {
      select: '*',
      email: `eq.${normalizedEmail}`,
      limit: '1',
    });

    const user = found.data?.[0];
    if (!user) {
      send(res, 401, {
        success: false,
        error: 'No member account found with this email. Please sign up.',
      });
      return;
    }

    const hash = hashWithSalt(String(password), user.salt || '');
    if (hash !== user.password_hash) {
      send(res, 401, { success: false, error: 'Incorrect password. Please try again.' });
      return;
    }

    const now = new Date().toISOString();
    const history = Array.isArray(user.sign_in_history) ? user.sign_in_history : [];
    const nextHistory = [{ timestamp: now, type: 'signin' }, ...history].slice(0, 20);
    const signInCount = (user.sign_in_count || 0) + 1;

    await sbUpdate('member_users', { id: `eq.${user.id}` }, {
      last_login: now,
      sign_in_count: signInCount,
      sign_in_history: nextHistory,
    });

    await sbInsert(
      'member_activity_log',
      [
        {
          id: `act_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
          member_id: user.id,
          member_name: user.name,
          member_email: user.email,
          type: 'signin',
          birthdate: user.birthdate || null,
          instant_discount: Boolean(user.claims?.birthday),
          discount_code: user.claims?.birthday?.code || null,
          timestamp: now,
        },
      ],
      { returning: false }
    ).catch(() => undefined);

    send(res, 200, {
      success: true,
      token: signMemberToken(user.id, user.email),
      user: publicMember({ ...user, last_login: now, sign_in_count: signInCount }),
    });
  } catch (err) {
    serverError(res, err, 'Member signin failed');
  }
}
