/** Checks for every page: search-engine tags, fits on a phone, no requests to other servers. */
import { expect, test } from '@playwright/test';

const PAGES = ['/', '/privacy/', '/imprint/', '/de/', '/de/datenschutz/', '/de/impressum/'];

test('every page is ready for search engines and phones', async ({ page, baseURL }) => {
  const foreign: string[] = [];
  const errors: string[] = [];
  await page.route((url) => !url.href.startsWith(baseURL!), (route) => {
    foreign.push(route.request().url());
    return route.abort();
  });
  page.on('pageerror', (error) => errors.push(error.message));

  for (const path of PAGES) {
    const response = await page.goto(path);
    expect(response?.status(), path).toBe(200);
    expect((await page.title()).length, path).toBeGreaterThan(15);
    await expect(page.locator('meta[name="description"]'), path).toHaveAttribute('content', /.{60,170}/);
    await expect(page.locator('link[rel="canonical"]'), path).toHaveAttribute('href', new RegExp(`${path}$`));
    await expect(page.locator('h1'), path).toHaveCount(1);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow, `${path} is wider than the screen`).toBeLessThanOrEqual(0);
  }
  expect(foreign, 'requests to other servers').toEqual([]);
  expect(errors).toEqual([]);
});

test('the sitemap lists every page', async ({ request }) => {
  const sitemap = await (await request.get('/sitemap.xml')).text();
  for (const path of PAGES) expect(sitemap).toContain(`${path}</loc>`);
});

test('the legal pages exist in English and German and point to each other', async ({ page, request }) => {
  for (const [en, de] of [
    ['/', '/de/'],
    ['/privacy/', '/de/datenschutz/'],
    ['/imprint/', '/de/impressum/'],
  ]) {
    for (const path of [en, de]) {
      await page.goto(path!);
      await expect(page.locator('link[rel="alternate"][hreflang="en"]'), path).toHaveAttribute('href', new RegExp(`${en}$`));
      await expect(page.locator('link[rel="alternate"][hreflang="de"]'), path).toHaveAttribute('href', new RegExp(`${de}$`));
      await expect(page.locator('link[rel="alternate"][hreflang="x-default"]'), path).toHaveAttribute('href', new RegExp(`${en}$`));
    }
    await expect(page.locator('html')).toHaveAttribute('lang', 'de');
  }
  const sitemap = await (await request.get('/sitemap.xml')).text();
  expect(sitemap).toContain('hreflang="de" href="https://toolstin.com/de/datenschutz/"');
});

test('unknown pages show the 404 page', async ({ page }) => {
  const response = await page.goto('/nope/');
  expect(response?.status()).toBe(404);
  await expect(page.getByRole('heading', { name: 'Page not found' })).toBeVisible();
});
