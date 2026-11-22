/**
 * The Swiss QR-bill ("QR-Rechnung"): checks what the visitor typed and builds the text inside
 * the Swiss QR code.
 *
 * Rules: "Swiss Implementation Guidelines for the QR-bill" by SIX, version 2.3. Since
 * 21 November 2025 only STRUCTURED addresses are allowed (address type "S": street, building
 * number, postal code and town each in their own field). The old "combined" address (type "K")
 * is gone, so this file can't even create it.
 *
 * Drawing the bill (receipt + payment part) is done in qr-bill-layout.ts.
 */
import { isValidCreditorReference, isValidIban, mod97, normalizeIban, parseAmount } from './qr-payloads';

export type Currency = 'CHF' | 'EUR';

/** QRR = QR reference (27 digits, only with a QR-IBAN), SCOR = creditor reference "RF…", NON = none */
export type ReferenceType = 'QRR' | 'SCOR' | 'NON';

/** An address exactly as the form has it (all text, maybe empty). */
export interface AddressInput {
  name: string;
  street: string;
  number: string;
  postalCode: string;
  town: string;
  country: string;
}

/** Everything the form delivers. */
export interface QrBillInput {
  account: string;
  creditor: AddressInput;
  currency: Currency;
  amount: string;
  referenceType: ReferenceType;
  reference: string;
  /** "Additional information" (in the standard: unstructured message) */
  message: string;
  /** Leave all fields empty for "no debtor": the bill then gets an empty box to write in. */
  debtor: AddressInput;
}

/** A checked, cleaned-up bill. */
export interface QrBill {
  /** IBAN or QR-IBAN without spaces, e.g. "CH4431999123000889012" */
  account: string;
  creditor: AddressInput;
  currency: Currency;
  amount?: number;
  referenceType: ReferenceType;
  /** Without spaces; '' for NON */
  reference: string;
  message: string;
  debtor?: AddressInput;
}

/** Longest allowed text per address field (SIX guidelines). */
export const ADDRESS_LIMITS = { name: 70, street: 70, number: 16, postalCode: 16, town: 35, country: 2 } as const;
export const MESSAGE_LIMIT = 140;

/** Names of the form fields, e.g. "account", "creditor.town" – used to mark the field with the problem. */
export type QrBillField = 'account' | 'amount' | 'reference' | 'message' | `${'creditor' | 'debtor'}.${keyof AddressInput}`;

export type QrBillProblem =
  | 'required'
  | 'too-long'
  | 'character'
  | 'iban'
  | 'iban-country'
  | 'country'
  | 'amount'
  | 'qr-iban-needs-qrr'
  | 'qrr-needs-qr-iban'
  | 'qr-reference'
  | 'creditor-reference'
  | 'too-much';

export class QrBillError extends Error {
  constructor(
    public readonly field: QrBillField,
    public readonly problem: QrBillProblem,
    /** Extra details for the message: the maximum length or the character that's not allowed */
    public readonly detail: { max?: number; char?: string } = {},
  ) {
    super(`QR-bill: ${field} – ${problem}`);
    this.name = 'QrBillError';
  }
}

// ---------------------------------------------------------------------------
// Cleaning up and checking text
// ---------------------------------------------------------------------------

/**
 * The characters a QR-bill may contain ("Latin character set" of the guidelines): normal
 * letters, digits and punctuation, accented letters like é, ü, č, ł, ő, plus Ș ș Ț ț and €.
 */
const ALLOWED = /^[ -~ -ſȘ-ț€]$/u;

/**
 * Tidies up typed text: one space instead of several spaces, tabs or line breaks, no spaces at the
 * ends. NFC turns "c + separate háček" (which some keyboards produce) into the single letter "č".
 * Typographic dashes, quotes and "…" (word processors put them in automatically) aren't allowed
 * in a QR-bill, so they become their plain keyboard versions.
 */
export function cleanText(value: string): string {
  return value
    .normalize('NFC')
    .replace(/[‐-―−]/g, '-')
    .replace(/[‘’‚‛′]/g, "'")
    .replace(/[“-‟″]/g, '"')
    .replace(/…/g, '...')
    .replace(/\s+/g, ' ')
    .trim();
}

/** The first character that is not allowed in a QR-bill, or undefined if all are fine. */
export function firstInvalidCharacter(value: string): string | undefined {
  return [...value].find((char) => !ALLOWED.test(char));
}

function checkText(field: QrBillField, value: string, max: number, required: boolean): string {
  const text = cleanText(value);
  if (required && text === '') throw new QrBillError(field, 'required');
  if ([...text].length > max) throw new QrBillError(field, 'too-long', { max });
  const char = firstInvalidCharacter(text);
  if (char) throw new QrBillError(field, 'character', { char });
  return text;
}

