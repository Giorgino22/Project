/** Checks for every page: search-engine tags, fits on a phone, no requests to other servers. */
import { expect, test } from '@playwright/test';

/** Every English page and its German version */
const VERSIONS = [
  ['/', '/de/'],
  ['/yes-or-no-wheel/', '/de/ja-nein-gluecksrad/'],
  ['/random-number-wheel/', '/de/zahlen-gluecksrad/'],
  ['/letter-wheel/', '/de/buchstaben-gluecksrad/'],
  ['/random-team-generator/', '/de/teamgenerator/'],
] as const;
const PAGES = VERSIONS.flat();

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
    await expect(page.locator('html'), path).toHaveAttribute('lang', path.startsWith('/de/') ? 'de' : 'en');
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow, `${path} is wider than the screen`).toBeLessThanOrEqual(0);
  }
  expect(foreign, 'requests to other servers').toEqual([]);
  expect(errors).toEqual([]);
});

test('the sitemap lists every page with its other language version', async ({ request }) => {
  const sitemap = await (await request.get('/sitemap.xml')).text();
  for (const path of PAGES) expect(sitemap).toContain(`${path}</loc>`);
  for (const [en, de] of VERSIONS) {
    expect(sitemap).toContain(`hreflang="de" href="https://wheel.toolstin.com${de}"`);
    expect(sitemap).toContain(`hreflang="x-default" href="https://wheel.toolstin.com${en}"`);
  }
});

test('English and German pages point to each other (hreflang and language menu)', async ({ page }) => {
  for (const [en, de] of VERSIONS) {
    for (const path of [en, de]) {
      await page.goto(path);
      await expect(page.locator('link[rel="alternate"][hreflang="en"]'), path).toHaveAttribute('href', new RegExp(`${en}$`));
      await expect(page.locator('link[rel="alternate"][hreflang="de"]'), path).toHaveAttribute('href', new RegExp(`${de}$`));
      await expect(page.locator('link[rel="alternate"][hreflang="x-default"]'), path).toHaveAttribute('href', new RegExp(`${en}$`));
    }
  }
  // Switch the language with the menu in the header
  await page.goto('/random-team-generator/');
  await page.locator('.lang-menu summary').click();
  await page.locator('.lang-menu').getByRole('link', { name: 'Deutsch' }).click();
  await expect(page).toHaveURL(/\/de\/teamgenerator\/$/);
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Teamgenerator');
});

test('German pages link to German pages and the German privacy policy', async ({ page }) => {
  await page.goto('/de/zahlen-gluecksrad/');
  await expect(page.locator('.header-nav a[href="/de/teamgenerator/"]')).toBeVisible();
  await expect(page.locator('.site-header .logo')).toHaveAttribute('href', '/de/');
  await expect(page.locator('footer a[href$="/de/datenschutz/"]')).toHaveText('Datenschutz');
  await expect(page.locator('footer a[href$="/de/impressum/"]')).toHaveText('Impressum');
  await expect(page.locator('footer a[href="https://typing.toolstin.com/de/"]')).toHaveText('Tipptest');
  await expect(page.locator('footer a[href="https://keeplocal.toolstin.com/de/"]')).toBeVisible();
  await expect(page.locator('.footer-bottom')).toContainText('Nichts wird hochgeladen');
});

test('the language menu works on phones too', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 800 });
  await page.goto('/de/');
  await page.locator('.lang-menu summary').click();
  const english = page.locator('.lang-menu').getByRole('link', { name: 'English' });
  await expect(english).toBeInViewport();
  await english.click();
  await expect(page).toHaveURL(/:\d+\/$/);
});

test('unknown pages show the 404 page', async ({ page }) => {
  const response = await page.goto('/nope/');
  expect(response?.status()).toBe(404);
  await expect(page.getByRole('heading', { name: 'Page not found' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Seite nicht gefunden' })).toBeVisible();
  await expect(page.locator('a[href="/de/"]').first()).toBeVisible();
});
