import { describe, expect, it } from 'vitest';
import { characterPools, entropyBits, generatePassword, secureRandomInt, strengthOf, type PasswordOptions } from '../../src/lib/password';
import {
  emailPayload,
  EpcError,
  epcPayload,
  escapeWifiValue,
  formatIban,
  isValidCreditorReference,
  isValidIban,
  normalizeUrl,
  parseAmount,
  phonePayload,
  wifiPayload,
} from '../../src/lib/qr-payloads';

const ALL_ON: PasswordOptions = { length: 20, lowercase: true, uppercase: true, digits: true, symbols: true, avoidAmbiguous: false };

describe('password generator', () => {
  it('creates passwords of the requested length with every selected character type', () => {
    for (let i = 0; i < 200; i++) {
      const password = generatePassword({ ...ALL_ON, length: 8 });
      expect(password).toHaveLength(8);
      expect(password).toMatch(/[a-z]/);
      expect(password).toMatch(/[A-Z]/);
      expect(password).toMatch(/\d/);
      expect(password).toMatch(/[^a-zA-Z\d]/);
    }
  });

  it('only uses the selected character types', () => {
    const digitsOnly = { ...ALL_ON, lowercase: false, uppercase: false, symbols: false };
    expect(generatePassword(digitsOnly)).toMatch(/^\d{20}$/);
  });

  it('can avoid look-alike characters', () => {
    const pools = characterPools({ ...ALL_ON, avoidAmbiguous: true }).join('');
    expect(pools).not.toMatch(/[Il1O0]/);
  });

  it('needs at least one character type', () => {
    expect(() => generatePassword({ ...ALL_ON, lowercase: false, uppercase: false, digits: false, symbols: false })).toThrow();
  });

  it('secureRandomInt is unbiased enough (every value appears, roughly equally)', () => {
    const counts = new Array(6).fill(0);
    for (let i = 0; i < 60_000; i++) counts[secureRandomInt(6)]++;
    for (const count of counts) expect(count).toBeGreaterThan(9_000); // expected 10,000 each
  });

  it('estimates strength', () => {
    expect(entropyBits({ ...ALL_ON, length: 16 })).toBeGreaterThan(95);
    expect(strengthOf(30)).toBe('weak');
    expect(strengthOf(60)).toBe('fair');
    expect(strengthOf(80)).toBe('strong');
    expect(strengthOf(128)).toBe('excellent');
  });
});

describe('QR payloads', () => {
  it('adds https:// to bare domains only', () => {
    expect(normalizeUrl(' example.com/page ')).toBe('https://example.com/page');
    expect(normalizeUrl('http://example.com')).toBe('http://example.com');
    expect(normalizeUrl('mailto:hi@example.com')).toBe('mailto:hi@example.com');
    expect(normalizeUrl('')).toBe('');
  });

  it('builds Wi-Fi codes with escaped special characters', () => {
    expect(escapeWifiValue('a;b,c:d\\e"f')).toBe('a\\;b\\,c\\:d\\\\e\\"f');
    expect(wifiPayload({ ssid: 'My Net', password: 'pa;ss', encryption: 'WPA', hidden: false })).toBe('WIFI:T:WPA;S:My Net;P:pa\\;ss;;');
    expect(wifiPayload({ ssid: 'Open', password: 'ignored', encryption: 'nopass', hidden: true })).toBe('WIFI:T:nopass;S:Open;H:true;;');
  });

  it('builds e-mail and phone links', () => {
    expect(emailPayload('hi@example.com', 'Hello there', 'Line 1')).toBe('mailto:hi@example.com?subject=Hello%20there&body=Line%201');
    expect(emailPayload('hi@example.com')).toBe('mailto:hi@example.com');
    expect(phonePayload('+41 (44) 123-45-67')).toBe('tel:+41441234567');
  });
});

describe('EPC payment QR code (GiroCode)', () => {
  it('validates IBANs with the mod-97 check', () => {
    expect(isValidIban('DE89 3704 0044 0532 0130 00')).toBe(true);
    expect(isValidIban('de89370400440532013000')).toBe(true);
    expect(isValidIban('DE89 3704 0044 0532 0130 01')).toBe(false); // one digit changed
    expect(isValidIban('hello')).toBe(false);
    expect(formatIban('de89370400440532013000')).toBe('DE89 3704 0044 0532 0130 00');
  });

  it('understands amounts typed in different styles', () => {
    expect(parseAmount('12.50')).toBe(12.5);
    expect(parseAmount('12,5')).toBe(12.5);
    expect(parseAmount('1.234,56')).toBe(1234.56);
    expect(parseAmount('1,234.56')).toBe(1234.56);
    expect(parseAmount("1'234.50 €")).toBe(1234.5);
    expect(parseAmount('1.000')).toBe(1000);
    expect(parseAmount('  ')).toBeUndefined();
    expect(parseAmount('ten')).toBeNaN();
  });

  it('validates RF creditor references', () => {
    expect(isValidCreditorReference('RF18 5390 0754 7034')).toBe(true);
    expect(isValidCreditorReference('RF19 5390 0754 7034')).toBe(false);
  });

  it('builds the payload exactly as the standard describes', () => {
    const payload = epcPayload({
      name: 'Red Cross',
      iban: 'DE89 3704 0044 0532 0130 00',
      bic: 'COBADEFFXXX',
      amount: 12.5,
      reference: 'Invoice 2026-001',
    });
    expect(payload).toBe(['BCD', '002', '1', 'SCT', 'COBADEFFXXX', 'Red Cross', 'DE89370400440532013000', 'EUR12.50', '', '', 'Invoice 2026-001'].join('\n'));
  });

  it('puts RF references into the structured field and drops trailing empty lines', () => {
    const payload = epcPayload({ name: 'Shop', iban: 'DE89370400440532013000', reference: 'rf18 5390 0754 7034' });
    expect(payload).toBe(['BCD', '002', '1', 'SCT', '', 'Shop', 'DE89370400440532013000', '', '', 'RF18539007547034'].join('\n'));
    expect(epcPayload({ name: 'Shop', iban: 'DE89370400440532013000' }).endsWith('DE89370400440532013000')).toBe(true);
  });

  it('reports which field is wrong', () => {
    const field = (fn: () => unknown) => {
      try {
        fn();
      } catch (e) {
        return e instanceof EpcError ? e.field : e;
      }
      return 'ok';
    };
    const valid = { name: 'Shop', iban: 'DE89370400440532013000' };
    expect(field(() => epcPayload({ ...valid, name: '' }))).toBe('name');
    expect(field(() => epcPayload({ ...valid, iban: 'DE00 1234' }))).toBe('iban');
    expect(field(() => epcPayload({ ...valid, bic: 'nope' }))).toBe('bic');
    expect(field(() => epcPayload({ ...valid, amount: 0 }))).toBe('amount');
    expect(field(() => epcPayload({ ...valid, reference: 'x'.repeat(141) }))).toBe('reference');
  });
});
