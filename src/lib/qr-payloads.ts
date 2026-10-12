/**
 * A QR code is just text. Phones recognise special text formats and offer an
 * action: "https://…" opens a website, "WIFI:…" joins a network, "BCD…" starts a
 * bank transfer. This file builds those texts.
 */

// ---------------------------------------------------------------------------
// Links, e-mail, phone
// ---------------------------------------------------------------------------

/** "example.com" → "https://example.com" so phones recognise it as a link. */
export function normalizeUrl(input: string): string {
  const url = input.trim();
  if (url === '') return '';
  // Already has a scheme like "https:", "mailto:" or "tel:"? Keep it as it is.
  return /^[a-z][a-z0-9+.-]*:/i.test(url) ? url : `https://${url}`;
}

export function emailPayload(address: string, subject = '', body = ''): string {
  const params = new URLSearchParams();
  if (subject) params.set('subject', subject);
  if (body) params.set('body', body);
  // URLSearchParams writes spaces as "+", but mail apps expect "%20".
  const query = params.toString().replace(/\+/g, '%20');
  return `mailto:${address.trim()}${query ? `?${query}` : ''}`;
}

export function phonePayload(number: string): string {
  return `tel:${number.replace(/[^\d+]/g, '')}`; // keep only digits and "+"
}

// ---------------------------------------------------------------------------
// Wi-Fi
// ---------------------------------------------------------------------------

export type WifiEncryption = 'WPA' | 'WEP' | 'nopass';

export interface WifiNetwork {
  ssid: string;
  password: string;
  encryption: WifiEncryption;
  hidden: boolean;
}

