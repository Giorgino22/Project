import { PDFDocument } from '@cantoo/pdf-lib';
import { expect, test } from '@playwright/test';
import { clickAndDownload, downloadBytes, GENERATED, FIXTURES, magic, pdfPageWidths, unzip } from './helpers';

const pdf = (name: string) => `${GENERATED}/${name}`;

test.describe('Merge PDF', () => {
  test('merges files in the chosen order', async ({ page }) => {
    await page.goto('/merge-pdf/');
    await page.locator('input[type="file"]').setInputFiles([pdf('three-pages.pdf'), pdf('two-pages.pdf')]);
    await expect(page.locator('[data-file-list] li')).toHaveCount(2);
    await expect(page.locator('[data-file-list] li').first()).toContainText('3 pages');

    // Move "two-pages.pdf" to the top
    await page.getByRole('button', { name: 'Move up: two-pages.pdf' }).click();
    await expect(page.locator('[data-file-list] li').first()).toContainText('two-pages.pdf');

    await page.getByRole('button', { name: 'Merge PDFs' }).click();
    await expect(page.locator('[data-status]')).toContainText('5 pages');
    const download = await clickAndDownload(page, () => page.getByRole('link', { name: 'Download' }).click());
    expect(download.suggestedFilename()).toBe('merged.pdf');
    expect(await pdfPageWidths(await downloadBytes(download))).toEqual([300, 301, 200, 201, 202]);
  });

  test('asks for the password of protected PDFs', async ({ page }) => {
    await page.goto('/merge-pdf/');
    await page.locator('input[type="file"]').setInputFiles(pdf('protected.pdf'));
    const prompt = page.locator('[data-password-prompt]');
    await expect(prompt).toBeVisible();
    await expect(prompt).toContainText('protected with a password');

    await prompt.getByLabel('Password').fill('wrong');
    await prompt.getByRole('button', { name: 'Unlock' }).click();
    await expect(prompt).toContainText('not correct');

    await prompt.getByLabel('Password').fill('secret');
    await prompt.getByRole('button', { name: 'Unlock' }).click();
    await expect(prompt).toBeHidden();
    await expect(page.locator('[data-file-list] li')).toHaveCount(1);
  });

  test('opens print/copy-restricted PDFs without asking', async ({ page }) => {
    await page.goto('/merge-pdf/');
    await page.locator('input[type="file"]').setInputFiles([pdf('restricted.pdf'), pdf('two-pages.pdf')]);
    await expect(page.locator('[data-file-list] li')).toHaveCount(2);
    await expect(page.locator('[data-password-prompt]')).toBeHidden();
    await page.getByRole('button', { name: 'Merge PDFs' }).click();
    const download = await clickAndDownload(page, () => page.getByRole('link', { name: 'Download' }).click());
    const bytes = await downloadBytes(download);
    expect(await pdfPageWidths(bytes)).toEqual([500, 300, 301]);
    expect(Buffer.from(bytes).includes(Buffer.from('/Encrypt'))).toBe(false); // result is unlocked
  });

  test('explains when a file is not a PDF', async ({ page }) => {
    await page.goto('/merge-pdf/');
    await page.locator('input[type="file"]').setInputFiles(pdf('not-a-pdf.pdf'));
    await expect(page.locator('[data-status]')).toContainText('is not a PDF');
  });
});

test.describe('Split PDF', () => {
  test('extracts selected pages', async ({ page }) => {
    await page.goto('/split-pdf/');
    await page.locator('input[type="file"]').setInputFiles(pdf('three-pages.pdf'));
    await expect(page.locator('[data-file-info]')).toContainText('3 pages');
    await page.locator('[data-pages-input]').fill('3, 1');
    await page.getByRole('button', { name: 'Split PDF' }).click();
    const download = await clickAndDownload(page, () => page.getByRole('link', { name: 'Download' }).click());
    expect(await pdfPageWidths(await downloadBytes(download))).toEqual([202, 200]);
  });

  test('saves every page separately as a ZIP', async ({ page }) => {
    await page.goto('/split-pdf/');
    await page.locator('input[type="file"]').setInputFiles(pdf('three-pages.pdf'));
    await page.getByLabel('Save every page as its own PDF').check();
    await page.getByRole('button', { name: 'Split PDF' }).click();
    await expect(page.locator('[data-result-list] li')).toHaveCount(3);
    const download = await clickAndDownload(page, () => page.getByRole('button', { name: 'Download all (ZIP)' }).click());
    const files = unzip(await downloadBytes(download));
    expect(Object.keys(files).sort()).toEqual(['three-pages_page-1.pdf', 'three-pages_page-2.pdf', 'three-pages_page-3.pdf']);
    expect(await pdfPageWidths(files['three-pages_page-2.pdf']!)).toEqual([201]);
  });

  test('shows a helpful error for impossible page numbers', async ({ page }) => {
    await page.goto('/split-pdf/');
    await page.locator('input[type="file"]').setInputFiles(pdf('three-pages.pdf'));
    await page.locator('[data-pages-input]').fill('2-9');
    await page.getByRole('button', { name: 'Split PDF' }).click();
    await expect(page.locator('[data-status]')).toContainText('outside this document (it has 3 pages)');
  });
});

