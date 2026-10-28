import { send, methodNotAllowed, serverError } from '../../../lib/http.js';
import { sbSelect } from '../../../lib/sb.js';

/**
 * GET /api/admin/members
 * Returns the Studio Club directory plus the live activity log that powers the
 * "Member Logins" panel in the admin dashboard.
 */
export default async function handler(req: any, res: any) {
  if (req.method !== 'GET') {
    methodNotAllowed(res, ['GET']);
    return;
  }

  try {
    const users = await sbSelect('member_users', {
      select: 'id,name,email,birthdate,created_at,last_login,sign_in_count,claims,sign_in_history',
      order: 'created_at.desc',
      limit: '500',
    });

    if (users.error) {
      send(res, 500, { success: false, error: users.error.message });
      return;
    }

    const activity = await sbSelect('member_activity_log', {
      select: '*',
      order: 'timestamp.desc',
      limit: '150',
    });

    const members = users.data || [];

    send(res, 200, {
      success: true,
      members,
      activity_log: activity.data || [],
      total_members: members.length,
    });
  } catch (err) {
    serverError(res, err, 'Failed to fetch members');
  }
}
