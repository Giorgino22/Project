import { describe, expect, it } from 'vitest';
import { contrastRatio, isRiskyQrColors } from '../../src/lib/color';
import { baseName, extensionOf, fill, formatBytes, matchesAccept, outputName, padNumber, percentSaved, uniqueNames } from '../../src/lib/format';
import { computeResize, layoutImageOnPage, limitScale, MAX_PAGE_SIDE } from '../../src/lib/image-layout';
import { formatRange, PageRangeError, parsePageRanges, parsePageSelection } from '../../src/lib/page-ranges';

describe('format helpers', () => {
  it('fills placeholders and leaves unknown ones visible', () => {
    expect(fill('Hello {name}, {count} files', { name: 'Ana', count: 3 })).toBe('Hello Ana, 3 files');
    expect(fill('Hi {missing}', {})).toBe('Hi {missing}');
  });

  it('formats bytes per language', () => {
    expect(formatBytes(500)).toBe('500 B');
    expect(formatBytes(1536)).toBe('1.5 KB');
    expect(formatBytes(1536, 'de')).toBe('1,5 KB');
    expect(formatBytes(5 * 1024 * 1024)).toBe('5 MB');
  });

  it('handles file names', () => {
    expect(baseName('holiday.photo.JPG')).toBe('holiday.photo');
    expect(baseName('.hidden')).toBe('.hidden');
    expect(extensionOf('scan.PNG')).toBe('png');
    expect(outputName('scan.png', 'jpg', '-small')).toBe('scan-small.jpg');
    expect(uniqueNames(['a.jpg', 'A.jpg', 'b.jpg', 'a.jpg'])).toEqual(['a.jpg', 'A (2).jpg', 'b.jpg', 'a (3).jpg']);
    expect(padNumber(7, 12)).toBe('07');
  });

  it('checks dropped files against the accept list', () => {
    const pdf = { name: 'Report.PDF', type: '' };
    expect(matchesAccept(pdf, 'application/pdf,.pdf')).toBe(true);
    expect(matchesAccept({ name: 'a.png', type: 'image/png' }, 'image/*')).toBe(true);
    expect(matchesAccept({ name: 'a.txt', type: 'text/plain' }, 'image/*')).toBe(false);
    expect(matchesAccept({ name: 'a.txt', type: 'text/plain' }, '')).toBe(true);
  });

  it('computes savings', () => {
    expect(percentSaved(1000, 250)).toBe(75);
    expect(percentSaved(1000, 1200)).toBe(-20);
    expect(percentSaved(0, 10)).toBe(0);
  });
});

describe('page ranges', () => {
  it('understands the usual ways of typing pages', () => {
    expect(parsePageRanges('1-3, 5, 8-', 10)).toEqual([
      { start: 1, end: 3 },
      { start: 5, end: 5 },
      { start: 8, end: 10 },
    ]);
    expect(parsePageRanges('-2; 4 – 5', 6)).toEqual([
      { start: 1, end: 2 },
      { start: 4, end: 5 },
    ]);
    expect(parsePageRanges('1 3', 3)).toEqual([
      { start: 1, end: 1 },
      { start: 3, end: 3 },
    ]);
  });

  it('turns ranges into unique 0-based indices in typed order', () => {
    expect(parsePageSelection('3, 1-2, 2', 5)).toEqual([2, 0, 1]);
  });

  it('reports helpful errors', () => {
    const error = (input: string) => {
      try {
        parsePageRanges(input, 5);
      } catch (e) {
        return e instanceof PageRangeError ? [e.code, e.token] : e;
      }
      return 'no error';
    };
    expect(error('   ')).toEqual(['empty', '']);
    expect(error('1, abc')).toEqual(['invalid', 'abc']);
    expect(error('4-2')).toEqual(['invalid', '4-2']);
    expect(error('-')).toEqual(['invalid', '-']);
    expect(error('2-9')).toEqual(['out-of-range', '2-9']);
    expect(error('0')).toEqual(['out-of-range', '0']);
  });

  it('formats ranges', () => {
    expect(formatRange({ start: 1, end: 3 })).toBe('1-3');
    expect(formatRange({ start: 4, end: 4 })).toBe('4');
  });
});

