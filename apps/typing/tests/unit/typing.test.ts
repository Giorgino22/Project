import { describe, expect, it } from 'vitest';
import { dictionaries, languages } from '../../src/i18n';
import { keyboards, keyName, mainBlock, navBlock, qwertzMainBlock, type Key } from '../../src/lib/keyboard';
import {
  countKeystrokes,
  durationLabel,
  formatTime,
  germanTopRowWords,
  LESSON_IDS,
  lessonWords,
  pickWords,
  ratingLevel,
  scoreTest,
  sentences,
  topRowWords,
  wordSets,
} from '../../src/lib/typing';
import { bottomRowWords, commonWords, homeRowWords, kidWords } from '../../src/lib/words';
import { germanBottomRowWords, germanCommonWords, germanHomeRowWords, germanKidWords } from '../../src/lib/words-de';
import { alternatesOf, getAllPages, pagePath } from '../../src/site';

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

  it('German lists: no duplicates, real German spelling, fair for Swiss keyboards', () => {
    for (const list of [germanCommonWords, germanKidWords, germanHomeRowWords, germanBottomRowWords]) {
      expect(new Set(list).size).toBe(list.length);
      for (const word of list) {
        // Letters and umlauts only, a capital only at the start (nouns), never an umlaut at the start
        // (Ü, Ö, Ä are awkward on Swiss keyboards) and never ß (Swiss keyboards have no ß key).
        expect(word).toMatch(/^[A-Za-z][a-zäöü]*$/);
        expect(word).toBe(word.normalize('NFC')); // "ü" as one character, like a keyboard types it
      }
    }
    expect(germanCommonWords.length).toBeGreaterThan(300);
    expect(germanCommonWords.some((word) => /[äöü]/.test(word))).toBe(true);
    expect(germanCommonWords.some((word) => /^[A-Z]/.test(word))).toBe(true); // nouns are capitalised
  });

  it('German lesson words only use the keys of their row on a QWERTZ keyboard', () => {
    for (const word of germanHomeRowWords) expect(word).toMatch(/^[asdfghjklöä]+$/);
    for (const word of germanBottomRowWords) expect(word).toMatch(/^[asdfghjklöäyxcvbnm]+$/);
    for (const word of germanTopRowWords) expect(word).toMatch(/^[qwertzuiopüasdfghjklöä]+$/);
    expect(germanTopRowWords.length).toBeGreaterThan(40);
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
    expect(result).toEqual({ wpm: 12, cpm: 60, accuracy: 100, correctWords: 10, wrongWords: 0, mistakes: [] });
  });

  it('counts Anschläge (characters per minute) the German way: every correct character incl. the space', () => {
    // "Haus " + "Brücke " = 12 characters in 30 seconds → 24 Anschläge per minute
    const result = scoreTest(['Haus', 'Brücke'], ['Haus', 'Brücke'], { correct: 10, wrong: 0 }, 30);
    expect(result.cpm).toBe(24);
    expect(result.wpm).toBe(5); // 24 ÷ 5 rounded
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
    expect(durationLabel(30, dictionaries.de.test)).toBe('30 Sek.');
    expect(durationLabel(300, dictionaries.de.test)).toBe('5 Min.');
  });

  it('rates every speed, in every language', () => {
    const rating = (wpm: number) => dictionaries.en.ratings[ratingLevel(wpm)];
    expect(rating(0)).toMatch(/Beginner/);
    expect(rating(40)).toMatch(/Average/);
    expect(rating(120)).toMatch(/Pro/);
    expect(dictionaries.de.ratings[ratingLevel(40)]).toMatch(/Durchschnitt/);
    for (const lang of languages) expect(dictionaries[lang].ratings, lang).toHaveLength(6);
  });
});

describe('lessons', () => {
  it('every lesson gives the wanted number of words, in every language', () => {
    for (const set of Object.values(wordSets)) {
      for (const lesson of LESSON_IDS) {
        const words = lessonWords(lesson, 30, undefined, set);
        expect(words, lesson).toHaveLength(30);
        for (const word of words) expect(word.length, lesson).toBeGreaterThan(0);
      }
    }
    for (const number of lessonWords('numbers', 50)) expect(number).toMatch(/^\d{1,4}$/);
    for (const word of lessonWords('home', 30, undefined, wordSets.de)) expect(word).toMatch(/^[asdfghjklöä]+$/);
  });

  it('every language names every lesson', () => {
    for (const lang of languages) expect(Object.keys(dictionaries[lang].lessons).sort(), lang).toEqual([...LESSON_IDS].sort());
  });

  it('turns words into sentences', () => {
    // Fake random numbers: no commas, end every sentence as early as possible with a full stop.
    const result = sentences(['the', 'cat', 'sat', 'down', 'and', 'slept'], sequence(1, 0, 0));
    expect(result[0]).toBe('The');
    expect(result.at(-1)).toMatch(/[.?!]$/);
    expect(result.join(' ')).toMatch(/^[A-Z]/);
  });
});

