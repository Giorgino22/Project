/**
 * Pure helpers for the Worker (no network, so they are easy to unit-test):
 * - what we tell the AI (SYSTEM_PROMPT, buildPrompt, ANSWER_SCHEMA)
 * - checking what the page sent (readRequest)
 * - reading the AI's answer safely (extractJson, cleanAnswer)
 */
import { sameSong } from '../lib/songs';
import type { Guess, IdentifyRequest, Round } from '../lib/types';

/** ~30 s of 16 kHz WAV is about 1.3 million base64 characters. A bit more is allowed. */
export const MAX_AUDIO_CHARACTERS = 2_000_000;

/** The AI's standing instructions. */
export const SYSTEM_PROMPT = `You are Humm, a music expert who names songs from a short recording of someone humming,
whistling, singing "na na na" or singing half-remembered words, plus anything else they remember.

How to work:
1. Listen closely: the shape of the melody and its intervals, rhythm, tempo, the vowels and any real words.
2. Write the words you can make out in "words", exactly as they sound, even if they are not real words
   or you are unsure of the language (for example "ke lo kera asere"). Use "" if there are no words.
3. Misheard lyrics are normal: match words by how they sound, across languages, accents and slang.
4. Combine everything with what the person remembers (singer, language, country, year, where they heard it).
5. Suggest up to 5 REAL, existing songs, the most likely first. Never invent songs or artists.
   Write title and artist the way streaming services show them.
6. "confidence" is a whole number from 0 to 100 and must be honest. Humming is hard, low numbers are fine.
7. In "why", say in one short sentence which part of the melody, rhythm, words or hints matches.
   Never write out song lyrics: quote at most five words.
8. Never suggest a song the person already said is wrong.
9. If you are unsure, put ONE short question in "question" that would narrow it down
   (for example "Was it sung by a man or a woman?"). Otherwise use "".
10. In "heard", describe in one sentence what you heard, or say that there was no recording.
Write "heard", "why" and "question" in the language of the person's notes, or in English if there are none.`;

/** Asked for from the second try on: the AI may search Google for the words it heard. */
const SEARCH_INSTRUCTIONS = `Use Google Search before you answer: search for the words you heard and for the person's notes
(put lyric fragments in quotes and add "lyrics" and the singer if known). Prefer songs whose real lyrics match
what you heard.`;

/** With web search, Google can't force the JSON shape, so we describe it in words. */
const JSON_INSTRUCTIONS = `Answer with ONLY one JSON object and no other text, in exactly this shape:
{"heard": "…", "words": "…", "guesses": [{"title": "…", "artist": "…", "year": "…", "confidence": 0, "why": "…"}], "question": "…"}`;

/** The shape of the answer, for the first try (Google then guarantees valid JSON). */
export const ANSWER_SCHEMA = {
  type: 'OBJECT',
  properties: {
    heard: { type: 'STRING' },
    words: { type: 'STRING' },
    guesses: {
      type: 'ARRAY',
      items: {
        type: 'OBJECT',
        properties: {
          title: { type: 'STRING' },
          artist: { type: 'STRING' },
          year: { type: 'STRING' },
          confidence: { type: 'INTEGER' },
          why: { type: 'STRING' },
        },
        required: ['title', 'artist', 'confidence', 'why'],
      },
    },
    question: { type: 'STRING' },
  },
  required: ['heard', 'words', 'guesses'],
};

/**
 * The message for one try. Everything – the visitor's notes, the songs that were wrong, what the
 * visitor said about them – goes into ONE message, so every request is a fresh, simple question.
 */
export function buildPrompt(input: { hasAudio: boolean; hint: string; rounds: Round[]; search: boolean }): string {
  const lines: string[] = [];
  lines.push(
    input.hasAudio
      ? 'The attached recording is the person humming, whistling or singing the song.'
      : 'There is no recording, only what the person remembers.',
  );
  lines.push(input.hint ? `What the person remembers: "${input.hint}"` : 'The person wrote nothing else.');

  const wrong = input.rounds.flatMap((round) => round.guesses);
  if (wrong.length > 0) {
    lines.push('', 'These songs were already suggested and are WRONG – never suggest them again:');
    for (const song of wrong) lines.push(`- "${song.title}" by ${song.artist}`);
    lines.push('', 'What the person said after those suggestions:');
    for (const round of input.rounds) lines.push(`- "${round.feedback}"`);
  }
  if (input.search) lines.push('', SEARCH_INSTRUCTIONS, '', JSON_INSTRUCTIONS);
  lines.push('', 'Which song is it?');
  return lines.join('\n');
}

