/**
 * Finds the melody of a song – the tune you would hum – although drums, bass and guitars play at
 * the same time. Humm uses it on a song's 30-second preview to check whether the song really has
 * the visitor's tune (src/lib/compare.ts).
 *
 * How it works (a simplified version of "Melodia" by J. Salamon and E. Gómez, 2012):
 * 1. Every 32 ms, take the last 128 ms of sound and find its strongest frequencies (FFT).
 * 2. A sung note is not one frequency but a "comb": the note plus 2×, 3×, 4× … its frequency
 *    (its overtones). For every possible note we add up how strong its comb is: its "salience".
 *    The voice usually has the strongest comb, even when it isn't the loudest single frequency.
 * 3. Follow the most salient notes through the song without jumping around. The "Viterbi" method
 *    finds the best path through all frames at once – like a navigation app that picks the best
 *    route, not the best next street.
 * 4. Where even the best note is weak, there is no melody (a break, or silence).
 */
import { createFft } from './fft';

/** Songs are analysed at 8,000 samples per second: enough for voices, and fast on phones. */
export const SONG_RATE = 8000;
/** 1024 samples = 128 ms per look … */
const FRAME = 1024;
/** … taken every 256 samples = 32 ms. */
const HOP = 256;
/** The notes we look for: E2 (82 Hz, a low male voice) up to C6 (1047 Hz, a high female voice). */
const LOW_NOTE = 40;
const HIGH_NOTE = 84;
/** Each semitone is split into 3 steps, so notes slightly out of tune still land in the right place. */
const STEPS = 3;
const BINS = (HIGH_NOTE - LOW_NOTE) * STEPS + 1;
/** How many overtones count, and how much each further one counts less (×0.8 each). */
const OVERTONES = 10;
const OVERTONE_WEIGHT = 0.8;
/** Moving the melody up or down costs this much per semitone, so the path doesn't jump for nothing. */
const JUMP_COST = 0.25;
/** Below this share of the song's typical melody strength, there is no melody. */
const VOICED = 0.15;

export interface SongMelody {
  /** The moment the first entry of `notes` describes (the middle of the first 128 ms), in seconds */
  start: number;
  /** Seconds between two entries of `notes` */
  step: number;
  /** The melody note at each step (see frequencyToNote in pitch.ts), or null where there is none */
  notes: (number | null)[];
}

export function songMelody(samples: Float32Array, sampleRate = SONG_RATE): SongMelody {
  const salience = salienceMap(samples, sampleRate);
  const frames = salience.length / BINS;
  const path = bestPath(salience, frames);

  // 4. Melody or not: compare each frame's strength with the song's typical melody strength.
  const strength = path.map((bin, t) => salience[t * BINS + bin]!);
  const typical = [...strength].sort((a, b) => a - b)[Math.floor(frames * 0.75)] ?? 0;
  const notes = path.map((bin, t) => {
    if (strength[t]! <= VOICED * typical || typical === 0) return null;
    // Fine-tune between the steps: the top of a parabola through the bin and its neighbours.
    const left = bin > 0 ? salience[t * BINS + bin - 1]! : 0;
    const right = bin < BINS - 1 ? salience[t * BINS + bin + 1]! : 0;
    const middle = strength[t]!;
    const curve = left - 2 * middle + right;
    const offset = curve < 0 ? Math.max(-0.5, Math.min(0.5, (left - right) / (2 * curve))) : 0;
    return LOW_NOTE + (bin + offset) / STEPS;
  });
  return { start: FRAME / 2 / sampleRate, step: HOP / sampleRate, notes };
}

/** The melody as notes with their times (what compareMelodies and the drawing need). */
export function melodyNotes(melody: SongMelody): { time: number; note: number | null }[] {
  return melody.notes.map((note, t) => ({ time: melody.start + t * melody.step, note }));
}

