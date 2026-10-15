/**
 * Finds each suggested song in Wikidata – the free, open database behind Wikipedia (CC0: anyone
 * may use it, also commercially; no key needed) – and reads its IDs on Spotify, YouTube and Apple
 * Music. With them the page links straight to the song and can play a preview.
 *
 * How, for every song (all at the same time):
 * 1. Search Wikidata for the title → items called "Starman" (a song, a film, a comic …).
 * 2. Keep the items whose name matches the title and whose description ("1972 single by David
 *    Bowie") or performer matches the artist.
 * 3. Read their IDs: Spotify track ID (P2207), YouTube video ID (P1651), Apple Music track ID (P10110).
 * Wikidata doesn't know every song – then the page links to a search on Spotify/YouTube instead.
 */
import { isAppleId, isSpotifyId, isYoutubeId, namesArtist, sameTitle, withoutExtras } from '../lib/songs';
import type { Guess, SongIds } from '../lib/types';

const API = 'https://www.wikidata.org/w/api.php';
// Wikimedia asks every program to say who it is.
const HEADERS = { 'user-agent': 'Humm/1.0 (+https://humm.toolstin.com)', accept: 'application/json' };

/** Wikidata's numbers ("properties") for the IDs we read, and for "performer". */
const PROPERTY = { spotify: 'P2207', youtube: 'P1651', apple: 'P10110', performer: 'P175' } as const;

/** One search result of wbsearchentities */
export interface SearchHit {
  id: string;
  label?: string;
  description?: string;
}

/** The part of a Wikidata item we read */
export interface Item {
  claims?: Record<string, { rank?: string; mainsnak?: { datavalue?: { value?: unknown } } }[]>;
  labels?: Record<string, { value?: string }>;
}

/** Adds `ids` to every song Wikidata knows. Never throws and never takes longer than `timeoutMs`. */
export async function addSongIds(guesses: Guess[], timeoutMs = 4000): Promise<void> {
  const deadline = AbortSignal.timeout(timeoutMs);
  try {
    // 1. Search all titles at the same time.
    const hits = await Promise.all(guesses.map((guess) => searchTitle(guess.title, deadline)));
    const candidates = guesses.map((guess, i) => matchingTitles(hits[i]!, guess.title));
    const itemIds = [...new Set(candidates.flat().map((hit) => hit.id))];
    if (itemIds.length === 0) return;

    // 2. Read the candidates, then the names of their performers (one request each, for all songs).
    const items = await getItems(itemIds, 'claims', deadline);
    const performerIds = [...new Set(itemIds.flatMap((id) => itemValues(items[id], PROPERTY.performer)))].filter((id) => /^Q\d+$/.test(id));
    const performers = performerIds.length > 0 ? await getItems(performerIds, 'labels', deadline) : {};

    // 3. Pick each song's IDs.
    let found = 0;
    guesses.forEach((guess, i) => {
      const ids = pickIds(guess.artist, candidates[i]!, items, performers);
      if (ids) {
        guess.ids = ids;
        found++;
      }
    });
    console.log(`ids: Wikidata knew ${found} of ${guesses.length} songs`);
  } catch (error) {
    // Only the reason is logged, never the songs.
    console.log(`ids: Wikidata failed (${error instanceof Error ? error.message : 'unknown'})`);
  }
}

/** Search hits whose name is the song's title (at most 5) – "Starman" for "Starman (2012 Remaster)". */
export function matchingTitles(hits: SearchHit[], title: string): SearchHit[] {
  return hits.filter((hit) => hit.label && sameTitle(hit.label, title)).slice(0, 5);
}

/**
 * The IDs of the first candidates that are really by this artist (the description or a performer
 * names the artist). Different items can hold different IDs – e.g. the "song" has the YouTube
 * video and the "single" the Spotify track – so the IDs of all matching items are combined.
 */
export function pickIds(artist: string, candidates: SearchHit[], items: Record<string, Item>, performers: Record<string, Item>): SongIds | undefined {
  const ids: SongIds = {};
  for (const hit of candidates) {
    const item = items[hit.id];
    if (!item) continue;
    const performerNames = itemValues(item, PROPERTY.performer).map((id) => performers[id]?.labels?.en?.value ?? '');
    const byArtist = namesArtist(hit.description ?? '', artist) || performerNames.some((name) => name && namesArtist(name, artist));
    if (!byArtist) continue;
    ids.spotify ??= itemValues(item, PROPERTY.spotify).find(isSpotifyId);
    ids.youtube ??= itemValues(item, PROPERTY.youtube).find(isYoutubeId);
    ids.apple ??= itemValues(item, PROPERTY.apple).find(isAppleId);
  }
  // Leave out empty entries so the answer stays small.
  const known = Object.fromEntries(Object.entries(ids).filter(([, value]) => value)) as SongIds;
  return Object.keys(known).length > 0 ? known : undefined;
}

/**
 * The values of one property of an item, best first. Wikidata can rank values: "preferred"
 * (e.g. the original recording) comes first, "deprecated" (known to be wrong) is skipped.
 * Text values (IDs) are returned as they are, item links ({ id: "Q5383" }) as their Q-number.
 */
export function itemValues(item: Item | undefined, property: string): string[] {
  const statements = item?.claims?.[property] ?? [];
  return statements
    .filter((statement) => statement.rank !== 'deprecated')
    .sort((a, b) => Number(b.rank === 'preferred') - Number(a.rank === 'preferred'))
    .map((statement) => statement.mainsnak?.datavalue?.value)
    .map((value) => (typeof value === 'string' ? value : typeof value === 'object' && value && 'id' in value ? String(value.id) : ''))
    .filter(Boolean);
}

async function searchTitle(title: string, signal: AbortSignal): Promise<SearchHit[]> {
  const query = new URLSearchParams({ action: 'wbsearchentities', search: withoutExtras(title), language: 'en', uselang: 'en', type: 'item', limit: '10', format: 'json' });
  const data = (await getJson(`${API}?${query}`, signal)) as { search?: SearchHit[] };
  return data.search ?? [];
}

async function getItems(ids: string[], props: 'claims' | 'labels', signal: AbortSignal): Promise<Record<string, Item>> {
  // Wikidata answers up to 50 items per request.
  const query = new URLSearchParams({ action: 'wbgetentities', ids: ids.slice(0, 50).join('|'), props, languages: 'en', format: 'json' });
  const data = (await getJson(`${API}?${query}`, signal)) as { entities?: Record<string, Item> };
  return data.entities ?? {};
}

async function getJson(url: string, signal: AbortSignal): Promise<unknown> {
  const response = await fetch(url, {
    headers: HEADERS,
    signal,
    // Cloudflare keeps answers for a day, so popular songs are quick and Wikidata isn't asked again.
    cf: { cacheTtl: 86_400, cacheEverything: true },
  } as RequestInit);
  if (!response.ok) throw new Error(`status ${response.status}`);
  return response.json();
}
