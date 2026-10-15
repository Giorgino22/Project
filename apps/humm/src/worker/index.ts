/**
 * The Cloudflare Worker of Humm – the only server code in the whole network.
 *
 * It exists because the AI needs a secret key, which must never be in the page itself.
 * /api/identify: the page sends the recording + notes → we ask Gemini → we add previews → answer.
 * /api/preview: asks Apple once more for one song's preview (when the visitor taps "Play preview"
 * and the answer had none – e.g. because Apple was busy).
 * Every other address (the pages, images, …) is served from dist/ without this code running
 * (see "run_worker_first" in wrangler.jsonc).
 */
import { readRequest } from './answer';
import { identify, type GeminiSettings } from './gemini';
import { findPreview } from './previews';

export interface Env extends GeminiSettings {
  /** The built site (dist/) */
  ASSETS: { fetch(request: Request): Promise<Response> };
  /** Cloudflare's rate limiters (see "ratelimits" in wrangler.jsonc). Missing in tests. */
  SEARCH_LIMIT?: RateLimit;
  PREVIEW_LIMIT?: RateLimit;
}

type RateLimit = { limit(options: { key: string }): Promise<{ success: boolean }> };

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const { pathname } = new URL(request.url);
    if (pathname === '/api/identify') return handleIdentify(request, env);
    if (pathname === '/api/preview') return handlePreview(request, env);
    if (pathname.startsWith('/api/')) return json({ error: 'Not found.' }, 404);
    return env.ASSETS.fetch(request);
  },
};

export async function handleIdentify(request: Request, env: Env): Promise<Response> {
  if (request.method !== 'POST') return json({ error: 'Use POST.' }, 405);
  if (!env.GEMINI_API_KEY) return json({ error: 'The song finder is not set up yet: the GEMINI_API_KEY secret is missing.' }, 500);

  // A few searches per minute per IP address (the address is only used for this count).
  if (env.SEARCH_LIMIT) {
    const { success } = await env.SEARCH_LIMIT.limit({ key: request.headers.get('cf-connecting-ip') ?? 'unknown' });
    if (!success) return json({ error: 'That was a lot of searches in a short time. Wait a minute, then try again.' }, 429);
  }

  const input = readRequest(await request.json().catch(() => null));
  if (typeof input === 'string') return json({ error: input }, 400);

  const result = await identify(input, env);
  if ('error' in result) return json({ error: result.error }, result.status);

  // Look for a 30-second preview of every suggested song, all at the same time.
  await Promise.all(
    result.answer.guesses.map(async (guess) => {
      guess.preview = await findPreview(guess.title, guess.artist);
    }),
  );
  return json(result.answer);
}

/** GET /api/preview?title=…&artist=… → { audioUrl, appleUrl } or 404 */
export async function handlePreview(request: Request, env: Env): Promise<Response> {
  if (request.method !== 'GET') return json({ error: 'Use GET.' }, 405);
  const params = new URL(request.url).searchParams;
  const title = (params.get('title') ?? '').trim().slice(0, 150);
  const artist = (params.get('artist') ?? '').trim().slice(0, 150);
  if (!title || !artist) return json({ error: 'Title and artist are needed.' }, 400);

  if (env.PREVIEW_LIMIT) {
    const { success } = await env.PREVIEW_LIMIT.limit({ key: request.headers.get('cf-connecting-ip') ?? 'unknown' });
    if (!success) return json({ error: 'Too many previews in a short time. Wait a minute.' }, 429);
  }
  const preview = await findPreview(title, artist);
  return preview ? json(preview) : json({ error: 'Apple Music has no preview of this song.' }, 404);
}

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
  });
}
