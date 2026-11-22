import { readFileSync } from 'node:fs';
import { PDFDocument } from '@cantoo/pdf-lib';
import { describe, expect, it } from 'vitest';
import {
  accountKind,
  addressLines,
  cleanText,
  creditorReferenceFrom,
  formatAmount,
  formatQrReference,
  isValidQrReference,
  parseQrBill,
  qrBillPayload,
  QrBillError,
  qrReferenceCheckDigit,
  qrReferenceFrom,
  type AddressInput,
  type QrBillInput,
} from '../../src/lib/qr-bill';
import { BILL_LABELS, layoutQrBill, SLIP, textWidth, wrapText, type Shape } from '../../src/lib/qr-bill-layout';
import { qrBillPdf } from '../../src/lib/qr-bill-pdf';

const NO_ADDRESS: AddressInput = { name: '', street: '', number: '', postalCode: '', town: '', country: 'CH' };

/** The example bill of the SIX implementation guidelines (QR-IBAN with QR reference). */
const EXAMPLE: QrBillInput = {
  account: 'CH44 3199 9123 0008 8901 2',
  creditor: { name: 'Robert Schneider AG', street: 'Rue du Lac', number: '1268', postalCode: '2501', town: 'Biel', country: 'CH' },
  currency: 'CHF',
  amount: '1949.75',
  referenceType: 'QRR',
  reference: '21 00000 00003 13947 14300 09017',
  message: 'Order dated 18.06.2020',
  debtor: { name: 'Pia-Maria Rutschmann-Schnyder', street: 'Grosse Marktgasse', number: '28', postalCode: '9400', town: 'Rorschach', country: 'CH' },
};

/** Runs parseQrBill and returns the error it throws (or fails the test). */
function problemOf(input: QrBillInput): { field: string; problem: string; detail: object } {
  try {
    parseQrBill(input);
  } catch (error) {
    if (error instanceof QrBillError) return { field: error.field, problem: error.problem, detail: error.detail };
    throw error;
  }
  throw new Error('Expected a QrBillError');
}

describe('QR-bill: QR code text', () => {
  it('builds the payload of the SIX example, with structured addresses (type S)', () => {
    expect(qrBillPayload(parseQrBill(EXAMPLE)).split('\n')).toEqual([
      'SPC', '0200', '1', 'CH4431999123000889012',
      'S', 'Robert Schneider AG', 'Rue du Lac', '1268', '2501', 'Biel', 'CH',
      '', '', '', '', '', '', '',
      '1949.75', 'CHF',
      'S', 'Pia-Maria Rutschmann-Schnyder', 'Grosse Marktgasse', '28', '9400', 'Rorschach', 'CH',
      'QRR', '210000000003139471430009017',
      'Order dated 18.06.2020',
      'EPD',
    ]);
  });

  it('leaves amount and debtor empty when they are unknown', () => {
    const bill = parseQrBill({
      ...EXAMPLE,
      account: 'CH58 0079 1123 0008 8901 2',
      amount: '',
      referenceType: 'NON',
      reference: '',
      message: '',
      debtor: NO_ADDRESS,
    });
    const lines = qrBillPayload(bill).split('\n');
    expect(lines[18]).toBe(''); // amount
    expect(lines.slice(20, 27)).toEqual(['', '', '', '', '', '', '']); // debtor
    expect(lines.slice(27)).toEqual(['NON', '', '', 'EPD']);
    expect(qrBillPayload(bill).endsWith('\n')).toBe(false);
  });

  it('cleans up typed text', () => {
    expect(cleanText('  Müller   &\tSöhne\n AG ')).toBe('Müller & Söhne AG');
    expect(cleanText('Invoice 12 – “urgent” … ‘ok’')).toBe('Invoice 12 - "urgent" ... \'ok\'');
    expect(cleanText('Petrovič')).toBe('Petrovič'); // c + combining háček → č
  });

  it('accepts the Latin character set, including č, ł and €', () => {
    const bill = parseQrBill({ ...EXAMPLE, creditor: { ...EXAMPLE.creditor, name: 'Kovačević & Łukasz Sàrl' }, message: 'Total in € – merci' });
    expect(bill.creditor.name).toBe('Kovačević & Łukasz Sàrl');
    expect(problemOf({ ...EXAMPLE, message: 'Thanks 😀' })).toMatchObject({ field: 'message', problem: 'character', detail: { char: '😀' } });
    expect(problemOf({ ...EXAMPLE, creditor: { ...EXAMPLE.creditor, town: 'Москва' } })).toMatchObject({ problem: 'character', detail: { char: 'М' } });
  });
});

