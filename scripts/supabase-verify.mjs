import { chromium } from 'playwright';

const BASE = process.env.BASE_URL || 'http://127.0.0.1:3000';
const browser = await chromium.launch({ args: ['--no-sandbox'] });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

const failed = [];
const supabaseCalls = [];
page.on('response', (res) => {
  const url = res.url();
  if (url.includes('supabase.co')) {
    supabaseCalls.push({ url: url.replace(/https:\/\/([a-z0-9]+)\.supabase\.co/, 'supabase:$1'), status: res.status() });
    if (res.status() >= 400) failed.push(`${res.status()} ${url}`);
  }
});
const consoleErrors = [];
page.on('console', (m) => {
  if (m.type() === 'error') consoleErrors.push(m.text().slice(0, 160));
});

await page.goto(BASE, { waitUntil: 'networkidle' });
await page.waitForTimeout(2500);

// The CMS hooks read from site_settings on load
await page.goto(`${BASE}/gallery`, { waitUntil: 'networkidle' });
await page.waitForTimeout(2000);

// Confirm the built bundle points at the new project
const bakedUrl = await page.evaluate(async () => {
  const scripts = Array.from(document.querySelectorAll('script[src]')).map((s) => s.src);
  for (const src of scripts) {
    const text = await fetch(src).then((r) => r.text()).catch(() => '');
    const match = text.match(/https:\/\/([a-z0-9]{20})\.supabase\.co/);
    if (match) return match[0];
  }
  return null;
});

console.log(JSON.stringify({
  bakedSupabaseUrl: bakedUrl,
  supabaseCalls: supabaseCalls.slice(0, 12),
  failedSupabaseCalls: failed,
  consoleErrors: consoleErrors.slice(0, 6),
}, null, 2));

await browser.close();
