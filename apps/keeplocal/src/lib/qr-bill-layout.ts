/**
 * Where everything sits on a Swiss QR-bill (the 210 × 105 mm slip: receipt on the left,
 * payment part on the right), following the SIX style guide.
 *
 * The result is a plain list of "shapes" (texts, lines, rectangles, the QR code). Two small
 * renderers draw that list: one as SVG for the preview on the page (src/scripts/qr-bill-svg.ts),
 * one into a PDF (qr-bill-pdf.ts). So preview and PDF always look the same.
 *
 * Units: positions and sizes in millimetres from the top left corner of the slip,
 * font sizes and line widths in points (1 pt = 1/72 inch ≈ 0.353 mm), like the style guide.
 */
import QRCode from 'qrcode';
import fontWidths from './qr-bill-font-widths.json';
import {
  addressLines,
  formatAmount,
  formatReference,
  qrBillPayload,
  type QrBill,
} from './qr-bill';
import { formatIban } from './qr-payloads';

export type Shape =
  /** y is the baseline (the line the letters sit on). align "right": x is where the text ends. */
  | { type: 'text'; x: number; y: number; text: string; size: number; bold: boolean; align: 'left' | 'right' }
  | { type: 'line'; x1: number; y1: number; x2: number; y2: number; width: number; dashed: boolean }
  | { type: 'rect'; x: number; y: number; width: number; height: number; color: 'black' | 'white' }
  /** modules: one entry per square of the code, row by row (1 = black) */
  | { type: 'qr'; x: number; y: number; size: number; count: number; modules: Uint8Array }
  /** A scissors symbol on the cutting line, centred on x/y. rotate = blades point down. */
  | { type: 'scissors'; x: number; y: number; size: number; rotate: boolean };

export const SLIP = { width: 210, height: 105 } as const;
export const QR_SIZE = 46; // the Swiss QR code is always 46 × 46 mm

export type BillLanguage = 'en' | 'de' | 'fr' | 'it';

/** The headings of the bill. Their wording is prescribed by the standard, in four languages. */
export const BILL_LABELS = {
  en: {
    receipt: 'Receipt',
    paymentPart: 'Payment part',
    account: 'Account / Payable to',
    reference: 'Reference',
    additionalInformation: 'Additional information',
    payableBy: 'Payable by',
    payableByName: 'Payable by (name/address)',
    currency: 'Currency',
    amount: 'Amount',
    acceptancePoint: 'Acceptance point',
  },
  de: {
    receipt: 'Empfangsschein',
    paymentPart: 'Zahlteil',
    account: 'Konto / Zahlbar an',
    reference: 'Referenz',
    additionalInformation: 'Zusätzliche Informationen',
    payableBy: 'Zahlbar durch',
    payableByName: 'Zahlbar durch (Name/Adresse)',
    currency: 'Währung',
    amount: 'Betrag',
    acceptancePoint: 'Annahmestelle',
  },
  fr: {
    receipt: 'Récépissé',
    paymentPart: 'Section paiement',
    account: 'Compte / Payable à',
    reference: 'Référence',
    additionalInformation: 'Informations supplémentaires',
    payableBy: 'Payable par',
    payableByName: 'Payable par (nom/adresse)',
    currency: 'Monnaie',
    amount: 'Montant',
    acceptancePoint: 'Point de dépôt',
  },
  it: {
    receipt: 'Ricevuta',
    paymentPart: 'Sezione pagamento',
    account: 'Conto / Pagabile a',
    reference: 'Riferimento',
    additionalInformation: 'Informazioni supplementari',
    payableBy: 'Pagabile da',
    payableByName: 'Pagabile da (nome/indirizzo)',
    currency: 'Valuta',
    amount: 'Importo',
    acceptancePoint: 'Punto di accettazione',
  },
} satisfies Record<BillLanguage, Record<string, string>>;

const MM_PER_PT = 25.4 / 72;
const pt = (points: number) => points * MM_PER_PT;

// ---------------------------------------------------------------------------
// Measuring and breaking text
// ---------------------------------------------------------------------------

type WidthTable = Record<string, number>;
const WIDTHS = { regular: fontWidths.regular as WidthTable, bold: fontWidths.bold as WidthTable };

