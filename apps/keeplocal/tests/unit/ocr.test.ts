import { describe, expect, it } from 'vitest';
import { cleanText, combineTexts, ocrScale } from '../../src/lib/ocr';

describe('ocrScale', () => {
  it('enlarges small screenshots, keeps normal images and shrinks huge photos', () => {
    expect(ocrScale(600, 300)).toBe(2);
    expect(ocrScale(1600, 900)).toBe(1);
    expect(ocrScale(8000, 6000)).toBe(0.5);
  });
});

describe('cleanText', () => {
  it('removes spaces at line ends and extra empty lines', () => {
    expect(cleanText('  Hello   \nWorld \n\n\n\nBye\n\n')).toBe('Hello\nWorld\n\nBye');
  });

  it('keeps an empty result empty', () => {
    expect(cleanText(' \n \n')).toBe('');
  });
});

describe('combineTexts', () => {
  it('returns the text of a single image as it is', () => {
    expect(combineTexts([{ name: 'a.png', text: 'Hello' }])).toBe('Hello');
  });

  it('puts the file name above each text', () => {
    expect(combineTexts([{ name: 'a.png', text: 'One' }, { name: 'b.jpg', text: 'Two' }])).toBe('--- a.png ---\nOne\n\n--- b.jpg ---\nTwo');
  });
});
