import { describe, expect, it } from 'vitest';
import { melodyLine, type MelodyPoint } from '../../src/lib/melody';

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
