/**
 * A made-up singing voice for the tests: "na na na" with the things that make a real voice harder
 * to follow than a test tone – overtones shaped by the mouth (an "a" sound), a slightly wobbling
 * pitch (vibrato), the hum of the "n", a breath after each syllable, a phone microphone that hardly
 * picks up deep notes, and background noise.
 */
import type { MelodyPoint } from '../../src/lib/melody';
import { detectPitch, frequencyToNote, loudness } from '../../src/lib/pitch';

/** The same "random" numbers on every run, so the tests always hear the same voice. */
function randomFrom(seed: number): () => number {
  let state = seed;
  return () => (state = (state * 16807) % 2147483647) / 2147483647;
}

export interface Syllable {
  /** The sung note in Hz, or null for a pause */
  hz: number | null;
  seconds: number;
}

export interface Voice {
  samples: Float32Array;
  sampleRate: number;
  /** When the singing starts and ends (seconds) */
  start: number;
  end: number;
}

/** How strongly a part of the sound with this frequency comes out: the mouth makes some overtones louder ("formants"). */
function mouth(hz: number, formants: [number, number][]): number {
  let gain = 0.03;
  for (const [centre, width] of formants) gain += 1 / Math.sqrt(1 + ((hz - centre) / (width / 2)) ** 2);
  // A phone microphone hardly picks up anything below about 150 Hz.
  const phone = (hz / 150) ** 2 / (1 + (hz / 150) ** 2);
  return gain * phone;
}

const VOWEL_A: [number, number][] = [[730, 90], [1090, 110], [2440, 170]];
const HUM_N: [number, number][] = [[250, 100], [2200, 300]];

/**
 * Sings the syllables after one second of silence. `loudness` is how loud the singing is (see
 * loudness() in pitch.ts): 0.05 is a normal voice close to the phone, 0.005 is soft humming.
 */
export function sing(syllables: Syllable[], options: { loudness: number; noise?: number }): Voice {
  const sampleRate = 48_000; // what iPhones record with
  const random = randomFrom(7);
  const leadIn = 1;
  const tail = 0.5;
  const sung = syllables.reduce((sum, syllable) => sum + syllable.seconds, 0);
  const samples = new Float32Array(Math.round((leadIn + sung + tail) * sampleRate));

  let first = Math.round(leadIn * sampleRate);
  let phase = 0;
  let energy = 0; // to set the loudness at the end
  let voicedSamples = 0;
  for (const { hz: note, seconds } of syllables) {
    const count = Math.round(seconds * sampleRate);
    if (note !== null) {
      const harmonics = Math.floor(4000 / note);
      const offsets = Array.from({ length: harmonics }, () => random() * 2 * Math.PI);
      const vowel = offsets.map((_, k) => mouth((k + 1) * note, VOWEL_A) / (k + 1));
      const hum = offsets.map((_, k) => mouth((k + 1) * note, HUM_N) / (k + 1));
      const voicedSeconds = 0.95 * seconds; // then a short breath
      for (let i = 0; i < count; i++) {
        const t = i / sampleRate;
        let value = 0;
        if (t < voicedSeconds) {
          // Vibrato: the pitch wobbles ±30 cents, 5.5 times a second, plus a little unsteadiness.
          const hz = note * 2 ** ((0.3 * Math.sin(2 * Math.PI * 5.5 * t) + 0.1 * (random() - 0.5)) / 12);
          phase += (2 * Math.PI * hz) / sampleRate;
          // The first 70 ms are the "n" (a hum through the nose), then the "a" opens.
          const open = Math.min(1, Math.max(0, (t - 0.07) / 0.02));
          const fade = Math.min(1, t / 0.02, (voicedSeconds - t) / 0.03);
          for (let k = 0; k < harmonics; k++) value += ((1 - open) * 0.4 * hum[k]! + open * vowel[k]!) * Math.sin((k + 1) * phase + offsets[k]!);
          value *= fade;
        } else {
          value = 0.25 * (random() * 2 - 1); // the breath
        }
        samples[first + i] = value;
        energy += value * value;
        voicedSamples++;
      }
    }
    first += count;
  }

  // Set the loudness of the singing, then add quiet room noise everywhere.
  const scale = options.loudness / Math.sqrt(energy / voicedSamples);
  const noise = options.noise ?? 0.0004;
  for (let i = 0; i < samples.length; i++) samples[i] = samples[i]! * scale + noise * (random() * 2 - 1);
  return { samples, sampleRate, start: leadIn, end: leadIn + sung };
}

/** Does what the page does while recording: looks at the newest 2048 samples 30 times a second. */
export function listen(voice: Voice): MelodyPoint[] {
  const points: MelodyPoint[] = [];
  for (let frame = 1; frame / 30 <= voice.samples.length / voice.sampleRate; frame++) {
    const end = Math.round((frame / 30) * voice.sampleRate);
    if (end < 2048) continue;
    const window = voice.samples.subarray(end - 2048, end);
    const hz = detectPitch(window, voice.sampleRate);
    points.push({ time: frame / 30, note: hz === null ? null : frequencyToNote(hz), level: loudness(window) });
  }
  return points;
}
