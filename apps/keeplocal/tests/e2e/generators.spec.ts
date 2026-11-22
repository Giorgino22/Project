import { PDFDocument } from '@cantoo/pdf-lib';
import { expect, test, type Page } from '@playwright/test';
import { clickAndDownload, decodeQrCanvas, decodeQrImage, downloadBytes, magic } from './helpers';

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

/** Fills in the QR-bill form: the example of the SIX guidelines (QR-IBAN, QR reference). */
async function fillExampleBill(page: Page): Promise<void> {
  const fields: Record<string, string> = {
    account: 'ch4431999123000889012',
    'creditor.name': 'Robert Schneider AG',
    'creditor.street': 'Rue du Lac',
    'creditor.number': '1268',
    'creditor.postalCode': '2501',
    'creditor.town': 'Biel',
    amount: "1'949.75",
    reference: '210000000003139471430009017',
    message: 'Order dated 18.06.2020',
    'debtor.name': 'Ana Petrović',
    'debtor.street': 'Grosse Marktgasse',
    'debtor.number': '28',
    'debtor.postalCode': '9400',
    'debtor.town': 'Rorschach',
  };
  for (const [name, value] of Object.entries(fields)) await page.locator(`input[name="${name}"]`).fill(value);
}

const EXAMPLE_PAYLOAD = [
  'SPC', '0200', '1', 'CH4431999123000889012',
  'S', 'Robert Schneider AG', 'Rue du Lac', '1268', '2501', 'Biel', 'CH',
  '', '', '', '', '', '', '',
  '1949.75', 'CHF',
  'S', 'Ana Petrović', 'Grosse Marktgasse', '28', '9400', 'Rorschach', 'CH',
  'QRR', '210000000003139471430009017', 'Order dated 18.06.2020', 'EPD',
].join('\n');

test.describe('Swiss QR-bill', () => {
  test('shows a preview and creates PDFs and a scannable QR code', async ({ page }) => {
    await page.goto('/swiss-qr-bill-generator/');
    await expect(page.getByRole('button', { name: 'PDF (A4)' })).toBeDisabled();
    await fillExampleBill(page);

    const preview = page.locator('[data-preview]');
    await expect(preview).toBeVisible();
    await expect(preview).toContainText('Payment part');
    await expect(preview).toContainText('21 00000 00003 13947 14300 09017');
    await expect(preview).toContainText('Ana Petrović');
    // A QR-IBAN always needs a QR reference: the other options are switched off.
    await expect(page.getByText('QR-IBAN – it needs a QR reference.')).toBeVisible();
    await expect(page.locator('input[name="referenceType"][value="NON"]')).toBeDisabled();

    const png = await clickAndDownload(page, () => page.getByRole('button', { name: 'QR code (PNG)' }).click());
    expect(png.suggestedFilename()).toBe('qr-bill-qr-code.png');
    expect(await decodeQrImage(page, await downloadBytes(png))).toBe(EXAMPLE_PAYLOAD);

    const svg = await clickAndDownload(page, () => page.getByRole('button', { name: 'QR code (SVG)' }).click());
    const svgText = Buffer.from(await downloadBytes(svg)).toString();
    expect(svgText).toContain('<svg');
    expect(svgText).toContain('width="56mm"');

    for (const [button, file, height] of [['PDF (A4)', 'qr-bill.pdf', 297], ['PDF (slip only)', 'qr-bill-slip.pdf', 105]] as const) {
      const pdf = await clickAndDownload(page, () => page.getByRole('button', { name: button }).click());
      expect(pdf.suggestedFilename()).toBe(file);
      const doc = await PDFDocument.load(await downloadBytes(pdf));
      expect(doc.getPageCount()).toBe(1);
      expect(Math.round((doc.getPage(0).getHeight() / 72) * 25.4)).toBe(height);
    }
    await expect(page.locator('[data-status]')).toHaveText('Done!');
  });

  test('explains mistakes and helps with references', async ({ page }) => {
    await page.goto('/swiss-qr-bill-generator/');
    await page.locator('input[name="account"]').fill('DE89 3704 0044 0532 0130 00');
    await page.locator('input[name="creditor.name"]').fill('Shop');
    await page.locator('input[name="creditor.postalCode"]').fill('8000');
    await page.locator('input[name="creditor.town"]').fill('Zürich');
    await expect(page.locator('[data-status]')).toContainText('Swiss or Liechtenstein account');
    await expect(page.locator('input[name="account"]')).toHaveAttribute('aria-invalid', 'true');
    await expect(page.getByRole('button', { name: 'PDF (A4)' })).toBeDisabled();

    // A normal Swiss IBAN with a creditor reference made from an invoice number
    await page.locator('input[name="account"]').fill('CH58 0079 1123 0008 8901 2');
    await page.getByText('Creditor reference (RF)').click();
    await page.locator('input[name="reference"]').fill('539007547034');
    await expect(page.locator('[data-status]')).toContainText('creditor reference is not valid');
    await page.getByRole('button', { name: 'Add check digits' }).click();
    await expect(page.locator('input[name="reference"]')).toHaveValue('RF18 5390 0754 7034');
    await expect(page.locator('[data-preview]')).toContainText('RF18 5390 0754 7034');
    await expect(page.locator('[data-status]')).toBeEmpty();

    // Characters a QR-bill can't contain
    await page.locator('input[name="message"]').fill('Thanks 😀');
    await expect(page.locator('[data-status]')).toContainText('“Additional information” contains “😀”');

    // A payer with only a name is not complete
    await page.locator('input[name="message"]').fill('');
    await page.locator('input[name="debtor.name"]').fill('Anna');
    await expect(page.locator('[data-status]')).toContainText('Please fill in “Payable by: Postal code”');
  });

  test('the German page makes a German bill', async ({ page }) => {
    await page.goto('/de/qr-rechnung-erstellen/');
    await fillExampleBill(page);
    await expect(page.locator('[data-preview]')).toContainText('Zahlteil');
    await expect(page.locator('[data-preview]')).toContainText('Empfangsschein');
    await page.getByText('Français').click();
    await expect(page.locator('[data-preview]')).toContainText('Section paiement');
  });
});

