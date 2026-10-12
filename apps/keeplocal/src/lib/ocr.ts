/**
 * Helpers for the "Image to text" tool – plain functions without page code, so they can be
 * unit-tested (tests/unit/ocr.test.ts). The tool itself: src/components/tools/ImageToText.astro
 */

/** Recognition languages, named like tesseract.js names them. */
export type OcrLanguage = 'eng' | 'deu' | 'eng+deu';

/**
 * How much to scale an image before the recognition. It works best when letters are about
 * 20–40 pixels tall: small screenshots are enlarged, huge photos are shrunk (faster, less memory).
 */
export function ocrScale(width: number, height: number): number {
  const longest = Math.max(width, height);
  if (longest > 4000) return 4000 / longest;
  if (longest < 1000) return 2;
  return 1;
}

/** Tidies recognised text: no spaces at the end of lines, at most one empty line in a row. */
export function cleanText(text: string): string {
  return text
    .split('\n')
    .map((line) => line.trimEnd())
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/** Puts the texts of several images together, each under its file name. One image = just its text. */
export function combineTexts(parts: { name: string; text: string }[]): string {
  if (parts.length === 1) return parts[0]!.text;
  return parts.map((part) => `--- ${part.name} ---\n${part.text}`).join('\n\n');
}
