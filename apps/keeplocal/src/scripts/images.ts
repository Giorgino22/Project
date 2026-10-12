/**
 * Image helpers for the browser: open an image, draw it on a <canvas> at any size,
 * and save the canvas as JPG, PNG or WebP.
 *
 * The <canvas> is the browser's built-in drawing board. Drawing an image onto it and
 * exporting it again is how we resize, convert and compress – all on the visitor's device.
 */
import { IMAGE_FORMATS, type ImageFormat } from '../lib/formats';

export interface DecodedImage {
  source: CanvasImageSource;
  width: number;
  height: number;
  /** Frees the memory. Call it when you're done with the image. */
  release(): void;
}

/** Thrown when the browser can't write a format (older Safari can't write WebP). */
export class FormatNotSupportedError extends Error {
  constructor(public readonly format: ImageFormat) {
    super(`This browser cannot write ${format}`);
    this.name = 'FormatNotSupportedError';
  }
}

/**
 * Opens an image file. Phone photos are often stored sideways with a "rotate me" flag
 * (EXIF orientation); `imageOrientation: 'from-image'` makes the browser turn them upright.
 */
export async function decodeImage(file: Blob): Promise<DecodedImage> {
  try {
    const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
    return { source: bitmap, width: bitmap.width, height: bitmap.height, release: () => bitmap.close() };
  } catch {
    // Fallback for formats createImageBitmap can't handle in some browsers (e.g. SVG).
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.src = url;
    try {
      await img.decode();
    } catch (error) {
      URL.revokeObjectURL(url);
      throw error;
    }
    return { source: img, width: img.naturalWidth, height: img.naturalHeight, release: () => URL.revokeObjectURL(url) };
  }
}

/** Draws an image onto a new canvas of the given size (optionally on a background colour). */
export function drawToCanvas(image: DecodedImage, width: number, height: number, background?: string): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Canvas is not supported');
  if (background) {
    context.fillStyle = background;
    context.fillRect(0, 0, width, height);
  }
  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = 'high'; // best quality when shrinking or enlarging
  context.drawImage(image.source, 0, 0, width, height);
  return canvas;
}

/** Saves a canvas as an image file. `quality` (0–1) only matters for JPG and WebP. */
export async function encodeCanvas(canvas: HTMLCanvasElement, format: ImageFormat, quality = 0.92): Promise<Blob> {
  const { mime } = IMAGE_FORMATS[format];
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, mime, quality));
  // toBlob gives null when the canvas is too big for the device's memory.
  if (!blob) throw new RangeError('Canvas too large');
  // Browsers that can't write a format silently return PNG instead – we check for that.
  if (blob.type !== mime) throw new FormatNotSupportedError(format);
  return blob;
}

/**
 * Compresses a PNG by reducing it to a palette of `colors` colours (0 = lossless).
 * Uses UPNG, the PNG encoder from Photopea, which comes with our PDF library.
 */
export async function compressPng(canvas: HTMLCanvasElement, colors: number): Promise<Blob> {
  const { default: UPNG } = await import('@cantoo/pdf-lib/upng');
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Canvas is not supported');
  const { data } = context.getImageData(0, 0, canvas.width, canvas.height);
  const png = UPNG.encode([data.buffer as ArrayBuffer], canvas.width, canvas.height, colors);
  return new Blob([png], { type: 'image/png' });
}

/** Which of our formats a file is (by its MIME type); undefined for GIF, BMP, AVIF… */
export function formatOfFile(file: File): ImageFormat | undefined {
  return (Object.keys(IMAGE_FORMATS) as ImageFormat[]).find((format) => IMAGE_FORMATS[format].mime === file.type);
}
