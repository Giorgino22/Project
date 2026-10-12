/**
 * Removes hidden metadata (GPS location, camera, date, comments…) from photos
 * WITHOUT re-compressing them. The pixel data is copied byte-for-byte, so the
 * quality stays 100% identical – we only leave out the metadata blocks.
 *
 * Image files are built from blocks:
 *   JPEG → "segments"  (marker 0xFF + type, then a length, then data)
 *   PNG  → "chunks"    (length, 4-letter type, data, checksum)
 *   WebP → "chunks"    (4-letter type, length, data)
 * Each block says how long it is, so we can hop from block to block and copy
 * only the ones we want to keep.
 *
 * Working with bytes: a Uint8Array is a list of numbers from 0 to 255 (one per byte).
 * Numbers bigger than 255 are stored in several bytes – "big-endian" means the
 * most significant byte comes first (PNG, JPEG), "little-endian" the other way round (WebP).
 */

export type ImageKind = 'jpg' | 'png' | 'webp' | 'gif' | 'bmp' | 'avif' | 'unknown';

/** What kind of metadata we removed. The page translates these into readable labels. */
export type MetadataKind = 'exif' | 'xmp' | 'iptc' | 'comment' | 'text' | 'time' | 'other';

export interface StripResult {
  bytes: Uint8Array;
  removed: MetadataKind[];
}

export class UnsupportedImageError extends Error {
  constructor(public readonly kind: ImageKind) {
    super(`Unsupported image type: ${kind}`);
    this.name = 'UnsupportedImageError';
  }
}

// ---------------------------------------------------------------------------
// Small byte helpers
// ---------------------------------------------------------------------------

/** Reads `length` bytes as text, e.g. the "PNG" or "RIFF" signatures. */
function ascii(bytes: Uint8Array, start: number, length: number): string {
  return String.fromCharCode(...bytes.subarray(start, start + length));
}

const readUint16BE = (b: Uint8Array, i: number) => (b[i]! << 8) | b[i + 1]!;
const readUint32BE = (b: Uint8Array, i: number) =>
  ((b[i]! << 24) >>> 0) + (b[i + 1]! << 16) + (b[i + 2]! << 8) + b[i + 3]!;
const readUint32LE = (b: Uint8Array, i: number) =>
  b[i]! + (b[i + 1]! << 8) + (b[i + 2]! << 16) + ((b[i + 3]! << 24) >>> 0);

function writeUint32LE(b: Uint8Array, i: number, value: number): void {
  b[i] = value & 0xff;
  b[i + 1] = (value >>> 8) & 0xff;
  b[i + 2] = (value >>> 16) & 0xff;
  b[i + 3] = (value >>> 24) & 0xff;
}

/** Glues several byte arrays together into one. */
function concat(parts: Uint8Array[]): Uint8Array {
  const total = parts.reduce((sum, part) => sum + part.length, 0);
  const result = new Uint8Array(total);
  let offset = 0;
  for (const part of parts) {
    result.set(part, offset);
    offset += part.length;
  }
  return result;
}

function addOnce(list: MetadataKind[], kind: MetadataKind): void {
  if (!list.includes(kind)) list.push(kind);
}

/** Recognises an image by its first bytes ("magic numbers") – file names can lie. */
export function detectImageKind(bytes: Uint8Array): ImageKind {
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return 'jpg';
  if (ascii(bytes, 0, 8) === '\x89PNG\r\n\x1a\n') return 'png';
  if (ascii(bytes, 0, 4) === 'RIFF' && ascii(bytes, 8, 4) === 'WEBP') return 'webp';
  if (ascii(bytes, 0, 4) === 'GIF8') return 'gif';
  if (ascii(bytes, 0, 2) === 'BM') return 'bmp';
  if (ascii(bytes, 4, 4) === 'ftyp' && /^avi[fs]$/.test(ascii(bytes, 8, 4))) return 'avif';
  return 'unknown';
}

