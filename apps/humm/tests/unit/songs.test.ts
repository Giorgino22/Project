import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { appleMusicLink, isSpotifyId, isYoutubeId, namesArtist, sameTitle, spotifyLink, youtubeLink } from '../../src/lib/songs';
import { addSongIds, itemValues, matchingTitles, pickIds, type Item, type SearchHit } from '../../src/worker/songids';
import type { Guess } from '../../src/lib/types';

// A small piece of Wikidata, shaped like its real answers
const hits: SearchHit[] = [
  { id: 'Q1', label: 'Starman', description: '1972 single by David Bowie' },
  { id: 'Q2', label: 'Starman', description: '1984 film by John Carpenter' },
  { id: 'Q3', label: 'Starman Jones', description: 'novel by Robert A. Heinlein' },
  { id: 'Q4', label: 'Starman', description: 'song' }, // no artist in the description …
];
const statement = (value: unknown, rank = 'normal') => ({ rank, mainsnak: { datavalue: { value } } });
const items: Record<string, Item> = {
  Q1: {
    claims: {
      P2207: [statement('0pQskrTITgmCMyr85tb9qq')],
      P1651: [statement('AAAAAAAAAAA', 'deprecated'), statement('BBBBBBBBBBB'), statement('tRcPA7Fzebw', 'preferred')],
      P175: [statement({ id: 'Q5383' })],
    },
  },
  Q2: { claims: { P2207: [statement('zzzzzzzzzzzzzzzzzzzzzz')] } }, // the film – must never be used
  Q4: { claims: { P10110: [statement('1440939938')], P175: [statement({ id: 'Q5383' })] } }, // … but its performer is Bowie
};
const performers: Record<string, Item> = { Q5383: { labels: { en: { value: 'David Bowie' } } } };

describe('finding a song in Wikidata', () => {
  it('keeps only items with the same title', () => {
    expect(matchingTitles(hits, 'Starman (2012 Remaster)').map((hit) => hit.id)).toEqual(['Q1', 'Q2', 'Q4']);
    expect(sameTitle('Lo Que Pasó, Pasó', 'lo que paso paso')).toBe(true);
    expect(sameTitle('Starman', 'Starman Jones')).toBe(false);
  });

  it('reads the IDs of the items by this artist and combines them', () => {
    expect(pickIds('David Bowie', matchingTitles(hits, 'Starman'), items, performers)).toEqual({
      spotify: '0pQskrTITgmCMyr85tb9qq',
      youtube: 'tRcPA7Fzebw', // the "preferred" value wins, the "deprecated" one is skipped
      apple: '1440939938', // from the item whose performer is Bowie
    });
  });

  it('finds nothing for another artist', () => {
    expect(pickIds('The Killers', matchingTitles(hits, 'Starman'), items, performers)).toBeUndefined();
  });

  it('ignores IDs that are not well-formed', () => {
    const odd: Record<string, Item> = { Q1: { claims: { P2207: [statement('not-an-id')], P1651: [statement('javascript:x')] } } };
    expect(pickIds('David Bowie', [hits[0]!], odd, {})).toBeUndefined();
  });

  it('matches artists by their real names, not by little words', () => {
    expect(namesArtist('song by Gente de Zona and Marc Anthony', 'Gente de Zona feat. Marc Anthony')).toBe(true);
    expect(namesArtist('song by Osmani García', 'Osmani García, Pitbull & Sensato')).toBe(true);
    expect(namesArtist('song by The Weeknd', 'The Killers')).toBe(false);
  });

  it('reads item links as Q-numbers', () => {
    expect(itemValues(items.Q1, 'P175')).toEqual(['Q5383']);
    expect(itemValues(undefined, 'P175')).toEqual([]);
  });
});

describe('asking Wikidata (with a fake internet)', () => {
  const guess = (): Guess => ({ title: 'Starman', artist: 'David Bowie', year: '1972', confidence: 70, why: '' });
  beforeEach(() => vi.spyOn(console, 'log').mockImplementation(() => {}));
  afterEach(() => vi.unstubAllGlobals());

  it('adds the IDs to the songs', async () => {
    const asked: string[] = [];
    vi.stubGlobal(
      'fetch',
      vi.fn(async (url: string) => {
        asked.push(url);
        const params = new URL(url).searchParams;
        if (params.get('action') === 'wbsearchentities') return Response.json({ search: hits });
        if (params.get('props') === 'claims') return Response.json({ entities: items });
        return Response.json({ entities: performers });
      }),
    );
    const songs = [guess()];
    await addSongIds(songs);
    expect(songs[0]!.ids).toEqual({ spotify: '0pQskrTITgmCMyr85tb9qq', youtube: 'tRcPA7Fzebw', apple: '1440939938' });
    expect(asked.every((url) => url.startsWith('https://www.wikidata.org/w/api.php?'))).toBe(true);
    expect(asked).toHaveLength(3); // search, items, performers
  });

  it('carries on without IDs when Wikidata fails or is slow', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response('busy', { status: 503 })));
    const songs = [guess()];
    await expect(addSongIds(songs)).resolves.toBeUndefined();
    expect(songs[0]!.ids).toBeUndefined();

    vi.stubGlobal(
      'fetch',
      vi.fn((_url: string, init?: RequestInit) => new Promise<Response>((_resolve, reject) => init?.signal?.addEventListener('abort', () => reject(new Error('timeout'))))),
    );
    const started = Date.now();
    await addSongIds(songs, 50);
    expect(Date.now() - started).toBeLessThan(1000);
  });
});

describe('links', () => {
  it('go straight to the song when the IDs are known', () => {
    const ids = { spotify: '0pQskrTITgmCMyr85tb9qq', youtube: 'tRcPA7Fzebw', apple: '1440939938' };
    expect(spotifyLink(ids, 'Starman', 'David Bowie')).toEqual({ href: 'https://open.spotify.com/track/0pQskrTITgmCMyr85tb9qq', direct: true });
    expect(youtubeLink(ids, 'Starman', 'David Bowie')).toEqual({ href: 'https://www.youtube.com/watch?v=tRcPA7Fzebw', direct: true });
    expect(appleMusicLink(ids)).toBe('https://music.apple.com/song/1440939938');
  });

  it('search on the service when they are not', () => {
    expect(spotifyLink(undefined, 'Rock & Roll', 'AC/DC')).toEqual({ href: 'https://open.spotify.com/search/Rock%20%26%20Roll%20AC%2FDC', direct: false });
    expect(youtubeLink({}, 'Starman', 'David Bowie').direct).toBe(false);
    expect(appleMusicLink(undefined)).toBeNull();
  });

  it('only accept real-looking IDs', () => {
    expect(isSpotifyId('0pQskrTITgmCMyr85tb9qq')).toBe(true);
    expect(isSpotifyId('0pQskrTITgmCMyr85tb9q/')).toBe(false);
    expect(isYoutubeId('tRcPA7Fzebw')).toBe(true);
    expect(isYoutubeId('tRcPA7Fzebw"><')).toBe(false);
  });
});
