import { describe, expect, it } from 'vitest';
import { melodyLine, silences, type MelodyPoint } from '../../src/lib/melody';

/** Notes measured 30 times a second, starting at `start` seconds. */
const at = (start: number, notes: (number | null)[]): MelodyPoint[] => notes.map((note, i) => ({ time: start + i / 30, note }));

describe('smooth melody line', () => {
  it('removes a single measuring error (one octave off)', () => {
    const line = melodyLine(at(0, [60, 60, 60, 72, 60, 60, 60]));
    expect(line).toHaveLength(1);
    for (const point of line[0]!) expect(point.note).toBeCloseTo(60);
  });

  it('bridges a short pause but breaks at a long one', () => {
    const shortPause = melodyLine([...at(0, [60, 60, 60, 60, 60, 60]), ...at(0.4, [62, 62, 62, 62, 62, 62])]);
    expect(shortPause).toHaveLength(1);
    const longPause = melodyLine([...at(0, [60, 60, 60, 60, 60, 60]), ...at(1.2, [62, 62, 62, 62, 62, 62])]);
    expect(longPause).toHaveLength(2);
  });

  it('leaves out tiny scraps of noise', () => {
    expect(melodyLine([...at(0, [64, 64]), ...at(2, [null, null])])).toEqual([]);
  });

  it('glides smoothly from one note to the next', () => {
    const [line] = melodyLine(at(0, [60, 60, 60, 60, 64, 64, 64, 64, 64, 64]));
    const notes = line!.map((point) => point.note);
    // Rises step by step, never overshoots, ends close to the new note
    for (let i = 1; i < notes.length; i++) expect(notes[i]).toBeGreaterThanOrEqual(notes[i - 1]!);
    expect(Math.max(...notes)).toBeLessThanOrEqual(64);
    expect(notes.at(-1)).toBeGreaterThan(63);
  });

  it('starts a new piece at a big jump', () => {
    const line = melodyLine(at(0, [50, 50, 50, 50, 50, 50, 70, 70, 70, 70, 70, 70]));
    expect(line).toHaveLength(2);
  });
});

describe('silent stretches (drawn in red)', () => {
  it('finds the pause between two pieces, and silence before and after', () => {
    const line = melodyLine([...at(0, [null, null, null, null, null, null, null, null, null, null, null, null, 60, 60, 60, 60, 60, 60]), ...at(1.5, [64, 64, 64, 64, 64, 64])]);
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
    const line = melodyLine(at(0, Array.from({ length: 30 }, () => 62)));
    expect(silences(line, 1)).toEqual([]);
  });
});
