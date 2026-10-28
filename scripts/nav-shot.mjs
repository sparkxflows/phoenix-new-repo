import { chromium } from 'playwright';

const BASE = process.env.BASE_URL || 'http://127.0.0.1:3000';
const outDir = process.env.OUT_DIR || '/home/user/shots-nav';
const browser = await chromium.launch({ args: ['--no-sandbox'] });
const page = await browser.newPage({ viewport: { width: 1440, height: 260 }, deviceScaleFactor: 2 });
await page.goto(BASE, { waitUntil: 'networkidle' });
await page.waitForTimeout(1200);

const nav = page.locator('nav.nav-capsule');
await nav.screenshot({ path: `${outDir}/nav-default.png` });

// hover an inactive item
await page.getByRole('link', { name: /^About$/ }).hover();
await page.waitForTimeout(600);
await nav.screenshot({ path: `${outDir}/nav-hover-about.png` });

// hover the rewards item
await page.getByRole('link', { name: /Rewards/ }).hover();
await page.waitForTimeout(600);
await nav.screenshot({ path: `${outDir}/nav-hover-rewards.png` });

// click about to show active state on a new route
await page.getByRole('link', { name: /^About$/ }).click();
await page.waitForTimeout(900);
await page.locator('nav.nav-capsule').screenshot({ path: `${outDir}/nav-active-about.png` });

console.log('nav shots done');
await browser.close();