/** Steps 1 and 2: how strong each possible note's comb of overtones is, frame by frame. */
function salienceMap(samples: Float32Array, sampleRate: number): Float32Array {
  const fft = createFft(FRAME);
  const window = Float32Array.from({ length: FRAME }, (_, i) => 0.5 - 0.5 * Math.cos((2 * Math.PI * i) / FRAME)); // "Hann" window
  const piece = new Float32Array(FRAME);
  const binHz = sampleRate / FRAME;
  const lowest = Math.max(2, Math.floor(55 / binHz)); // nothing below 55 Hz is part of a tune
  const highest = Math.min(FRAME / 2 - 2, Math.floor(3800 / binHz));
  const frames = samples.length >= FRAME ? Math.floor((samples.length - FRAME) / HOP) + 1 : 0;
  const salience = new Float32Array(frames * BINS);

  for (let t = 0; t < frames; t++) {
    for (let i = 0; i < FRAME; i++) piece[i] = samples[t * HOP + i]! * window[i]!;
    const spectrum = fft(piece);
    let loudest = 0;
    for (let k = lowest; k <= highest; k++) loudest = Math.max(loudest, spectrum[k]!);
    if (loudest === 0) continue;

    for (let k = lowest; k <= highest; k++) {
      const m = spectrum[k]!;
      // Only peaks, and only those at most 40 dB (100×) quieter than the loudest one.
      if (m < loudest / 100 || m <= spectrum[k - 1]! || m < spectrum[k + 1]!) continue;
      // The real frequency lies between two bins: the top of a parabola through the three values.
      const a = Math.log(spectrum[k - 1]! + 1e-12);
      const b = Math.log(m);
      const c = Math.log(spectrum[k + 1]! + 1e-12);
      const offset = (a - c) / (2 * (a - 2 * b + c) || 1);
      const hz = (k + offset) * binHz;
      const amplitude = Math.exp(b - 0.25 * (a - c) * offset);

      // This peak could be the note itself (h = 1) or its 2nd, 3rd … overtone: add it to each comb.
      for (let h = 1; h <= OVERTONES; h++) {
        const note = 69 + 12 * Math.log2(hz / h / 440);
        if (note < LOW_NOTE - 1) break; // even lower for higher h
        if (note > HIGH_NOTE + 1) continue;
        const centre = (note - LOW_NOTE) * STEPS;
        const weight = amplitude * OVERTONE_WEIGHT ** (h - 1);
        // Spread over ±1 semitone, most in the middle (a "cos²" bump).
        for (let bin = Math.ceil(centre - STEPS); bin <= Math.floor(centre + STEPS); bin++) {
          if (bin < 0 || bin >= BINS) continue;
          const distance = (bin - centre) / STEPS;
          salience[t * BINS + bin] = salience[t * BINS + bin]! + weight * Math.cos((distance * Math.PI) / 2) ** 2;
        }
      }
    }
  }
  return salience;
}

/**
 * Step 3: the best path through the frames. Each frame adds how strong its note is (as a
 * logarithm, so "twice as strong" always counts the same), each jump costs JUMP_COST per semitone.
 */
function bestPath(salience: Float32Array, frames: number): number[] {
  if (frames === 0) return [];
  // Voices usually sing between about 150 and 700 Hz; bass instruments play lower.
  const prior = Float32Array.from({ length: BINS }, (_, bin) => Math.exp(-0.5 * ((LOW_NOTE + bin / STEPS - 62) / 12) ** 2));
  let loudest = 0;
  for (const value of salience) loudest = Math.max(loudest, value);
  const floor = Math.max(loudest * 1e-4, 1e-12); // "nothing here" still gets a small value
  const stepCost = JUMP_COST / STEPS;

  let score = new Float64Array(BINS);
  let next = new Float64Array(BINS);
  const cameFrom = new Int16Array(frames * BINS);
  const source = new Int16Array(BINS);
  for (let t = 0; t < frames; t++) {
    // For each note: the best previous note, counting the cost of the jump. Two sweeps (up, then
    // down) find it for all notes at once instead of comparing every pair.
    for (let bin = 0; bin < BINS; bin++) {
      next[bin] = score[bin]!;
      source[bin] = bin;
    }
    for (let bin = 1; bin < BINS; bin++) {
      if (next[bin - 1]! - stepCost > next[bin]!) {
        next[bin] = next[bin - 1]! - stepCost;
        source[bin] = source[bin - 1]!;
      }
    }
    for (let bin = BINS - 2; bin >= 0; bin--) {
      if (next[bin + 1]! - stepCost > next[bin]!) {
        next[bin] = next[bin + 1]! - stepCost;
        source[bin] = source[bin + 1]!;
      }
    }
    for (let bin = 0; bin < BINS; bin++) {
      cameFrom[t * BINS + bin] = source[bin]!;
      next[bin] = next[bin]! + Math.log(salience[t * BINS + bin]! * prior[bin]! + floor);
    }
    [score, next] = [next, score];
  }

  // Walk back from the best last note.
  let bin = 0;
  for (let b = 1; b < BINS; b++) if (score[b]! > score[bin]!) bin = b;
  const path = new Array<number>(frames);
  for (let t = frames - 1; t >= 0; t--) {
    path[t] = bin;
    bin = cameFrom[t * BINS + bin]!;
  }
  return path;
}
