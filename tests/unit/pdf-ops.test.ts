import { PDFDocument, StandardFonts } from '@cantoo/pdf-lib';
import { describe, expect, it } from 'vitest';
import {
  deletePages,
  extractPages,
  imagesToPdf,
  loadPdf,
  mergePdfs,
  PdfInvalidError,
  PdfPasswordError,
  rotatePages,
} from '../../src/lib/pdf-ops';

/**
 * Creates a test PDF whose pages are labelled, e.g. ["A1", "A2", "A3"].
 * Each page also gets a different width (100, 101, 102…) so we can tell pages apart
 * after they've been moved around.
 */
async function makePdf(labels: string[], encryption?: { user: string }): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  labels.forEach((label, i) => {
    doc.addPage([100 + i, 200]).drawText(label, { x: 10, y: 100, size: 12, font });
  });
  if (encryption) {
    doc.encrypt({ ownerPassword: 'owner-secret', userPassword: encryption.user, permissions: {} });
  }
  return doc.save();
}

/** Page widths of a saved PDF – our way of identifying pages. */
async function pageWidths(bytes: Uint8Array): Promise<number[]> {
  const doc = await PDFDocument.load(bytes);
  return doc.getPages().map((page) => page.getWidth());
}

// A 1×1 pixel PNG and JPEG, small enough to write inline.
const PNG_1PX = Uint8Array.from(
  Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==', 'base64'),
);
const JPG_1PX = Uint8Array.from(
  Buffer.from(
    '/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////wgALCAABAAEBAREA/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPxA=',
    'base64',
  ),
);

describe('loadPdf', () => {
  it('opens a normal PDF', async () => {
    const doc = await loadPdf(await makePdf(['A1', 'A2']));
    expect(doc.getPageCount()).toBe(2);
  });

  it('opens PDFs that are only protected against printing/copying (empty open password)', async () => {
    const doc = await loadPdf(await makePdf(['A1'], { user: '' }));
    expect(doc.getPageCount()).toBe(1);
  });

  it('asks for a password when one is needed, and reports a wrong one', async () => {
    const bytes = await makePdf(['A1'], { user: 'open-sesame' });
    await expect(loadPdf(bytes)).rejects.toEqual(new PdfPasswordError('needs-password'));
    await expect(loadPdf(bytes, 'wrong')).rejects.toEqual(new PdfPasswordError('wrong-password'));
    expect((await loadPdf(bytes, 'open-sesame')).getPageCount()).toBe(1);
  });

  it('rejects files that are not PDFs', async () => {
    await expect(loadPdf(new TextEncoder().encode('just some text'))).rejects.toBeInstanceOf(PdfInvalidError);
  });
});

describe('PDF operations', () => {
  it('merges documents in the given order', async () => {
    const a = await loadPdf(await makePdf(['A1', 'A2']));
    const b = await loadPdf(await makePdf(['B1']));
    const merged = await mergePdfs([b, a]);
    expect(await pageWidths(merged)).toEqual([100, 100, 101]); // B1, A1, A2
  });

  it('merges a decrypted PDF into an unencrypted result', async () => {
    const locked = await loadPdf(await makePdf(['A1'], { user: 'pw' }), 'pw');
    const merged = await mergePdfs([locked]);
    expect(Buffer.from(merged).includes(Buffer.from('/Encrypt'))).toBe(false);
    expect((await PDFDocument.load(merged)).getPageCount()).toBe(1);
  });

  it('extracts pages in the requested order', async () => {
    const doc = await loadPdf(await makePdf(['1', '2', '3', '4']));
    expect(await pageWidths(await extractPages(doc, [3, 0]))).toEqual([103, 100]);
  });

  it('deletes pages and refuses to delete all of them', async () => {
    const doc = await loadPdf(await makePdf(['1', '2', '3']));
    expect(await pageWidths(await deletePages(doc, [1]))).toEqual([100, 102]);
    await expect(deletePages(doc, [0, 1, 2])).rejects.toThrow();
  });

  it('rotates only the selected pages and adds to an existing rotation', async () => {
    const doc = await loadPdf(await makePdf(['1', '2', '3']));
    const once = await rotatePages(doc, [0, 2], 90);
    const twice = await rotatePages(await loadPdf(once), [0], 270);
    const angles = (await PDFDocument.load(twice)).getPages().map((page) => page.getRotation().angle);
    expect(angles).toEqual([0, 0, 90]); // 90 + 270 = 360 → 0
  });

  it('turns images into one page each', async () => {
    const pdf = await imagesToPdf(
      [
        { bytes: PNG_1PX, type: 'png' },
        { bytes: JPG_1PX, type: 'jpg' },
      ],
      { pageSize: 'a4', orientation: 'portrait', margin: 0 },
    );
    const doc = await PDFDocument.load(pdf);
    expect(doc.getPageCount()).toBe(2);
    expect(Math.round(doc.getPage(0).getWidth())).toBe(595); // A4 width in points
  });
});
