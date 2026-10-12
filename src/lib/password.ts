/**
 * Password generator logic.
 *
 * Security rule #1: never use Math.random() for passwords – it is predictable.
 * We use crypto.getRandomValues(), the browser's cryptographically secure
 * random number generator (the same one used for encryption).
 */

export interface PasswordOptions {
  length: number;
  lowercase: boolean;
  uppercase: boolean;
  digits: boolean;
  symbols: boolean;
  /** Leave out characters that look alike: I, l, 1, O, 0 */
  avoidAmbiguous: boolean;
}

const CHARACTER_SETS = {
  lowercase: 'abcdefghijklmnopqrstuvwxyz',
  uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  digits: '0123456789',
  symbols: '!#$%&*+-=?@^_~.,:;()[]{}',
} as const;

const AMBIGUOUS = /[Il1O0]/g;

/** A function that returns a random whole number from 0 to max-1. */
export type RandomInt = (max: number) => number;

/**
 * Secure random whole number from 0 to max-1, without "modulo bias".
 *
 * getRandomValues gives us numbers from 0 to 4,294,967,295 (2^32 − 1).
 * The quick way, `random % max`, is slightly unfair when 2^32 is not a multiple
 * of max: small results come up a tiny bit more often. So we ignore the few
 * random numbers at the very top that cause the unfairness and draw again.
 * This is called "rejection sampling".
 */
export function secureRandomInt(max: number): number {
  const limit = Math.floor(2 ** 32 / max) * max; // biggest fair multiple of max
  const buffer = new Uint32Array(1);
  for (;;) {
    crypto.getRandomValues(buffer);
    const value = buffer[0]!;
    if (value < limit) return value % max;
  }
}

/** The character groups the user switched on (e.g. ["abc…", "0123…"]). */
export function characterPools(options: PasswordOptions): string[] {
  const pools: string[] = [];
  for (const key of ['lowercase', 'uppercase', 'digits', 'symbols'] as const) {
    if (!options[key]) continue;
    const set = options.avoidAmbiguous
      ? CHARACTER_SETS[key].replace(AMBIGUOUS, '')
      : CHARACTER_SETS[key];
    pools.push(set);
  }
  return pools;
}

export function generatePassword(
  options: PasswordOptions,
  randomInt: RandomInt = secureRandomInt,
): string {
  const pools = characterPools(options);
  if (pools.length === 0) throw new Error('Select at least one character type');

  const allCharacters = pools.join('');
  const length = Math.max(options.length, pools.length);
  const pick = (set: string) => set[randomInt(set.length)]!;

  // 1. One character from every selected group, so e.g. "digits" really means "contains a digit".
  const characters = pools.map(pick);
  // 2. Fill up the rest with characters from all selected groups.
  while (characters.length < length) characters.push(pick(allCharacters));
  // 3. Shuffle (Fisher–Yates), otherwise the guaranteed characters would always come first.
  for (let i = characters.length - 1; i > 0; i--) {
    const j = randomInt(i + 1);
    [characters[i], characters[j]] = [characters[j]!, characters[i]!];
  }
  return characters.join('');
}

/**
 * Password strength in "bits of entropy": how many yes/no guesses an attacker
 * needs in the worst case. Each extra bit doubles the work.
 * Formula: length × log2(number of possible characters).
 */
export function entropyBits(options: PasswordOptions): number {
  const poolSize = characterPools(options).join('').length;
  if (poolSize === 0) return 0;
  return Math.round(Math.max(options.length, 1) * Math.log2(poolSize));
}

export type Strength = 'weak' | 'fair' | 'strong' | 'excellent';

export function strengthOf(bits: number): Strength {
  if (bits < 45) return 'weak';
  if (bits < 70) return 'fair';
  if (bits < 100) return 'strong';
  return 'excellent';
}