/**
 * Width of a text in mm, using the real letter widths of the font the PDF uses
 * (from qr-bill-font-widths.json, made by scripts/make-qr-bill-fonts.py).
 */
export function textWidth(text: string, size: number, bold: boolean): number {
  const table = bold ? WIDTHS.bold : WIDTHS.regular;
  let units = 0;
  for (const char of text) units += table[char] ?? table['n']!; // unknown letters (never in a valid bill): "n"-wide
  return pt((units / fontWidths.unitsPerEm) * size);
}

/**
 * Breaks a text into lines that fit `width` mm – at spaces where possible, inside very long
 * words only if they don't fit on a line at all. If more than `maxLines` lines are needed,
 * the last line ends with "…".
 */
export function wrapText(text: string, width: number, size: number, bold: boolean, maxLines: number): string[] {
  const fits = (line: string) => textWidth(line, size, bold) <= width;
  const lines: string[] = [];
  let current = '';
  for (const word of text.split(' ')) {
    const candidate = current ? `${current} ${word}` : word;
    if (fits(candidate)) {
      current = candidate;
      continue;
    }
    if (current) lines.push(current);
    current = word;
    // A single word that is too long for one line: cut it letter by letter.
    while (!fits(current)) {
      const letters = [...current];
      let cut = letters.length - 1;
      while (cut > 1 && !fits(letters.slice(0, cut).join(''))) cut--;
      lines.push(letters.slice(0, cut).join(''));
      current = letters.slice(cut).join('');
    }
  }
  if (current) lines.push(current);
  if (lines.length <= maxLines) return lines;

  // Too many lines: keep the first ones and shorten the rest into the last line.
  const kept = lines.slice(0, maxLines - 1);
  let last = lines.slice(maxLines - 1).join(' ');
  while (last.length > 0 && !fits(`${last}…`)) last = [...last].slice(0, -1).join('');
  return [...kept, `${last.trimEnd()}…`];
}

// ---------------------------------------------------------------------------
// Building blocks
// ---------------------------------------------------------------------------

/** A text section: a bold heading, then lines of values (or an empty box to write in). */
interface Section {
  heading: string;
  /** Each value may be broken into several lines; `maxLines` says how many it may use. */
  values: { text: string; maxLines: number }[];
  box?: { width: number; height: number };
}

interface ColumnStyle {
  x: number;
  top: number;
  width: number;
  /** Distance between lines in pt */
  lineHeight: number;
  headingSize: number;
  valueSize: number;
}

/** Baseline inside a line: letters sit a bit above the bottom of their line. */
const baseline = (lineTop: number, lineHeight: number) => lineTop + pt(lineHeight * 0.8);

/** Corner marks of an empty field the payer fills in by hand (3 mm long, 0.75 pt). */
export function cornerMarks(x: number, y: number, width: number, height: number): Shape[] {
  const l = 3;
  const line = (x1: number, y1: number, x2: number, y2: number): Shape => ({ type: 'line', x1, y1, x2, y2, width: 0.75, dashed: false });
  const right = x + width;
  const bottom = y + height;
  return [
    line(x, y, x + l, y), line(x, y, x, y + l), // top left
    line(right - l, y, right, y), line(right, y, right, y + l), // top right
    line(x, bottom - l, x, bottom), line(x, bottom, x + l, bottom), // bottom left
    line(right, bottom - l, right, bottom), line(right - l, bottom, right, bottom), // bottom right
  ];
}

/** Lays out sections one below the other. Returns the shapes and where the column ends (mm). */
function column(sections: Section[], style: ColumnStyle): { shapes: Shape[]; bottom: number } {
  const shapes: Shape[] = [];
  const step = pt(style.lineHeight);
  let y = style.top;
  sections.forEach((section, index) => {
    if (index > 0) y += step; // one empty line between sections
    shapes.push({ type: 'text', x: style.x, y: baseline(y, style.lineHeight), text: section.heading, size: style.headingSize, bold: true, align: 'left' });
    y += step;
    for (const value of section.values) {
      for (const line of wrapText(value.text, style.width, style.valueSize, false, value.maxLines)) {
        shapes.push({ type: 'text', x: style.x, y: baseline(y, style.lineHeight), text: line, size: style.valueSize, bold: false, align: 'left' });
        y += step;
      }
    }
    if (section.box) {
      shapes.push(...cornerMarks(style.x, y + 1, section.box.width, section.box.height));
      y += 1 + section.box.height;
    }
  });
  return { shapes, bottom: y };
}

