/**
 * Runs once before the browser tests: creates sample PDFs in tests/fixtures/generated/.
 * Each page is a little wider than the one before (200, 201, 202 points…), so tests
 * can recognise pages after merging or reordering.
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { PDFDocument, StandardFonts } from '@cantoo/pdf-lib';
import { GENERATED } from './helpers';

async function makePdf(labels: string[], firstWidth: number, userPassword?: string): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  labels.forEach((label, index) => {
    doc.addPage([firstWidth + index, 300]).drawText(label, { x: 20, y: 150, size: 24, font });
  });
  if (userPassword !== undefined) {
    doc.encrypt({ ownerPassword: 'owner-secret', userPassword, permissions: {} });
  }
  return doc.save();
}

export default async function globalSetup(): Promise<void> {
  mkdirSync(GENERATED, { recursive: true });
  writeFileSync(`${GENERATED}/three-pages.pdf`, await makePdf(['Page 1', 'Page 2', 'Page 3'], 200));
  writeFileSync(`${GENERATED}/two-pages.pdf`, await makePdf(['A', 'B'], 300));
  writeFileSync(`${GENERATED}/protected.pdf`, await makePdf(['Secret 1', 'Secret 2'], 400, 'secret'));
  writeFileSync(`${GENERATED}/restricted.pdf`, await makePdf(['Restricted'], 500, ''));
  writeFileSync(`${GENERATED}/not-a-pdf.pdf`, 'This is just text pretending to be a PDF.');
}
