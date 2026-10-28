/**
 * SINGLE Vercel Serverless Function — routes every /api/* request internally.
 *
 * Why one function instead of ~18?
 *   The Vercel Hobby plan allows at most 12 Serverless Functions per deployment.
 *   A catch-all router keeps the whole backend inside one function, which also
 *   means one cold start and one bundle for the entire API.
 *
 * The individual handlers live in `api/_routes/**` (the leading underscore keeps
 * Vercel from deploying them as separate functions).
 */
import health from '../backend/routes/health.js';
import appInfo from '../backend/routes/app-info.js';
import contentKey from '../backend/routes/content/[key].js';
import reviews from '../backend/routes/reviews.js';
import chat from '../backend/routes/chat.js';
import uploadImage from '../backend/routes/upload-image.js';
import uploadVideo from '../backend/routes/upload-video.js';
import uploadSign from '../backend/routes/upload-sign.js';
import authSignup from '../backend/routes/auth/signup.js';
import authSignin from '../backend/routes/auth/signin.js';
import authMe from '../backend/routes/auth/me.js';
import authSignout from '../backend/routes/auth/signout.js';
import rewardsClaim from '../backend/routes/rewards/claim.js';
import rewardsMyClaims from '../backend/routes/rewards/my-claims.js';
import adminLogin from '../backend/routes/admin/login.js';
import adminStatus from '../backend/routes/admin/status.js';
import adminRegister from '../backend/routes/admin/register.js';
import adminMembers from '../backend/routes/admin/members/index.js';
import adminMemberById from '../backend/routes/admin/members/[id].js';
import { send } from '../backend/lib/http.js';

type Handler = (req: any, res: any) => any;

interface Route {
  /** Path segments; a segment starting with ":" is captured into req.query. */
  pattern: string[];
  handlers: Record<string, Handler>;
}

const ROUTES: Route[] = [
  { pattern: ['health'], handlers: { GET: health } },
  { pattern: ['app-info'], handlers: { GET: appInfo } },
  { pattern: ['content', ':key'], handlers: { GET: contentKey, POST: contentKey, PUT: contentKey } },
  { pattern: ['reviews'], handlers: { GET: reviews, POST: reviews } },
  { pattern: ['chat'], handlers: { POST: chat } },
  { pattern: ['upload-image'], handlers: { POST: uploadImage } },
  { pattern: ['upload-video'], handlers: { POST: uploadVideo } },
  { pattern: ['upload-sign'], handlers: { POST: uploadSign } },
  { pattern: ['auth', 'signup'], handlers: { POST: authSignup } },
  { pattern: ['auth', 'signin'], handlers: { POST: authSignin } },
  { pattern: ['auth', 'me'], handlers: { GET: authMe, POST: authMe } },
  { pattern: ['auth', 'signout'], handlers: { POST: authSignout } },
  { pattern: ['rewards', 'claim'], handlers: { POST: rewardsClaim } },
  { pattern: ['rewards', 'my-claims'], handlers: { GET: rewardsMyClaims } },
  { pattern: ['admin', 'login'], handlers: { POST: adminLogin } },
  { pattern: ['admin', 'status'], handlers: { GET: adminStatus } },
  { pattern: ['admin', 'register'], handlers: { POST: adminRegister } },
  { pattern: ['admin', 'members'], handlers: { GET: adminMembers } },
  { pattern: ['admin', 'members', ':id'], handlers: { DELETE: adminMemberById } },
];

function matchRoute(segments: string[]): { route: Route; params: Record<string, string> } | null {
  for (const route of ROUTES) {
    if (route.pattern.length !== segments.length) continue;
    const params: Record<string, string> = {};
    let ok = true;

    for (let i = 0; i < route.pattern.length; i += 1) {
      const expected = route.pattern[i];
      const actual = segments[i];
      if (expected.startsWith(':')) {
        params[expected.slice(1)] = decodeURIComponent(actual);
      } else if (expected !== actual) {
        ok = false;
        break;
      }
    }

    if (ok) return { route, params };
  }
  return null;
}

/** Normalises `req.query.all` (Vercel catch-all) into path segments. */
function pathSegments(req: any): string[] {
  const raw = req.query?.all ?? req.query?.['...all'];
  const fromQuery = Array.isArray(raw) ? raw : typeof raw === 'string' ? raw.split('/') : [];

  if (fromQuery.length > 0) return fromQuery.filter(Boolean);

  // Fallbacks for local runners that keep the full URL in req.url
  const url: string = req.url || '';
  const path = url.split('?')[0].replace(/^\/api\/?/, '');
  return path.split('/').filter(Boolean);
}

export default async function handler(req: any, res: any) {
  const segments = pathSegments(req);
  const matched = matchRoute(segments);

  if (!matched) {
    send(res, 404, {
      success: false,
      error: `Unknown API route: /api/${segments.join('/')}`,
      hint: 'Try /api/health to check the deployment.',
    });
    return;
  }

  const method = String(req.method || 'GET').toUpperCase();
  const routeHandler = matched.route.handlers[method];

  if (!routeHandler) {
    const allowed = Object.keys(matched.route.handlers);
    res.setHeader('Allow', allowed.join(', '));
    send(res, 405, {
      success: false,
      error: `Method ${method} not allowed on /api/${segments.join('/')}.`,
      allowed,
    });
    return;
  }

  // Handlers read dynamic segments from req.query, exactly like native
  // Vercel dynamic routes did before the consolidation.
  req.query = { ...(req.query || {}), ...matched.params };

  try {
    await routeHandler(req, res);
  } catch (err: any) {
    console.error('[api] unhandled error:', err);
    if (!res.headersSent) {
      send(res, 500, { success: false, error: err?.message || 'Internal server error' });
    }
  }
}