/** Tries a roomy layout first (address lines may use 2 lines); if it doesn't fit, a compact one. */
function fittingColumn(makeSections: (addressLines: number, messageLines: number) => Section[], style: ColumnStyle, maxBottom: number): Shape[] {
  const roomy = column(makeSections(2, 4), style);
  return roomy.bottom <= maxBottom ? roomy.shapes : column(makeSections(1, 2), style).shapes;
}

/** The QR code (with the Swiss cross in the middle) as shapes, `size` mm wide, at x/y. */
export function qrCodeShapes(payload: string, x: number, y: number, size = QR_SIZE): Shape[] {
  // Error correction level M, as the standard requires.
  const code = QRCode.create(payload, { errorCorrectionLevel: 'M' });
  const scale = size / QR_SIZE;
  const center = (box: number) => ({ x: x + size / 2 - (box * scale) / 2, y: y + size / 2 - (box * scale) / 2 });
  const square = (box: number, color: 'black' | 'white'): Shape => ({ type: 'rect', ...center(box), width: box * scale, height: box * scale, color });
  // The Swiss cross: 7 mm white border square, 6 mm black square, white cross (3.89 × 1.17 mm arms).
  const arm = { long: 3.89 * scale, thick: 1.17 * scale };
  return [
    { type: 'qr', x, y, size, count: code.modules.size, modules: code.modules.data },
    square(7, 'white'),
    square(6, 'black'),
    { type: 'rect', x: x + size / 2 - arm.long / 2, y: y + size / 2 - arm.thick / 2, width: arm.long, height: arm.thick, color: 'white' },
    { type: 'rect', x: x + size / 2 - arm.thick / 2, y: y + size / 2 - arm.long / 2, width: arm.thick, height: arm.long, color: 'white' },
  ];
}

/**
 * The black squares of a QR code as ONE SVG path, in "module" units (1 = one square).
 * Neighbouring squares in a row are joined into one rectangle. One filled path (instead of
 * thousands of separate squares) also avoids thin white seams between squares in PDF viewers.
 */
export function qrPath(shape: Extract<Shape, { type: 'qr' }>): string {
  const parts: string[] = [];
  for (let row = 0; row < shape.count; row++) {
    let col = 0;
    while (col < shape.count) {
      if (!shape.modules[row * shape.count + col]) {
        col++;
        continue;
      }
      const start = col;
      while (col < shape.count && shape.modules[row * shape.count + col]) col++;
      parts.push(`M${start} ${row}h${col - start}v1h${start - col}z`);
    }
  }
  return parts.join('');
}

/**
 * The scissors symbol (shape of the Lucide "scissors" icon: two rings and three lines) as an
 * SVG path in mm. Drawn as a line, `size / 12` mm thick.
 */
export function scissorsPath(shape: Extract<Shape, { type: 'scissors' }>): string {
  const scale = shape.size / 24; // the icon is drawn on a 24 × 24 grid
  // Icon point → mm on the slip. Rotated by 90° the blades point down instead of right.
  const point = (x: number, y: number) => {
    const [u, v] = shape.rotate ? [12 - y, x - 12] : [x - 12, y - 12];
    return `${(shape.x + u * scale).toFixed(3)} ${(shape.y + v * scale).toFixed(3)}`;
  };
  const ring = (cx: number, cy: number) => {
    const r = 3 * scale;
    const [x, y] = point(cx, cy).split(' ').map(Number) as [number, number];
    return `M${(x - r).toFixed(3)} ${y.toFixed(3)}a${r} ${r} 0 1 0 ${2 * r} 0a${r} ${r} 0 1 0 ${-2 * r} 0`;
  };
  const line = (x1: number, y1: number, x2: number, y2: number) => `M${point(x1, y1)}L${point(x2, y2)}`;
  return [ring(6, 6), ring(6, 18), line(8.12, 8.12, 12, 12), line(20, 4, 8.12, 15.88), line(14.8, 14.8, 20, 20)].join('');
}

// ---------------------------------------------------------------------------
// The whole slip
// ---------------------------------------------------------------------------