describe('computeResize', () => {
  it('scales by percent', () => {
    expect(computeResize(400, 300, { mode: 'percent', percent: 50 })).toEqual({ width: 200, height: 150 });
  });

  it('keeps the aspect ratio inside the given box', () => {
    expect(computeResize(400, 300, { mode: 'pixels', width: 200, keepAspect: true })).toEqual({ width: 200, height: 150 });
    expect(computeResize(400, 300, { mode: 'pixels', height: 600, keepAspect: true })).toEqual({ width: 800, height: 600 });
    expect(computeResize(400, 300, { mode: 'pixels', width: 100, height: 100, keepAspect: true })).toEqual({ width: 100, height: 75 });
  });

  it('stretches when the aspect ratio is not kept', () => {
    expect(computeResize(400, 300, { mode: 'pixels', width: 100, height: 100, keepAspect: false })).toEqual({ width: 100, height: 100 });
    expect(computeResize(400, 300, { mode: 'pixels', width: 100, keepAspect: false })).toEqual({ width: 100, height: 300 });
  });

  it('never returns 0 pixels and keeps the size when nothing is entered', () => {
    expect(computeResize(10, 10, { mode: 'percent', percent: 1 })).toEqual({ width: 1, height: 1 });
    expect(computeResize(400, 300, { mode: 'pixels', keepAspect: true })).toEqual({ width: 400, height: 300 });
  });
});

describe('limitScale', () => {
  it('keeps small pages at the wanted zoom and shrinks huge ones', () => {
    expect(limitScale(595, 842, 2)).toBe(2);
    const scale = limitScale(3370, 4768, 300 / 72); // A0 poster at 300 DPI
    expect(3370 * scale * 4768 * scale).toBeLessThanOrEqual(16_777_216 + 1);
  });
});

describe('QR colours', () => {
  it('measures contrast and warns about risky combinations', () => {
    expect(contrastRatio('#000000', '#ffffff')).toBeCloseTo(21);
    expect(isRiskyQrColors('#000000', '#ffffff')).toBe(false);
    expect(isRiskyQrColors('#ffffff', '#000000')).toBe(true); // inverted
    expect(isRiskyQrColors('#999999', '#aaaaaa')).toBe(true); // too little contrast
  });
});

describe('layoutImageOnPage', () => {
  it('centres an image on an A4 page and picks landscape automatically for wide images', () => {
    const layout = layoutImageOnPage(2000, 1000, { pageSize: 'a4', orientation: 'auto', margin: 0 });
    expect(layout.pageWidth).toBeCloseTo(841.89);
    expect(layout.pageHeight).toBeCloseTo(595.28);
    expect(layout.width).toBeCloseTo(841.89);
    expect(layout.y).toBeCloseTo((595.28 - 420.945) / 2);
  });

  it('respects margins', () => {
    const layout = layoutImageOnPage(100, 100, { pageSize: 'letter', orientation: 'portrait', margin: 36 });
    expect(layout.width).toBe(612 - 72);
    expect(layout.x).toBe(36);
  });

  it('makes the page as big as the image in "fit" mode, within PDF limits', () => {
    expect(layoutImageOnPage(800, 600, { pageSize: 'fit', orientation: 'auto', margin: 0 })).toMatchObject({
      pageWidth: 800,
      pageHeight: 600,
    });
    const huge = layoutImageOnPage(30_000, 1000, { pageSize: 'fit', orientation: 'auto', margin: 0 });
    expect(huge.pageWidth).toBeLessThanOrEqual(MAX_PAGE_SIDE);
  });
});
