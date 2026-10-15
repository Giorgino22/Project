import { describe, expect, it } from 'vitest';
import { melodyLine, silences, soundLevel, type MelodyPoint, type Silence } from '../../src/lib/melody';
import { QUIET } from '../../src/lib/pitch';
import { listen, sing, type Syllable } from './voice';

/**
 * Measurements 30 times a second, starting at `start` seconds: a note, '~' = a sound without a
 * clear note (like the "n" in "na"), or null = silence. Sounds have the loudness `level`.
 */
const at = (start: number, notes: (number | '~' | null)[], level = 0.05): MelodyPoint[] =>
  notes.map((note, i) => ({ time: start + i / 30, note: typeof note === 'number' ? note : null, level: note === null ? 0.0005 : level }));

const times = (count: number, value: number | '~' | null) => Array.from({ length: count }, () => value);

/** Seconds of red between `from` and `to`. */
function redBetween(gaps: Silence[], from: number, to: number): number {
  return gaps.reduce((sum, gap) => sum + Math.max(0, Math.min(gap.end, to) - Math.max(gap.start, from)), 0);
}

describe('smooth melody line', () => {
  it('removes a single measuring error (one octave off)', () => {
    const line = melodyLine(at(0, [60, 60, 60, 72, 60, 60, 60]));
    expect(line).toHaveLength(1);
    for (const point of line[0]!) expect(point.note).toBeCloseTo(60);
  });

  it('bridges a short pause but breaks at a long one', () => {
    const shortPause = melodyLine([...at(0, times(6, 60)), ...at(0.4, times(6, 62))]);
    expect(shortPause).toHaveLength(1);
    const longPause = melodyLine([...at(0, times(6, 60)), ...at(1.2, times(6, 62))]);
    expect(longPause).toHaveLength(2);
  });

  it('leaves out tiny scraps of noise', () => {
    expect(melodyLine([...at(0, [64, 64]), ...at(2, [null, null])])).toEqual([]);
  });

  it('leaves out sounds without a tune (a cough, talking)', () => {
    expect(melodyLine(at(0, times(20, '~')))).toEqual([]);
  });

  it('glides smoothly from one note to the next', () => {
    const [line] = melodyLine(at(0, [60, 60, 60, 60, 64, 64, 64, 64, 64, 64]));
    const notes = line!.map((point) => point.note);
    // Rises step by step, never overshoots, ends close to the new note
    for (let i = 1; i < notes.length; i++) expect(notes[i]).toBeGreaterThanOrEqual(notes[i - 1]!);
    expect(Math.max(...notes)).toBeLessThanOrEqual(64);
    expect(notes.at(-1)).toBeGreaterThan(63);
  });

  it('keeps the line going while you sing, even where no clear note was heard', () => {
    // A note, then half a second of sound without a clear note, then the next note
    const line = melodyLine(at(0, [...times(6, 60), ...times(15, '~'), ...times(6, 64)]));
    expect(line).toHaveLength(1);
    expect(silences(line, 0.9)).toEqual([]);
  });

  it('starts and ends the line with the sound, not with the first and last clear note', () => {
    const [line] = melodyLine(at(1, ['~', '~', '~', 60, 60, 60, 60, '~', '~', '~']));
    expect(line![0]!.time).toBe(1);
    expect(line!.at(-1)!.time).toBeCloseTo(1.3);
  });
});

describe('what counts as sound', () => {
  it('is measured against the visitor’s own voice', () => {
    expect(soundLevel(at(0, times(10, 60), 0.05))).toBeCloseTo(0.005); // a tenth of the singing
    expect(soundLevel(at(0, times(10, 60), 0.004))).toBe(QUIET); // never less than a quiet room
    expect(soundLevel([])).toBe(QUIET);
  });

  it('follows soft singing as well as loud singing', () => {
    const soft = melodyLine(at(0, times(30, 60), 0.004));
    expect(soft).toHaveLength(1);
    expect(silences(soft, 1)).toEqual([]);
  });

  it('ignores a quiet hum in the background (a fridge) while someone sings', () => {
    const points = [...at(0, times(30, 60), 0.05), ...at(1, times(30, 47), 0.002), ...at(2, times(30, 62), 0.05)];
    const line = melodyLine(points);
    expect(line).toHaveLength(2); // the fridge part is a pause …
    expect(redBetween(silences(line, 3), 1, 2)).toBeGreaterThan(0.9); // … and shown in red
  });
});

describe('a real-sounding voice', () => {
  // "na na na" up and down a scale, 0.4 s per syllable
  const tune = (base: number): Syllable[] => [0, 2, 4, 5, 7, 5, 4, 2, 0, 0].map((step) => ({ hz: base * 2 ** (step / 12), seconds: 0.4 }));

  it.each([
    ['a man singing normally', 131, 0.05],
    ['a man singing softly', 131, 0.005],
    ['a woman humming very softly', 220, 0.003],
  ])('draws %s as one line without red', (_name, base, loudness) => {
    const voice = sing(tune(base), { loudness });
    const points = listen(voice);
    const line = melodyLine(points);
    expect(line).toHaveLength(1);
    expect(redBetween(silences(line, points.at(-1)!.time), voice.start, voice.end)).toBeLessThan(0.1);
  });

  it('shows a real pause in red, even in a noisy room', () => {
    const withPause = [...tune(131).slice(0, 4), { hz: null, seconds: 1 }, ...tune(131).slice(4)];
    const voice = sing(withPause, { loudness: 0.03, noise: 0.002 });
    const points = listen(voice);
    const gaps = silences(melodyLine(points), points.at(-1)!.time);
    const pause = { from: voice.start + 1.6, to: voice.start + 2.6 };
    expect(redBetween(gaps, pause.from, pause.to)).toBeGreaterThan(0.9);
    expect(redBetween(gaps, voice.start, pause.from) + redBetween(gaps, pause.to, voice.end)).toBeLessThan(0.15);
  });
});

describe('silent stretches (drawn in red)', () => {
  it('finds the pause between two pieces, and silence before and after', () => {
    const line = melodyLine([...at(0, [...times(12, null), ...times(6, 60)]), ...at(1.5, times(6, 64))]);
    const gaps = silences(line, 3);
    expect(gaps.map((gap) => [Number(gap.start.toFixed(2)), Number(gap.end.toFixed(2))])).toEqual([
      [0, 0.4], // before the first note
      [0.57, 1.5], // between the two pieces
      [1.67, 3], // after the last note until the end of the recording
    ]);
    expect(gaps[1]!.fromNote).toBeCloseTo(60, 0);
    expect(gaps[1]!.toNote).toBeCloseTo(64, 0);
  });

  it('marks the whole time as silent when no tune was heard', () => {
    expect(silences([], 2)).toEqual([{ start: 0, end: 2, fromNote: null, toNote: null }]);
    expect(silences([], 0.1)).toEqual([]);
  });

  it('shows no red for a tune without real pauses', () => {
    const line = melodyLine(at(0, times(30, 62)));
    expect(silences(line, 1)).toEqual([]);
  });
});
