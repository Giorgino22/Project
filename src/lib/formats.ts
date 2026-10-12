/**
 * Facts about the image formats our tools can write.
 * (Descriptions for visitors live in the language files, e.g. src/i18n/en.ts → formats.)
 */

export const IMAGE_FORMATS = {
  jpg: { label: 'JPG', mime: 'image/jpeg', extension: 'jpg', transparency: false, lossy: true },
  png: { label: 'PNG', mime: 'image/png', extension: 'png', transparency: true, lossy: false },
  webp: { label: 'WebP', mime: 'image/webp', extension: 'webp', transparency: true, lossy: true },
} as const;

export type ImageFormat = keyof typeof IMAGE_FORMATS;

export function isImageFormat(value: string): value is ImageFormat {
  return value in IMAGE_FORMATS;
}

/** "image/jpeg" → "jpg"; unknown types → undefined */
export function formatFromMime(mime: string): ImageFormat | undefined {
  for (const [format, info] of Object.entries(IMAGE_FORMATS)) {
    if (info.mime === mime) return format as ImageFormat;
  }
  return undefined;
}
