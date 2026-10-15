/**
 * Comparing songs and building links to them. Used by the Worker (to drop songs the visitor
 * already rejected) and by the page (to pick the right Apple preview and to open Spotify/YouTube).
 */

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

// ---------------------------------------------------------------- Apple previews

/** The fields of an Apple (iTunes Search API) result that we use. */
export interface ItunesTrack {
  trackName?: string;
  artistName?: string;
  previewUrl?: string;
  trackViewUrl?: string;
}

/** Versions nobody is looking for, unless the AI suggested exactly that. */
const UNWANTED = /\b(karaoke|tribute|instrumental|made famous|cover|8 bit|lullaby)\b/;

/**
 * Apple's result whose title AND artist match the suggested song best, or null if none matches
 * well enough – a wrong preview (or a karaoke version) would be worse than none.
 */
export function pickBestMatch(tracks: ItunesTrack[], title: string, artist: string): ItunesTrack | null {
  const wantsUnusual = UNWANTED.test(simplify(title));
  let best: ItunesTrack | null = null;
  let bestScore = 0;
  for (const track of tracks) {
    if (!track.previewUrl || !track.trackName || !track.artistName) continue;
    if (!wantsUnusual && UNWANTED.test(simplify(track.trackName))) continue;
    const titleMatch = overlap(withoutExtras(track.trackName), withoutExtras(title));
    const artistMatch = overlap(track.artistName, artist);
    if (titleMatch < 0.6 || artistMatch < 0.3) continue;
    const score = 2 * titleMatch + artistMatch;
    if (score > bestScore) {
      best = track;
      bestScore = score;
    }
  }
  return best;
}

/** "El Taxi (feat. Pitbull & Sensato) [Remix]" → "El Taxi" */
function withoutExtras(title: string): string {
  return title.replace(/\s*[([].*?[)\]]/g, '').replace(/\s+-\s+.*$/, '');
}

/**
 * How many words two names share, compared to the shorter one (0 … 1).
 * "Osmani García" vs "Osmani García, Pitbull & Sensato" → 1, because the shorter one is fully inside.
 */
function overlap(a: string, b: string): number {
  const wordsA = new Set(simplify(a).split(' ').filter(Boolean));
  const wordsB = new Set(simplify(b).split(' ').filter(Boolean));
  if (wordsA.size === 0 || wordsB.size === 0) return 0;
  let shared = 0;
  for (const word of wordsA) if (wordsB.has(word)) shared++;
  return shared / Math.min(wordsA.size, wordsB.size);
}

// ---------------------------------------------------------------- Spotify and YouTube

/**
 * A link that opens the song on Spotify or YouTube.
 *
 * Finding the song's own page there needs Spotify's or YouTube's API (with keys and limits that
 * don't fit a free public site). Instead the link asks DuckDuckGo: a search that starts with "\"
 * jumps straight to the first result ("I'm feeling ducky"), which is almost always the song.
 * If not, the visitor simply lands on the search results.
 */
export function songLink(service: 'spotify' | 'youtube', title: string, artist: string): string {
  // Spotify's song pages are called "… – song and lyrics by …", so "song" helps find the song page.
  const query = service === 'spotify' ? `\\${title} ${artist} song site:open.spotify.com` : `\\${title} ${artist} site:youtube.com`;
  return `https://duckduckgo.com/?q=${encodeURIComponent(query)}`;
}
