import { chromium } from 'playwright';

const BASE = process.env.BASE_URL || 'http://127.0.0.1:3000';
const outDir = process.env.OUT_DIR || '/home/user/shots-nav';
const browser = await chromium.launch({ args: ['--no-sandbox'] });
const errors = [];

// Desktop: hero CTA states on the home page
const desktop = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 });
desktop.on('pageerror', (e) => errors.push(e.message));
await desktop.goto(BASE, { waitUntil: 'networkidle' });
await desktop.waitForTimeout(1500);

const hero = desktop.locator('section').first();
const ctaRow = hero.locator('div.flex.flex-col.sm\\:flex-row').first();

await ctaRow.screenshot({ path: `${outDir}/cta-rest.png` });
await hero.getByRole('button', { name: /^Book Appointment$/i }).first().hover();
await desktop.waitForTimeout(500);
await ctaRow.screenshot({ path: `${outDir}/cta-hover-book.png` });
await hero.getByRole('link', { name: /Book on WhatsApp/i }).first().hover();
await desktop.waitForTimeout(500);
await ctaRow.screenshot({ path: `${outDir}/cta-hover-whatsapp.png` });
await hero.getByRole('link', { name: /Book on Call/i }).first().hover();
await desktop.waitForTimeout(500);
await ctaRow.screenshot({ path: `${outDir}/cta-hover-call.png` });

// Nav states
const nav = desktop.locator('nav.nav-capsule');
await nav.screenshot({ path: `${outDir}/nav-default.png` });
await nav.getByRole('link', { name: /Rewards/ }).hover();
await desktop.waitForTimeout(550);
await nav.screenshot({ path: `${outDir}/nav-hover-rewards.png` });
await nav.getByRole('link', { name: /^Artists$/ }).hover();
await desktop.waitForTimeout(550);
await nav.screenshot({ path: `${outDir}/nav-hover-artists.png` });

// About page CTAs still work and get the treatment
await desktop.goto(`${BASE}/about`, { waitUntil: 'networkidle' });
await desktop.waitForTimeout(900);
const aboutBtn = desktop.getByRole('button', { name: /^Book Appointment$/i }).first();
await aboutBtn.scrollIntoViewIfNeeded();
await aboutBtn.hover();
await desktop.waitForTimeout(500);
await desktop.screenshot({ path: `${outDir}/about-cta-hover.png`, clip: { x: 0, y: 0, width: 1440, height: 900 } });

const taggedCount = await desktop.locator('[data-modern-cta]').count();

// Mobile header + bottom bar
const mobile = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
mobile.on('pageerror', (e) => errors.push(e.message));
await mobile.goto(BASE, { waitUntil: 'networkidle' });
await mobile.waitForTimeout(1500);
await mobile.screenshot({ path: `${outDir}/mobile-home.png` });
await mobile.getByRole('button', { name: 'Toggle navigation menu' }).click();
await mobile.waitForTimeout(700);
await mobile.screenshot({ path: `${outDir}/mobile-menu.png` });

console.log('tagged CTAs on about page:', taggedCount);
console.log('page errors:', errors.length ? errors : 'none');
await browser.close();
