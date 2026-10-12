import { readFileSync } from 'node:fs';
import exifr from 'exifr';
import { describe, expect, it } from 'vitest';
import {
  detectImageKind,
  readJpegOrientation,
  stripMetadata,
  UnsupportedImageError,
  webpExifBlock,
} from '../../src/lib/metadata';

const fixture = (name: string) => new Uint8Array(readFileSync(new URL(`../fixtures/${name}`, import.meta.url)));

/** Reads everything exifr can find (EXIF, GPS, XMP, IPTC). */
async function readMetadata(bytes: Uint8Array) {
  return exifr.parse(bytes, { tiff: true, gps: true, xmp: true, iptc: true, icc: false, mergeOutput: true });
}

/** All bytes after the start-of-scan marker – i.e. the pixel data of a JPEG. */
function jpegPixelData(bytes: Uint8Array): string {
  const buffer = Buffer.from(bytes);
  return buffer.subarray(buffer.indexOf(Buffer.from([0xff, 0xda]))).toString('hex');
}

describe('detectImageKind', () => {
  it('recognises files by their first bytes', () => {
    expect(detectImageKind(fixture('photo.jpg'))).toBe('jpg');
    expect(detectImageKind(fixture('graphic.png'))).toBe('png');
    expect(detectImageKind(fixture('photo.webp'))).toBe('webp');
    expect(detectImageKind(new TextEncoder().encode('GIF89a...'))).toBe('gif');
    expect(detectImageKind(new TextEncoder().encode('hello'))).toBe('unknown');
  });
});

describe('stripMetadata – JPEG', () => {
  it('the fixture really contains GPS and camera data (sanity check)', async () => {
    const meta = await readMetadata(fixture('photo-gps.jpg'));
    expect(meta.latitude).toBeCloseTo(48.858, 2);
    expect(meta.Make).toBe('TestCam');
    expect(readJpegOrientation(fixture('photo-gps.jpg'))).toBe(6);
  });

  it('removes GPS, camera, XMP and comments but keeps the orientation', async () => {
    const input = fixture('photo-gps.jpg');
    const { bytes, removed } = stripMetadata(input);

    const meta = await readMetadata(bytes);
    expect(meta?.latitude).toBeUndefined();
    expect(meta?.Make).toBeUndefined();
    expect(meta?.creator).toBeUndefined();
    expect(Buffer.from(bytes).includes(Buffer.from('secret comment'))).toBe(false);
    expect(removed).toEqual(expect.arrayContaining(['exif', 'xmp', 'comment']));

    // Orientation 6 must survive, or the photo would suddenly appear sideways.
    expect(readJpegOrientation(bytes)).toBe(6);
    expect(meta?.Orientation).toBeDefined();
  });

  it('copies the pixel data byte-for-byte (lossless)', () => {
    const input = fixture('photo-gps.jpg');
    const { bytes } = stripMetadata(input);
    expect(jpegPixelData(bytes)).toBe(jpegPixelData(input));
  });

  it('keeps the colour profile (ICC)', () => {
    const { bytes } = stripMetadata(fixture('photo-gps.jpg'));
    expect(Buffer.from(bytes).includes(Buffer.from('ICC_PROFILE'))).toBe(true);
  });

  it('handles progressive JPEGs (several scans)', async () => {
    const input = fixture('photo-gps-progressive.jpg');
    const { bytes } = stripMetadata(input);
    expect((await readMetadata(bytes))?.latitude).toBeUndefined();
    expect(jpegPixelData(bytes)).toBe(jpegPixelData(input));
  });

  it('drops data hidden after the end of the image', () => {
    const input = fixture('photo.jpg');
    const withTrailer = new Uint8Array([...input, ...new TextEncoder().encode('SEFT hidden phone data')]);
    const { bytes, removed } = stripMetadata(withTrailer);
    expect(bytes.length).toBe(input.length);
    expect(removed).toContain('other');
  });

  it('leaves a clean JPEG unchanged', () => {
    const input = fixture('photo.jpg');
    const { bytes, removed } = stripMetadata(input);
    expect(removed).toEqual([]);
    expect(Buffer.from(bytes).equals(Buffer.from(input))).toBe(true);
  });
});

describe('stripMetadata – PNG', () => {
  it('removes text and EXIF chunks', async () => {
    const input = fixture('graphic.png');
    expect(Buffer.from(input).includes(Buffer.from('Test Person'))).toBe(true);

    const { bytes, removed } = stripMetadata(input);
    expect(Buffer.from(bytes).includes(Buffer.from('Test Person'))).toBe(false);
    expect(Buffer.from(bytes).includes(Buffer.from('eXIf'))).toBe(false);
    expect(removed).toEqual(expect.arrayContaining(['text', 'exif']));
    expect((await readMetadata(bytes))?.latitude).toBeUndefined();
    // Still a PNG with its pixel data and end marker
    expect(detectImageKind(bytes)).toBe('png');
    expect(Buffer.from(bytes).includes(Buffer.from('IDAT'))).toBe(true);
    expect(Buffer.from(bytes).includes(Buffer.from('IEND'))).toBe(true);
  });
});

describe('stripMetadata – WebP', () => {
  it('finds the EXIF block so the page can show what is inside', async () => {
    const exif = webpExifBlock(fixture('photo.webp'));
    expect(exif).toBeDefined();
    expect((await readMetadata(exif!))?.latitude).toBeCloseTo(48.858, 2);
  });

  it('removes EXIF and XMP chunks and fixes the header', () => {
    const input = fixture('photo.webp');
    const { bytes, removed } = stripMetadata(input);
    expect(removed).toEqual(expect.arrayContaining(['exif', 'xmp']));
    expect(webpExifBlock(bytes)).toBeUndefined();
    expect(Buffer.from(bytes).includes(Buffer.from('Test Person'))).toBe(false);
    expect(Buffer.from(bytes).includes(Buffer.from('VP8 '))).toBe(true); // pixel data kept

    const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    expect(view.getUint32(4, true)).toBe(bytes.length - 8); // RIFF size must match the new length
    const vp8x = Buffer.from(bytes).indexOf('VP8X');
    expect(bytes[vp8x + 8]! & 0x0c).toBe(0); // EXIF and XMP flags cleared
  });
});

describe('stripMetadata – other formats', () => {
  it('rejects formats it cannot clean', () => {
    expect(() => stripMetadata(new TextEncoder().encode('GIF89a......'))).toThrow(UnsupportedImageError);
  });
});
