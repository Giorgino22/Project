import { describe, expect, it } from 'vitest';
import { mainBlock, navBlock } from '../../src/lib/keyboard';
import {
  countKeystrokes,
  durationLabel,
  formatTime,
  LESSONS,
  lessonWords,
  pickWords,
  rating,
  scoreTest,
  sentences,
  topRowWords,
  type LessonId,
} from '../../src/lib/typing';
import { bottomRowWords, commonWords, homeRowWords, kidWords } from '../../src/lib/words';

/** A fake random generator that always returns the same numbers in a loop – makes tests repeatable. */
const sequence = (...numbers: number[]) => {
  let i = 0;
  return (max: number) => numbers[i++ % numbers.length]! % max;
};

describe('word lists', () => {
  it('have no duplicates and only lowercase letters', () => {
    for (const list of [commonWords, kidWords, homeRowWords, bottomRowWords]) {
      expect(new Set(list).size).toBe(list.length);
      for (const word of list) expect(word).toMatch(/^[a-z]+$/);
    }
    expect(commonWords.length).toBeGreaterThan(300);
  });

  it('lesson words only use the keys of their row', () => {
    for (const word of homeRowWords) expect(word).toMatch(/^[asdfghjkl]+$/);
    for (const word of bottomRowWords) expect(word).toMatch(/^[asdfghjklzxcvbnm]+$/);
    for (const word of topRowWords) expect(word).toMatch(/^[qwertyuiopasdfghjkl]+$/);
    expect(topRowWords.length).toBeGreaterThan(40);
  });
});

describe('pickWords', () => {
  it('returns the wanted number of words and never repeats a word directly', () => {
    const words = pickWords(['a', 'b', 'c'], 500);
    expect(words).toHaveLength(500);
    for (let i = 1; i < words.length; i++) expect(words[i]).not.toBe(words[i - 1]);
  });

  it('copes with a list of one word', () => {
    expect(pickWords(['only'], 3)).toEqual(['only', 'only', 'only']);
  });
});

describe('countKeystrokes', () => {
  it('counts a new correct or wrong letter', () => {
    expect(countKeystrokes('house', 'ho', 'hou')).toEqual({ correct: 1, wrong: 0 });
    expect(countKeystrokes('house', 'ho', 'hox')).toEqual({ correct: 0, wrong: 1 });
  });

  it('ignores deleting', () => {
    expect(countKeystrokes('house', 'hox', 'ho')).toEqual({ correct: 0, wrong: 0 });
  });

  it('counts letters typed beyond the end of the word as wrong', () => {
    expect(countKeystrokes('cat', 'cat', 'cats')).toEqual({ correct: 0, wrong: 1 });
  });

  it('handles several letters at once (autocorrect, pasting)', () => {
    expect(countKeystrokes('the', 'teh', 'the')).toEqual({ correct: 2, wrong: 0 });
    expect(countKeystrokes('the', '', 'the')).toEqual({ correct: 3, wrong: 0 });
  });
});

describe('scoreTest', () => {
  it('calculates words per minute from correct words (5 characters = 1 word)', () => {
    // 10 correct five-letter words: 10 × (5 letters + space) = 60 characters = 12 words in one minute
    const words = Array<string>(10).fill('house');
    const result = scoreTest(words, words, { correct: 50, wrong: 0 }, 60);
    expect(result).toEqual({ wpm: 12, accuracy: 100, correctWords: 10, wrongWords: 0, mistakes: [] });
  });

  it('scales to the test length', () => {
    const words = Array<string>(10).fill('house');
    expect(scoreTest(words, words, { correct: 50, wrong: 0 }, 30).wpm).toBe(24);
  });

  it('ignores wrong words for the speed and lists them once', () => {
    const result = scoreTest(['house', 'cat', 'cat'], ['house', 'cot', 'cut'], { correct: 9, wrong: 2 }, 60);
    expect(result.wpm).toBe(1); // only "house " = 6 characters
    expect(result.correctWords).toBe(1);
    expect(result.wrongWords).toBe(2);
    expect(result.mistakes).toEqual(['cat']);
    expect(result.accuracy).toBe(82); // 9 of 11
  });

  it('counts left-out letters as mistakes', () => {
    // "hou" instead of "house": 3 correct keys, 2 letters missing → 60 %
    expect(scoreTest(['house'], ['hou'], { correct: 3, wrong: 0 }, 60).accuracy).toBe(60);
  });

  it('gives 0 when nothing was typed', () => {
    expect(scoreTest(['a'], [], { correct: 0, wrong: 0 }, 0)).toMatchObject({ wpm: 0, accuracy: 0 });
  });
});

describe('texts and times', () => {
  it('formats times and test lengths', () => {
    expect(formatTime(60)).toBe('1:00');
    expect(formatTime(75)).toBe('1:15');
    expect(formatTime(9)).toBe('0:09');
    expect(formatTime(-3)).toBe('0:00');
    expect(durationLabel(30)).toBe('30 s');
    expect(durationLabel(180)).toBe('3 min');
  });

  it('rates every speed', () => {
    expect(rating(0)).toMatch(/Beginner/);
    expect(rating(40)).toMatch(/Average/);
    expect(rating(120)).toMatch(/Pro/);
  });
});

describe('lessons', () => {
  it('every lesson gives the wanted number of words', () => {
    for (const lesson of Object.keys(LESSONS) as LessonId[]) {
      const words = lessonWords(lesson, 30);
      expect(words, lesson).toHaveLength(30);
      for (const word of words) expect(word.length, lesson).toBeGreaterThan(0);
    }
    for (const number of lessonWords('numbers', 50)) expect(number).toMatch(/^\d{1,4}$/);
  });

  it('turns words into sentences', () => {
    // Fake random numbers: no commas, end every sentence as early as possible with a full stop.
    const result = sentences(['the', 'cat', 'sat', 'down', 'and', 'slept'], sequence(1, 0, 0));
    expect(result[0]).toBe('The');
    expect(result.at(-1)).toMatch(/[.?!]$/);
    expect(result.join(' ')).toMatch(/^[A-Z]/);
  });
});

describe('keyboard layout', () => {
  it('every key exists once and every row has the full width', () => {
    const codes = [...mainBlock, ...navBlock].flat().map((key) => key.code).filter(Boolean);
    expect(new Set(codes).size).toBe(codes.length);
    for (const row of mainBlock) expect(row.reduce((sum, key) => sum + key.width, 0)).toBe(15);
    for (const row of navBlock) expect(row.reduce((sum, key) => sum + key.width, 0)).toBe(3);
  });

  it('every key width fits the grid (quarter units)', () => {
    for (const key of [...mainBlock, ...navBlock].flat()) expect(Number.isInteger(key.width * 4)).toBe(true);
  });
});
