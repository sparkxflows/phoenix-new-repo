/**
 * End-to-end test for the Vercel serverless API layer.
 *
 *   npm run api:smoke
 *
 * Boots the mock Supabase emulator + the API handlers, then walks the real user
 * journeys: member signup → signin → profile → reward claim → admin directory
 * → CMS read/write → image upload → admin login → chatbot.
 */
import { spawn } from 'node:child_process';
import { setTimeout as sleep } from 'node:timers/promises';

const MOCK_PORT = 54321;
const API_PORT = 4100;

const results = [];
function check(name, ok, detail = '') {
  results.push({ name, ok, detail });
  console.log(`${ok ? '✓' : '✗'} ${name}${detail ? ` — ${detail}` : ''}`);
}

function start(cmd, args, env) {
  const child = spawn(cmd, args, {
    env: { ...process.env, ...env },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  child.stdout.on('data', (d) => process.env.VERBOSE && process.stdout.write(`[>] ${d}`));
  child.stderr.on('data', (d) => process.env.VERBOSE && process.stderr.write(`[!] ${d}`));
  return child;
}

const mock = start(process.execPath, ['scripts/mock-supabase.mjs'], { MOCK_PORT: String(MOCK_PORT) });
const api = start(
  process.execPath,
  ['./node_modules/tsx/dist/cli.mjs', 'scripts/serve-api.ts'],
  {
    API_PORT: String(API_PORT),
    SUPABASE_URL: `http://127.0.0.1:${MOCK_PORT}`,
    SUPABASE_SERVICE_ROLE_KEY: 'test-service-role-key',
    SUPABASE_ANON_KEY: 'test-anon-key',
    VITE_SUPABASE_URL: '',
    VITE_SUPABASE_ANON_KEY: '',
    GEMINI_API_KEY: '',
    AUTH_TOKEN_SECRET: 'test-token-secret',
  }
);

const BASE = `http://127.0.0.1:${API_PORT}`;
const MOCK = `http://127.0.0.1:${MOCK_PORT}`;

async function call(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, options);
  const text = await res.text();
  let body = null;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    body = text;
  }
  return { status: res.status, body };
}

const json = (payload) => ({
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(payload),
});

