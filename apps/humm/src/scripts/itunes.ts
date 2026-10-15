/**
 * Browser helper: finds a song's 30-second preview at Apple (iTunes Search API).
 *
 * Why in the browser and not in our Worker? Apple turns away requests from Cloudflare's servers
 * (they share their addresses with many other sites), but it welcomes requests from web pages.
 *
 * How: browsers don't let one website read another website's answers ("CORS"). Apple's official
 * way around this for web pages is called JSONP: we add a <script> whose address asks Apple to wrap
 * its answer in a call of a function we name ("callback"). When the script loads, Apple's answer
 * calls our function with the results. This only happens when the visitor taps "Play preview".
 */
import { pickBestMatch, type ItunesTrack } from '../lib/songs';
import type { Preview } from '../lib/types';

let counter = 0;

export async function findPreview(title: string, artist: string): Promise<Preview | undefined> {
  const tracks = await searchApple(`${artist} ${title}`).catch(() => []);
  const track = pickBestMatch(tracks, title, artist);
  if (!track?.previewUrl?.startsWith('https://') || !track.trackViewUrl?.startsWith('https://')) return undefined;
  return { audioUrl: track.previewUrl, appleUrl: track.trackViewUrl };
}

/** Asks Apple's search with a <script> tag ("JSONP"). Gives up after 8 seconds. */
function searchApple(term: string): Promise<ItunesTrack[]> {
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
    callbacks[callbackName] = (data: { results?: ItunesTrack[] }) => finish(() => resolve(data?.results ?? []));
    script.onerror = () => finish(() => reject(new Error('Apple could not be reached')));
    const query = new URLSearchParams({ term, media: 'music', entity: 'song', limit: '10', callback: callbackName });
    script.src = `https://itunes.apple.com/search?${query}`;
    document.head.append(script);
  });
}
