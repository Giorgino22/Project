/**
 * THE LIST OF ALL TOOLS.
 *
 * Every entry becomes a page in every language. To add a tool:
 *   1. add an entry here,
 *   2. add its texts to every language file in src/i18n/ (TypeScript will remind you),
 *   3. create its UI component in src/components/tools/ and register it in
 *      src/components/tools/index.ts.
 * See docs/ADDING-TOOLS.md for a step-by-step guide.
 */
import type { IconName } from '@tools/shared/icons/icons';
import type { ImageFormat } from '../lib/formats';

export type Category = 'pdf' | 'image' | 'generator';

/** Names of the UI components in src/components/tools/ */
export type ComponentName =
  | 'MergePdf'
  | 'SplitPdf'
  | 'RotatePdf'
  | 'DeletePdfPages'
  | 'ImagesToPdf'
  | 'PdfToImages'
  | 'CompressImage'
  | 'ResizeImage'
  | 'ConvertImage'
  | 'RemoveExif'
  | 'ImageToText'
  | 'QrCode'
  | 'EpcQrCode'
  | 'PasswordGenerator';

export interface ToolDefinition {
  /** Stable internal name. Never change it once the site is live (texts and settings use it). */
  id: string;
  category: Category;
  component: ComponentName;
  icon: IconName;
  /**
   * Only for converter pages like "PNG to JPG": they share the ConvertImage component and
   * get their texts from a template (see `converter` in the language files).
   */
  convert?: { from: ImageFormat; to: ImageFormat };
}

export const tools = [
  // PDF tools
  { id: 'merge-pdf', category: 'pdf', component: 'MergePdf', icon: 'file-stack' },
  { id: 'split-pdf', category: 'pdf', component: 'SplitPdf', icon: 'scissors' },
  { id: 'rotate-pdf', category: 'pdf', component: 'RotatePdf', icon: 'rotate-cw' },
  { id: 'delete-pdf-pages', category: 'pdf', component: 'DeletePdfPages', icon: 'file-minus' },
  { id: 'jpg-to-pdf', category: 'pdf', component: 'ImagesToPdf', icon: 'file-image' },
  { id: 'pdf-to-jpg', category: 'pdf', component: 'PdfToImages', icon: 'image-down' },

  // Image tools
  { id: 'compress-image', category: 'image', component: 'CompressImage', icon: 'shrink' },
  { id: 'resize-image', category: 'image', component: 'ResizeImage', icon: 'scaling' },
  { id: 'image-converter', category: 'image', component: 'ConvertImage', icon: 'repeat' },
  { id: 'remove-exif', category: 'image', component: 'RemoveExif', icon: 'map-pin-off' },
  { id: 'image-to-text', category: 'image', component: 'ImageToText', icon: 'scan-text' },

  // Converter pages: one page per popular search ("png to jpg", "webp to png", …)
  { id: 'png-to-jpg', category: 'image', component: 'ConvertImage', icon: 'repeat', convert: { from: 'png', to: 'jpg' } },
  { id: 'jpg-to-png', category: 'image', component: 'ConvertImage', icon: 'repeat', convert: { from: 'jpg', to: 'png' } },
  { id: 'webp-to-jpg', category: 'image', component: 'ConvertImage', icon: 'repeat', convert: { from: 'webp', to: 'jpg' } },
  { id: 'webp-to-png', category: 'image', component: 'ConvertImage', icon: 'repeat', convert: { from: 'webp', to: 'png' } },
  { id: 'png-to-webp', category: 'image', component: 'ConvertImage', icon: 'repeat', convert: { from: 'png', to: 'webp' } },
  { id: 'jpg-to-webp', category: 'image', component: 'ConvertImage', icon: 'repeat', convert: { from: 'jpg', to: 'webp' } },

  // Generators
  { id: 'qr-code-generator', category: 'generator', component: 'QrCode', icon: 'qr-code' },
  { id: 'epc-qr-code', category: 'generator', component: 'EpcQrCode', icon: 'banknote' },
  { id: 'password-generator', category: 'generator', component: 'PasswordGenerator', icon: 'key-round' },
] as const satisfies readonly ToolDefinition[];

/** Union of all tool ids: 'merge-pdf' | 'split-pdf' | … (TypeScript builds it from the list above) */
export type ToolId = (typeof tools)[number]['id'];

/** Tools that have their own hand-written texts (all except the converter pages). */
export type MainToolId = Exclude<(typeof tools)[number], { convert: object }>['id'];

export const categories: Category[] = ['pdf', 'image', 'generator'];

export function getTool(id: ToolId): ToolDefinition {
  const tool = tools.find((t) => t.id === id);
  if (!tool) throw new Error(`Unknown tool: ${id}`);
  return tool;
}

export function isConverterPage(tool: ToolDefinition): tool is ToolDefinition & { convert: { from: ImageFormat; to: ImageFormat } } {
  return tool.convert !== undefined;
}
