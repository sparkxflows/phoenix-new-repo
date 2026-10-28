import { chromium } from 'playwright';

const BASE = process.env.BASE_URL || 'http://127.0.0.1:3000';
const browser = await chromium.launch({ args: ['--no-sandbox'] });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

const routes = ['/', '/about', '/artists', '/experience', '/gallery', '/reviews', '/contact'];
const report = {};

for (const route of routes) {
  await page.goto(BASE + route, { waitUntil: 'networkidle' });
  await page.waitForTimeout(900);
  const stats = await page.evaluate(() => {
    const all = Array.from(document.querySelectorAll('button, a'));
    const tagged = all.filter((el) => el.dataset.modernCta);
    return {
      total: all.length,
      tagged: tagged.length,
      gold: tagged.filter((el) => el.dataset.modernCta === 'gold').length,
      dark: tagged.filter((el) => el.dataset.modernCta === 'dark').length,
      untagged: all
        .filter((el) => !el.dataset.modernCta)
        .map((el) => (el.textContent || '').trim().slice(0, 28) || el.getAttribute('aria-label') || el.tagName),
    };
  });
  report[route] = stats;
}

// Hover-state assertion on the three hero CTAs
await page.goto(BASE, { waitUntil: 'networkidle' });
await page.waitForTimeout(1200);

const hero = page.locator('section').first();
const targets = [
  ['Book Appointment', hero.getByRole('button', { name: /^Book Appointment$/i }).first()],
  ['Book on WhatsApp', hero.getByRole('link', { name: /Book on WhatsApp/i }).first()],
  ['Book on Call', hero.getByRole('link', { name: /Book on Call/i }).first()],
];

const hoverChecks = {};
for (const [name, locator] of targets) {
  const before = await locator.evaluate((el) => {
    const s = getComputedStyle(el);
    return { shadow: s.boxShadow, transform: s.transform, filter: s.filter };
  });
  await locator.hover();
  await page.waitForTimeout(700);
  const after = await locator.evaluate((el) => {
    const s = getComputedStyle(el);
    return { shadow: s.boxShadow, transform: s.transform, filter: s.filter };
  });
  hoverChecks[name] = {
    shadowChanged: before.shadow !== after.shadow,
    transformChanged: before.transform !== after.transform,
    filterChanged: before.filter !== after.filter,
    afterTransform: after.transform,
    afterShadow: after.shadow.slice(0, 90),
  };
  await page.mouse.move(5, 700);
  await page.waitForTimeout(250);
}

console.log(JSON.stringify({ report, hoverChecks }, null, 2));
await browser.close();
