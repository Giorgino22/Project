/**
 * Packs several files into one ZIP archive, in the browser (library: fflate).
 * This file is loaded only when someone clicks "Download all", to keep pages fast.
 */
import { zipSync, type Zippable } from 'fflate';
import { uniqueNames } from '../lib/format';

export async function zipFiles(files: { name: string; blob: Blob }[]): Promise<Blob> {
  const names = uniqueNames(files.map((file) => file.name)); // a ZIP can't contain the same name twice
  const entries: Zippable = {};
  for (const [index, file] of files.entries()) {
    // level 0 = just store: PDFs and images are already compressed, compressing again only costs time.
    entries[names[index]!] = [new Uint8Array(await file.blob.arrayBuffer()), { level: 0 }];
  }
  return new Blob([zipSync(entries) as Uint8Array<ArrayBuffer>], { type: 'application/zip' });
}