/** Checks what the page sent. Returns the cleaned request, or an error message for the visitor. */
export function readRequest(body: unknown): IdentifyRequest | string {
  if (typeof body !== 'object' || body === null) return 'The request could not be read.';
  const { audio, hint, rounds } = body as Record<string, unknown>;

  if (audio !== undefined && audio !== null && typeof audio !== 'string') return 'The recording could not be read.';
  if (typeof audio === 'string' && audio.length > MAX_AUDIO_CHARACTERS) return 'The recording is too long. Record at most 30 seconds.';
  const cleanHint = typeof hint === 'string' ? text(hint, 500) : '';
  if (!audio && !cleanHint) return 'Record something or type what you remember first.';

  const cleanRounds: Round[] = [];
  for (const round of Array.isArray(rounds) ? rounds.slice(-8) : []) {
    if (typeof round !== 'object' || round === null) continue;
    const { guesses, feedback } = round as Record<string, unknown>;
    cleanRounds.push({
      guesses: (Array.isArray(guesses) ? guesses.slice(0, 5) : []).map((guess) => {
        const song = (typeof guess === 'object' && guess !== null ? guess : {}) as Record<string, unknown>;
        return { title: text(song.title, 150), artist: text(song.artist, 150) };
      }),
      feedback: text(feedback, 300) || 'None of these are right.',
    });
  }
  return { audio: audio || undefined, hint: cleanHint, rounds: cleanRounds };
}

/**
 * Finds the JSON object in the AI's text. With web search the AI sometimes wraps it in
 * ```json … ``` or writes a sentence before it, so we take everything from the first "{" to the last "}".
 */
export function extractJson(reply: string): unknown {
  const start = reply.indexOf('{');
  const end = reply.lastIndexOf('}');
  if (start === -1 || end <= start) return null;
  try {
    return JSON.parse(reply.slice(start, end + 1));
  } catch {
    return null;
  }
}

/**
 * Turns the AI's answer into a clean, safe shape: only strings and numbers we expect, at most
 * five songs, no duplicates and none of the songs the visitor already said were wrong.
 * Returns null if it isn't a usable answer at all.
 */
export function cleanAnswer(raw: unknown, wrong: Round['guesses'] = []): { heard: string; words: string; guesses: Guess[]; question: string } | null {
  if (typeof raw !== 'object' || raw === null || !Array.isArray((raw as { guesses?: unknown }).guesses)) return null;
  const answer = raw as Record<string, unknown>;

  const guesses: Guess[] = [];
  for (const item of answer.guesses as unknown[]) {
    if (typeof item !== 'object' || item === null) continue;
    const guess = item as Record<string, unknown>;
    const song: Guess = {
      title: text(guess.title, 150),
      artist: text(guess.artist, 150),
      year: text(guess.year, 10),
      confidence: Math.round(Math.min(100, Math.max(0, Number(guess.confidence) || 0))),
      why: text(guess.why, 300),
    };
    if (!song.title || !song.artist) continue;
    if ([...wrong, ...guesses].some((other) => sameSong(other, song))) continue;
    guesses.push(song);
    if (guesses.length === 5) break;
  }
  return { heard: text(answer.heard, 300), words: text(answer.words, 200), guesses, question: text(answer.question, 200) };
}

/** A trimmed single-line string of at most `max` characters (anything else becomes ''). */
function text(value: unknown, max: number): string {
  if (typeof value !== 'string' && typeof value !== 'number') return '';
  return String(value)
    .replace(/[\u0000-\u001f\u007f]+/g, ' ')
    .trim()
    .slice(0, max);
}