/** Removes metadata from a JPEG, PNG or WebP file. */
export function stripMetadata(bytes: Uint8Array): StripResult {
  const kind = detectImageKind(bytes);
  if (kind === 'jpg') return stripJpegMetadata(bytes);
  if (kind === 'png') return stripPngMetadata(bytes);
  if (kind === 'webp') return stripWebpMetadata(bytes);
  throw new UnsupportedImageError(kind);
}

// ---------------------------------------------------------------------------
// JPEG
// ---------------------------------------------------------------------------
//
// Marker types we care about (the byte after 0xFF):
//   D8 = start of image    D9 = end of image     DA = start of scan (pixel data follows)
//   E0 = APP0 "JFIF" (keep)                      E1 = APP1: EXIF or XMP (remove)
//   E2 = APP2: colour profile "ICC_PROFILE" (keep) or "MPF" multi-picture index (remove)
//   EE = APP14 "Adobe": needed for correct colours in CMYK files (keep)
//   other E3–EF = vendor data (remove)    ED = APP13 Photoshop/IPTC (remove)    FE = comment (remove)

/** Does this JPEG segment hold metadata? If so, which kind? (null = keep it) */
function jpegSegmentKind(marker: number, payload: Uint8Array): MetadataKind | null {
  if (marker === 0xe1) return ascii(payload, 0, 4) === 'Exif' ? 'exif' : 'xmp';
  if (marker === 0xed) return 'iptc';
  if (marker === 0xfe) return 'comment';
  if (marker === 0xe0 || marker === 0xee) return null; // JFIF, Adobe
  if (marker === 0xe2) return ascii(payload, 0, 11) === 'ICC_PROFILE' ? null : 'other';
  if (marker >= 0xe3 && marker <= 0xef) return 'other';
  return null; // everything else describes the image itself (tables, size, …)
}

/**
 * Reads the EXIF "Orientation" value (1–8). Phones store photos sideways and set this
 * flag so viewers rotate them upright. If we removed it, the photo would appear rotated,
 * so we put a tiny EXIF block back that contains nothing but the orientation.
 */
export function readJpegOrientation(bytes: Uint8Array): number {
  let pos = 2;
  while (pos + 4 < bytes.length && bytes[pos] === 0xff) {
    const marker = bytes[pos + 1]!;
    if (marker === 0xff) {
      pos++; // padding byte between segments
      continue;
    }
    if (marker === 0xda || marker === 0xd9) break; // pixel data starts, no more metadata
    const length = readUint16BE(bytes, pos + 2);
    if (marker === 0xe1 && ascii(bytes, pos + 4, 6) === 'Exif\0\0') {
      // The EXIF data is a small TIFF file: byte order ("II" = little-endian, "MM" = big-endian),
      // the number 42, the position of the first list of tags (IFD0), then the tags (12 bytes each).
      const tiff = pos + 10;
      const little = ascii(bytes, tiff, 2) === 'II';
      const u16 = (i: number) => (little ? bytes[i]! | (bytes[i + 1]! << 8) : readUint16BE(bytes, i));
      const u32 = (i: number) => (little ? readUint32LE(bytes, i) : readUint32BE(bytes, i));
      const ifd = tiff + u32(tiff + 4);
      const count = ifd + 2 <= bytes.length ? u16(ifd) : 0;
      for (let i = 0; i < count; i++) {
        const entry = ifd + 2 + i * 12;
        if (entry + 12 > bytes.length) break;
        if (u16(entry) === 0x0112) return u16(entry + 8); // tag 0x0112 = Orientation
      }
    }
    pos += 2 + length;
  }
  return 1; // 1 = "normal", nothing to rotate
}

