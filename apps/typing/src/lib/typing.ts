/**
 * The maths of the typing test – plain functions without any page code, so they are easy to
 * test (tests/unit/typing.test.ts). The page itself is in src/components/TypingTest.astro.
 */
import { fill } from '@tools/shared/i18n';
import { randomInt } from '@tools/shared/lib/random';
import { bottomRowWords, commonWords, homeRowWords, kidWords } from './words';
import { germanBottomRowWords, germanCommonWords, germanHomeRowWords, germanKidWords } from './words-de';

/** A function that returns a random whole number from 0 to max-1 (tests pass in a fake one). */
type Random = (max: number) => number;

/** Settings of the typing test on one page (see src/site.ts). */
export interface TestOptions {
  /** Test length in seconds. 0 = practice: no time limit, the test ends after the last word. */
  duration: number;
  /** Test lengths the visitor can switch between (seconds). Leave out = no choice. */
  durations?: number[];
  /** 'kids' = short, easy words */
  words?: 'common' | 'kids';
  /** Show the lesson menu (practice page) */
  lessons?: boolean;
  /** Extra-big letters (kids page) */
  large?: boolean;
}

export interface Keystrokes {
  correct: number;
  wrong: number;
}

export interface TestResult {
  /** Words per minute (5 characters = 1 word) */
  wpm: number;
  /** Characters per minute – in German "Anschläge pro Minute" */
  cpm: number;
  /** Correct keystrokes in percent (0–100) */
  accuracy: number;
  correctWords: number;
  wrongWords: number;
  /** Words that were typed wrong (each only once) – good to practise */
  mistakes: string[];
}

/** `count` random words from the list. The same word never comes twice in a row. */
export function pickWords(list: readonly string[], count: number, random: Random = randomInt): string[] {
  const words: string[] = [];
  while (words.length < count) {
    const word = list[random(list.length)]!;
    if (word !== words.at(-1) || list.length < 2) words.push(word);
  }
  return words;
}

/**
 * Checks the letters typed since the last check against the word that should be typed.
 * Example: target "house", before "ho", after "hou" → 1 correct. Deleting letters counts nothing.
 */
export function countKeystrokes(target: string, before: string, after: string): Keystrokes {
  // Skip the start that didn't change – normally that's everything except the new last letter.
  let start = 0;
  while (start < before.length && before[start] === after[start]) start++;

  const keys = { correct: 0, wrong: 0 };
  for (let i = start; i < after.length; i++) {
    if (after[i] === target[i]) keys.correct++;
    else keys.wrong++;
  }
  return keys;
}

/**
 * Scores a finished test the standard way:
 * - WPM: every 5 characters count as one "word" (so long and short words are fair). Only correctly
 *   typed words count, plus the space after each of them.
 * - CPM ("Anschläge pro Minute", what German speakers know): the same characters, not divided by 5.
 *   A capital letter counts as one character, like in German typing exams.
 * - Accuracy: correct keystrokes out of all keystrokes. Letters left out of a word count as mistakes.
 */
export function scoreTest(
  targets: readonly string[],
  typed: readonly string[],
  keys: Keystrokes,
  seconds: number,
): TestResult {
  let correctChars = 0;
  let correctWords = 0;
  let missingLetters = 0;
  const mistakes: string[] = [];

  typed.forEach((word, i) => {
    const target = targets[i] ?? '';
    if (word === target) {
      correctWords++;
      correctChars += word.length + 1; // + 1 for the space
    } else if (!mistakes.includes(target)) {
      mistakes.push(target);
    }
    missingLetters += Math.max(0, target.length - word.length);
  });

  const minutes = seconds / 60;
  const allKeys = keys.correct + keys.wrong + missingLetters;
  return {
    wpm: minutes > 0 ? Math.round(correctChars / 5 / minutes) : 0,
    cpm: minutes > 0 ? Math.round(correctChars / minutes) : 0,
    accuracy: allKeys > 0 ? Math.round((keys.correct / allKeys) * 100) : 0,
    correctWords,
    wrongWords: typed.length - correctWords,
    mistakes,
  };
}

/** The lowest speed (words per minute) of each verdict level. Most adults type around 40 words per minute. */
const LEVELS = [90, 70, 50, 35, 20, 0];

