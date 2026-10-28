import { send, readBody, methodNotAllowed, serverError } from '../../lib/http.js';
import { sbInsert, sbSelect, sbUpdate } from '../../lib/sb.js';
import { randomCode, readToken, verifyMemberToken } from '../../lib/auth.js';

const VALID_TYPES = ['birthday', 'referral', 'welcome'];

/** POST /api/rewards/claim — one claim per member per offer type. */
export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    methodNotAllowed(res, ['POST']);
    return;
  }

  try {
    const payload = verifyMemberToken(readToken(req));
    if (!payload) {
      send(res, 401, {
        success: false,
        error: 'Please sign in or create an account to claim your rewards and gifts.',
      });
      return;
    }

    const { offerType = 'birthday' } = readBody(req);
    if (!VALID_TYPES.includes(offerType)) {
      send(res, 400, { success: false, error: 'Invalid reward offer type.' });
      return;
    }

    const found = await sbSelect('member_users', { select: '*', id: `eq.${payload.sub}`, limit: '1' });
    const user = found.data?.[0];
    if (!user) {
      send(res, 401, { success: false, error: 'Member account no longer exists.' });
      return;
    }

    const claims = user.claims && typeof user.claims === 'object' ? { ...user.claims } : {};

    if (claims[offerType]) {
      send(res, 200, {
        success: true,
        alreadyClaimed: true,
        claim: claims[offerType],
        message: `You have already claimed this ${offerType} offer. Each offer is limited to one claim per member.`,
        user: { id: user.id, name: user.name, email: user.email, claims },
      });
      return;
    }

    const prefix = offerType === 'birthday' ? 'PHX15' : offerType === 'referral' ? 'REF' : 'GIFT';
    const claim = {
      code: randomCode(prefix, user.name),
      claimedAt: new Date().toISOString(),
      offerType,
      discountPercentage: offerType === 'birthday' ? 15 : undefined,
      memberName: user.name,
      memberEmail: user.email,
    };

    claims[offerType] = claim;

    const updated = await sbUpdate('member_users', { id: `eq.${user.id}` }, { claims });
    if (updated.error) {
      send(res, 500, { success: false, error: updated.error.message });
      return;
    }

    send(res, 200, {
      success: true,
      alreadyClaimed: false,
      claim,
      user: { id: user.id, name: user.name, email: user.email, claims },
    });
  } catch (err) {
    serverError(res, err, 'Reward claim failed');
  }
}
