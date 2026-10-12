/**
 * All PDF editing happens here, using the open-source library pdf-lib
 * (the maintained "@cantoo" fork, which can also open encrypted PDFs).
 *
 * Everything runs in the visitor's browser – these functions never send data anywhere.
 * They also run in Node.js, which is how tests/unit/pdf-ops.test.ts checks them.
 *
 * The approach is the same for every tool: we build a *fresh* PDF and copy the
 * wanted pages into it. That is simple, keeps page content byte-for-byte identical,
 * and the result is never encrypted. (Downside: bookmarks and fillable form
 * fields of the original are not carried over – the page FAQs mention this.)
 */
import { PDFDocument, degrees } from '@cantoo/pdf-lib';
import { layoutImageOnPage, type PageLayoutOptions } from './image-layout';

/** The PDF needs a password to open, or the password was wrong. */
export class PdfPasswordError extends Error {
  constructor(public readonly reason: 'needs-password' | 'wrong-password') {
    super(reason);
    this.name = 'PdfPasswordError';
  }
}

/** The file is not a PDF, or it is too damaged to read. */
export class PdfInvalidError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PdfInvalidError';
  }
}

/**
 * Opens a PDF.
 * Many PDFs (bank statements, e-books…) are encrypted with an empty "open" password
 * and only restrict printing/copying. Passing password '' opens those automatically.
 * If a real password is needed we throw PdfPasswordError so the page can ask for it.
 */
export async function loadPdf(bytes: Uint8Array | ArrayBuffer, password = ''): Promise<PDFDocument> {
  try {
    return await PDFDocument.load(bytes, { password });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    // pdf-lib reports password problems only through the error text, so we check that.
    if (/needs password/i.test(message)) throw new PdfPasswordError('needs-password');
    if (/password incorrect/i.test(message)) throw new PdfPasswordError('wrong-password');
    throw new PdfInvalidError(message);
  }
}

/** Creates a new PDF containing the given pages (0-based indices, in that order). */
async function copyIntoNewPdf(source: PDFDocument, indices: number[]): Promise<PDFDocument> {
  const output = await PDFDocument.create();
  const pages = await output.copyPages(source, indices);
  for (const page of pages) output.addPage(page);
  return output;
}

/** Merges several PDFs into one, in the order given. */
export async function mergePdfs(documents: PDFDocument[]): Promise<Uint8Array> {
  const output = await PDFDocument.create();
  for (const doc of documents) {
    const pages = await output.copyPages(doc, doc.getPageIndices());
    for (const page of pages) output.addPage(page);
  }
  return output.save();
}

/** Makes a new PDF that only contains the chosen pages. */
export async function extractPages(doc: PDFDocument, indices: number[]): Promise<Uint8Array> {
  if (indices.length === 0) throw new Error('No pages selected');
  return (await copyIntoNewPdf(doc, indices)).save();
}

/** Makes a new PDF without the chosen pages. */
export async function deletePages(doc: PDFDocument, indicesToDelete: number[]): Promise<Uint8Array> {
  const remove = new Set(indicesToDelete);
  const keep = doc.getPageIndices().filter((index) => !remove.has(index));
  if (keep.length === 0) throw new Error('Cannot delete every page');
  return extractPages(doc, keep);
}

export type RotationAngle = 90 | 180 | 270;

/**
 * Rotates the chosen pages clockwise by `angle` degrees.
 * A page can already be rotated, so we add to its current rotation (and keep it within 0–359).
 */
export async function rotatePages(
  doc: PDFDocument,
  indices: number[],
  angle: RotationAngle,
): Promise<Uint8Array> {
  const output = await copyIntoNewPdf(doc, doc.getPageIndices());
  for (const index of indices) {
    const page = output.getPage(index);
    const current = page.getRotation().angle;
    page.setRotation(degrees((current + angle) % 360));
  }
  return output.save();
}

/** An image that pdf-lib can embed directly: the raw bytes of a JPG or PNG file. */
export interface EmbeddableImage {
  bytes: Uint8Array;
  type: 'jpg' | 'png';
}

/** Puts each image on its own page. */
export async function imagesToPdf(
  images: EmbeddableImage[],
  layout: PageLayoutOptions,
): Promise<Uint8Array> {
  const output = await PDFDocument.create();
  for (const image of images) {
    const embedded =
      image.type === 'jpg' ? await output.embedJpg(image.bytes) : await output.embedPng(image.bytes);
    const place = layoutImageOnPage(embedded.width, embedded.height, layout);
    const page = output.addPage([place.pageWidth, place.pageHeight]);
    page.drawImage(embedded, { x: place.x, y: place.y, width: place.width, height: place.height });
  }
  return output.save();
}
