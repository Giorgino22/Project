/**
 * The maths of the typing test – plain functions without any page code, so they are easy to
 * test (tests/unit/typing.test.ts). The page itself is in src/components/TypingTest.astro.
 */
import { randomInt } from '@tools/shared/lib/random';
import { bottomRowWords, commonWords, homeRowWords } from './words';

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
  /** Words per minute */
  wpm: number;
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
    accuracy: allKeys > 0 ? Math.round((keys.correct / allKeys) * 100) : 0,
    correctWords,
    wrongWords: typed.length - correctWords,
    mistakes,
  };
}

/** A friendly verdict for a speed. Most adults type around 40 words per minute. */
export function rating(wpm: number): string {
  if (wpm >= 90) return 'Pro level. Faster than almost everyone.';
  if (wpm >= 70) return 'Very fast. Much faster than most people.';
  if (wpm >= 50) return 'Fast. Above average.';
  if (wpm >= 35) return 'Average. About as fast as most people.';
  if (wpm >= 20) return 'Getting there. A few minutes of practice a day will speed you up quickly.';
  return 'Beginner. Everyone starts here, so keep practising.';
}

/** 75 → "1:15" */
export function formatTime(seconds: number): string {
  const whole = Math.max(0, Math.round(seconds));
  return `${Math.floor(whole / 60)}:${String(whole % 60).padStart(2, '0')}`;
}

/** 30 → "30 s", 60 → "1 min", 180 → "3 min" */
export function durationLabel(seconds: number): string {
  return seconds < 60 ? `${seconds} s` : `${seconds / 60} min`;
}

// ---------- Practice lessons ----------

/** Lessons on the practice page: ID → name shown in the menu. */
export const LESSONS = {
  common: 'Common words',
  home: 'Home row (A S D F …)',
  top: 'Top row (Q W E R …)',
  bottom: 'Bottom row (Z X C V …)',
  numbers: 'Numbers',
  sentences: 'Capitals & punctuation',
} as const;

export type LessonId = keyof typeof LESSONS;

/** Common words that only need the top row and the home row – and at least one top row key. */
export const topRowWords = commonWords.filter((word) => /^[qwertyuiopasdfghjkl]+$/.test(word) && /[qwertyuiop]/.test(word));

/** The words to type in a lesson. */
export function lessonWords(lesson: LessonId, count: number, random: Random = randomInt): string[] {
  switch (lesson) {
    case 'home':
      return pickWords(homeRowWords, count, random);
    case 'top':
      return pickWords(topRowWords, count, random);
    case 'bottom':
      return pickWords(bottomRowWords, count, random);
    case 'numbers':
      // Numbers with 1 to 4 digits, e.g. "7", "42", "2048"
      return Array.from({ length: count }, () => String(random(10 ** (1 + random(4)))));
    case 'sentences':
      return sentences(pickWords(commonWords, count, random), random);
    default:
      return pickWords(commonWords, count, random);
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
