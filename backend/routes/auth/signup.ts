import { send, readBody, methodNotAllowed, serverError } from '../../lib/http.js';
import { sbInsert, sbSelect } from '../../lib/sb.js';
import { hashWithSalt, newSalt, publicMember, randomCode, signMemberToken } from '../../lib/auth.js';

/** POST /api/auth/signup — creates a Studio Club member and returns a signed token. */
export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    methodNotAllowed(res, ['POST']);
    return;
  }

  try {
    const { name, email, password, birthdate } = readBody(req);

    if (!name || typeof name !== 'string' || !name.trim()) {
      send(res, 400, { success: false, error: 'Please enter your full name.' });
      return;
    }
    if (!email || typeof email !== 'string' || !email.includes('@')) {
      send(res, 400, { success: false, error: 'Please provide a valid email address.' });
      return;
    }
    if (!password || typeof password !== 'string' || password.length < 6) {
      send(res, 400, { success: false, error: 'Password must be at least 6 characters.' });
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();
    const existing = await sbSelect('member_users', {
      select: 'id',
      email: `eq.${normalizedEmail}`,
      limit: '1',
    });

    if (existing.data && existing.data.length > 0) {
      send(res, 400, {
        success: false,
        error: 'An account with this email address already exists. Please sign in instead.',
      });
      return;
    }

    const salt = newSalt();
    const password_hash = hashWithSalt(password, salt);
    const trimmedBirthdate =
      birthdate && typeof birthdate === 'string' && birthdate.trim() ? birthdate.trim() : null;

    const claims: Record<string, any> = {};
    if (trimmedBirthdate) {
      claims.birthday = {
        code: randomCode('PHX15', name),
        claimedAt: new Date().toISOString(),
        offerType: 'birthday',
        discountPercentage: 15,
        memberName: name.trim(),
        memberEmail: normalizedEmail,
        birthdate: trimmedBirthdate,
        instantDiscount: true,
      };
    }

    const now = new Date().toISOString();
    const member = {
      id: `mbr_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      name: name.trim(),
      email: normalizedEmail,
      birthdate: trimmedBirthdate,
      salt,
      password_hash,
      claims,
      sign_in_count: 1,
      last_login: now,
      sign_in_history: [{ timestamp: now, type: 'signup' }],
      created_at: now,
    };

    const inserted = await sbInsert('member_users', [member]);
    if (inserted.error) {
      send(res, 500, { success: false, error: inserted.error.message });
      return;
    }

    // Activity log powers the live "Member Logins" panel in the admin dashboard.
    await sbInsert(
      'member_activity_log',
      [
        {
          id: `act_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
          member_id: member.id,
          member_name: member.name,
          member_email: member.email,
          type: 'signup',
          birthdate: member.birthdate,
          instant_discount: Boolean(claims.birthday),
          discount_code: claims.birthday?.code || null,
          timestamp: now,
        },
      ],
      { returning: false }
    ).catch(() => undefined);

    send(res, 200, {
      success: true,
      token: signMemberToken(member.id, member.email),
      user: publicMember(member),
    });
  } catch (err) {
    serverError(res, err, 'Member signup failed');
  }
}