function checkAddress(party: 'creditor' | 'debtor', address: AddressInput): AddressInput {
  const field = (key: keyof AddressInput) => `${party}.${key}` as const;
  const country = cleanText(address.country).toUpperCase();
  if (!/^[A-Z]{2}$/.test(country)) throw new QrBillError(field('country'), 'country');
  return {
    name: checkText(field('name'), address.name, ADDRESS_LIMITS.name, true),
    // Street and building number are optional in structured addresses (e.g. small villages).
    street: checkText(field('street'), address.street, ADDRESS_LIMITS.street, false),
    number: checkText(field('number'), address.number, ADDRESS_LIMITS.number, false),
    postalCode: checkText(field('postalCode'), address.postalCode, ADDRESS_LIMITS.postalCode, true),
    town: checkText(field('town'), address.town, ADDRESS_LIMITS.town, true),
    country,
  };
}

/** True if nothing was typed into the debtor fields (the country field is pre-filled, so it doesn't count). */
export function isEmptyAddress(address: AddressInput): boolean {
  return [address.name, address.street, address.number, address.postalCode, address.town].every((value) => value.trim() === '');
}

// ---------------------------------------------------------------------------
// Accounts and references
// ---------------------------------------------------------------------------

/**
 * A QR-IBAN is a Swiss/Liechtenstein IBAN whose bank number ("QR-IID", the digits 5 to 9) is
 * between 30000 and 31999. Banks give it out for payments with a QR reference.
 */
export function isQrIban(iban: string): boolean {
  const value = normalizeIban(iban);
  if (!/^(CH|LI)\d{7}/.test(value)) return false;
  const bankNumber = Number(value.slice(4, 9));
  return bankNumber >= 30000 && bankNumber <= 31999;
}

/** "qr" for a valid QR-IBAN, "normal" for another valid CH/LI IBAN, undefined otherwise. */
export function accountKind(iban: string): 'qr' | 'normal' | undefined {
  const value = normalizeIban(iban);
  if (!/^(CH|LI)/.test(value) || value.length !== 21 || !isValidIban(value)) return undefined;
  return isQrIban(value) ? 'qr' : 'normal';
}

/**
 * Check digit of a QR reference ("modulo 10, recursive" – the method of the old orange
 * payment slips). The table makes swapped or mistyped digits change the result.
 */
export function qrReferenceCheckDigit(digits: string): number {
  const table = [0, 9, 4, 6, 8, 2, 7, 1, 3, 5];
  let carry = 0;
  for (const digit of digits) carry = table[(carry + Number(digit)) % 10]!;
  return (10 - carry) % 10;
}

/** 27 digits, the last one being the check digit of the first 26. */
export function isValidQrReference(reference: string): boolean {
  const value = reference.replace(/\s+/g, '');
  return /^\d{27}$/.test(value) && qrReferenceCheckDigit(value.slice(0, 26)) === Number(value[26]);
}

/**
 * Turns an invoice or customer number into a QR reference: zeros in front up to 26 digits,
 * then the check digit. "4711" → "000000000000000000000047119". Undefined if that's impossible.
 * (Some banks want their own customer number at the start – they tell you if so.)
 */
export function qrReferenceFrom(number: string): string | undefined {
  const digits = number.replace(/\s+/g, '');
  if (!/^\d{1,26}$/.test(digits)) return undefined;
  const base = digits.padStart(26, '0');
  return `${base}${qrReferenceCheckDigit(base)}`;
}

/**
 * Turns an invoice number into an international creditor reference (ISO 11649):
 * "RF" + two check digits + the number. "539007547034" → "RF18539007547034".
 */
export function creditorReferenceFrom(text: string): string | undefined {
  const value = text.replace(/\s+/g, '').toUpperCase();
  if (!/^[A-Z0-9]{1,21}$/.test(value)) return undefined;
  // The check digits are chosen so that the whole reference passes the "mod 97 = 1" test.
  const check = 98 - mod97(`${value}RF00`);
  return `RF${String(check).padStart(2, '0')}${value}`;
}

// ---------------------------------------------------------------------------
// Formatting for the printed bill (as the style guide shows it)
// ---------------------------------------------------------------------------

/** "210000000003139471430009017" → "21 00000 00003 13947 14300 09017" */
export function formatQrReference(reference: string): string {
  const value = reference.replace(/\s+/g, '');
  return `${value.slice(0, 2)} ${value.slice(2).replace(/(.{5})/g, '$1 ')}`.trim();
}

/** "RF18539007547034" → "RF18 5390 0754 7034" */
export function formatCreditorReference(reference: string): string {
  return reference.replace(/\s+/g, '').replace(/(.{4})/g, '$1 ').trim();
}

