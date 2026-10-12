/** Image to text: real text recognition in the browser – with the engine loaded from our own server. */
import { expect, test, type Page } from '@playwright/test';
import { blockThirdParties, clickAndDownload } from './helpers';

/** Draws black text on a transparent canvas in the browser and returns it as a PNG data URL. */
function textImage(page: Page, lines: string[]): Promise<string> {
  return page.evaluate((text) => {
    const canvas = document.createElement('canvas');
    canvas.width = 900;
    canvas.height = 60 + text.length * 70;
    const context = canvas.getContext('2d')!;
    context.font = '48px sans-serif';
    context.fillStyle = '#000';
    text.forEach((line, i) => context.fillText(line, 30, 70 + i * 70));
    return canvas.toDataURL('image/png');
  }, lines);
}

const pngBuffer = (dataUrl: string) => Buffer.from(dataUrl.split(',')[1]!, 'base64');

test('reads the text in an image without contacting other servers', async ({ page, baseURL }) => {
  test.setTimeout(120_000);
  const foreign = await blockThirdParties(page, baseURL!);
  await page.goto('/image-to-text/');
  const image = await textImage(page, ['Hello from KeepLocal', 'Private text recognition']);
  await page.locator('input[type="file"]').setInputFiles({ name: 'note.png', mimeType: 'image/png', buffer: pngBuffer(image) });

  const result = page.getByLabel('Recognised text');
  await expect(result).toHaveValue(/Hello from KeepLocal/, { timeout: 90_000 });
  await expect(result).toHaveValue(/Private text recognition/);
  expect(foreign).toEqual([]);

  const download = await clickAndDownload(page, () => page.getByRole('button', { name: 'Download as .txt' }).click());
  expect(download.suggestedFilename()).toBe('note.txt');
});

test('reads German text from a pasted screenshot', async ({ page }) => {
  test.setTimeout(120_000);
  await page.goto('/de/bild-zu-text/');
  await expect(page.getByLabel('Sprache des Textes')).toHaveValue('deu'); // German page → German text
  const image = await textImage(page, ['Schöne Grüße aus Zürich']);

  // Simulate Ctrl+V with an image in the clipboard.
  await page.evaluate(async (dataUrl) => {
    const blob = await (await fetch(dataUrl)).blob();
    const clipboard = new DataTransfer();
    clipboard.items.add(new File([blob], 'image.png', { type: 'image/png' }));
    window.dispatchEvent(new ClipboardEvent('paste', { clipboardData: clipboard }));
  }, image);

  const result = page.getByLabel('Erkannter Text');
  await expect(result).toHaveValue(/Schöne/, { timeout: 90_000 });
  await expect(result).toHaveValue(/Zürich/);
});
