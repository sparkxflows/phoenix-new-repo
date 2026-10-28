import { chromium } from 'playwright';

const BASE_URL = process.env.BASE_URL || 'http://127.0.0.1:3000';
const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
const results = [];

function record(name, ok, detail = '') {
  results.push({ name, ok, detail });
  console.log(`${ok ? '✓' : '✗'} ${name}${detail ? ` — ${detail}` : ''}`);
}

async function closeBookingModal(page) {
  const close = page.getByRole('button', { name: 'Close booking modal' }).first();
  if (await close.isVisible().catch(() => false)) {
    await close.click();
    await page.getByRole('heading', { name: 'Book Studio Appointment' }).waitFor({ state: 'hidden', timeout: 5000 });
  }
}

async function expectBookingModal(page) {
  await page.getByRole('heading', { name: 'Book Studio Appointment' }).waitFor({ state: 'visible', timeout: 5000 });
}

async function runViewport(label, width, height) {
  const context = await browser.newContext({ viewport: { width, height } });
  const page = await context.newPage();
  const consoleErrors = [];

  page.on('console', (msg) => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });
  page.on('pageerror', (err) => consoleErrors.push(err.message));

  await page.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(1800);

  record(
    `${label}: hero renders without runtime errors`,
    await page.getByRole('heading', { name: 'INK YOUR STORY' }).isVisible(),
  );

  record(
    `${label}: left booking launcher is hidden on mobile/tablet`,
    !(await page.locator('aside[aria-label="Quick Booking and Contact"]').isVisible()),
  );

  record(
    `${label}: header CTA opens booking modal`,
    await (async () => {
      try {
        const headerCta = width >= 640
          ? page.getByRole('button', { name: /^Book Appointment$/i }).first()
          : page.getByRole('button', { name: 'Book appointment' }).first();
        await headerCta.click();
        await expectBookingModal(page);
        await closeBookingModal(page);
        return true;
      } catch (error) {
        console.log(`  header CTA error: ${error.message}`);
        await closeBookingModal(page).catch(() => {});
        return false;
      }
    })(),
  );

  record(
    `${label}: hero CTA opens booking modal`,
    await (async () => {
      try {
        await page.locator('section').first().getByRole('button', { name: /^Book Appointment$/i }).first().click();
        await expectBookingModal(page);
        await closeBookingModal(page);
        return true;
      } catch (error) {
        console.log(`  hero CTA error: ${error.message}`);
        await closeBookingModal(page).catch(() => {});
        return false;
      }
    })(),
  );

  record(
    `${label}: bottom bar Book button opens booking modal`,
    await (async () => {
      try {
        await page.getByRole('button', { name: 'Book studio appointment' }).click();
        await expectBookingModal(page);
        await closeBookingModal(page);
        return true;
      } catch (error) {
        console.log(`  bottom bar error: ${error.message}`);
        await closeBookingModal(page).catch(() => {});
        return false;
      }
    })(),
  );

  record(
    `${label}: compact chatbot launcher opens chat window`,
    await (async () => {
      try {
        await page.getByRole('button', { name: 'Toggle Phoenix Studio AI Chatbot' }).click();
        await page.getByText('Suggested Topics:').waitFor({ state: 'visible', timeout: 5000 });
        await page.getByRole('button', { name: 'Close chat window' }).click();
        await page.getByText('Suggested Topics:').waitFor({ state: 'hidden', timeout: 5000 });
        return true;
      } catch (error) {
        console.log(`  chatbot error: ${error.message}`);
        return false;
      }
    })(),
  );

  record(
    `${label}: hamburger opens mobile navigation drawer`,
    await (async () => {
      try {
        await page.getByRole('button', { name: 'Toggle navigation menu' }).click();
        await page.getByText('Gallery Menu').waitFor({ state: 'visible', timeout: 5000 });
        await page.getByRole('button', { name: 'Toggle navigation menu' }).click();
        return true;
      } catch (error) {
        console.log(`  menu error: ${error.message}`);
        return false;
      }
    })(),
  );

  const relevantErrors = consoleErrors.filter((text) => !/ERR_ABORTED|studio_bg_video\.mp4|fonts\.googleapis|gstatic|google\.com\/maps|wa\.me|unsplash/i.test(text));
  record(
    `${label}: no unexpected browser console errors`,
    relevantErrors.length === 0,
    relevantErrors.length ? relevantErrors.slice(0, 3).join(' | ') : `${consoleErrors.length} filtered console message(s) ignored`,
  );

  await context.close();
}

try {
  await runViewport('tablet 720x1080', 720, 1080);
  await runViewport('mobile 510x1080', 510, 1080);
} finally {
  await browser.close();
}

const passed = results.filter((r) => r.ok).length;
console.log(`\n${passed}/${results.length} UI checks passed.`);
if (passed !== results.length) process.exitCode = 1;
