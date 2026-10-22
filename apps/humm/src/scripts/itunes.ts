/**
 * Browser helper: finds a song's 30-second preview on Apple Music, with Apple's free iTunes Search
 * API (no key, about 20 questions per minute per visitor). If Wikidata knew the song's Apple Music ID,
 * Apple is asked for exactly that song ("lookup"); otherwise Humm searches for "title artist" and
 * only takes a result with the same title by the same artist – not a cover or a karaoke version.
 *
 * Why in the browser? Apple turns away requests from Cloudflare's servers.
 *
 * How: browsers don't let one website read another website's answers ("CORS"). Apple's official
 * way around this for web pages is called JSONP: we add a <script> whose address asks Apple to wrap
 * its answer in a call of a function we name ("callback"). When the script loads, Apple's answer
 * calls our function with the result.
 */
import { isAppleId, namesArtist, sameTitle, withoutExtras } from '../lib/songs';
import type { Preview } from '../lib/types';

interface AppleTrack {
  trackName?: string;
  artistName?: string;
  previewUrl?: string;
  trackViewUrl?: string;
}

let counter = 0;

export async function findApplePreview(song: { title: string; artist: string; appleId?: string }): Promise<Preview | undefined> {
  const usable = (track: AppleTrack | undefined): Preview | undefined =>
    track?.previewUrl?.startsWith('https://')
      ? {
          audioUrl: track.previewUrl,
          appleUrl: track.trackViewUrl?.startsWith('https://') ? track.trackViewUrl : '',
          title: track.trackName ?? '',
          artist: track.artistName ?? '',
          via: 'lookup',
        }
      : undefined;

  // 1. The exact song, if Wikidata knew its Apple Music ID.
  if (isAppleId(song.appleId)) {
    const found = usable((await askApple('lookup', { id: song.appleId, entity: 'song' }).catch(() => []))[0]);
    if (found) return { ...found, appleUrl: found.appleUrl || `https://music.apple.com/song/${song.appleId}` };
  }

  // 2. A search – but only a result with the same title by the same artist counts.
  const term = `${withoutExtras(song.title)} ${song.artist}`.slice(0, 200);
  const results = await askApple('search', { term, media: 'music', entity: 'song', limit: '15' }).catch(() => []);
  const match = results.find((track) => sameTitle(track.trackName ?? '', song.title) && namesArtist(track.artistName ?? '', song.artist));
  const found = usable(match);
  return found ? { ...found, via: 'search' } : undefined;
}

/** Asks Apple with a <script> tag ("JSONP"). Gives up after 8 seconds. */
function askApple(endpoint: 'lookup' | 'search', parameters: Record<string, string>): Promise<AppleTrack[]> {
  return new Promise((resolve, reject) => {
    const callbackName = `hummApple${Date.now()}${counter++}`;
    const callbacks = window as unknown as Record<string, unknown>;
    const script = document.createElement('script');
    const timer = window.setTimeout(() => finish(() => reject(new Error('Apple did not answer'))), 8000);

    function finish(then: () => void): void {
      window.clearTimeout(timer);
      delete callbacks[callbackName];
      script.remove();
      then();
    }

    // Apple's answer arrives as: hummApple…({ "results": [ … ] })
    callbacks[callbackName] = (data: { results?: AppleTrack[] }) => finish(() => resolve(Array.isArray(data?.results) ? data.results : []));
    script.onerror = () => finish(() => reject(new Error('Apple could not be reached')));
    script.src = `https://itunes.apple.com/${endpoint}?${new URLSearchParams({ ...parameters, callback: callbackName })}`;
    document.head.append(script);
  });
}
