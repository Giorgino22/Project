/**
 * Turning a recording into a small WAV file that the AI can read.
 *
 * Browsers record in different formats (Chrome: WebM, iPhone: MP4). So the page decodes the
 * recording (see src/scripts/recording.ts) and stores it again in the simplest format there is:
 * WAV, one channel, 16,000 samples per second, 16 bits per sample. That's plenty for a voice and
 * small enough to send: 30 seconds ≈ 1 MB.
 */

export const WAV_SAMPLE_RATE = 16_000;

/** Makes the loudest moment 90 % of full volume. Humming is often quiet, this helps the AI hear it. */
export function normalize(samples: Float32Array): Float32Array {
  let peak = 0;
  for (const value of samples) peak = Math.max(peak, Math.abs(value));
  if (peak === 0) return samples.slice(); // silence stays silence
  const gain = 0.9 / peak;
  return samples.map((value) => value * gain);
}

/**
 * A WAV file is a 44-byte header that describes the format, followed by the samples.
 * Each sample (−1 … 1) is stored as a whole number between −32767 and 32767 ("16 bit").
 */
export function encodeWav(samples: Float32Array, sampleRate = WAV_SAMPLE_RATE): Uint8Array {
  const dataSize = samples.length * 2;
  const view = new DataView(new ArrayBuffer(44 + dataSize));
  const writeText = (offset: number, text: string) => {
    for (let i = 0; i < text.length; i++) view.setUint8(offset + i, text.charCodeAt(i));
  };

  writeText(0, 'RIFF');
  view.setUint32(4, 36 + dataSize, true); // size of the rest of the file
  writeText(8, 'WAVE');
  writeText(12, 'fmt ');
  view.setUint32(16, 16, true); // size of the format block
  view.setUint16(20, 1, true); // 1 = plain, uncompressed samples
  view.setUint16(22, 1, true); // 1 channel (mono)
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true); // bytes per second
  view.setUint16(32, 2, true); // bytes per sample
  view.setUint16(34, 16, true); // bits per sample
  writeText(36, 'data');
  view.setUint32(40, dataSize, true);

  // "true" = little-endian, the byte order WAV files use.
  samples.forEach((value, i) => view.setInt16(44 + i * 2, Math.max(-1, Math.min(1, value)) * 0x7fff, true));
  return new Uint8Array(view.buffer);
}

/**
 * Base64 turns bytes into plain text, so the file fits into a JSON request. We convert in
 * pieces because String.fromCharCode can't take a million arguments at once.
 */
export function bytesToBase64(bytes: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < bytes.length; i += 0x8000) {
    binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  }
  return btoa(binary);
}
