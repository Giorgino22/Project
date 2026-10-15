/**
 * What the page and the Worker (src/worker/) send each other. Both import these types, so
 * TypeScript notices when one side changes and the other doesn't.
 */

/** What the page sends to /api/identify. */
export interface IdentifyRequest {
  /** The recording as a base64 WAV file (16 kHz, mono), if there is one */
  audio?: string;
  /** What the visitor typed: words, the singer, where they heard it … */
  hint?: string;
  /** Earlier tries of this search: what Humm suggested and what the visitor said about it */
  rounds?: Round[];
}

export interface Round {
  guesses: { title: string; artist: string }[];
  /** e.g. "older, a woman sings" – or "None of these are right." */
  feedback: string;
}

export interface Preview {
  /** The 30-second preview (an audio file on Apple's servers) */
  audioUrl: string;
  /** The song's page on Apple Music */
  appleUrl: string;
}

export interface Guess {
  title: string;
  artist: string;
  /** e.g. "2014", or '' */
  year: string;
  /** 0–100: how sure the AI is */
  confidence: number;
  /** One sentence: why this song matches */
  why: string;
  preview?: Preview;
}

/** What /api/identify answers. */
export interface Answer {
  /** What the AI heard, e.g. "A fast melody sung by a man, with Spanish words" */
  heard: string;
  /** Words it could make out, written as they sound ('' if none) */
  words: string;
  guesses: Guess[];
  /** A question that would help narrow it down, or '' */
  question: string;
  /** true = the AI searched the web (Google) for this answer */
  searched: boolean;
  /** Google's search suggestions as ready-made HTML. Google requires us to show them next to a searched answer. */
  searchSuggestions?: string;
  /** The web pages the search used */
  sources?: { title: string; url: string }[];
  /** Which AI model answered (shown small under the results) */
  model: string;
}
