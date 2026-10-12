/** Small helpers shared by the browser tests. */
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { PDFDocument } from '@cantoo/pdf-lib';
import type { Download, Page } from '@playwright/test';
import { unzipSync } from 'fflate';

export const FIXTURES = 'tests/fixtures';
export const GENERATED = 'tests/fixtures/generated';

/** Ad and statistics services the site may load once you switch them on in src/config.ts. */
const ALLOWED_THIRD_PARTIES = /(googlesyndication|doubleclick|googleadservices|adtrafficquality|fundingchoicesmessages|cloudflareinsights)\./;

/**
 * Blocks every request to other servers (like an ad blocker would) and records them.
 * Returns the list of blocked addresses that are NOT ads/statistics – i.e. anything
 * our own code tried to contact. For a privacy-first site that list must stay empty.
 */
export async function blockThirdParties(page: Page, baseURL: string): Promise<string[]> {
  const unexpected: string[] = [];
  await page.route(
    (url) => !url.href.startsWith(baseURL) && url.protocol.startsWith('http'),
    async (route) => {
      const url = route.request().url();
      if (!ALLOWED_THIRD_PARTIES.test(new URL(url).hostname)) unexpected.push(url);
      await route.abort();
    },
  );
  return unexpected;
}

/** Reads a downloaded file into memory. */
export async function downloadBytes(download: Download): Promise<Uint8Array> {
  return new Uint8Array(readFileSync(await download.path()));
}

/** Clicks the button and returns the download it starts. */
export async function clickAndDownload(page: Page, click: () => Promise<void>): Promise<Download> {
  const [download] = await Promise.all([page.waitForEvent('download'), click()]);
  return download;
}

/** Page widths of a PDF – the test PDFs use them to tell pages apart. */
export async function pdfPageWidths(bytes: Uint8Array): Promise<number[]> {
  const doc = await PDFDocument.load(bytes);
  return doc.getPages().map((page) => Math.round(page.getWidth()));
}

export function unzip(bytes: Uint8Array): Record<string, Uint8Array> {
  return unzipSync(bytes);
}

/** First bytes of a file as hex, to check the file type ("ffd8ff" = JPEG, "89504e47" = PNG). */
export function magic(bytes: Uint8Array, length = 4): string {
  return Buffer.from(bytes.subarray(0, length)).toString('hex');
}

/** Width and height stored in a JPEG's "start of frame" segment. */
export function jpegSize(bytes: Uint8Array): { width: number; height: number } {
  let pos = 2;
  while (pos < bytes.length) {
    const marker = bytes[pos + 1]!;
    const length = (bytes[pos + 2]! << 8) | bytes[pos + 3]!;
    if (marker >= 0xc0 && marker <= 0xc3) {
      return { height: (bytes[pos + 5]! << 8) | bytes[pos + 6]!, width: (bytes[pos + 7]! << 8) | bytes[pos + 8]! };
    }
    pos += 2 + length;
  }
  throw new Error('No JPEG size found');
}

/** Width and height from a PNG header. */
export function pngSize(bytes: Uint8Array): { width: number; height: number } {
  const view = new DataView(bytes.buffer, bytes.byteOffset);
  return { width: view.getUint32(16), height: view.getUint32(20) };
}

/**
 * Reads the QR code drawn on a <canvas> with the jsQR library (injected into the page),
 * so tests can check that the code really contains what it should.
 */
export async function decodeQrCanvas(page: Page, selector: string): Promise<string | null> {
  const require = createRequire(import.meta.url);
  await page.addScriptTag({ path: require.resolve('jsqr/dist/jsQR.js') });
  return page.evaluate((canvasSelector) => {
    const canvas = document.querySelector<HTMLCanvasElement>(canvasSelector)!;
    const image = canvas.getContext('2d')!.getImageData(0, 0, canvas.width, canvas.height);
    const decode = (window as unknown as { jsQR: (d: Uint8ClampedArray, w: number, h: number) => { data: string } | null }).jsQR;
    return decode(image.data, image.width, image.height)?.data ?? null;
  }, selector);
}
