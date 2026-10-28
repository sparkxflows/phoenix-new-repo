import { chromium } from 'playwright';

const BASE = process.env.BASE_URL || 'http://127.0.0.1:3000';
const out = process.env.OUT_DIR || '/home/user/ui-modern-shots';
const browser = await chromium.launch({ args: ['--no-sandbox'] });

// ---- Desktop nav states (clean crops for the before/after deliverable)
const desktop = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 });
await desktop.goto(BASE, { waitUntil: 'networkidle' });
await desktop.waitForTimeout(1400);

const nav = desktop.locator('nav.nav-capsule');
await nav.screenshot({ path: `${out}/nav-active-home.png` });
await nav.getByRole('link', { name: /Rewards/ }).hover();
await desktop.waitForTimeout(600);
await nav.screenshot({ path: `${out}/nav-hover-rewards.png` });
await nav.getByRole('button', { name: /^Gallery$/ }).hover();
await desktop.waitForTimeout(900);
await desktop.screenshot({ path: `${out}/nav-hover-gallery-dropdown.png`, clip: { x: 0, y: 0, width: 1440, height: 360 } });

// ---- Hero CTA hover states
await desktop.mouse.move(20, 700);
await desktop.waitForTimeout(400);
const hero = desktop.locator('section').first();
const ctaRow = hero.locator('div.flex.flex-col.sm\\:flex-row').first();
await ctaRow.screenshot({ path: `${out}/cta-idle.png` });
await hero.getByRole('button', { name: /^Book Appointment$/i }).first().hover();
await desktop.waitForTimeout(550);
await ctaRow.screenshot({ path: `${out}/cta-hover-book.png` });
await hero.getByRole('link', { name: /Book on WhatsApp/i }).first().hover();
await desktop.waitForTimeout(550);
await ctaRow.screenshot({ path: `${out}/cta-hover-whatsapp.png` });
await hero.getByRole('link', { name: /Book on Call/i }).first().hover();
await desktop.waitForTimeout(550);
await ctaRow.screenshot({ path: `${out}/cta-hover-call.png` });

// ---- Full desktop page for the hero + header overview
await desktop.mouse.move(10, 10);
await desktop.waitForTimeout(500);
await desktop.screenshot({ path: `${out}/desktop-home.png`, clip: { x: 0, y: 0, width: 1440, height: 900 } });

// ---- Navbar CTA + sticky behaviour after scroll
await desktop.evaluate(() => window.scrollTo(0, 700));
await desktop.waitForTimeout(700);
await desktop.screenshot({ path: `${out}/desktop-sticky-header.png`, clip: { x: 0, y: 0, width: 1440, height: 140 } });

// ---- Mobile home + drawer
const mobile = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
await mobile.goto(BASE, { waitUntil: 'networkidle' });
await mobile.waitForTimeout(1400);
await mobile.screenshot({ path: `${out}/mobile-home.png` });
await mobile.getByRole('button', { name: 'Toggle navigation menu' }).click();
await mobile.waitForTimeout(800);
await mobile.screenshot({ path: `${out}/mobile-drawer.png` });

await browser.close();
console.log('final shots written to', out);