/** Builds a minimal EXIF segment containing only the orientation tag (36 bytes). */
function orientationOnlyExif(orientation: number): Uint8Array {
  return new Uint8Array([
    0xff, 0xe1, 0x00, 0x22, // APP1 marker, length 34
    0x45, 0x78, 0x69, 0x66, 0x00, 0x00, // "Exif\0\0"
    0x4d, 0x4d, 0x00, 0x2a, // "MM" = big-endian, 42
    0x00, 0x00, 0x00, 0x08, // first tag list starts at byte 8
    0x00, 0x01, // one tag:
    0x01, 0x12, 0x00, 0x03, // Orientation, type SHORT
    0x00, 0x00, 0x00, 0x01, // one value
    0x00, orientation, 0x00, 0x00, // the value
    0x00, 0x00, 0x00, 0x00, // no further tag lists
  ]);
}

/**
 * Finds the end of the pixel data, starting at the first "start of scan" marker.
 * Inside pixel data a real 0xFF byte is written as FF 00, and FF D0–D7 are "restart"
 * markers. Any other FF xx is a new segment (progressive JPEGs have several scans),
 * which we skip using its length. FF D9 is the end of the image.
 */
function findJpegEnd(bytes: Uint8Array, scanStart: number): number {
  let pos = scanStart + 2 + readUint16BE(bytes, scanStart + 2); // skip the scan header
  while (pos < bytes.length - 1) {
    if (bytes[pos] !== 0xff) {
      pos++;
      continue;
    }
    const next = bytes[pos + 1]!;
    if (next === 0x00 || next === 0xff || (next >= 0xd0 && next <= 0xd7)) {
      pos += next === 0xff ? 1 : 2; // stuffed byte, fill byte or restart marker → still pixel data
    } else if (next === 0xd9) {
      return pos + 2; // end of image
    } else {
      pos += 2 + readUint16BE(bytes, pos + 2); // another segment (e.g. next scan) → hop over it
    }
  }
  return bytes.length; // no end marker (truncated file) → keep everything
}

export function stripJpegMetadata(input: Uint8Array): StripResult {
  const removed: MetadataKind[] = [];
  const orientation = readJpegOrientation(input);
  const parts: Uint8Array[] = [input.subarray(0, 2)]; // FF D8 = start of image
  if (orientation > 1 && orientation <= 8) parts.push(orientationOnlyExif(orientation));

  let pos = 2;
  while (pos < input.length - 1) {
    if (input[pos] !== 0xff) throw new Error('Invalid JPEG structure');
    const marker = input[pos + 1]!;

    if (marker === 0xff) {
      pos++; // padding byte between segments
    } else if (marker === 0xda) {
      // Start of scan: copy the pixel data up to the end-of-image marker, then stop.
      // Anything after it (extra images, phone maker data) is dropped too.
      const end = findJpegEnd(input, pos);
      parts.push(input.subarray(pos, end));
      if (end < input.length) addOnce(removed, 'other');
      break;
    } else if (marker === 0xd9) {
      parts.push(input.subarray(pos, pos + 2));
      break;
    } else {
      const segmentEnd = pos + 2 + readUint16BE(input, pos + 2);
      const kind = jpegSegmentKind(marker, input.subarray(pos + 4, segmentEnd));
      if (kind) addOnce(removed, kind);
      else parts.push(input.subarray(pos, segmentEnd));
      pos = segmentEnd;
    }
  }
  return { bytes: concat(parts), removed };
}

// ---------------------------------------------------------------------------
// PNG
// ---------------------------------------------------------------------------
//
// We keep a "whitelist" of chunks that are needed to display the image correctly
// and drop everything else (text, EXIF, timestamps and unknown chunks).

const PNG_KEEP = new Set([
  'IHDR', 'PLTE', 'IDAT', 'IEND', // the essentials: header, palette, pixel data, end
  'tRNS', 'gAMA', 'cHRM', 'sRGB', 'iCCP', 'sBIT', 'bKGD', 'pHYs', // transparency & colour
  'cICP', 'mDCV', 'mDCv', 'cLLI', 'cLLi', // HDR colour information
  'acTL', 'fcTL', 'fdAT', // animation (APNG)
]);

