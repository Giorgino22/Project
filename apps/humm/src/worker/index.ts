/**
 * The Cloudflare Worker of Humm – the only server code in the whole network.
 *
 * It exists because the AI needs a secret key, which must never be in the page itself.
 * /api/identify: the page sends the recording + notes → we ask Gemini → we add previews → answer.
 * Every other address (the pages, images, …) is served from dist/ without this code running
 * (see "run_worker_first" in wrangler.jsonc).
 */
import { readRequest } from './answer';
import { identify, type GeminiSettings } from './gemini';
import { findPreview } from './previews';

export interface Env extends GeminiSettings {
  /** The built site (dist/) */
  ASSETS: { fetch(request: Request): Promise<Response> };
  /** Cloudflare's rate limiter (see "ratelimits" in wrangler.jsonc). Missing in tests. */
  SEARCH_LIMIT?: { limit(options: { key: string }): Promise<{ success: boolean }> };
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const { pathname } = new URL(request.url);
    if (pathname === '/api/identify') return handleIdentify(request, env);
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

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
  });
}