/**
 * Which friendly verdict a speed gets: 0 = pro level, 1 = very fast … 5 = beginner.
 * The verdicts themselves are texts in each language (`ratings` in src/i18n/en.ts and de.ts).
 */
export function ratingLevel(wpm: number): number {
  return LEVELS.findIndex((lowest) => wpm >= lowest);
}

/** 75 → "1:15" */
export function formatTime(seconds: number): string {
  const whole = Math.max(0, Math.round(seconds));
  return `${Math.floor(whole / 60)}:${String(whole % 60).padStart(2, '0')}`;
}

/**
 * 30 → "30 s", 60 → "1 min", 180 → "3 min". Other languages pass their own units,
 * e.g. { seconds: '{n} Sek.', minutes: '{n} Min.' }.
 */
export function durationLabel(seconds: number, units = { seconds: '{n} s', minutes: '{n} min' }): string {
  return seconds < 60 ? fill(units.seconds, { n: seconds }) : fill(units.minutes, { n: seconds / 60 });
}

// ---------- Word lists per language ----------

/** All word lists of one language. */
export interface WordSet {
  /** Frequent words (the normal test) */
  common: readonly string[];
  /** Short, easy words (kids test) */
  kids: readonly string[];
  /** Practice lessons: words for the home row, the top row and the bottom row of keys */
  home: readonly string[];
  top: readonly string[];
  bottom: readonly string[];
}

/** Common words that only need the top row and the home row – and at least one top row key. */
export const topRowWords = commonWords.filter((word) => /^[qwertyuiopasdfghjkl]+$/.test(word) && /[qwertyuiop]/.test(word));

/** The same for German (QWERTZ keyboard: Z and Ü are in the top row, Ö and Ä in the home row). */
export const germanTopRowWords = germanCommonWords.filter(
  (word) => /^[qwertzuiopüasdfghjklöä]+$/.test(word) && /[qwertzuiopü]/.test(word),
);

export const wordSets = {
  en: { common: commonWords, kids: kidWords, home: homeRowWords, top: topRowWords, bottom: bottomRowWords },
  de: {
    common: germanCommonWords,
    kids: germanKidWords,
    home: germanHomeRowWords,
    top: germanTopRowWords,
    bottom: germanBottomRowWords,
  },
} satisfies Record<string, WordSet>;

export type WordLang = keyof typeof wordSets;

// ---------- Practice lessons ----------

/** Lessons on the practice page. Their names are texts in each language (`lessons` in src/i18n/). */
export const LESSON_IDS = ['common', 'home', 'top', 'bottom', 'numbers', 'sentences'] as const;

export type LessonId = (typeof LESSON_IDS)[number];

/** The words to type in a lesson, from the word lists of one language (English if none is given). */
export function lessonWords(
  lesson: LessonId,
  count: number,
  random: Random = randomInt,
  words: WordSet = wordSets.en,
): string[] {
  switch (lesson) {
    case 'home':
      return pickWords(words.home, count, random);
    case 'top':
      return pickWords(words.top, count, random);
    case 'bottom':
      return pickWords(words.bottom, count, random);
    case 'numbers':
      // Numbers with 1 to 4 digits, e.g. "7", "42", "2048"
      return Array.from({ length: count }, () => String(random(10 ** (1 + random(4)))));
    case 'sentences':
      return sentences(pickWords(words.common, count, random), random);
    default:
      return pickWords(words.common, count, random);
  }
}

/** Turns words into sentences: a capital letter at the start, a comma now and then, a full stop (or ? or !) at the end. */
export function sentences(words: readonly string[], random: Random = randomInt): string[] {
  let length = 0; // words in the current sentence so far
  return words.map((word, i) => {
    let token = length === 0 ? word.charAt(0).toUpperCase() + word.slice(1) : word;
    length++;
    const isLast = i === words.length - 1;
    if (isLast || length >= 10 || (length >= 4 && random(4) === 0)) {
      token += '..?!'.charAt(random(4)); // full stops are twice as likely
      length = 0;
    } else if (length >= 2 && random(6) === 0) {
      token += ',';
    }
    return token;
  });
}
