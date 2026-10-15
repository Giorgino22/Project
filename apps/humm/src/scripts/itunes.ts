/**
 * Browser helper: gets a song's 30-second preview from Apple, by the song's Apple Music ID
 * (found in Wikidata by our Worker). Only when the visitor taps "Play preview".
 *
 * Why in the browser? Apple turns away requests from Cloudflare's servers. And why by ID? Apple's
 * search has been unreliable in 2026, but looking a song up by its ID ("lookup") works.
 *
 * How: browsers don't let one website read another website's answers ("CORS"). Apple's official
 * way around this for web pages is called JSONP: we add a <script> whose address asks Apple to wrap
 * its answer in a call of a function we name ("callback"). When the script loads, Apple's answer
 * calls our function with the result.
 */
import { isAppleId } from '../lib/songs';
import type { Preview } from '../lib/types';

let counter = 0;

export async function applePreview(appleId: string): Promise<Preview | undefined> {
  if (!isAppleId(appleId)) return undefined;
  const results = await askApple(appleId).catch(() => []);
  const track = results.find((result) => result.previewUrl?.startsWith('https://'));
  if (!track?.previewUrl) return undefined;
  return { audioUrl: track.previewUrl, appleUrl: track.trackViewUrl?.startsWith('https://') ? track.trackViewUrl : `https://music.apple.com/song/${appleId}` };
}

/** Asks Apple's lookup with a <script> tag ("JSONP"). Gives up after 8 seconds. */
function askApple(appleId: string): Promise<{ previewUrl?: string; trackViewUrl?: string }[]> {
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
    callbacks[callbackName] = (data: { results?: { previewUrl?: string; trackViewUrl?: string }[] }) =>
      finish(() => resolve(data?.results ?? []));
    script.onerror = () => finish(() => reject(new Error('Apple could not be reached')));
    script.src = `https://itunes.apple.com/lookup?${new URLSearchParams({ id: appleId, entity: 'song', callback: callbackName })}`;
    document.head.append(script);
  });
}