test('Rotate PDF rotates only the chosen pages', async ({ page }) => {
  await page.goto('/rotate-pdf/');
  await page.locator('input[type="file"]').setInputFiles(pdf('three-pages.pdf'));
  await page.getByText('180°').click();
  await page.getByLabel('Only these pages:').check();
  await page.locator('[data-pages-input]').fill('2');
  await page.getByRole('button', { name: 'Rotate PDF' }).click();
  const download = await clickAndDownload(page, () => page.getByRole('link', { name: 'Download' }).click());
  const doc = await PDFDocument.load(await downloadBytes(download));
  expect(doc.getPages().map((p) => p.getRotation().angle)).toEqual([0, 180, 0]);
});

test('Delete PDF pages removes pages and refuses to delete all', async ({ page }) => {
  await page.goto('/delete-pdf-pages/');
  await page.locator('input[type="file"]').setInputFiles(pdf('three-pages.pdf'));
  await page.locator('[data-pages-input]').fill('1-3');
  await page.getByRole('button', { name: 'Delete pages' }).click();
  await expect(page.locator('[data-status]')).toContainText('can’t delete every page');

  await page.locator('[data-pages-input]').fill('2');
  await page.getByRole('button', { name: 'Delete pages' }).click();
  const download = await clickAndDownload(page, () => page.getByRole('link', { name: 'Download' }).click());
  expect(await pdfPageWidths(await downloadBytes(download))).toEqual([200, 202]);
});

test('JPG to PDF puts each image on an A4 page', async ({ page }) => {
  await page.goto('/jpg-to-pdf/');
  await page.locator('input[type="file"]').setInputFiles([`${FIXTURES}/photo.jpg`, `${FIXTURES}/graphic.png`, `${FIXTURES}/photo.webp`]);
  await expect(page.locator('[data-file-list] li')).toHaveCount(3);
  await page.getByRole('button', { name: 'Create PDF' }).click();
  const download = await clickAndDownload(page, () => page.getByRole('link', { name: 'Download' }).click());
  const doc = await PDFDocument.load(await downloadBytes(download));
  expect(doc.getPageCount()).toBe(3);
  // photo.jpg is wider than tall, so "automatic" orientation makes the first page landscape A4.
  expect(Math.round(doc.getPage(0).getWidth())).toBe(842);
});

test('PDF to JPG renders every page as an image', async ({ page }) => {
  await page.goto('/pdf-to-jpg/');
  await page.locator('input[type="file"]').setInputFiles(pdf('three-pages.pdf'));
  await expect(page.locator('[data-file-info]')).toContainText('3 pages');
  await page.getByRole('button', { name: 'Convert to images' }).click();
  await expect(page.locator('[data-result-list] li')).toHaveCount(3, { timeout: 20_000 });
  const download = await clickAndDownload(page, () => page.getByRole('button', { name: 'Download all (ZIP)' }).click());
  const files = unzip(await downloadBytes(download));
  expect(Object.keys(files)).toHaveLength(3);
  for (const bytes of Object.values(files)) expect(magic(bytes, 3)).toBe('ffd8ff'); // JPEG
});

test('PDF to JPG asks for the password of protected PDFs', async ({ page }) => {
  await page.goto('/pdf-to-jpg/');
  await page.locator('input[type="file"]').setInputFiles(pdf('protected.pdf'));
  const prompt = page.locator('[data-password-prompt]');
  await prompt.getByLabel('Password').fill('secret');
  await prompt.getByRole('button', { name: 'Unlock' }).click();
  await expect(page.locator('[data-file-info]')).toContainText('2 pages');
});

test('German page works in German', async ({ page }) => {
  await page.goto('/de/pdf-zusammenfuegen/');
  await expect(page.locator('html')).toHaveAttribute('lang', 'de');
  await page.locator('input[type="file"]').setInputFiles([pdf('three-pages.pdf'), pdf('two-pages.pdf')]);
  await page.getByRole('button', { name: 'PDFs zusammenfügen' }).click();
  await expect(page.locator('[data-status]')).toContainText('5 Seiten');
});
