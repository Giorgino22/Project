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

test('ads.txt is served as plain text', async ({ request }) => {
  const response = await request.get('/ads.txt');
  expect(response.status()).toBe(200);
  expect(response.headers()['content-type']).toContain('text/plain');
});