export function formatReference(type: ReferenceType, reference: string): string {
  if (type === 'QRR') return formatQrReference(reference);
  if (type === 'SCOR') return formatCreditorReference(reference);
  return '';
}

/** 1234567.5 → "1 234 567.50" (space between thousands, dot before the cents) */
export function formatAmount(amount: number): string {
  const [whole, cents] = amount.toFixed(2).split('.');
  return `${whole!.replace(/\B(?=(\d{3})+$)/g, ' ')}.${cents}`;
}

/**
 * The printed lines of an address: name, street + number, postal code + town.
 * Addresses outside Switzerland and Liechtenstein get the country code in front: "DE - 10115 Berlin".
 */
export function addressLines(address: AddressInput): string[] {
  const street = [address.street, address.number].filter(Boolean).join(' ');
  const country = address.country === 'CH' || address.country === 'LI' ? '' : `${address.country} - `;
  return [address.name, street, `${country}${address.postalCode} ${address.town}`].filter((line) => line.trim() !== '');
}

// ---------------------------------------------------------------------------
// Checking the whole bill and building the QR code text
// ---------------------------------------------------------------------------

/** Checks everything and returns the cleaned-up bill. Throws QrBillError for the first problem. */
export function parseQrBill(input: QrBillInput): QrBill {
  const account = normalizeIban(input.account);
  if (account === '') throw new QrBillError('account', 'required');
  if (/^[A-Z]{2}/.test(account) && !/^(CH|LI)/.test(account)) throw new QrBillError('account', 'iban-country');
  const kind = accountKind(account);
  if (!kind) throw new QrBillError('account', 'iban');

  const creditor = checkAddress('creditor', input.creditor);

  let amount: number | undefined;
  const amountText = input.amount.replace(/chf/i, '');
  if (amountText.trim() !== '') {
    amount = parseAmount(amountText);
    if (amount === undefined || !(amount >= 0.01 && amount <= 999_999_999.99)) throw new QrBillError('amount', 'amount');
    amount = Math.round(amount * 100) / 100;
  }

  const { referenceType } = input;
  if (kind === 'qr' && referenceType !== 'QRR') throw new QrBillError('reference', 'qr-iban-needs-qrr');
  if (kind === 'normal' && referenceType === 'QRR') throw new QrBillError('reference', 'qrr-needs-qr-iban');
  let reference = '';
  if (referenceType !== 'NON') {
    reference = input.reference.replace(/\s+/g, '').toUpperCase();
    if (reference === '') throw new QrBillError('reference', 'required');
    if (referenceType === 'QRR' && !isValidQrReference(reference)) throw new QrBillError('reference', 'qr-reference');
    if (referenceType === 'SCOR' && !isValidCreditorReference(reference)) throw new QrBillError('reference', 'creditor-reference');
  }

  const message = checkText('message', input.message, MESSAGE_LIMIT, false);
  const debtor = isEmptyAddress(input.debtor) ? undefined : checkAddress('debtor', input.debtor);

  const bill: QrBill = { account, creditor, currency: input.currency, amount, referenceType, reference, message, debtor };
  // A Swiss QR code may hold at most 997 characters. Only extreme inputs get there
  // (many letters like "č" take two bytes in the code).
  if (new TextEncoder().encode(qrBillPayload(bill)).length > 997) throw new QrBillError('message', 'too-much');
  return bill;
}

/** The 7 lines of an address in the QR code: type "S" (structured), name, street, number, postal code, town, country. */
function addressElements(address: AddressInput | undefined): string[] {
  if (!address) return ['', '', '', '', '', '', ''];
  return ['S', address.name, address.street, address.number, address.postalCode, address.town, address.country];
}

/**
 * The text inside the Swiss QR code, one element per line (guidelines chapter 4):
 *
 *   SPC / 0200 / 1               header: "Swiss Payments Code", version 2.0, UTF-8
 *   IBAN                         account
 *   S, name … country            creditor (7 lines)
 *   7 empty lines                "ultimate creditor" – reserved for later use, must stay empty
 *   amount, currency             e.g. "1949.75", "CHF" (amount may be empty)
 *   S, name … country            debtor (7 lines, all empty if unknown)
 *   QRR/SCOR/NON, reference      reference type and reference
 *   message                      "additional information"
 *   EPD                          "end of payment data"
 */
export function qrBillPayload(bill: QrBill): string {
  return [
    'SPC',
    '0200',
    '1',
    bill.account,
    ...addressElements(bill.creditor),
    ...addressElements(undefined),
    bill.amount === undefined ? '' : bill.amount.toFixed(2),
    bill.currency,
    ...addressElements(bill.debtor),
    bill.referenceType,
    bill.reference,
    bill.message,
    'EPD',
  ].join('\n');
}
