/**
 * Password card: a grid of random characters with letters above the columns and numbers in
 * front of the rows. The visitor remembers a start cell (e.g. "C4") and a path (e.g. "12 to the
 * right"); the characters along the path are the password.
 *
 * The characters come from the same secure random generator and character sets as the
 * password generator (src/lib/password.ts).
 */
import { characterPools, secureRandomInt, type PasswordOptions, type RandomInt } from './password';

/** Which characters may appear on the card (the password generator's options without the length). */
export type CardOptions = Omit<PasswordOptions, 'length'>;

/**
 * The two card sizes. The wallet card is a bank card (85.6 × 54 mm, ISO/IEC 7810 ID-1);
 * the A4 page has a bigger grid with larger letters.
 */
export const CARD_SIZES = {
  wallet: { rows: 8, columns: 16 },
  a4: { rows: 30, columns: 26 },
} as const;

export type CardSize = keyof typeof CARD_SIZES;

/** Column names: A, B, C, … (at most 26 columns). */
export function columnLabels(count: number): string[] {
  return Array.from({ length: count }, (_, index) => String.fromCharCode(65 + index));
}

/** All characters the card may use, e.g. "abc…XYZ…23…!#…" (throws if no type is selected). */
export function cardCharacters(options: CardOptions): string {
  const characters = characterPools({ ...options, length: 1 }).join('');
  if (characters === '') throw new Error('Select at least one character type');
  return characters;
}

/** A new random card: `rows` lists of `columns` characters each. */
export function generateCard(size: CardSize, options: CardOptions, randomInt: RandomInt = secureRandomInt): string[][] {
  const characters = cardCharacters(options);
  const { rows, columns } = CARD_SIZES[size];
  return Array.from({ length: rows }, () =>
    Array.from({ length: columns }, () => characters[randomInt(characters.length)]!),
  );
}

/** Bits of entropy one character of the card adds (log2 of the number of possible characters). */
export function bitsPerCharacter(options: CardOptions): number {
  return Math.log2(cardCharacters(options).length);
}
