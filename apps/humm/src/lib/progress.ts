/**
 * The circle that fills up while Humm searches, and the "About 8 seconds left" under it.
 *
 * Nobody knows in advance how long the AI needs, so we estimate it from the last few searches
 * on this device (the middle value, so one very slow search doesn't throw it off). The circle
 * reaches 90 % at the estimated time and then creeps on slowly – it only closes when the answer
 * is really there.
 */

/** Estimated seconds for the next search, from earlier durations (or `fallback` the first time). */
export function estimateSeconds(previous: number[], fallback: number): number {
  const recent = previous.filter((seconds) => Number.isFinite(seconds) && seconds > 0).slice(-5);
  if (recent.length === 0) return fallback;
  const sorted = [...recent].sort((a, b) => a - b);
  const middle = sorted[Math.floor(sorted.length / 2)]!;
  return Math.min(90, Math.max(4, Math.round(middle)));
}

/** How full the circle is (0 … 1) after `elapsed` seconds. */
export function progressFraction(elapsed: number, estimate: number): number {
  if (elapsed <= 0) return 0;
  if (elapsed < estimate) return 0.9 * (elapsed / estimate);
  // After the estimate: slowly from 90 % towards 99 % (an "exponential approach").
  return 0.99 - 0.09 * Math.exp(-(elapsed - estimate) / estimate);
}

/** The text under the circle. */
export function timeLeftText(elapsed: number, estimate: number): string {
  const left = Math.ceil(estimate - elapsed);
  if (left > 1) return `About ${left} seconds left`;
  if (left === 1) return 'About 1 second left';
  return 'Taking a little longer than usual';
}
