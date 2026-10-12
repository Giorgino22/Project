/**
 * Understands page selections the way people type them: "1-3, 5, 8-".
 *
 * Users count pages from 1. PDF libraries count from 0. To avoid confusion,
 * `PageRange` keeps the human numbers (1-based) and only `rangesToIndices`
 * converts them to 0-based indices for the PDF library.
 */

export interface PageRange {
  /** First page, counting from 1 */
  start: number;
  /** Last page (inclusive), counting from 1 */
  end: number;
}

export type PageRangeErrorCode = 'empty' | 'invalid' | 'out-of-range';

/** Thrown when the user typed something we can't use. `token` is the bad part. */
export class PageRangeError extends Error {
  constructor(
    public readonly code: PageRangeErrorCode,
    public readonly token = '',
    /** Number of pages of the document, so the message can say "it has 12 pages" */
    public readonly pageCount = 0,
  ) {
    super(`${code}: ${token}`);
    this.name = 'PageRangeError';
  }
}

/**
 * Parses text like "1-3, 5, 8-" into ranges.
 *
 * Supported forms:  "5" (one page) · "1-3" (a range) · "8-" (8 to the end) · "-3" (start to 3)
 * Separators: commas, semicolons or spaces. "–" and "—" count as dashes, because some
 * keyboards and phones insert them automatically.
 */
export function parsePageRanges(input: string, pageCount: number): PageRange[] {
  const normalized = input
    .replace(/[–—]/g, '-') // en dash / em dash → normal dash
    .replace(/\s*-\s*/g, '-') // "1 - 3" → "1-3"
    .trim();

  if (normalized === '') throw new PageRangeError('empty');

  const tokens = normalized.split(/[\s,;]+/).filter(Boolean);
  return tokens.map((token) => {
    // ^(\d*)-(\d*)$ matches "1-3", "8-" and "-3"; ^\d+$ matches a single page.
    const rangeMatch = /^(\d*)-(\d*)$/.exec(token);
    let start: number;
    let end: number;

    if (rangeMatch) {
      const [, from, to] = rangeMatch;
      if (from === '' && to === '') throw new PageRangeError('invalid', token);
      start = from === '' ? 1 : Number(from);
      end = to === '' ? pageCount : Number(to);
    } else if (/^\d+$/.test(token)) {
      start = end = Number(token);
    } else {
      throw new PageRangeError('invalid', token);
    }

    if (start > end) throw new PageRangeError('invalid', token);
    if (start < 1 || end > pageCount) throw new PageRangeError('out-of-range', token, pageCount);
    return { start, end };
  });
}

/**
 * Converts ranges into 0-based page indices, in the order the user typed them.
 * Pages that appear twice are only kept once: "1-3, 2" → [0, 1, 2]
 */
export function rangesToIndices(ranges: PageRange[]): number[] {
  const seen = new Set<number>();
  const indices: number[] = [];
  for (const { start, end } of ranges) {
    for (let page = start; page <= end; page++) {
      if (!seen.has(page)) {
        seen.add(page);
        indices.push(page - 1);
      }
    }
  }
  return indices;
}

/** Shortcut: text → unique 0-based indices. */
export function parsePageSelection(input: string, pageCount: number): number[] {
  return rangesToIndices(parsePageRanges(input, pageCount));
}

/** { start: 1, end: 3 } → "1-3",  { start: 5, end: 5 } → "5" */
export function formatRange({ start, end }: PageRange): string {
  return start === end ? String(start) : `${start}-${end}`;
}
