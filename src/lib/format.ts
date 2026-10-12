/**
 * Small text helpers used all over the site.
 * They are "pure" functions: same input → same output, no DOM, no side effects.
 * That makes them easy to unit-test (see tests/unit/format.test.ts).
 */

/**
 * Replaces {placeholders} in a text.
 * fill('Hello {name}!', { name: 'Ana' }) → 'Hello Ana!'
 * Unknown placeholders are left as they are, so mistakes are easy to spot.
 */
export function fill(text: string, values: Record<string, string | number>): string {
  return text.replace(/\{(\w+)\}/g, (match, key: string) =>
    key in values ? String(values[key]) : match,
  );
}

/**
 * Turns a number of bytes into something humans can read.
 * formatBytes(1536) → "1.5 KB", formatBytes(1536, 'de') → "1,5 KB"
 */
export function formatBytes(bytes: number, lang = 'en'): string {
  const units = ['B', 'KB', 'MB', 'GB'];
  let value = bytes;
  let unit = 0;
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024;
    unit++;
  }
  // Show one decimal for small numbers ("1.5 MB"), none for big ones ("312 KB").
  const decimals = unit === 0 || value >= 10 ? 0 : 1;
  const number = new Intl.NumberFormat(lang, { maximumFractionDigits: decimals }).format(value);
  return `${number} ${units[unit]}`;
}

/** "holiday.photo.JPG" → "holiday.photo"  (a name without a dot stays as it is) */
export function baseName(fileName: string): string {
  const dot = fileName.lastIndexOf('.');
  return dot > 0 ? fileName.slice(0, dot) : fileName;
}

/** "scan.PNG" → "png"  ("" if there is no extension) */
export function extensionOf(fileName: string): string {
  const dot = fileName.lastIndexOf('.');
  return dot > 0 ? fileName.slice(dot + 1).toLowerCase() : '';
}

/**
 * Builds the name of a file we create.
 * outputName('scan.png', 'jpg', '-small') → 'scan-small.jpg'
 */
export function outputName(fileName: string, extension: string, suffix = ''): string {
  return `${baseName(fileName)}${suffix}.${extension}`;
}

/**
 * Makes file names unique, which a ZIP archive needs.
 * ['a.jpg', 'a.jpg', 'b.jpg'] → ['a.jpg', 'a (2).jpg', 'b.jpg']
 */
export function uniqueNames(names: string[]): string[] {
  const used = new Set<string>();
  return names.map((name) => {
    let candidate = name;
    let counter = 2;
    while (used.has(candidate.toLowerCase())) {
      const ext = extensionOf(name);
      candidate = ext ? `${baseName(name)} (${counter}).${ext}` : `${name} (${counter})`;
      counter++;
    }
    used.add(candidate.toLowerCase());
    return candidate;
  });
}

/** How many percent smaller "after" is compared to "before" (negative = it got bigger). */
export function percentSaved(before: number, after: number): number {
  if (before <= 0) return 0;
  return Math.round((1 - after / before) * 100);
}

/**
 * Checks a file against an "accept" list like the one of <input type="file">:
 * "application/pdf,.pdf" or "image/*". (Browsers only enforce it in the file dialog,
 * not for drag & drop – so we check dropped files ourselves.)
 */
export function matchesAccept(file: { name: string; type: string }, accept: string): boolean {
  if (accept.trim() === '') return true;
  const name = file.name.toLowerCase();
  return accept
    .split(',')
    .map((rule) => rule.trim().toLowerCase())
    .some((rule) => {
      if (rule.startsWith('.')) return name.endsWith(rule);
      if (rule.endsWith('/*')) return file.type.startsWith(rule.slice(0, -1));
      return file.type === rule;
    });
}

/** 7 → "07" when there are 10–99 pages, so files sort nicely: page-07.pdf, page-10.pdf */
export function padNumber(value: number, total: number): string {
  return String(value).padStart(String(total).length, '0');
}
