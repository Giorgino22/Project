/**
 * Comparing songs and building links to them. Used by the Worker (to drop songs the visitor
 * already rejected, and to find songs in Wikidata) and by the page (links and previews).
 */
import type { SongIds } from './types';

/** Lower case, no accents, no punctuation, single spaces: "Lo Que Pasó, Pasó" → "lo que paso paso". */
export function simplify(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // the accents, which NFD split off from their letters
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim();
}

/** "El Taxi" by "Osmani García" = "el taxi" by "OSMANI GARCIA" (ignores case, accents and punctuation). */
export function sameSong(a: { title: string; artist: string }, b: { title: string; artist: string }): boolean {
  return simplify(a.title) === simplify(b.title) && simplify(a.artist) === simplify(b.artist);
}

/** "El Taxi (feat. Pitbull & Sensato) [Remix]" → "El Taxi";  "Starman - 2012 Remaster" → "Starman" */
export function withoutExtras(title: string): string {
  return title.replace(/\s*[([].*?[)\]]/g, '').replace(/\s+-\s+.*$/, '');
}

/**
 * How many words two texts share, compared to the shorter one (0 … 1).
 * "David Bowie" vs "1972 single by David Bowie" → 1, because the shorter one is fully inside.
 */
export function wordMatch(a: string, b: string): number {
  const wordsA = new Set(simplify(a).split(' ').filter(Boolean));
  const wordsB = new Set(simplify(b).split(' ').filter(Boolean));
  if (wordsA.size === 0 || wordsB.size === 0) return 0;
  let shared = 0;
  for (const word of wordsA) if (wordsB.has(word)) shared++;
  return shared / Math.min(wordsA.size, wordsB.size);
}

/** Same title, ignoring extras like "(Remastered)": "Starman" = "Starman (2012 Remaster)", but not "Starman Jones". */
export function sameTitle(a: string, b: string): boolean {
  const wordsA = simplify(withoutExtras(a)).split(' ').filter(Boolean);
  const wordsB = simplify(withoutExtras(b)).split(' ').filter(Boolean);
  if (wordsA.length === 0 || wordsB.length === 0) return false;
  const shared = wordsA.filter((word) => wordsB.includes(word)).length;
  return shared / Math.max(wordsA.length, wordsB.length) >= 0.8;
}

/** Little words that say nothing about who the artist is ("The Killers" vs "song by The Weeknd"). */
const FILLER = new Set(['the', 'a', 'an', 'and', 'by', 'of', 'feat', 'ft', 'featuring', 'with', 'de', 'la', 'el', 'los', 'las', 'y', 'und', 'der', 'die', 'das', 'song', 'single']);

/** Does `text` (a Wikidata description or performer) name this artist? Filler words don't count. */
export function namesArtist(text: string, artist: string): boolean {
  const keep = (value: string) => simplify(value).split(' ').filter((word) => word && !FILLER.has(word)).join(' ');
  return wordMatch(keep(artist), keep(text)) >= 0.5;
}

// ---------------------------------------------------------------- IDs and links

/** IDs come from outside (Wikidata), so they are checked before they go into a link or player. */
export const isSpotifyId = (id: unknown): id is string => typeof id === 'string' && /^[A-Za-z0-9]{22}$/.test(id);
export const isYoutubeId = (id: unknown): id is string => typeof id === 'string' && /^[A-Za-z0-9_-]{11}$/.test(id);
export const isAppleId = (id: unknown): id is string => typeof id === 'string' && /^\d{4,15}$/.test(id);

export interface SongLink {
  href: string;
  /** true = straight to the song; false = a search on that service */
  direct: boolean;
}

/** The song on Spotify. With its ID, phones open it right in the Spotify app. */
export function spotifyLink(ids: SongIds | undefined, title: string, artist: string): SongLink {
  if (isSpotifyId(ids?.spotify)) return { href: `https://open.spotify.com/track/${ids.spotify}`, direct: true };
  return { href: `https://open.spotify.com/search/${encodeURIComponent(`${title} ${artist}`)}`, direct: false };
}

/** The song's video on YouTube (or a YouTube search). */
export function youtubeLink(ids: SongIds | undefined, title: string, artist: string): SongLink {
  if (isYoutubeId(ids?.youtube)) return { href: `https://www.youtube.com/watch?v=${ids.youtube}`, direct: true };
  return { href: `https://www.youtube.com/results?search_query=${encodeURIComponent(`${title} ${artist}`)}`, direct: false };
}

/** The song on Apple Music – only when its ID is known (Apple's search is unreliable). */
export function appleMusicLink(ids: SongIds | undefined): string | null {
  return isAppleId(ids?.apple) ? `https://music.apple.com/song/${ids.apple}` : null;
}