test.describe('Password card', () => {
  test('creates a random card in two sizes', async ({ page }) => {
    await page.goto('/password-card-generator/');
    const card = page.locator('[data-card]');
    await expect(card.locator('tbody tr')).toHaveCount(8);
    await expect(card.locator('tbody tr').first().locator('td')).toHaveCount(16);
    await expect(card.locator('thead th').last()).toHaveText('P');
    await expect(page.locator('[data-entropy]')).toContainText('about 76 bits');

    const before = await card.locator('tbody').textContent();
    await page.getByRole('button', { name: 'New card' }).click();
    expect(await card.locator('tbody').textContent()).not.toBe(before);

    await page.getByText('A4 page', { exact: true }).click();
    await expect(card.locator('tbody tr')).toHaveCount(30);
    await expect(card.locator('tbody tr').first().locator('td')).toHaveCount(26);

    for (const label of ['Lowercase (a–z)', 'Uppercase (A–Z)', 'Numbers (0–9)', 'Symbols (!#$…)']) await page.getByLabel(label).uncheck();
    await expect(page.locator('[data-status]')).toContainText('Select at least one');
    await expect(page.getByRole('button', { name: 'Print card' })).toBeDisabled();
  });

  test('prints only the card, in bank-card size', async ({ page }) => {
    await page.goto('/password-card-generator/');
    const cells = await page.locator('[data-card] td').allTextContents();
    // Browsers fire "beforeprint" when printing starts; the card copy for the printer is made then.
    await page.evaluate(() => window.dispatchEvent(new Event('beforeprint')));
    await page.emulateMedia({ media: 'print' });
    const sheet = page.locator('.pw-print-sheet');
    await expect(sheet).toBeVisible();
    await expect(page.locator('.site-header')).toBeHidden();
    expect(await sheet.locator('td').allTextContents()).toEqual(cells);
    const box = (await sheet.locator('.pw-card-cut').boundingBox())!;
    expect(Math.round((box.width / 96) * 25.4)).toBe(86); // 85.6 mm wide
    expect(Math.round((box.height / 96) * 25.4)).toBe(54);
  });
});

test.describe('Links between related tools', () => {
  for (const [from, to, name] of [
    ['/password-generator/', '/password-card-generator/', 'Password card'],
    ['/password-card-generator/', '/password-generator/', 'Password generator'],
    ['/de/passwort-generator/', '/de/passwortkarte/', 'Passwortkarte'],
    ['/de/passwortkarte/', '/de/passwort-generator/', 'Passwort-Generator'],
    ['/epc-qr-code-generator/', '/swiss-qr-bill-generator/', 'Swiss QR-bill generator'],
  ]) {
    test(`${from} links to ${to}`, async ({ page }) => {
      await page.goto(from);
      await expect(page.locator('.see-also').getByRole('link', { name })).toHaveAttribute('href', to);
    });
  }
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