function pngChunkKind(type: string): MetadataKind {
  if (type === 'eXIf') return 'exif';
  if (type === 'tIME') return 'time';
  if (type === 'tEXt' || type === 'zTXt' || type === 'iTXt') return 'text';
  return 'other';
}

export function stripPngMetadata(input: Uint8Array): StripResult {
  const removed: MetadataKind[] = [];
  const parts: Uint8Array[] = [input.subarray(0, 8)]; // the PNG signature
  let pos = 8;
  while (pos + 8 <= input.length) {
    const length = readUint32BE(input, pos);
    const type = ascii(input, pos + 4, 4);
    const chunkEnd = pos + 12 + length; // length + type + data + checksum
    if (chunkEnd > input.length) throw new Error('Invalid PNG structure');
    if (PNG_KEEP.has(type)) parts.push(input.subarray(pos, chunkEnd));
    else addOnce(removed, pngChunkKind(type));
    pos = chunkEnd;
    if (type === 'IEND') break;
  }
  return { bytes: concat(parts), removed };
}

// ---------------------------------------------------------------------------
// WebP
// ---------------------------------------------------------------------------
//
// Layout: "RIFF" + total size + "WEBP", then chunks: 4-letter type + size + data
// (+ one padding byte when the size is odd). Extended files start with a "VP8X"
// chunk whose flags say which optional chunks exist – we must clear the EXIF/XMP flags.

const WEBP_KEEP = new Set(['VP8 ', 'VP8L', 'VP8X', 'ALPH', 'ANIM', 'ANMF', 'ICCP']);
const VP8X_EXIF_FLAG = 0x08;
const VP8X_XMP_FLAG = 0x04;

/**
 * Returns the EXIF block of a WebP file. It is a small TIFF file, which the
 * exifr library can read (exifr can't open WebP files directly).
 */
export function webpExifBlock(input: Uint8Array): Uint8Array | undefined {
  let pos = 12;
  while (pos + 8 <= input.length) {
    const type = ascii(input, pos, 4);
    const size = readUint32LE(input, pos + 4);
    if (type === 'EXIF') {
      const block = input.subarray(pos + 8, pos + 8 + size);
      // Some programs put "Exif\0\0" in front of the TIFF data – skip it.
      return ascii(block, 0, 6) === 'Exif\0\0' ? block.subarray(6) : block;
    }
    pos += 8 + size + (size % 2);
  }
  return undefined;
}

export function stripWebpMetadata(input: Uint8Array): StripResult {
  const removed: MetadataKind[] = [];
  const parts: Uint8Array[] = [];
  let pos = 12; // after "RIFF", size and "WEBP"
  while (pos + 8 <= input.length) {
    const type = ascii(input, pos, 4);
    const size = readUint32LE(input, pos + 4);
    const chunkEnd = pos + 8 + size + (size % 2); // + padding byte if size is odd
    if (WEBP_KEEP.has(type)) {
      const chunk = input.slice(pos, Math.min(chunkEnd, input.length)); // slice = copy we may change
      if (type === 'VP8X') chunk[8] = chunk[8]! & ~(VP8X_EXIF_FLAG | VP8X_XMP_FLAG);
      parts.push(chunk);
    } else {
      addOnce(removed, type === 'EXIF' ? 'exif' : type === 'XMP ' ? 'xmp' : 'other');
    }
    pos = chunkEnd;
  }

  const body = concat(parts);
  const output = new Uint8Array(12 + body.length);
  output.set(input.subarray(0, 12)); // "RIFF" + size + "WEBP"
  writeUint32LE(output, 4, 4 + body.length); // new total size ("WEBP" + chunks)
  output.set(body, 12);
  return { bytes: output, removed };
}
