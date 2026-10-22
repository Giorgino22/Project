/**
 * Made-up songs for the tests: a tune sung by the test voice (voice.ts) over chords, bass and drums
 * – and hums of a part of it, sung in another key and at another speed, with a few wrong notes.
 * With these we can test whether Humm finds a song's melody and recognises a hum of it.
 */
import { sing, type Syllable } from './voice';

/** One note of a tune: a MIDI note number (60 = middle C) or null for a rest, and its length. */
export interface TuneNote {
  note: number | null;
  seconds: number;
}

/** The same "random" numbers on every run (a different series for each seed). */
export function randomFrom(seed: number): () => number {
  let state = seed % 2147483647 || 1;
  return () => (state = (state * 16807) % 2147483647) / 2147483647;
}

const MAJOR = [0, 2, 4, 5, 7, 9, 11];

/**
 * A pop-like tune of about `seconds`: mostly small steps on a major scale, some leaps and rests,
 * and – like real songs – short motifs that come back.
 */
export function makeTune(seed: number, seconds = 30): { notes: TuneNote[]; beat: number; key: number } {
  const random = randomFrom(seed * 7919);
  const key = 55 + Math.floor(random() * 10); // the tonic, G3 … E4
  const beat = 60 / (85 + random() * 45); // 85 … 130 beats per minute
  const pick = <T>(choices: [T, number][]): T => {
    let r = random() * choices.reduce((sum, [, weight]) => sum + weight, 0);
    for (const [value, weight] of choices) if ((r -= weight) <= 0) return value;
    return choices[0]![0];
  };

  // Two-bar motifs (8 beats each); the song is made of them, like verse and chorus.
  const motif = (): { degree: number | null; beats: number }[] => {
    const result: { degree: number | null; beats: number }[] = [];
    let degree = Math.floor(random() * 5);
    let used = 0;
    while (used < 8) {
      const beats = Math.min(8 - used, pick<number>([[0.5, 4], [1, 4], [1.5, 1], [2, 2]]));
      if (random() < 0.08) result.push({ degree: null, beats });
      else {
        degree += pick<number>([[0, 2], [1, 3], [-1, 3], [2, 1.5], [-2, 1.5], [3, 0.6], [-3, 0.6], [4, 0.4], [-4, 0.4]]);
        degree = Math.max(-3, Math.min(10, degree));
        result.push({ degree, beats });
      }
      used += beats;
    }
    return result;
  };
  const motifs = [motif(), motif(), motif()];
  const form = [0, 0, 1, 0, 2, 2, 1, 0, 0, 2, 1, 2];

  const notes: TuneNote[] = [];
  let time = 0;
  for (const index of form) {
    for (const { degree, beats } of motifs[index]!) {
      const octave = degree === null ? 0 : Math.floor(degree / 7);
      const step = degree === null ? 0 : MAJOR[((degree % 7) + 7) % 7]!;
      notes.push({ note: degree === null ? null : key + 12 * octave + step, seconds: beats * beat });
      time += beats * beat;
    }
    if (time >= seconds) break;
  }
  return { notes, beat, key };
}

/** The tune sung by the test voice over chords, bass and drums – like a song's preview. */
export function renderSong(tune: ReturnType<typeof makeTune>, sampleRate = 8000, seed = 1): Float32Array {
  const random = randomFrom(seed * 104729);
  const total = tune.notes.reduce((sum, note) => sum + note.seconds, 0);
  const length = Math.round(total * sampleRate);
  const voice = sing(
    tune.notes.map((note) => ({ hz: note.note === null ? null : 440 * 2 ** ((note.note - 69) / 12), seconds: note.seconds })),
    { loudness: 0.08, noise: 0, leadIn: 0, tail: 0, sampleRate, seed },
  ).samples;
  const mix = new Float32Array(length);
  for (let i = 0; i < length; i++) mix[i] = voice[i] ?? 0;

  // A rich tone (like a keyboard or a guitar) that fades out.
  const play = (note: number, start: number, seconds: number, volume: number) => {
    const hz = 440 * 2 ** ((note - 69) / 12);
    const first = Math.round(start * sampleRate);
    const count = Math.round(seconds * sampleRate);
    for (let i = 0; i < count && first + i < length; i++) {
      const t = i / sampleRate;
      let value = 0;
      for (let k = 1; k <= 8 && k * hz < sampleRate / 2.2; k++) value += Math.sin(2 * Math.PI * k * hz * t) / k;
      mix[first + i]! += volume * value * Math.exp(-2.5 * t) * Math.min(1, t / 0.01);
    }
  };

  // Chords change every two beats, following the key: I, V, vi, IV.
  const chords = [[0, 4, 7], [7, 11, 14], [9, 12, 16], [5, 9, 12]];
  for (let start = 0, n = 0; start < total; start += 2 * tune.beat, n++) {
    const chord = chords[Math.floor(n / 2) % 4]!;
    for (const step of chord) play(tune.key - 12 + step, start, 2 * tune.beat, 0.035);
    play(tune.key - 24 + chord[0]!, start, tune.beat, 0.07); // bass
    play(tune.key - 24 + chord[0]!, start + tune.beat, tune.beat, 0.07);
  }
  // Drums: a thump on beats 1 and 3, a noise burst on 2 and 4, ticks in between.
  for (let start = 0, n = 0; start < total; start += tune.beat / 2, n++) {
    const first = Math.round(start * sampleRate);
    const kind = n % 4 === 0 ? 'kick' : n % 4 === 2 ? 'snare' : 'hat';
    const count = Math.round((kind === 'hat' ? 0.03 : 0.15) * sampleRate);
    for (let i = 0; i < count && first + i < length; i++) {
      const t = i / sampleRate;
      const value = kind === 'kick' ? Math.sin(2 * Math.PI * (60 + 80 * Math.exp(-30 * t)) * t) : random() * 2 - 1;
      mix[first + i]! += (kind === 'kick' ? 0.25 : kind === 'snare' ? 0.08 : 0.03) * value * Math.exp(-25 * t);
    }
  }
  return mix;
}

/** Where each note of the tune starts (seconds). */
export function startTimes(notes: TuneNote[]): number[] {
  let time = 0;
  return notes.map((note) => {
    const start = time;
    time += note.seconds;
    return start;
  });
}

/**
 * A person humming `seconds` of the tune from `from` on – in another key, a bit faster or slower,
 * slightly off-pitch, with some wrong notes – as syllables for the test voice.
 */
export function humPart(
  tune: ReturnType<typeof makeTune>,
  options: { from: number; seconds: number; transpose: number; tempo: number; seed: number; wrongNotes?: number },
): Syllable[] {
  const random = randomFrom(options.seed * 31337);
  const starts = startTimes(tune.notes);
  const result: Syllable[] = [];
  tune.notes.forEach((note, i) => {
    if (starts[i]! < options.from || starts[i]! >= options.from + options.seconds) return;
    let pitch = note.note === null ? null : note.note + options.transpose + (random() - 0.5) * 0.6;
    if (pitch !== null && random() < (options.wrongNotes ?? 0.1)) pitch += random() < 0.5 ? -2 : 2;
    result.push({ hz: pitch === null ? null : 440 * 2 ** ((pitch - 69) / 12), seconds: note.seconds / options.tempo });
  });
  return result;
}
