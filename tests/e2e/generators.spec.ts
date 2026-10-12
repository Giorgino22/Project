import { expect, test } from '@playwright/test';
import { clickAndDownload, decodeQrCanvas, downloadBytes, magic } from './helpers';

test.describe('QR code generator', () => {
  test('creates a scannable code for a website', async ({ page }) => {
    await page.goto('/qr-code-generator/');
    await page.getByLabel('Web address').fill('example.com/hello');
    await expect(page.locator('[data-preview]')).toBeVisible();
    expect(await decodeQrCanvas(page, '[data-preview]')).toBe('https://example.com/hello');

    const png = await clickAndDownload(page, () => page.getByRole('button', { name: 'Download PNG' }).click());
    expect(png.suggestedFilename()).toBe('qr-code.png');
    expect(magic(await downloadBytes(png))).toBe('89504e47');

    const svg = await clickAndDownload(page, () => page.getByRole('button', { name: 'Download SVG' }).click());
    expect(Buffer.from(await downloadBytes(svg)).toString()).toContain('<svg');
  });

  test('creates Wi-Fi codes', async ({ page }) => {
    await page.goto('/qr-code-generator/');
    await page.getByText('Wi-Fi', { exact: true }).click();
    await page.getByLabel('Network name (SSID)').fill('Home;Net');
    await page.getByLabel('Password', { exact: true }).fill('pa:ss');
    await expect(page.locator('[data-preview]')).toBeVisible();
    expect(await decodeQrCanvas(page, '[data-preview]')).toBe('WIFI:T:WPA;S:Home\\;Net;P:pa\\:ss;;');
  });

  test('warns about colours that are hard to scan', async ({ page }) => {
    await page.goto('/qr-code-generator/');
    await page.getByLabel('Web address').fill('example.com');
    await page.locator('input[name="dark"]').fill('#eeeeee');
    await expect(page.locator('[data-status]')).toContainText('Low contrast');
  });
});

test.describe('EPC payment QR code', () => {
  test('creates the standard payload', async ({ page }) => {
    await page.goto('/epc-qr-code-generator/');
    await page.getByLabel('Recipient name').fill('Red Cross');
    await page.getByLabel('IBAN').fill('de89 3704 0044 0532 0130 00');
    await page.getByLabel('Amount in EUR (optional)').fill('12,50');
    await page.getByLabel('Payment reference (optional)').fill('Invoice 42');
    await expect(page.locator('[data-preview]')).toBeVisible();
    expect(await decodeQrCanvas(page, '[data-preview]')).toBe(
      'BCD\n002\n1\nSCT\n\nRed Cross\nDE89370400440532013000\nEUR12.50\n\n\nInvoice 42',
    );
    const download = await clickAndDownload(page, () => page.getByRole('button', { name: 'Download PNG' }).click());
    expect(magic(await downloadBytes(download))).toBe('89504e47');
  });

  test('points out an invalid IBAN', async ({ page }) => {
    await page.goto('/epc-qr-code-generator/');
    await page.getByLabel('Recipient name').fill('Shop');
    await page.getByLabel('IBAN').fill('DE00 1234 5678');
    await expect(page.locator('[data-status]')).toContainText('IBAN is not valid');
    await expect(page.getByLabel('IBAN')).toHaveAttribute('aria-invalid', 'true');
    await expect(page.getByRole('button', { name: 'Download PNG' })).toBeDisabled();
  });
});

test.describe('Password generator', () => {
  test('creates passwords with the chosen settings', async ({ page }) => {
    await page.goto('/password-generator/');
    const output = page.locator('[data-password]');
    await expect(output).toHaveText(/^.{20}$/);

    await page.locator('#password-length').fill('32');
    await expect(output).toHaveText(/^.{32}$/);

    for (const label of ['Lowercase (a–z)', 'Uppercase (A–Z)', 'Symbols (!#$…)']) await page.getByLabel(label).uncheck();
    await expect(output).toHaveText(/^\d{32}$/);

    await page.getByLabel('Numbers (0–9)').uncheck();
    await expect(page.locator('[data-status]')).toContainText('Select at least one');
  });

  test('copies the password', async ({ page, context }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    await page.goto('/password-generator/');
    const password = await page.locator('[data-password]').textContent();
    await page.getByRole('button', { name: 'Copy' }).click();
    await expect(page.getByRole('button', { name: 'Copied!' })).toBeVisible();
    expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(password);
  });
});
