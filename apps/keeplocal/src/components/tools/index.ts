/**
 * Connects the component names used in src/tools/registry.ts with the actual components.
 * When you build a new tool component, import it here and add it to the list.
 */
import type { ComponentName } from '../../tools/registry';
import CompressImage from './CompressImage.astro';
import ConvertImage from './ConvertImage.astro';
import DeletePdfPages from './DeletePdfPages.astro';
import EpcQrCode from './EpcQrCode.astro';
import ImagesToPdf from './ImagesToPdf.astro';
import MergePdf from './MergePdf.astro';
import PasswordGenerator from './PasswordGenerator.astro';
import PdfToImages from './PdfToImages.astro';
import QrCode from './QrCode.astro';
import RemoveExif from './RemoveExif.astro';
import ResizeImage from './ResizeImage.astro';
import RotatePdf from './RotatePdf.astro';
import SplitPdf from './SplitPdf.astro';

export const toolComponents = {
  MergePdf,
  SplitPdf,
  RotatePdf,
  DeletePdfPages,
  ImagesToPdf,
  PdfToImages,
  CompressImage,
  ResizeImage,
  ConvertImage,
  RemoveExif,
  QrCode,
  EpcQrCode,
  PasswordGenerator,
} satisfies Record<ComponentName, unknown>;
