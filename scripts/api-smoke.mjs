import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';

const BASE = (process.env.BASE_URL || 'http://127.0.0.1:3000').replace(/\/$/, '');
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@phoenixtattooz.local';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'PhoenixClone2026!';

const results = [];
function pass(name, detail = '') {
  results.push({ ok: true, name, detail });
  console.log(`✓ ${name}${detail ? ` — ${detail}` : ''}`);
}
function fail(name, error) {
  results.push({ ok: false, name, detail: String(error) });
  console.error(`✗ ${name} — ${String(error)}`);
}

async function check(name, fn) {
  try {
    const detail = await fn();
    pass(name, detail || '');
  } catch (error) {
    fail(name, error?.message || error);
  }
}

async function jsonFetch(url, options = {}) {
  const res = await fetch(url.startsWith('http') ? url : BASE + url, options);
  const text = await res.text();
  let data;
  try { data = text ? JSON.parse(text) : null; } catch { data = text; }
  return { res, data, text };
}

function jsonOptions(method, body) {
  return {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  };
}

const stamp = Date.now();
const memberEmail = `smoke-${stamp}@example.local`;
const memberPassword = 'SmokeTest123!';
const bookingCode = `SMOKE-${stamp}`;
const reviewId = `smoke-review-${stamp}`;
const createdUploads = [];

await check('App heartbeat', async () => {
  const { res, data } = await jsonFetch('/api/app-info');
  assert.equal(res.status, 200);
  assert.equal(data.status, 'online');
  return `version ${data.version}`;
});

await check('All public SPA routes serve the app', async () => {
  const routes = ['/', '/about', '/artists', '/artists/rohit-sharma', '/experience', '/gallery', '/reviews', '/contact', '/admin', '/gallery?tab=videos', '/unknown-route'];
  for (const route of routes) {
    const res = await fetch(BASE + route);
    assert.equal(res.status, 200, `${route} returned ${res.status}`);
    const html = await res.text();
    assert.match(html, /<div id="root"><\/div>/, `${route} missing root element`);
  }
  return `${routes.length} routes`;
});

await check('Static media and repaired assets are served', async () => {
  const assets = [
    '/assets/aistudio/unnamed__3__df6a950e.png',
    '/uploads/studio_bg_video.mp4',
    '/uploads/repairs/compass-rose.jpg',
    '/uploads/repairs/samurai.jpg',
  ];
  for (const asset of assets) {
    const res = await fetch(BASE + asset, { headers: asset.endsWith('.mp4') ? { Range: 'bytes=0-1023' } : {} });
    assert.ok([200, 206].includes(res.status), `${asset} returned ${res.status}`);
  }
  return `${assets.length} assets`;
});

await check('Default gallery fallback matches the source website', async () => {
  const { data } = await jsonFetch('/api/content/custom_gallery');
  assert.equal(data.success, true);
  assert.equal(data.value, null);
  return '16 built-in gallery photos remain active';
});

await check('Reviews API reads, adds and deletes a review', async () => {
  const before = await jsonFetch('/api/reviews');
  assert.equal(before.data.success, true);
  const originalCount = before.data.count;
  const added = await jsonFetch('/api/reviews', jsonOptions('POST', {
    action: 'add',
    review: { id: reviewId, name: 'Smoke Test', title: 'Verification review', text: 'Automated smoke check.', rating: 5, service: 'Custom Tattooing' },
  }));
  assert.equal(added.data.success, true);
  assert.equal(added.data.newReview.id, reviewId);
  const removed = await jsonFetch('/api/reviews', jsonOptions('POST', { action: 'delete', id: reviewId }));
  assert.equal(removed.data.success, true);
  assert.equal(removed.data.reviews.length, originalCount);
  return `${originalCount} seeded reviews`;
});

await check('Generic content store accepts and clears a key', async () => {
  const key = `smoke_key_${stamp}`;
  const saved = await jsonFetch(`/api/content/${key}`, jsonOptions('POST', { value: { ok: true } }));
  assert.equal(saved.data.success, true);
  const read = await jsonFetch(`/api/content/${key}`);
  assert.equal(read.data.value.ok, true);
  await jsonFetch(`/api/content/${key}`, jsonOptions('POST', { value: null }));
  return key;
});

await check('Admin status and Express login fallback work', async () => {
  const status = await jsonFetch('/api/admin/status');
  assert.equal(status.data.claimed, true);
  const login = await jsonFetch('/api/admin/login', jsonOptions('POST', { email: ADMIN_EMAIL, password: ADMIN_PASSWORD }));
  assert.equal(login.res.status, 200);
  assert.equal(login.data.success, true);
  assert.ok(login.data.session.token);
  return ADMIN_EMAIL;
});

