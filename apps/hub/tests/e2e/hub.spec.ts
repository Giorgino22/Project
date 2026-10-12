/** Browser tests for the hub (the central domain). */
import { expect, test } from '@playwright/test';

test('the front page links to every site and its popular tools', async ({ page }) => {
  await page.goto('/');
  for (const subdomain of ['keeplocal', 'wheel', 'typing']) {
    const card = page.locator('.site-card', { has: page.locator(`a[href^="https://${subdomain}."]`) });
    await expect(card, subdomain).toHaveCount(1);
    expect(await card.locator('.chip-list a').count(), subdomain).toBeGreaterThan(1);
  }
  await expect(page.locator('a[href^="https://keeplocal."][href$="/merge-pdf/"]').first()).toBeVisible();
});

test('the privacy policy covers all sites and the browser storage', async ({ page }) => {
  await page.goto('/privacy/');
  for (const subdomain of ['keeplocal', 'wheel', 'typing']) await expect(page.getByText(`${subdomain}.`, { exact: false }).first()).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Data saved in your browser' })).toBeVisible();
});

test('ads.txt is served as plain text', async ({ request }) => {
  const response = await request.get('/ads.txt');
  expect(response.status()).toBe(200);
  expect(response.headers()['content-type']).toContain('text/plain');
});