try {
  // Wait for both services
  for (let i = 0; i < 40; i += 1) {
    try {
      const r = await fetch(`${MOCK}/__test/dump`);
      const h = await fetch(`${BASE}/api/health`);
      if (r.ok && h.ok) break;
    } catch {
      /* retry */
    }
    await sleep(250);
  }
  await fetch(`${MOCK}/__test/reset`, { method: 'POST' });

  // 1. Health
  const health = await call('/api/health');
  check('GET /api/health reports the server config', health.status === 200 && health.body.config.serviceRoleKey === 'present');

  // 2. Member signup
  const signup = await call('/api/auth/signup', json({
    name: 'Smoke Test Member',
    email: 'smoke@example.com',
    password: 'secret123',
    birthdate: '1996-04-12',
  }));
  check(
    'POST /api/auth/signup creates a member + birthday voucher',
    signup.status === 200 && signup.body.success === true && Boolean(signup.body.token) && Boolean(signup.body.user.claims.birthday),
    signup.body?.user?.claims?.birthday?.code
  );
  const token = signup.body?.token;

  // 3. Duplicate signup rejected
  const dupe = await call('/api/auth/signup', json({
    name: 'Smoke Test Member',
    email: 'smoke@example.com',
    password: 'secret123',
  }));
  check('Duplicate email is rejected', dupe.status === 400);

  // 4. Signin
  const signin = await call('/api/auth/signin', json({ email: 'smoke@example.com', password: 'secret123' }));
  check('POST /api/auth/signin returns a signed token', signin.status === 200 && Boolean(signin.body.token));

  const badPassword = await call('/api/auth/signin', json({ email: 'smoke@example.com', password: 'wrong' }));
  check('Wrong password is rejected', badPassword.status === 401);

  // 5. Profile
  const me = await call('/api/auth/me', { headers: { Authorization: `Bearer ${token}` } });
  check('GET /api/auth/me resolves the token', me.status === 200 && me.body.user?.email === 'smoke@example.com');

  const meNoToken = await call('/api/auth/me');
  check('GET /api/auth/me blocks anonymous callers', meNoToken.status === 401);

  // 6. Reward claim (once only)
  const claim = await call('/api/rewards/claim', {
    ...json({ offerType: 'referral' }),
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
  });
  check('POST /api/rewards/claim issues a code', claim.status === 200 && claim.body.alreadyClaimed === false, claim.body?.claim?.code);

  const claimAgain = await call('/api/rewards/claim', {
    ...json({ offerType: 'referral' }),
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
  });
  check('Reward can only be claimed once', claimAgain.body?.alreadyClaimed === true);

  const myClaims = await call('/api/rewards/my-claims', { headers: { Authorization: `Bearer ${token}` } });
  check('GET /api/rewards/my-claims returns both vouchers', Object.keys(myClaims.body?.claims || {}).length === 2);

  // 7. Admin directory
  const members = await call('/api/admin/members');
  check(
    'GET /api/admin/members returns the member + activity log',
    members.status === 200 && members.body.total_members === 1 && members.body.activity_log.length >= 2
  );

  // 8. CMS content
  const saveContent = await call('/api/content/custom_artists', json({ value: [{ id: 'a1', name: 'Rohit Sharma' }] }));
  check('POST /api/content/:key saves CMS content', saveContent.status === 200 && saveContent.body.success === true);

  const readContent = await call('/api/content/custom_artists');
  check(
    'GET /api/content/:key reads it back',
    readContent.status === 200 && readContent.body.value?.[0]?.name === 'Rohit Sharma'
  );

  // 9. Reviews
  await call('/api/reviews', json({ action: 'add', review: { name: 'Aman', rating: 5, text: 'Great work' } }));
  const reviews = await call('/api/reviews');
  check('POST+GET /api/reviews round-trips a review', reviews.body?.count === 1);

  // 10. Uploads
  const upload = await call('/api/upload-image', json({
    dataUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
    filename: 'hero.png',
    type: 'gallery',
  }));
  check(
    'POST /api/upload-image stores the file in Supabase Storage',
    upload.status === 200 && String(upload.body.url).includes('/storage/v1/object/public/studio-uploads/'),
    upload.body?.filename
  );

  // 10b. Signed upload URL (bypasses Vercel's ~4.5 MB function body limit)
  const sign = await call('/api/upload-sign', json({ filename: 'hero-video.mp4', contentType: 'video/mp4' }));
  check(
    'POST /api/upload-sign returns a direct Storage upload URL',
    sign.status === 200 && String(sign.body.uploadUrl).includes('/storage/v1/object/upload/sign/'),
    sign.body?.path
  );

  const putRes = await fetch(sign.body.uploadUrl, {
    method: 'PUT',
    headers: { 'Content-Type': 'video/mp4', 'x-upsert': 'true' },
    body: new Uint8Array(1024),
  });
  check('The browser can PUT straight to that signed URL', putRes.ok, `HTTP ${putRes.status}`);

  // 11. Admin login via admin_users table
  await call('/api/admin/register', json({ email: 'owner@studio.com', password: 'supersecret', fullName: 'Studio Owner' }));
  const adminLogin = await call('/api/admin/login', json({ email: 'owner@studio.com', password: 'supersecret' }));
  check('POST /api/admin/login verifies the admin_users hash', adminLogin.status === 200 && adminLogin.body.via === 'admin_users');

  const adminLoginBad = await call('/api/admin/login', json({ email: 'owner@studio.com', password: 'nope' }));
  check('Wrong admin password is rejected', adminLoginBad.status === 401);

  const adminStatus = await call('/api/admin/status');
  check('GET /api/admin/status reports the claimed slot', adminStatus.body?.claimed === true);

  // 12. Admin login via Supabase Auth
  await call('/api/admin/register', json({ email: 'second@studio.com', password: 'x123456', fullName: 'Second' }));
  const authLogin = await call('/api/admin/login', json({ email: 'owner@studio.com', password: 'supabase-auth-password' }));
  check(
    'Admin login also accepts Supabase Auth users',
    authLogin.status === 200 && String(authLogin.body.via).startsWith('supabase-auth')
  );

  // 13. Chatbot
  const chat = await call('/api/chat', json({ message: 'How do I book an appointment?' }));
  check('POST /api/chat answers from the studio knowledge base', chat.status === 200 && String(chat.body.reply).includes('Book'));

  // 14. Delete member
  const memberId = members.body.members[0].id;
  const del = await call(`/api/admin/members/${encodeURIComponent(memberId)}`, { method: 'DELETE' });
  const after = await call('/api/admin/members');
  check('DELETE /api/admin/members/:id removes the member', del.status === 200 && after.body.total_members === 0);
} catch (err) {
  check('test run completed without exceptions', false, err?.message || String(err));
} finally {
  api.kill('SIGTERM');
  mock.kill('SIGTERM');
}

const passed = results.filter((r) => r.ok).length;
console.log(`\n${passed}/${results.length} API checks passed`);
process.exit(passed === results.length ? 0 : 1);
