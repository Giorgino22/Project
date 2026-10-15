/**
 * 30-second song previews from Apple's free iTunes Search API
 * (https://performance-partners.apple.com/search-api – no key needed, about 20 searches a minute).
 *
 * For each song the AI suggests, we search Apple's catalogue and keep the result only if title
 * AND artist really match – otherwise the visitor would hear a different song (or a karaoke version).
 */
import type { Preview } from '../lib/types';
import { simplify } from './answer';

/** The fields of an iTunes search result that we use. */
export interface ItunesTrack {
  trackName?: string;
  artistName?: string;
  previewUrl?: string;
  trackViewUrl?: string;
}

/** Versions nobody is looking for, unless the AI suggested exactly that. */
const UNWANTED = /\b(karaoke|tribute|instrumental|made famous|cover|8 bit|lullaby)\b/;

export async function findPreview(title: string, artist: string): Promise<Preview | undefined> {
  const query = new URLSearchParams({ term: `${artist} ${title}`, media: 'music', entity: 'song', limit: '10' });
  try {
    const response = await fetch(`https://itunes.apple.com/search?${query}`, {
      // Say who is asking – some servers refuse requests without these.
      headers: { 'user-agent': 'Humm/1.0 (+https://humm.toolstin.com)', accept: 'application/json' },
      signal: AbortSignal.timeout(5000),
      // Cloudflare keeps the answer for a day, so popular songs don't use up Apple's limit.
      cf: { cacheTtl: 86_400, cacheEverything: true },
    } as RequestInit);
    // The log (Cloudflare → humm → Observability → Logs) shows why a preview is missing.
    if (!response.ok) {
      console.log(`preview: Apple answered ${response.status}`);
      return undefined;
    }
    const data = (await response.json()) as { results?: ItunesTrack[] };
    const track = pickBestMatch(data.results ?? [], title, artist);
    if (!track?.previewUrl || !track.trackViewUrl || !isHttps(track.previewUrl) || !isHttps(track.trackViewUrl)) {
      console.log(`preview: no matching song among ${data.results?.length ?? 0} results`);
      return undefined;
    }
    return { audioUrl: track.previewUrl, appleUrl: track.trackViewUrl };
  } catch {
    console.log('preview: no answer from Apple');
    return undefined; // no preview – the YouTube and Spotify links still work
  }
}

/** The search result whose title and artist match best, or null if none matches well enough. */
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

function isHttps(url: string): boolean {
  try {
    return new URL(url).protocol === 'https:';
  } catch {
    return false;
  }
}
