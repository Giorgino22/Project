/**
 * Turns the raw notes from detectPitch() – about 30 per second, a bit shaky – into a smooth
 * melody line for the staff:
 *
 * 1. A note that is far from its neighbours is a measuring error (often exactly one octave off).
 *    Each note is replaced by the middle value ("median") of itself and its 4 neighbours, which
 *    removes such single outliers but keeps real steps in the melody.
 * 2. Short pauses (a breath, a consonant like the "n" in "na na") don't break the line.
 * 3. Scraps shorter than 0.15 s are left out – they are almost always noise.
 * 4. What's left is smoothed: each point moves 40 % of the way towards the next note, like a
 *    steady hand drawing instead of a shaky one.
 */

export interface MelodyPoint {
  /** Seconds since the recording started */
  time: number;
  /** The note (see frequencyToNote) or null for silence */
  note: number | null;
}

export type Segment = { time: number; note: number }[];

/** Pauses shorter than this (seconds) are bridged. */
export const BRIDGE_SECONDS = 0.3;
/** Pieces of line shorter than this (seconds) are left out. */
export const MIN_SEGMENT_SECONDS = 0.15;
/** A jump bigger than this (semitones) starts a new piece of line instead of a steep stroke. */
const MAX_JUMP = 9;

export function melodyLine(points: MelodyPoint[]): Segment[] {
  const voiced = points.filter((point): point is { time: number; note: number } => point.note !== null);

  // 1. The median of each note and its neighbours (only neighbours close in time count).
  const steady = voiced.map((point, i) => {
    const near = voiced
      .slice(Math.max(0, i - 2), i + 3)
      .filter((other) => Math.abs(other.time - point.time) <= 0.25)
      .map((other) => other.note)
      .sort((a, b) => a - b);
    return { time: point.time, note: near[Math.floor(near.length / 2)]! };
  });

  // 2. Cut into pieces where the pause is long or the jump is big.
  const segments: Segment[] = [];
  for (const point of steady) {
    const current = segments[segments.length - 1];
    const last = current?.[current.length - 1];
    if (!current || !last || point.time - last.time > BRIDGE_SECONDS || Math.abs(point.note - last.note) > MAX_JUMP) {
      segments.push([point]);
    } else {
      current.push(point);
    }
  }

  return (
    segments
      // 3. No scraps
      .filter((segment) => segment[segment.length - 1]!.time - segment[0]!.time >= MIN_SEGMENT_SECONDS)
      // 4. Smooth ("moving average")
      .map((segment) => {
        let smooth = segment[0]!.note;
        return segment.map((point) => {
          smooth += 0.4 * (point.note - smooth);
          return { time: point.time, note: smooth };
        });
      })
  );
}
