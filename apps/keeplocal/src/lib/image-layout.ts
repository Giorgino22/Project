/**
 * Geometry helpers for image tools: how big should the result be, and where
 * does an image go on a PDF page? Pure math, no DOM – so it is easy to test.
 */

// ---------------------------------------------------------------------------
// Resizing images
// ---------------------------------------------------------------------------

export type ResizeOptions =
  | { mode: 'percent'; percent: number }
  | {
      mode: 'pixels';
      /** Wanted width in pixels (undefined = not set) */
      width?: number;
      /** Wanted height in pixels (undefined = not set) */
      height?: number;
      /** true: scale proportionally to fit inside width × height. false: stretch to exactly width × height. */
      keepAspect: boolean;
    };

/** Works out the new size of an image. The result is always at least 1 × 1 pixel. */
export function computeResize(
  width: number,
  height: number,
  options: ResizeOptions,
): { width: number; height: number } {
  const atLeastOne = (value: number) => Math.max(1, Math.round(value));

  if (options.mode === 'percent') {
    const factor = options.percent / 100;
    return { width: atLeastOne(width * factor), height: atLeastOne(height * factor) };
  }

  const { width: wantedW, height: wantedH, keepAspect } = options;
  if (!wantedW && !wantedH) return { width, height }; // nothing entered → keep size

  if (!keepAspect) {
    return { width: atLeastOne(wantedW ?? width), height: atLeastOne(wantedH ?? height) };
  }

  // Keep the aspect ratio: use the smaller scale factor so the image fits in the box.
  const scaleW = wantedW ? wantedW / width : Infinity;
  const scaleH = wantedH ? wantedH / height : Infinity;
  const scale = Math.min(scaleW, scaleH);
  return { width: atLeastOne(width * scale), height: atLeastOne(height * scale) };
}

/**
 * Browsers refuse to create gigantic canvases (iPhones stop at about 16.7 million pixels).
 * This lowers a zoom factor just enough that width × height stays within those limits.
 */
export function limitScale(
  width: number,
  height: number,
  scale: number,
  maxPixels = 16_777_216,
  maxSide = 16_384,
): number {
  const byArea = Math.sqrt(maxPixels / (width * height));
  const bySide = maxSide / Math.max(width, height);
  return Math.min(scale, byArea, bySide);
}

// ---------------------------------------------------------------------------
// Placing images on PDF pages
// ---------------------------------------------------------------------------

/** PDF sizes are measured in "points": 72 points = 1 inch = 2.54 cm. */
export const PAGE_SIZES = {
  a4: { width: 595.28, height: 841.89 },
  letter: { width: 612, height: 792 },
} as const;

/** PDF viewers refuse pages bigger than 14,400 points (200 inches). */
export const MAX_PAGE_SIDE = 14_400;

export type PageSizeName = keyof typeof PAGE_SIZES | 'fit';
export type Orientation = 'auto' | 'portrait' | 'landscape';

export interface PageLayoutOptions {
  /** 'fit' makes the page exactly as big as the image */
  pageSize: PageSizeName;
  orientation: Orientation;
  /** Empty space around the image, in points */
  margin: number;
}

export interface PageLayout {
  pageWidth: number;
  pageHeight: number;
  /** Position and size of the image on the page. (0,0) is the bottom-left corner in PDFs. */
  x: number;
  y: number;
  width: number;
  height: number;
}

export function layoutImageOnPage(
  imageWidth: number,
  imageHeight: number,
  { pageSize, orientation, margin }: PageLayoutOptions,
): PageLayout {
  let pageWidth: number;
  let pageHeight: number;

  if (pageSize === 'fit') {
    // One image pixel = one point. Huge images are scaled down to the PDF maximum.
    const shrink = Math.min(1, (MAX_PAGE_SIDE - 2 * margin) / Math.max(imageWidth, imageHeight));
    pageWidth = imageWidth * shrink + 2 * margin;
    pageHeight = imageHeight * shrink + 2 * margin;
  } else {
    const size = PAGE_SIZES[pageSize];
    const landscape =
      orientation === 'landscape' || (orientation === 'auto' && imageWidth > imageHeight);
    pageWidth = landscape ? size.height : size.width;
    pageHeight = landscape ? size.width : size.height;
  }

  // Fit the image into the area inside the margins, keeping its proportions.
  const areaWidth = pageWidth - 2 * margin;
  const areaHeight = pageHeight - 2 * margin;
  const scale = Math.min(areaWidth / imageWidth, areaHeight / imageHeight);
  const width = imageWidth * scale;
  const height = imageHeight * scale;

  return {
    pageWidth,
    pageHeight,
    width,
    height,
    // Center the image on the page.
    x: (pageWidth - width) / 2,
    y: (pageHeight - height) / 2,
  };
}
