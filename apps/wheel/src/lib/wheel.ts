/**
 * The maths of the wheel. Pure functions – no drawing, no DOM – so they are easy to test.
 *
 * How angles work here: the pointer sits at the TOP of the wheel. Segment 0 starts at the top
 * and the segments follow clockwise. "rotation" is how far the wheel has turned clockwise
 * (in radians: a full turn is 2π ≈ 6.283).
 */

export const MAX_ENTRIES = 500;
const FULL_TURN = 2 * Math.PI;

/** Text from the entries box → clean list: one entry per line, trimmed, no empty lines. */
export function parseEntries(text: string): string[] {
  return text
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line !== '')
    .slice(0, MAX_ENTRIES);
}

/** Keeps an angle between 0 and 2π (e.g. 7 → 0.717, −1 → 5.283). */
export function normalize(angle: number): number {
  return ((angle % FULL_TURN) + FULL_TURN) % FULL_TURN;
}

/**
 * Which segment is under the pointer when the wheel has turned by `rotation`?
 * Turning the wheel clockwise moves earlier segments away from the pointer, so the part of the
 * wheel under the pointer is at angle −rotation.
 */
export function segmentAtPointer(rotation: number, count: number): number {
  const segment = FULL_TURN / count;
  return Math.floor(normalize(-rotation) / segment) % count;
}

/**
 * Plans a spin. The winner is chosen FIRST (fairly, by the caller); this works out the final
 * rotation so the wheel stops with the pointer inside the winner's segment.
 *
 * @param offset    where inside the segment to stop, 0–1 (we use 0.1–0.9, never right on an edge)
 * @param fullTurns how many extra full turns for the show (e.g. 6)
 */
export function planSpin(currentRotation: number, count: number, winner: number, offset: number, fullTurns: number): number {
  const segment = FULL_TURN / count;
  const target = (winner + offset) * segment; // the wheel angle that must end up under the pointer
  // We need normalize(-finalRotation) === target, turning forward (clockwise) from where we are.
  const extra = normalize(-target - currentRotation);
  return currentRotation + extra + fullTurns * FULL_TURN;
}

/** Animation curve: starts fast and slows down smoothly, like a real wheel (t from 0 to 1). */
export function easeOut(t: number): number {
  return 1 - (1 - t) ** 4;
}

/**
 * Segment colours: the network's yellow and ink plus a few clear, flat colours.
 * Light and dark colours take turns, so neighbouring segments are easy to tell apart.
 */
export const COLORS = ['#ffd400', '#1d1e20', '#8ec5ff', '#1a7a43', '#f28b30', '#2d5be3', '#d8d6cf', '#c8381f'];

/** Text colour for the label on a segment: ink on light colours, white on dark ones (at least 4.5:1 contrast). */
export function labelColor(segment: string): string {
  return ['#ffd400', '#8ec5ff', '#f28b30', '#d8d6cf'].includes(segment) ? '#1d1e20' : '#ffffff';
}

/**
 * Colour of segment i. Colours repeat around the wheel, but on a wheel the last segment also
 * touches the first one – if both would get the same colour, the last one takes the next colour.
 */
export function segmentColor(index: number, count: number): string {
  let color = index % COLORS.length;
  if (count > 1 && index === count - 1 && color === 0) color = 1;
  return COLORS[color]!;
}

/** Numbers from `from` to `to` (inclusive), for the number wheel. */
export function numberRange(from: number, to: number, max = 200): string[] {
  if (!Number.isInteger(from) || !Number.isInteger(to) || to < from) throw new RangeError('invalid range');
  if (to - from + 1 > max) throw new RangeError('too many numbers');
  return Array.from({ length: to - from + 1 }, (_, i) => String(from + i));
}

/** Entries ↔ share link: "#entries=Ana%0ABen" (one entry per line, URL-encoded). */
export function entriesToHash(entries: string[]): string {
  return `#entries=${encodeURIComponent(entries.join('\n'))}`;
}

export function entriesFromHash(hash: string): string[] | null {
  const match = /^#entries=(.*)$/s.exec(hash);
  if (!match) return null;
  try {
    return parseEntries(decodeURIComponent(match[1]!));
  } catch {
    return null; // broken link
  }
}