describe('keyboard layouts', () => {
  /** Width of each row – a key that is two rows tall (QWERTZ Enter) also fills the row below it. */
  const rowWidths = (rows: Key[][]) =>
    rows.map((row, i) => {
      const fromAbove = (rows[i - 1] ?? []).filter((key) => key.rows === 2);
      return [...row, ...fromAbove].reduce((sum, key) => sum + key.width, 0);
    });

  it('every key exists once and every row has the full width', () => {
    for (const [name, board] of Object.entries(keyboards)) {
      const codes = [...board.main, ...board.nav].flat().map((key) => key.code).filter(Boolean);
      expect(new Set(codes).size, name).toBe(codes.length);
      expect(rowWidths(board.main), name).toEqual([15, 15, 15, 15, 15, 15]);
      expect(rowWidths(board.nav), name).toEqual([3, 3, 3, 3, 3, 3]);
    }
  });

  it('every key width fits the grid (quarter units)', () => {
    for (const board of Object.values(keyboards)) {
      for (const key of [...board.main, ...board.nav].flat()) expect(Number.isInteger(key.width * 4)).toBe(true);
    }
    expect(mainBlock).toBe(keyboards.us.main);
    expect(navBlock).toBe(keyboards.us.nav);
  });

  it('the QWERTZ keyboard has Z and Y swapped, umlaut keys and Swiss labels', () => {
    const keys = new Map(qwertzMainBlock.flat().map((key) => [key.code, key]));
    expect(keys.get('KeyY')?.label).toBe('Z'); // where US keyboards have Y
    expect(keys.get('KeyZ')?.label).toBe('Y');
    expect(keys.get('Semicolon')?.label).toBe('Ö');
    expect(keys.get('Quote')?.label).toBe('Ä');
    expect(keys.get('BracketLeft')?.label).toBe('Ü');
    expect(keys.get('Minus')?.label).toBe('ß');
    expect(keys.get('IntlBackslash')?.label).toBe('<'); // the extra key of ISO keyboards
    expect(keys.get('Minus')?.ch).toBe("'"); // Swiss keyboards: no ß
    expect(keys.get('Backslash')?.ch).toBe('$');
    expect(keys.get('Enter')?.rows).toBe(2);
  });

  it('names special keys in the page language', () => {
    expect(keyName(' ')).toBe('Space');
    expect(keyName(' ', dictionaries.de.keyboard)).toBe('Leertaste');
    expect(keyName('Dead', dictionaries.de.keyboard)).toBe('Tottaste (Akzent)');
    expect(keyName('ä', dictionaries.de.keyboard)).toBe('ä');
  });
});

describe('pages and languages', () => {
  it('every page exists in every language, at its own address', () => {
    const pages = getAllPages();
    expect(pages).toHaveLength(languages.length * Object.keys(dictionaries.en.pages).length);
    expect(new Set(pages.map((page) => page.path)).size).toBe(pages.length);
    for (const page of pages) {
      expect(page.path, page.path).toMatch(page.lang === 'en' ? /^\/([a-z0-9-]+\/)?$/ : /^\/de\/([a-z0-9-]+\/)?$/);
      expect(alternatesOf(page.key).map((version) => version.lang)).toEqual(languages);
    }
  });

  it('German pages have German addresses', () => {
    expect(pagePath('home', 'de')).toBe('/de/');
    expect(pagePath('threeMinutes', 'de')).toBe('/de/3-minuten-tipptest/');
    expect(pagePath('fiveMinutes', 'de')).toBe('/de/5-minuten-tipptest/');
    expect(pagePath('practice', 'de')).toBe('/de/tippen-ueben/');
    expect(pagePath('kids', 'de')).toBe('/de/tipptest-fuer-kinder/');
    expect(pagePath('keyboard', 'de')).toBe('/de/tastaturtest/');
  });

  it('titles and descriptions fit into Google results', () => {
    for (const page of getAllPages()) {
      expect(page.title.length, page.path).toBeLessThanOrEqual(65);
      expect(page.description.length, page.path).toBeGreaterThanOrEqual(60);
      expect(page.description.length, page.path).toBeLessThanOrEqual(170);
    }
  });

  it('the German pages test with German words, Anschläge and a QWERTZ keyboard', () => {
    expect(dictionaries.de.test.measure).toBe('cpm');
    expect(dictionaries.de.keyboard.board).toBe('qwertz');
    expect(dictionaries.de.keyboard.variants.map((variant) => variant.id)).toEqual(['de', 'ch']);
    expect(dictionaries.en.test.measure).toBe('wpm');
    expect(dictionaries.en.keyboard.board).toBe('us');
  });
});
