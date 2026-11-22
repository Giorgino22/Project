/** Browser tests for the hub (the central domain). */
import { expect, test } from '@playwright/test';

test('the front page links to every site and its popular tools', async ({ page }) => {
  await page.goto('/');
  for (const subdomain of ['keeplocal', 'wheel', 'typing']) {
    const column = page.locator('.site-list > li', { has: page.locator(`h2 a[href^="https://${subdomain}."]`) });
    await expect(column, subdomain).toHaveCount(1);
    expect(await column.locator('li a').count(), subdomain).toBeGreaterThan(1);
  }
  await expect(page.locator('a[href^="https://keeplocal."][href$="/merge-pdf/"]').first()).toBeVisible();
  // Humm has one page so far
  const humm = page.locator('.site-list > li', { has: page.locator('h2 a[href^="https://humm."]') });
  await expect(humm.locator('li a')).toHaveCount(1);
});

test('the German front page links the German pages of every site', async ({ page }) => {
  await page.goto('/de/');
  await expect(page.locator('html')).toHaveAttribute('lang', 'de');
  for (const url of [
    'https://keeplocal.toolstin.com/de/pdf-zusammenfuegen/',
    'https://wheel.toolstin.com/de/',
    'https://wheel.toolstin.com/de/teamgenerator/',
    'https://typing.toolstin.com/de/tippen-ueben/',
    'https://typing.toolstin.com/de/tastaturtest/',
  ]) {
    await expect(page.locator(`.site-list a[href="${url}"]`).first(), url).toBeVisible();
  }
  // No English-only page is linked as if it were German – except Humm, which says so
  await expect(page.locator('.site-list')).toContainText('Seite auf Englisch');
  await expect(page.locator('.site-list > li')).toHaveCount(4);
  // German pages of the network point "All our tools" here
  await page.goto('/de/datenschutz/');
  await expect(page.locator('.site-header .logo')).toHaveAttribute('href', '/de/');
});

test('the four site columns stand under their tools in the tin', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto('/');
  const tin = await page.locator('.tin-scene').boundingBox();
  const columns = await page.locator('.site-list > li').evaluateAll((items) =>
    items.map((item) => {
      const box = item.getBoundingClientRect();
      return box.left + box.width / 2;
    }),
  );
  // Where the tools stand in TinScene.astro, as a share of the picture's width
  const tools = [0.158, 0.386, 0.614, 0.842];
  expect(columns).toHaveLength(tools.length);
  columns.forEach((centre, i) => expect(Math.abs(centre - (tin!.x + tools[i]! * tin!.width)), `column ${i + 1}`).toBeLessThan(20));
});

test('the privacy policy covers all sites and the browser storage', async ({ page }) => {
  await page.goto('/privacy/');
  for (const subdomain of ['keeplocal', 'wheel', 'typing', 'humm']) await expect(page.getByText(`${subdomain}.`, { exact: false }).first()).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Data saved in your browser' })).toBeVisible();
  // The song finder is the one tool that sends something away – the policy explains it
  await expect(page.getByRole('heading', { name: 'Song finder (Humm)' })).toBeVisible();
  await expect(page.locator('#song-finder')).toBeVisible();
});

test('the German privacy policy is complete and in German', async ({ page }) => {
  await page.goto('/de/datenschutz/');
  await expect(page.getByRole('heading', { name: 'Datenschutzerklärung', level: 1 })).toBeVisible();
  for (const subdomain of ['keeplocal', 'wheel', 'typing', 'humm']) await expect(page.getByText(`${subdomain}.`, { exact: false }).first()).toBeVisible();
  await expect(page.getByRole('heading', { name: 'In Ihrem Browser gespeicherte Daten' })).toBeVisible();
  await expect(page.locator('#song-finder')).toBeVisible();
  // The same sections as the English policy
  const count = async (path: string) => {
    await page.goto(path);
    return page.locator('main h2').count();
  };
  expect(await count('/de/datenschutz/')).toBe(await count('/privacy/'));
  // The footer links to the German legal pages
  await page.goto('/de/impressum/');
  await expect(page.locator('footer a[href="/de/datenschutz/"]')).toBeVisible();
});

test('ads.txt is served as plain text', async ({ request }) => {
  const response = await request.get('/ads.txt');
  expect(response.status()).toBe(200);
  expect(response.headers()['content-type']).toContain('text/plain');
});
