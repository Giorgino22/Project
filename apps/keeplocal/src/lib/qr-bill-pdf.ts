/**
 * Draws a QR-bill (the shapes from qr-bill-layout.ts) into a PDF: either an A4 page with the
 * slip at the bottom, or a page that is just the slip (210 × 105 mm).
 *
 * pdf-lib (and fontkit, which pdf-lib needs to embed a font file) are big, so the tool page only
 * loads this file when the visitor clicks a PDF button.
 */
import fontkit from '@cantoo/fontkit';
import { LineCapStyle, PDFDocument, rgb, type PDFFont } from '@cantoo/pdf-lib';
import { qrPath, scissorsPath, SLIP, type Shape } from './qr-bill-layout';

export type PdfFormat = 'a4' | 'slip';

/** Page heights in mm (both pages are 210 mm wide). */
const PAGE_HEIGHT: Record<PdfFormat, number> = { a4: 297, slip: SLIP.height };

const PT_PER_MM = 72 / 25.4;
const BLACK = rgb(0, 0, 0);
const WHITE = rgb(1, 1, 1);

export interface QrBillFonts {
  /** The font files public/fonts/qr-bill-sans-regular.ttf and …-bold.ttf */
  regular: Uint8Array;
  bold: Uint8Array;
}

export async function qrBillPdf(shapes: Shape[], format: PdfFormat, fonts: QrBillFonts, title: string): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  doc.registerFontkit(fontkit);
  // subset: only the letters that are actually used end up in the PDF (keeps it small).
  const font: Record<'regular' | 'bold', PDFFont> = {
    regular: await doc.embedFont(fonts.regular, { subset: true }),
    bold: await doc.embedFont(fonts.bold, { subset: true }),
  };
  doc.setTitle(title);
  doc.setCreator('KeepLocal');
  doc.setProducer('KeepLocal');

  const page = doc.addPage([SLIP.width * PT_PER_MM, PAGE_HEIGHT[format] * PT_PER_MM]);
  // PDF measures from the BOTTOM left corner in points; the layout from the slip's TOP left in mm.
  // The slip sits at the bottom of the page, so "y mm below the slip's top" is (105 − y) mm up.
  const x = (mm: number) => mm * PT_PER_MM;
  const y = (mm: number) => (SLIP.height - mm) * PT_PER_MM;

  for (const shape of shapes) {
    switch (shape.type) {
      case 'text': {
        const face = shape.bold ? font.bold : font.regular;
        const width = shape.align === 'right' ? face.widthOfTextAtSize(shape.text, shape.size) : 0;
        page.drawText(shape.text, { x: x(shape.x) - width, y: y(shape.y), size: shape.size, font: face, color: BLACK });
        break;
      }
      case 'line':
        page.drawLine({
          start: { x: x(shape.x1), y: y(shape.y1) },
          end: { x: x(shape.x2), y: y(shape.y2) },
          thickness: shape.width,
          color: BLACK,
          dashArray: shape.dashed ? [4, 3] : undefined,
        });
        break;
      case 'rect':
        page.drawRectangle({
          x: x(shape.x),
          y: y(shape.y + shape.height),
          width: shape.width * PT_PER_MM,
          height: shape.height * PT_PER_MM,
          color: shape.color === 'black' ? BLACK : WHITE,
        });
        break;
      case 'qr':
        // drawSvgPath puts the path's 0/0 at x/y and lets it grow downwards, like SVG.
        page.drawSvgPath(qrPath(shape), { x: x(shape.x), y: y(shape.y), scale: (shape.size / shape.count) * PT_PER_MM, color: BLACK });
        break;
      case 'scissors': {
        const half = shape.size / 2;
        page.drawRectangle({ x: x(shape.x - half), y: y(shape.y + half), width: shape.size * PT_PER_MM, height: shape.size * PT_PER_MM, color: WHITE });
        // The path is in mm; scale turns mm into points (the line width is scaled too, so it's in mm).
        page.drawSvgPath(scissorsPath(shape), {
          x: 0,
          y: y(0),
          scale: PT_PER_MM,
          borderColor: BLACK,
          borderWidth: shape.size / 12,
          borderLineCap: LineCapStyle.Round,
        });
        break;
      }
    }
  }
  return doc.save();
}
