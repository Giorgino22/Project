/**
 * Checks for the whole site: every page loads, has the tags search engines need,
 * fits on a phone screen, and – most important for our promise – tools never
 * contact any server while working with files.
 */
import { expect, test } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { blockThirdParties, FIXTURES, GENERATED } from './helpers';

/** All page addresses, read from the built sitemap. */
function allPaths(): string[] {
  const sitemap = readFileSync('dist/sitemap.xml', 'utf8');
  return [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => new URL(match[1]!).pathname);
}

test('every page has a title, description, canonical URL and language versions', async ({ page, baseURL }) => {
  const paths = allPaths();
  expect(paths.length).toBeGreaterThan(40);
  await blockThirdParties(page, baseURL!); // ads (once switched on) shouldn't make this test flaky
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(`${page.url()}: ${error.message}`));
  page.on('console', (message) => {
    // ERR_FAILED = a blocked third-party request, not a problem of our site
    if (message.type() === 'error' && !message.text().includes('ERR_FAILED')) errors.push(`${page.url()}: ${message.text()}`);
  });

  for (const path of paths) {
    const response = await page.goto(path);
    expect(response?.status(), path).toBe(200);
    expect((await page.title()).length, `${path} title`).toBeGreaterThan(10);
    await expect(page.locator('meta[name="description"]'), path).toHaveAttribute('content', /.{50,}/);
    await expect(page.locator('link[rel="canonical"]'), path).toHaveAttribute('href', new RegExp(`${path}$`));
    await expect(page.locator('link[rel="alternate"][hreflang]'), path).toHaveCount(3); // en, de, x-default
    await expect(page.locator('h1'), path).toHaveCount(1);
    // Nothing may be wider than the screen (horizontal scrolling on phones looks broken)
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow, `${path} is wider than the screen`).toBeLessThanOrEqual(0);
  }
  expect(errors).toEqual([]);
});

test('unknown addresses show the 404 page', async ({ page }) => {
  const response = await page.goto('/this-page-does-not-exist/');
  expect(response?.status()).toBe(404);
  await expect(page.getByRole('heading', { name: 'Page not found' })).toBeVisible();
});

test('the language menu leads to the German version of the same tool', async ({ page }) => {
  await page.goto('/merge-pdf/');
  await page.locator('.lang-menu summary').click();
  await page.locator('.lang-menu').getByRole('link', { name: 'Deutsch' }).click();
  await expect(page).toHaveURL(/\/de\/pdf-zusammenfuegen\/$/);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('PDF-Dateien zusammenfügen');
});

test('tools never send files anywhere (no requests to other servers)', async ({ page, baseURL, isMobile }) => {
  test.skip(isMobile, 'checked once on desktop');
  const foreign = await blockThirdParties(page, baseURL!);
  const uploads: string[] = [];
  page.on('request', (request) => {
    if (request.method() !== 'GET') uploads.push(`${request.method()} ${request.url()}`);
  });

  await page.goto('/merge-pdf/');
  await page.locator('input[type="file"]').setInputFiles([`${GENERATED}/three-pages.pdf`, `${GENERATED}/two-pages.pdf`]);
  await page.getByRole('button', { name: 'Merge PDFs' }).click();
  await expect(page.locator('[data-results]')).toBeVisible();

  await page.goto('/pdf-to-jpg/');
  await page.locator('input[type="file"]').setInputFiles(`${GENERATED}/three-pages.pdf`);
  await page.getByRole('button', { name: 'Convert to images' }).click();
  await expect(page.locator('[data-result-list] li')).toHaveCount(3, { timeout: 20_000 });

  await page.goto('/remove-exif-data/');
  await page.locator('input[type="file"]').setInputFiles(`${FIXTURES}/photo-gps.jpg`);
  await page.getByRole('button', { name: 'Remove metadata' }).click();
  await expect(page.locator('[data-results]')).toBeVisible();

  expect(foreign, 'requests to other servers').toEqual([]);
  expect(uploads, 'POST/PUT requests (uploads)').toEqual([]);
});
