/**
 * Which note is someone humming right now? Used to draw the melody line while recording.
 * (The AI listens to the recording itself – this is only the picture for the visitor.)
 *
 * The method is called autocorrelation: a hummed note is a wave that repeats itself. If you
 * shift the wave by exactly one repetition ("period"), it lies on top of itself. So we try many
 * shifts and look for the one that matches best. Notes per second = sample rate / best shift.
 */

/** Lowest and highest notes we look for: a low hum (≈ C2) up to a high whistle (≈ C7). */
export const MIN_HZ = 65;
export const MAX_HZ = 2100;

/** Quieter than this (average loudness) counts as silence. */
const SILENCE = 0.01;
/** How well the wave must match itself (0–1) to count as a clear note and not as noise. */
const CLEAR_NOTE = 0.8;

/** Returns the frequency in Hz of the note in `samples`, or null for silence, noise or breath. */
export function detectPitch(input: Float32Array, inputRate: number): number | null {
  // Fewer samples = faster. Above 24,000 samples per second we keep every second one
  // (averaged with its neighbour); that still covers notes far higher than any whistle.
  const { samples, sampleRate } = inputRate > 24_000 ? halve(input, inputRate) : { samples: input, sampleRate: inputRate };
  const n = samples.length;

  let energy = 0;
  for (const value of samples) energy += value * value;
  if (Math.sqrt(energy / n) < SILENCE) return null;

  const minLag = Math.max(2, Math.floor(sampleRate / MAX_HZ));
  const maxLag = Math.min(n - 2, Math.ceil(sampleRate / MIN_HZ));

  // How well does the wave match itself when shifted by `lag` samples? (1 = perfectly)
  const scores = new Float32Array(maxLag + 2);
  let best = 0;
  for (let lag = 1; lag <= maxLag + 1; lag++) {
    let sum = 0;
    let energyA = 0;
    let energyB = 0;
    for (let i = 0; i + lag < n; i++) {
      const a = samples[i]!;
      const b = samples[i + lag]!;
      sum += a * b;
      energyA += a * a;
      energyB += b * b;
    }
    scores[lag] = energyA > 0 && energyB > 0 ? sum / Math.sqrt(energyA * energyB) : 0;
    if (lag >= minLag && lag <= maxLag) best = Math.max(best, scores[lag]!);
  }
  if (best < CLEAR_NOTE) return null;

  // Take the FIRST strong peak after the curve has dipped. Later peaks lie 2, 3 … periods away
  // and would give a note one or more octaves too low.
  let dipped = false;
  for (let lag = 1; lag <= maxLag; lag++) {
    const score = scores[lag]!;
    if (score < best * 0.5) dipped = true;
    const isPeak = score >= scores[lag - 1]! && score >= scores[lag + 1]!;
    if (dipped && lag >= minLag && isPeak && score >= best * 0.9) {
      // The real period usually lies between two samples: fit a parabola through the
      // three scores around the peak and take its top.
      const left = scores[lag - 1]!;
      const right = scores[lag + 1]!;
      const curve = left - 2 * score + right;
      const shift = curve === 0 ? 0 : (left - right) / (2 * curve);
      return sampleRate / (lag + shift);
    }
  }
  return null;
}

/** 440 Hz → 69 (the note A4). One step = one semitone, so the melody line can be drawn evenly. */
export function frequencyToNote(hz: number): number {
  return 69 + 12 * Math.log2(hz / 440);
}

function halve(samples: Float32Array, sampleRate: number): { samples: Float32Array; sampleRate: number } {
  const half = new Float32Array(Math.floor(samples.length / 2));
  for (let i = 0; i < half.length; i++) half[i] = (samples[2 * i]! + samples[2 * i + 1]!) / 2;
  return { samples: half, sampleRate: sampleRate / 2 };
}
