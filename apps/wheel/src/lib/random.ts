/**
 * Fair random numbers from the browser's cryptographic generator (crypto.getRandomValues).
 * Math.random() would be fine for a game, but this makes the wheel provably unbiased –
 * people use it for giveaways, so fairness matters.
 */

/** Random whole number from 0 to max-1, without "modulo bias" (see the comment inside). */
export function randomInt(max: number): number {
  // getRandomValues gives numbers 0 … 2^32−1. "value % max" would favour small results a tiny bit
  // when 2^32 isn't a multiple of max, so we throw away the few values at the top and draw again.
  const limit = Math.floor(2 ** 32 / max) * max;
  const buffer = new Uint32Array(1);
  for (;;) {
    crypto.getRandomValues(buffer);
    if (buffer[0]! < limit) return buffer[0]! % max;
  }
}

/** Random number between 0 (inclusive) and 1 (exclusive), like Math.random() but secure. */
export function randomFraction(): number {
  return randomInt(1_000_000) / 1_000_000;
}

/** Shuffles a copy of the list (Fisher–Yates: every order is equally likely). */
export function shuffle<T>(items: readonly T[], random: (max: number) => number = randomInt): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = random(i + 1);
    [copy[i], copy[j]] = [copy[j]!, copy[i]!];
  }
  return copy;
}