describe('QR-bill: checks', () => {
  it('tells QR-IBANs and normal IBANs apart', () => {
    expect(accountKind('CH44 3199 9123 0008 8901 2')).toBe('qr');
    expect(accountKind('CH58 0079 1123 0008 8901 2')).toBe('normal');
    expect(accountKind('CH58 0079 1123 0008 8901 3')).toBeUndefined(); // wrong check digits
    expect(accountKind('DE89 3704 0044 0532 0130 00')).toBeUndefined(); // not Swiss
  });

  it('only accepts Swiss and Liechtenstein accounts', () => {
    expect(problemOf({ ...EXAMPLE, account: 'DE89 3704 0044 0532 0130 00' })).toMatchObject({ field: 'account', problem: 'iban-country' });
    expect(problemOf({ ...EXAMPLE, account: 'CH44 3199 9123 0008 8901 3' })).toMatchObject({ field: 'account', problem: 'iban' });
  });

  it('matches the reference type to the account', () => {
    expect(problemOf({ ...EXAMPLE, referenceType: 'NON' })).toMatchObject({ field: 'reference', problem: 'qr-iban-needs-qrr' });
    expect(problemOf({ ...EXAMPLE, account: 'CH58 0079 1123 0008 8901 2' })).toMatchObject({ problem: 'qrr-needs-qr-iban' });
    const scor = parseQrBill({ ...EXAMPLE, account: 'CH58 0079 1123 0008 8901 2', referenceType: 'SCOR', reference: 'rf18 5390 0754 7034' });
    expect(scor.reference).toBe('RF18539007547034');
    expect(problemOf({ ...EXAMPLE, account: 'CH58 0079 1123 0008 8901 2', referenceType: 'SCOR', reference: 'RF19 5390 0754 7034' })).toMatchObject({
      problem: 'creditor-reference',
    });
  });

  it('checks the QR reference check digit (modulo 10, recursive)', () => {
    expect(qrReferenceCheckDigit('21000000000313947143000901')).toBe(7);
    expect(isValidQrReference('21 00000 00003 13947 14300 09017')).toBe(true);
    expect(isValidQrReference('21 00000 00003 13947 14300 09018')).toBe(false);
    expect(isValidQrReference('12 00000 00003 13947 14300 09017')).toBe(false); // swapped digits are noticed
    expect(problemOf({ ...EXAMPLE, reference: '210000000003139471430009018' })).toMatchObject({ problem: 'qr-reference' });
  });

  it('makes references from invoice numbers', () => {
    const qrr = qrReferenceFrom('4711')!;
    expect(qrr).toMatch(/^0{22}4711\d$/);
    expect(isValidQrReference(qrr)).toBe(true);
    expect(qrReferenceFrom('INV-1')).toBeUndefined();
    expect(qrReferenceFrom('1'.repeat(27))).toBeUndefined();
    expect(creditorReferenceFrom('539007547034')).toBe('RF18539007547034'); // example of ISO 11649
    expect(creditorReferenceFrom('inv 2026 114')).toMatch(/^RF\d{2}INV2026114$/);
    expect(creditorReferenceFrom('a'.repeat(22))).toBeUndefined();
  });

  it('needs name, postal code, town and a country code, and respects the maximum lengths', () => {
    expect(problemOf({ ...EXAMPLE, creditor: { ...EXAMPLE.creditor, name: ' ' } })).toMatchObject({ field: 'creditor.name', problem: 'required' });
    expect(problemOf({ ...EXAMPLE, creditor: { ...EXAMPLE.creditor, town: 'x'.repeat(36) } })).toMatchObject({
      field: 'creditor.town',
      problem: 'too-long',
      detail: { max: 35 },
    });
    expect(problemOf({ ...EXAMPLE, creditor: { ...EXAMPLE.creditor, country: 'Schweiz' } })).toMatchObject({ problem: 'country' });
    expect(problemOf({ ...EXAMPLE, message: 'x'.repeat(141) })).toMatchObject({ field: 'message', problem: 'too-long' });
    // Street and number are optional in structured addresses
    expect(parseQrBill({ ...EXAMPLE, creditor: { ...EXAMPLE.creditor, street: '', number: '' } }).creditor.street).toBe('');
  });

  it('treats a debtor as missing only when all fields are empty', () => {
    expect(parseQrBill({ ...EXAMPLE, debtor: NO_ADDRESS }).debtor).toBeUndefined();
    expect(problemOf({ ...EXAMPLE, debtor: { ...NO_ADDRESS, name: 'Anna' } })).toMatchObject({ field: 'debtor.postalCode', problem: 'required' });
  });

  it('reads amounts the Swiss way and checks the range', () => {
    expect(parseQrBill({ ...EXAMPLE, amount: "1'234.50" }).amount).toBe(1234.5);
    expect(parseQrBill({ ...EXAMPLE, amount: 'CHF 99,9' }).amount).toBe(99.9);
    expect(problemOf({ ...EXAMPLE, amount: '0' })).toMatchObject({ problem: 'amount' });
    expect(problemOf({ ...EXAMPLE, amount: '1000000000' })).toMatchObject({ problem: 'amount' });
    expect(problemOf({ ...EXAMPLE, amount: 'ten' })).toMatchObject({ problem: 'amount' });
  });
});