/** In the Wi-Fi format, the characters \ ; , : " have a special meaning and must be escaped with "\". */
export function escapeWifiValue(value: string): string {
  return value.replace(/([\\;,:"])/g, '\\$1');
}

/** Example result: WIFI:T:WPA;S:My Network;P:secret\;123;; */
export function wifiPayload({ ssid, password, encryption, hidden }: WifiNetwork): string {
  let payload = `WIFI:T:${encryption};S:${escapeWifiValue(ssid)};`;
  if (encryption !== 'nopass') payload += `P:${escapeWifiValue(password)};`;
  if (hidden) payload += 'H:true;';
  return `${payload};`;
}

// ---------------------------------------------------------------------------
// EPC payment QR code ("GiroCode") for SEPA credit transfers
// Standard: EPC069-12 by the European Payments Council.
// ---------------------------------------------------------------------------

/** Removes spaces and makes letters uppercase: "de89 3704…" → "DE893704…" */
export function normalizeIban(iban: string): string {
  return iban.replace(/\s+/g, '').toUpperCase();
}

/** "DE89370400440532013000" → "DE89 3704 0044 0532 0130 00" */
export function formatIban(iban: string): string {
  return normalizeIban(iban).replace(/(.{4})/g, '$1 ').trim();
}

/**
 * The "mod 97" check used by IBANs and RF creditor references (ISO 7064):
 * 1. move the first four characters to the end,
 * 2. replace letters by numbers (A = 10, B = 11, … Z = 35),
 * 3. the huge resulting number divided by 97 must leave a remainder of 1.
 * The number is too big for JavaScript, so we compute the remainder digit by digit.
 */
function passesMod97(value: string): boolean {
  const rearranged = value.slice(4) + value.slice(0, 4);
  let remainder = 0;
  for (const char of rearranged) {
    const number = parseInt(char, 36); // '0'–'9' → 0–9, 'A'–'Z' → 10–35
    if (Number.isNaN(number)) return false;
    // Numbers ≥ 10 have two digits, so we "shift" the remainder by 100 instead of 10.
    remainder = (remainder * (number > 9 ? 100 : 10) + number) % 97;
  }
  return remainder === 1;
}

export function isValidIban(iban: string): boolean {
  const value = normalizeIban(iban);
  return /^[A-Z]{2}\d{2}[A-Z0-9]{11,30}$/.test(value) && passesMod97(value);
}

/** RF creditor reference (ISO 11649), e.g. "RF18 5390 0754 7034". */
export function isValidCreditorReference(reference: string): boolean {
  const value = reference.replace(/\s+/g, '').toUpperCase();
  return /^RF\d{2}[A-Z0-9]{1,21}$/.test(value) && passesMod97(value);
}

export function isValidBic(bic: string): boolean {
  return /^[A-Z]{4}[A-Z]{2}[A-Z0-9]{2}([A-Z0-9]{3})?$/.test(bic.replace(/\s+/g, '').toUpperCase());
}

/**
 * Reads an amount the way people type it: "12.50", "12,50", "1,234.50" or "1.234,50".
 * The LAST "." or "," is the decimal separator if one or two digits follow it.
 * Returns undefined for empty input and NaN for nonsense.
 */
export function parseAmount(input: string): number | undefined {
  const value = input.replace(/[\s'€]/g, '').replace(/eur/i, '');
  if (value === '') return undefined;
  if (!/^\d[\d.,]*$/.test(value)) return Number.NaN;
  const decimal = /[.,](\d{1,2})$/.exec(value);
  const whole = decimal ? value.slice(0, decimal.index) : value;
  return Number(`${whole.replace(/[.,]/g, '')}.${decimal ? decimal[1] : '0'}`);
}

export interface EpcPayment {
  /** Name of the person/company receiving the money (max. 70 characters) */
  name: string;
  iban: string;
  /** Optional within the EEA */
  bic?: string;
  /** In euros, 0.01 – 999,999,999.99. Leave out to let the payer type it. */
  amount?: number;
  /** Payment reference: an RF creditor reference or free text (max. 140 characters) */
  reference?: string;
}

export type EpcErrorField = 'name' | 'iban' | 'bic' | 'amount' | 'reference' | 'too-long';

export class EpcError extends Error {
  constructor(public readonly field: EpcErrorField) {
    super(`Invalid EPC field: ${field}`);
    this.name = 'EpcError';
  }
}

/**
 * Builds the text of an EPC QR code. Each line is one field:
 *
 *   BCD                      service tag (always "BCD")
 *   002                      version
 *   1                        character set: 1 = UTF-8
 *   SCT                      SEPA Credit Transfer
 *   BIC                      may be empty
 *   Name
 *   IBAN
 *   EUR12.50                 amount, may be empty
 *   (purpose code)           we leave it empty
 *   RF reference             structured reference, OR …
 *   free text reference      … unstructured text (never both)
 */
export function epcPayload(payment: EpcPayment): string {
  const name = payment.name.trim();
  if (name.length === 0 || name.length > 70) throw new EpcError('name');

  const iban = normalizeIban(payment.iban);
  if (!isValidIban(iban)) throw new EpcError('iban');

  const bic = (payment.bic ?? '').replace(/\s+/g, '').toUpperCase();
  if (bic !== '' && !isValidBic(bic)) throw new EpcError('bic');

  let amount = '';
  if (payment.amount !== undefined) {
    if (!(payment.amount >= 0.01 && payment.amount <= 999_999_999.99)) throw new EpcError('amount');
    amount = `EUR${payment.amount.toFixed(2)}`;
  }

  // A valid RF reference goes into the "structured" field, anything else is free text.
  const reference = (payment.reference ?? '').trim();
  const isStructured = isValidCreditorReference(reference);
  const structured = isStructured ? reference.replace(/\s+/g, '').toUpperCase() : '';
  const unstructured = isStructured ? '' : reference;
  if (unstructured.length > 140) throw new EpcError('reference');

  const lines = ['BCD', '002', '1', 'SCT', bic, name, iban, amount, '', structured, unstructured];
  // The standard says: no line breaks after the last filled-in field.
  while (lines.at(-1) === '') lines.pop();
  const payload = lines.join('\n');

  // The standard allows at most 331 bytes in total.
  if (new TextEncoder().encode(payload).length > 331) throw new EpcError('too-long');
  return payload;
}
