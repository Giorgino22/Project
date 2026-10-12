/**
 * Colour helpers for the QR code generator: a QR code needs enough contrast,
 * and dark modules on a light background, or many phones can't scan it.
 */

/** "#1a2b3c" → [26, 43, 60] */
export function hexToRgb(hex: string): [number, number, number] {
  const value = hex.replace('#', '');
  const full = value.length === 3 ? [...value].map((c) => c + c).join('') : value;
  const number = parseInt(full, 16);
  return [(number >> 16) & 255, (number >> 8) & 255, number & 255];
}

/** How bright a colour looks to the human eye, from 0 (black) to 1 (white). WCAG formula. */
export function relativeLuminance(hex: string): number {
  const [r, g, b] = hexToRgb(hex).map((channel) => {
    const c = channel / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  }) as [number, number, number];
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** Contrast between two colours: 1 (none) to 21 (black on white). */
export function contrastRatio(a: string, b: string): number {
  const [light, dark] = [relativeLuminance(a), relativeLuminance(b)].sort((x, y) => y - x) as [number, number];
  return (light + 0.05) / (dark + 0.05);
}

/** True if a QR code with these colours is likely hard to scan. */
export function isRiskyQrColors(foreground: string, background: string): boolean {
  const inverted = relativeLuminance(foreground) > relativeLuminance(background);
  return inverted || contrastRatio(foreground, background) < 3;
}