describe('QR-bill: printed bill', () => {
  it('formats numbers like the style guide', () => {
    expect(formatAmount(1949.75)).toBe('1 949.75');
    expect(formatAmount(1234567.5)).toBe('1 234 567.50');
    expect(formatAmount(0.05)).toBe('0.05');
    expect(formatQrReference('210000000003139471430009017')).toBe('21 00000 00003 13947 14300 09017');
  });

  it('writes the country code in front of foreign postal codes', () => {
    expect(addressLines({ name: 'A', street: 'Hauptstr.', number: '1', postalCode: '10115', town: 'Berlin', country: 'DE' })).toEqual([
      'A',
      'Hauptstr. 1',
      'DE - 10115 Berlin',
    ]);
    expect(addressLines({ name: 'B', street: '', number: '', postalCode: '9490', town: 'Vaduz', country: 'LI' })).toEqual(['B', '9490 Vaduz']);
  });

  it('breaks long text into lines and shortens it with "…" if needed', () => {
    const lines = wrapText('word '.repeat(40).trim(), 50, 10, false, 3);
    expect(lines).toHaveLength(3);
    for (const line of lines) expect(textWidth(line, 10, false)).toBeLessThanOrEqual(50);
    expect(lines[2]!.endsWith('…')).toBe(true);
    expect(wrapText('W'.repeat(60), 50, 10, false, 5).length).toBeGreaterThan(1); // one huge word is cut
  });

  it('uses the official headings in the chosen language', () => {
    const texts = (language: 'de' | 'fr') =>
      layoutQrBill(parseQrBill(EXAMPLE), { language, lineAbove: false }).flatMap((shape) => (shape.type === 'text' ? [shape.text] : []));
    expect(texts('de')).toEqual(expect.arrayContaining([BILL_LABELS.de.paymentPart, BILL_LABELS.de.receipt, 'CH44 3199 9123 0008 8901 2']));
    expect(texts('fr')).toContain('Section paiement');
  });

  it('keeps even the longest possible texts inside their part of the slip', () => {
    const long: AddressInput = { name: 'W'.repeat(70), street: 'M'.repeat(70), number: '8'.repeat(16), postalCode: '9'.repeat(16), town: 'W'.repeat(35), country: 'DE' };
    const bill = parseQrBill({ ...EXAMPLE, creditor: long, debtor: long, message: 'W'.repeat(140) });
    const shapes = layoutQrBill(bill, { language: 'fr', lineAbove: true });
    for (const shape of shapes.filter((s): s is Extract<Shape, { type: 'text' }> => s.type === 'text')) {
      const width = textWidth(shape.text, shape.size, shape.bold);
      const [left, right] = shape.align === 'right' ? [shape.x - width, shape.x] : [shape.x, shape.x + width];
      const inReceipt = shape.x < 62;
      expect(left, shape.text).toBeGreaterThanOrEqual(inReceipt ? 5 : 67);
      expect(right, shape.text).toBeLessThanOrEqual(inReceipt ? 57 : 205);
      expect(shape.y, shape.text).toBeLessThanOrEqual(SLIP.height - 5);
    }
    // The receipt's details end above its amount section (which starts at 68 mm).
    const receiptDetails = shapes.filter((s) => s.type === 'text' && s.x === 5 && s.size === 8 && s.text !== 'CHF');
    for (const shape of receiptDetails) expect(shape.type === 'text' && shape.y).toBeLessThan(68);
  });

  it('creates PDFs: A4 with the slip at the bottom, or just the slip', async () => {
    const fonts = { regular: readFileSync('public/fonts/qr-bill-sans-regular.ttf'), bold: readFileSync('public/fonts/qr-bill-sans-bold.ttf') };
    const bill = parseQrBill({ ...EXAMPLE, debtor: { ...EXAMPLE.debtor, name: 'Ana Petrović' } });
    for (const [format, height] of [['a4', 297], ['slip', 105]] as const) {
      const bytes = await qrBillPdf(layoutQrBill(bill, { language: 'de', lineAbove: format === 'a4' }), format, fonts, 'QR-Rechnung');
      const doc = await PDFDocument.load(bytes);
      expect(doc.getPageCount()).toBe(1);
      const size = doc.getPage(0).getSize();
      expect(Math.round((size.width / 72) * 25.4)).toBe(210);
      expect(Math.round((size.height / 72) * 25.4)).toBe(height);
      expect(doc.getTitle()).toBe('QR-Rechnung');
      expect(bytes.length).toBeLessThan(60_000); // only the used letters of the font are embedded
    }
  });
});