export interface LayoutOptions {
  language: BillLanguage;
  /** true on an A4 page: also draw the cutting line along the top edge of the slip */
  lineAbove: boolean;
}

/** All shapes of a QR-bill slip (210 × 105 mm). */
export function layoutQrBill(bill: QrBill, { language, lineAbove }: LayoutOptions): Shape[] {
  const labels = BILL_LABELS[language];
  const shapes: Shape[] = [];
  const text = (x: number, y: number, value: string, size: number, bold: boolean, align: 'left' | 'right' = 'left') =>
    shapes.push({ type: 'text', x, y, text: value, size, bold, align });

  // Cutting lines with scissors: the visitor prints on plain paper, so the standard asks for them.
  shapes.push({ type: 'line', x1: 62, y1: 0, x2: 62, y2: SLIP.height, width: 0.75, dashed: true });
  shapes.push({ type: 'scissors', x: 62, y: 11, size: 4, rotate: true });
  if (lineAbove) {
    shapes.push({ type: 'line', x1: 0, y1: 0, x2: SLIP.width, y2: 0, width: 0.75, dashed: true });
    shapes.push({ type: 'scissors', x: 105, y: 0, size: 4, rotate: false });
  }

  const creditor = addressLines(bill.creditor);
  const debtor = bill.debtor ? addressLines(bill.debtor) : [];
  const reference = formatReference(bill.referenceType, bill.reference);

  // Sections of the receipt (left) and of the payment part's right column. The receipt has no
  // "additional information"; both show an empty box when the payer's address is unknown.
  function sections(receipt: boolean, addressMax: number, messageMax: number): Section[] {
    const lines = (values: string[]) => values.map((value) => ({ text: value, maxLines: addressMax }));
    const list: Section[] = [{ heading: labels.account, values: [{ text: formatIban(bill.account), maxLines: 1 }, ...lines(creditor)] }];
    if (reference) list.push({ heading: labels.reference, values: [{ text: reference, maxLines: 1 }] });
    if (!receipt && bill.message) list.push({ heading: labels.additionalInformation, values: [{ text: bill.message, maxLines: messageMax }] });
    if (bill.debtor) list.push({ heading: labels.payableBy, values: lines(debtor) });
    else list.push({ heading: labels.payableByName, values: [], box: receipt ? { width: 52, height: 20 } : { width: 65, height: 25 } });
    return list;
  }

  // ----- Receipt: 62 mm wide, 5 mm margins -----
  text(5, 5 + pt(11 * 0.8), labels.receipt, 11, true);
  shapes.push(
    ...fittingColumn((a) => sections(true, a, 0), { x: 5, top: 12, width: 52, lineHeight: 9, headingSize: 6, valueSize: 8 }, 66),
  );
  // Amount: if it's unknown, the payer writes it into a box.
  const receiptAmountX = bill.amount === undefined ? 18 : 27;
  text(5, baseline(68, 9), labels.currency, 6, true);
  text(receiptAmountX, baseline(68, 9), labels.amount, 6, true);
  text(5, baseline(68 + pt(9), 9), bill.currency, 8, false);
  if (bill.amount === undefined) shapes.push(...cornerMarks(27, 68, 30, 10));
  else text(receiptAmountX, baseline(68 + pt(9), 9), formatAmount(bill.amount), 8, false);
  text(57, baseline(82, 9), labels.acceptancePoint, 6, true, 'right');

  // ----- Payment part: starts at 62 mm; QR code and amount on the left, details on the right -----
  text(67, 5 + pt(11 * 0.8), labels.paymentPart, 11, true);
  shapes.push(...qrCodeShapes(qrBillPayload(bill), 67, 17));
  text(67, baseline(68, 11), labels.currency, 8, true);
  text(89, baseline(68, 11), labels.amount, 8, true);
  text(67, baseline(68 + pt(11), 11), bill.currency, 10, false);
  if (bill.amount === undefined) shapes.push(...cornerMarks(78, 72, 40, 15));
  else text(89, baseline(68 + pt(11), 11), formatAmount(bill.amount), 10, false);

  shapes.push(
    ...fittingColumn((a, m) => sections(false, a, m), { x: 118, top: 5, width: 87, lineHeight: 11, headingSize: 8, valueSize: 10 }, 100),
  );
  return shapes;
}
