import { chromium } from 'playwright';

const BASE = process.env.BASE_URL || 'http://127.0.0.1:3000';
const browser = await chromium.launch({ args: ['--no-sandbox'] });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto(BASE, { waitUntil: 'networkidle' });
await page.waitForTimeout(1000);

const before = await page.evaluate(() => {
  const header = document.querySelector('header');
  const root = document.querySelector('#root');
  const cs = getComputedStyle(header);
  return {
    headerTop: header.getBoundingClientRect().top,
    position: cs.position,
    zIndex: cs.zIndex,
    htmlOverflowX: getComputedStyle(document.documentElement).overflowX,
    bodyOverflowX: getComputedStyle(document.body).overflowX,
    rootOverflowX: root ? getComputedStyle(root).overflowX : null,
    scrollY: window.scrollY,
  };
});

await page.evaluate(() => window.scrollTo(0, 900));
await page.waitForTimeout(600);

const after = await page.evaluate(() => {
  const header = document.querySelector('header');
  const rect = header.getBoundingClientRect();
  return {
    headerTop: rect.top,
    headerHeight: rect.height,
    scrollY: window.scrollY,
    classList: header.className,
  };
});

console.log(JSON.stringify({ before, after }, null, 2));
await page.screenshot({ path: '/home/user/ui-modern-shots/_sticky-test.png', clip: { x: 0, y: 0, width: 1440, height: 400 } });
await browser.close();
