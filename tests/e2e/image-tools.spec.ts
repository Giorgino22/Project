import exifr from 'exifr';
import { statSync } from 'node:fs';
import { expect, test } from '@playwright/test';
import { readJpegOrientation } from '../../src/lib/metadata';
import { clickAndDownload, downloadBytes, FIXTURES, jpegSize, magic, pngSize, unzip } from './helpers';

const image = (name: string) => `${FIXTURES}/${name}`;

test.describe('Compress image', () => {
  test('makes a JPG smaller', async ({ page }) => {
    await page.goto('/compress-image/');
    await page.locator('input[type="file"]').setInputFiles(image('photo.jpg'));
    await page.getByRole('button', { name: 'Compress' }).click();
    await expect(page.locator('[data-result-list] li')).toContainText('% smaller');
    const download = await clickAndDownload(page, () => page.getByRole('link', { name: 'Download' }).click());
    const bytes = await downloadBytes(download);
    expect(magic(bytes, 3)).toBe('ffd8ff');
    expect(bytes.length).toBeLessThan(statSync(image('photo.jpg')).size);
    expect(download.suggestedFilename()).toBe('photo-compressed.jpg');
  });

  test('turns phone photos upright and drops their metadata', async ({ page }) => {
    await page.goto('/compress-image/');
    await page.locator('input[type="file"]').setInputFiles(image('photo-gps.jpg')); // stored 64×48, orientation 6
    await page.getByRole('button', { name: 'Compress' }).click();
    const download = await clickAndDownload(page, () => page.getByRole('link', { name: 'Download' }).click());
    const bytes = await downloadBytes(download);
    expect(jpegSize(bytes)).toEqual({ width: 48, height: 64 });
    expect((await exifr.gps(bytes).catch(() => undefined))?.latitude).toBeUndefined();
  });

  test('turns other formats (GIF) into a real JPG', async ({ page }) => {
    await page.goto('/compress-image/');
    await page.locator('input[type="file"]').setInputFiles(image('photo.gif'));
    await page.getByRole('button', { name: 'Compress' }).click();
    const download = await clickAndDownload(page, () => page.getByRole('link', { name: 'Download' }).click());
    expect(download.suggestedFilename()).toBe('photo-compressed.jpg');
    expect(magic(await downloadBytes(download), 3)).toBe('ffd8ff');
  });

  test('compresses PNGs with a colour palette', async ({ page }) => {
    await page.goto('/compress-image/');
    await page.locator('input[type="file"]').setInputFiles(image('graphic.png'));
    await page.getByRole('button', { name: 'Compress' }).click();
    const download = await clickAndDownload(page, () => page.getByRole('link', { name: 'Download' }).click());
    expect(magic(await downloadBytes(download))).toBe('89504e47');
  });
});

test('Resize image by percent', async ({ page }) => {
  await page.goto('/resize-image/');
  await page.locator('input[type="file"]').setInputFiles(image('photo.jpg'));
  await expect(page.locator('[data-file-list] li')).toContainText('400 × 300 px');
  await page.getByRole('button', { name: 'Resize' }).click();
  const download = await clickAndDownload(page, () => page.getByRole('link', { name: 'Download' }).click());
  expect(download.suggestedFilename()).toBe('photo-200x150.jpg');
  expect(jpegSize(await downloadBytes(download))).toEqual({ width: 200, height: 150 });
});

test('Resize image to a width in pixels keeps the aspect ratio', async ({ page }) => {
  await page.goto('/resize-image/');
  await page.locator('input[type="file"]').setInputFiles([image('photo.jpg'), image('graphic.png')]);
  await page.getByText('Pixels', { exact: true }).click();
  await page.getByLabel('Width (px)').fill('100');
  await page.getByRole('button', { name: 'Resize' }).click();
  await expect(page.locator('[data-result-list] li')).toHaveCount(2);
  const download = await clickAndDownload(page, () => page.getByRole('button', { name: 'Download all (ZIP)' }).click());
  const files = unzip(await downloadBytes(download));
  expect(jpegSize(files['photo-100x75.jpg']!)).toEqual({ width: 100, height: 75 });
  expect(pngSize(files['graphic-100x75.png']!)).toEqual({ width: 100, height: 75 });
});

test('PNG to JPG converter page', async ({ page }) => {
  await page.goto('/png-to-jpg/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Convert PNG to JPG');
  await expect(page.locator('input[name="target"][value="jpg"]')).toBeChecked();
  await page.locator('input[type="file"]').setInputFiles(image('graphic.png'));
  await page.getByRole('button', { name: 'Convert', exact: true }).click();
  const download = await clickAndDownload(page, () => page.getByRole('link', { name: 'Download' }).click());
  expect(download.suggestedFilename()).toBe('graphic.jpg');
  expect(magic(await downloadBytes(download), 3)).toBe('ffd8ff');
});

test('WebP to PNG converter page', async ({ page }) => {
  await page.goto('/webp-to-png/');
  await page.locator('input[type="file"]').setInputFiles(image('photo.webp'));
  await page.getByRole('button', { name: 'Convert', exact: true }).click();
  const download = await clickAndDownload(page, () => page.getByRole('link', { name: 'Download' }).click());
  expect(download.suggestedFilename()).toBe('photo.png');
  expect(pngSize(await downloadBytes(download))).toEqual({ width: 64, height: 48 });
});

test('Remove EXIF shows the GPS location and removes it losslessly', async ({ page }) => {
  await page.goto('/remove-exif-data/');
  await page.locator('input[type="file"]').setInputFiles(image('photo-gps.jpg'));
  const findings = page.locator('[data-findings]');
  await expect(findings).toContainText('Location (GPS): 48.85840, 2.29450');
  await expect(findings).toContainText('Camera: TestCam Model X');
  await expect(findings.getByRole('link', { name: 'Show on map' })).toHaveAttribute('href', /openstreetmap\.org/);

  await page.getByRole('button', { name: 'Remove metadata' }).click();
  await expect(page.locator('[data-result-list]')).toContainText('Removed: EXIF');
  const download = await clickAndDownload(page, () => page.getByRole('link', { name: 'Download' }).click());
  const bytes = await downloadBytes(download);
  expect(download.suggestedFilename()).toBe('photo-gps-clean.jpg');
  const meta = await exifr.parse(bytes, { gps: true, tiff: true, xmp: true }).catch(() => undefined);
  expect(meta?.latitude).toBeUndefined();
  expect(meta?.Make).toBeUndefined();
  expect(readJpegOrientation(bytes)).toBe(6); // the photo still shows the right way up
});
