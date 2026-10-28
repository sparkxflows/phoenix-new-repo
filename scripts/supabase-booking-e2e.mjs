import { chromium } from 'playwright';

const BASE = process.env.BASE_URL || 'http://127.0.0.1:3000';
const browser = await chromium.launch({ args: ['--no-sandbox'] });
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });

const posts = [];
page.on('response', (res) => {
  const url = res.url();
  if (url.includes('supabase.co') && res.request().method() === 'POST') {
    posts.push({ path: url.split('.supabase.co')[1], status: res.status() });
  }
});
const errors = [];
page.on('pageerror', (e) => errors.push(e.message));

await page.goto(BASE, { waitUntil: 'networkidle' });
await page.waitForTimeout(1500);

// Open the booking modal from the hero CTA
await page.locator('section').first().getByRole('button', { name: /^Book Appointment$/i }).first().click();
await page.getByRole('heading', { name: 'Book Studio Appointment' }).waitFor({ timeout: 8000 });

// Fill the required fields (date, slot, name, phone)
const tomorrow = new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0];
await page.locator('input[type="date"]').fill(tomorrow);
const slotSelect = page.locator('select').filter({ has: page.locator('option[value="04:00 PM"]') }).first();
await slotSelect.selectOption('04:00 PM');
await page.getByPlaceholder('e.g. Balmukund Sharma').fill('Supabase E2E Test');
await page.getByPlaceholder('e.g. 99929 69919').fill('9876500011');
await page.locator('textarea').first().fill('end-to-end supabase write test');

await page.getByRole('button', { name: /Confirm Appointment Request/i }).click();
await page.waitForTimeout(4000);

const successVisible = await page
  .getByText(/Appointment Requested|Booking Confirmed|Appointment Confirmed|Thank/i)
  .first()
  .isVisible()
  .catch(() => false);

const errorsShown = await page.locator('text=/failed|error|could not/i').count();

console.log(JSON.stringify({ posts, successVisible, errorsShown, pageErrors: errors.slice(0, 3) }, null, 2));
await page.screenshot({ path: '/home/user/ui-modern-shots/supabase-booking-submit.png', fullPage: false });
await browser.close();