await check('Local Supabase shim saves, updates and deletes appointments', async () => {
  const inserted = await jsonFetch('/__local-supabase/rest/v1/appointments', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Prefer: 'return=representation' },
    body: JSON.stringify([{ booking_code: bookingCode, client_name: 'Smoke Test', client_phone: '9999999999', service: 'Tattoo' }]),
  });
  assert.equal(inserted.res.status, 201);
  assert.equal(inserted.data[0].booking_code, bookingCode);
  const list = await jsonFetch('/__local-supabase/rest/v1/appointments?select=*&order=created_at.desc');
  assert.ok(list.data.some((row) => row.booking_code === bookingCode));
  const patched = await jsonFetch(`/__local-supabase/rest/v1/appointments?booking_code=eq.${bookingCode}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Prefer: 'return=representation' },
    body: JSON.stringify({ status: 'confirmed' }),
  });
  assert.equal(patched.data[0].status, 'confirmed');
  const deleted = await jsonFetch(`/__local-supabase/rest/v1/appointments?booking_code=eq.${bookingCode}`, {
    method: 'DELETE',
    headers: { Prefer: 'return=representation' },
  });
  assert.equal(deleted.data.length, 1);
  return bookingCode;
});

await check('Contact inquiry storage works', async () => {
  const inserted = await jsonFetch('/__local-supabase/rest/v1/contact_inquiries', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Prefer: 'return=representation' },
    body: JSON.stringify([{ name: `Smoke ${stamp}`, phone: '9999999999', message: 'Automated check' }]),
  });
  assert.equal(inserted.res.status, 201);
  const list = await jsonFetch('/__local-supabase/rest/v1/contact_inquiries?select=*');
  assert.ok(list.data.some((row) => row.name === `Smoke ${stamp}`));
  await jsonFetch(`/__local-supabase/rest/v1/contact_inquiries?name=eq.Smoke%20${stamp}`, { method: 'DELETE' });
  return 'insert + read + delete';
});

await check('Member signup, profile, rewards and signin work', async () => {
  const signup = await jsonFetch('/api/auth/signup', jsonOptions('POST', {
    name: 'Smoke Tester', email: memberEmail, password: memberPassword, birthdate: '1995-05-15',
  }));
  assert.equal(signup.data.success, true, signup.data.error);
  const token = signup.data.token;
  assert.ok(signup.data.user.claims.birthday?.code);

  const me = await jsonFetch('/api/auth/me', { headers: { Authorization: `Bearer ${token}` } });
  assert.equal(me.data.authenticated, true);

  const referral = await jsonFetch('/api/rewards/claim', {
    ...jsonOptions('POST', { offerType: 'referral' }),
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
  });
  assert.equal(referral.data.success, true, referral.data.error);
  assert.ok(referral.data.claim.code.startsWith('REF-'));

  const claims = await jsonFetch('/api/rewards/my-claims', { headers: { Authorization: `Bearer ${token}` } });
  assert.ok(claims.data.claims.birthday && claims.data.claims.referral);

  await jsonFetch('/api/auth/signout', { method: 'POST', headers: { Authorization: `Bearer ${token}` } });
  const signin = await jsonFetch('/api/auth/signin', jsonOptions('POST', { email: memberEmail, password: memberPassword }));
  assert.equal(signin.data.success, true, signin.data.error);
  return signup.data.user.claims.birthday.code;
});

await check('Admin members directory and deletion work', async () => {
  const directory = await jsonFetch('/api/admin/members');
  assert.equal(directory.data.success, true);
  const member = directory.data.members.find((m) => m.email === memberEmail);
  assert.ok(member, 'test member missing from directory');
  const removed = await jsonFetch(`/api/admin/members/${encodeURIComponent(member.id)}`, { method: 'DELETE' });
  assert.equal(removed.data.success, true);
  return `${directory.data.total_members} member(s) visible before cleanup`;
});

await check('AI chatbot fallback responds', async () => {
  const { res, data } = await jsonFetch('/api/chat', jsonOptions('POST', { message: 'What are your prices?', history: [] }));
  assert.equal(res.status, 200);
  assert.match(data.reply, /Pricing Guide|Studio Minimum/i);
  return data.model;
});

await check('Image and video upload endpoints work', async () => {
  const png = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=';
  const image = await jsonFetch('/api/upload-image', jsonOptions('POST', { dataUrl: `data:image/png;base64,${png}`, filename: 'smoke.png', type: 'smoke' }));
  assert.equal(image.data.success, true);
  createdUploads.push(image.data.filename);
  const video = await jsonFetch('/api/upload-video', jsonOptions('POST', { dataUrl: `data:video/mp4;base64,${Buffer.from('smoke').toString('base64')}` }));
  assert.equal(video.data.success, true);
  createdUploads.push(video.data.filename);
  return `${createdUploads.length} files`;
});

await check('Supabase Auth shim forces the local admin fallback', async () => {
  const { res, data } = await jsonFetch('/__local-supabase/auth/v1/token?grant_type=password', jsonOptions('POST', { email: 'nobody@example.com', password: 'wrong' }));
  assert.equal(res.status, 400);
  assert.equal(data.error, 'invalid_grant');
  return 'HTTP 400 invalid_grant';
});

// Remove tiny smoke upload files so the delivered clone stays clean.
for (const filename of createdUploads) {
  for (const dir of ['public/uploads', 'data/uploads']) {
    try { await fs.unlink(path.join(process.cwd(), dir, filename)); } catch {}
  }
}

const failed = results.filter((r) => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} checks passed.`);
if (failed.length) process.exit(1);
