/**
 * Tests of the Worker with a fake internet: `fetch` is replaced, so no real AI or Apple server is
 * called. Each fake answer is chosen by the address the Worker asks.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { identify } from '../../src/worker/gemini';
import worker, { type Env } from '../../src/worker/index';

/** Gemini's reply format with our JSON answer inside. */
function geminiReply(answer: object, extra: object = {}) {
  return { candidates: [{ content: { parts: [{ text: JSON.stringify(answer) }] }, ...extra }] };
}

const goodAnswer = {
  heard: 'A man singing in Spanish.',
  words: 'que loquera',
  question: '',
  guesses: [{ title: 'El Taxi', artist: 'Osmani García', year: '2015', confidence: 60, why: 'The chorus matches.' }],
};

/** Records every request and answers from `respond(url, body)`. */
function fakeInternet(respond: (url: string, body: any) => Response | Promise<Response>) {
  const calls: { url: string; body: any }[] = [];
  vi.stubGlobal(
    'fetch',
    vi.fn(async (url: string, init?: RequestInit) => {
      const body = init?.body ? JSON.parse(String(init.body)) : undefined;
      calls.push({ url, body });
      return respond(url, body);
    }),
  );
  return calls;
}

const json = (data: unknown, status = 200) => new Response(JSON.stringify(data), { status });
const modelOf = (url: string) => /models\/(.+):generateContent/.exec(url)?.[1];
const settings = { GEMINI_API_KEY: 'test-key' };

beforeEach(() => vi.spyOn(console, 'log').mockImplementation(() => {}));
afterEach(() => vi.unstubAllGlobals());

describe('asking Gemini', () => {
  it('asks the best model first, with a fixed answer shape and without web search', async () => {
    const calls = fakeInternet(() => json(geminiReply(goodAnswer)));
    const result = await identify({ audio: 'UklGRg==', hint: 'with Pitbull', rounds: [] }, settings);

    expect(result).toMatchObject({ answer: { guesses: [{ title: 'El Taxi' }], searched: false, model: 'gemini-3.8-flash' } });
    expect(calls).toHaveLength(1);
    const body = calls[0]!.body;
    expect(body.contents[0].parts[0]).toEqual({ inlineData: { mimeType: 'audio/wav', data: 'UklGRg==' } });
    expect(body.generationConfig.responseSchema).toBeDefined();
    expect(body.generationConfig.thinkingConfig).toEqual({ thinkingLevel: 'low' });
    expect(body.tools).toBeUndefined();
  });

  it('searches the web on the second try and passes on Google’s suggestions', async () => {
    const calls = fakeInternet(() =>
      json(
        geminiReply(goodAnswer, {
          groundingMetadata: {
            webSearchQueries: ['"que loquera" pitbull lyrics'],
            searchEntryPoint: { renderedContent: '<div class="chip">que loquera</div>' },
            groundingChunks: [{ web: { uri: 'https://example.com/a', title: 'lyrics.example' } }, { web: { uri: 'https://example.com/b', title: 'lyrics.example' } }],
          },
        }),
      ),
    );
    const result = await identify({ hint: 'que loquera', rounds: [{ guesses: [{ title: 'No Lo Trates', artist: 'Pitbull' }], feedback: 'older' }] }, settings);

    expect(calls[0]!.body.tools).toEqual([{ google_search: {} }]);
    expect(calls[0]!.body.generationConfig.responseSchema).toBeUndefined();
    expect(result).toMatchObject({
      answer: { searched: true, searchSuggestions: '<div class="chip">que loquera</div>', sources: [{ title: 'lyrics.example', url: 'https://example.com/a' }] },
    });
  });

  it('moves on to the next model when one is busy or unknown', async () => {
    const calls = fakeInternet((url) => {
      if (modelOf(url) === 'gemini-3.8-flash') return json({ error: { message: 'The model is overloaded.' } }, 503);
      if (modelOf(url) === 'gemini-3.6-flash') return json({ error: { message: 'not found' } }, 404);
      return json(geminiReply(goodAnswer));
    });
    const result = await identify({ hint: 'la la la' }, settings);
    expect(calls.map((call) => modelOf(call.url))).toEqual(['gemini-3.8-flash', 'gemini-3.6-flash', 'gemini-flash-latest']);
    expect(result).toMatchObject({ answer: { model: 'gemini-flash-latest' } });
  });

  it('tries GEMINI_MODEL first when it is set', async () => {
    const calls = fakeInternet(() => json(geminiReply(goodAnswer)));
    await identify({ hint: 'la' }, { ...settings, GEMINI_MODEL: 'gemini-test' });
    expect(modelOf(calls[0]!.url)).toBe('gemini-test');
  });

  it('asks again without the thinking setting if a model doesn’t know it', async () => {
    const calls = fakeInternet((_url, body) =>
      body.generationConfig.thinkingConfig ? json({ error: { message: 'Unknown name "thinkingLevel"' } }, 400) : json(geminiReply(goodAnswer)),
    );
    const result = await identify({ hint: 'la' }, settings);
    expect(calls).toHaveLength(2);
    expect(modelOf(calls[1]!.url)).toBe('gemini-3.8-flash');
    expect(result).toHaveProperty('answer');
  });

  it('stops at once when the API key is wrong', async () => {
    // Google answers a wrong key with 400 (seen for real while testing the Worker locally)
    const calls = fakeInternet(() => json({ error: { message: 'API key not valid. Please pass a valid API key.' } }, 400));
    const result = await identify({ hint: 'la' }, settings);
    expect(result).toMatchObject({ status: 502 });
    expect('error' in result && result.error).toContain('API key doesn’t work');
    expect(calls).toHaveLength(1);
  });

  it('stops at once when the request is not allowed', async () => {
    const calls = fakeInternet(() => json({ error: { message: 'Permission denied.' } }, 403));
    expect(await identify({ hint: 'la' }, settings)).toEqual({ error: 'Permission denied.', status: 502 });
    expect(calls).toHaveLength(1);
  });

  it('answers without web search when the search doesn’t work', async () => {
    const calls = fakeInternet((_url, body) => (body.tools ? json({ error: { message: 'Search quota exceeded' } }, 429) : json(geminiReply(goodAnswer))));
    const result = await identify({ hint: 'la', rounds: [{ guesses: [], feedback: 'no' }] }, settings);
    expect(result).toMatchObject({ answer: { searched: false } });
    expect(calls.filter((call) => call.body.tools)).toHaveLength(3); // every model was tried with search first
  });

  it('gives up on a model that takes too long and lists every problem', async () => {
    fakeInternet(
      (_url) =>
        new Promise<Response>(() => {
          /* never answers */
        }),
    );
    // Real fetch stops when the time is up; the fake one has to be told:
    vi.mocked(fetch).mockImplementation(
      (_url, init) => new Promise((_resolve, reject) => init?.signal?.addEventListener('abort', () => reject(new Error('timeout')))),
    );
    const result = await identify({ hint: 'la' }, settings, { quick: 40, search: 40, total: 10_000 });
    expect(result).toMatchObject({ status: 502 });
    expect('error' in result && result.error).toContain('gemini-3.8-flash: no answer after');
    expect('error' in result && result.error).toContain('gemini-flash-latest');
  });

  it('skips answers that are not JSON', async () => {
    fakeInternet((url) =>
      modelOf(url) === 'gemini-3.8-flash'
        ? json({ candidates: [{ finishReason: 'RECITATION', content: { parts: [] } }] })
        : json(geminiReply(goodAnswer)),
    );
    expect(await identify({ hint: 'la' }, settings)).toMatchObject({ answer: { model: 'gemini-3.6-flash' } });
  });
});

describe('the Worker', () => {
  const assets = { fetch: vi.fn(async () => new Response('page')) };
  const env = (more: Partial<Env> = {}): Env => ({ ASSETS: assets, GEMINI_API_KEY: 'test-key', ...more });
  const post = (body: unknown) =>
    new Request('https://humm.example.com/api/identify', { method: 'POST', body: JSON.stringify(body), headers: { 'cf-connecting-ip': '203.0.113.1' } });

  it('serves pages from the built site and only POST requests at /api/identify', async () => {
    expect(await (await worker.fetch(new Request('https://humm.example.com/'), env())).text()).toBe('page');
    expect((await worker.fetch(new Request('https://humm.example.com/api/identify'), env())).status).toBe(405);
    expect((await worker.fetch(new Request('https://humm.example.com/api/other'), env())).status).toBe(404);
  });

  it('explains a missing API key and a bad request', async () => {
    const missing = await worker.fetch(post({ hint: 'la' }), env({ GEMINI_API_KEY: '' }));
    expect(missing.status).toBe(500);
    expect((await missing.json()).error).toContain('GEMINI_API_KEY');
    expect((await worker.fetch(post({}), env())).status).toBe(400);
  });

  it('stops visitors who search too often', async () => {
    const limiter = { limit: vi.fn(async () => ({ success: false })) };
    const response = await worker.fetch(post({ hint: 'la' }), env({ SEARCH_LIMIT: limiter }));
    expect(response.status).toBe(429);
    expect(limiter.limit).toHaveBeenCalledWith({ key: '203.0.113.1' });
  });

  it('answers with the songs and their IDs from Wikidata', async () => {
    const calls = fakeInternet((url) => {
      if (url.includes('generativelanguage')) return json(geminiReply(goodAnswer));
      const params = new URL(url).searchParams;
      if (params.get('action') === 'wbsearchentities') return json({ search: [{ id: 'Q9', label: 'El Taxi', description: 'song by Osmani García' }] });
      return json({ entities: { Q9: { claims: { P2207: [{ mainsnak: { datavalue: { value: '1234567890abcdefghijkl' } } }] } } } });
    });
    const response = await worker.fetch(post({ hint: 'la' }), env());
    expect(response.status).toBe(200);
    expect(response.headers.get('cache-control')).toBe('no-store');
    expect(await response.json()).toMatchObject({ guesses: [{ title: 'El Taxi', ids: { spotify: '1234567890abcdefghijkl' } }] });
    // Only Gemini and Wikidata are asked – never Apple (it refuses Cloudflare's servers)
    expect(calls.every((call) => /^https:\/\/(generativelanguage\.googleapis\.com|www\.wikidata\.org)\//.test(call.url))).toBe(true);
  });

  it('still answers when Wikidata fails', async () => {
    fakeInternet((url) => (url.includes('generativelanguage') ? json(geminiReply(goodAnswer)) : json({}, 503)));
    const answer = await (await worker.fetch(post({ hint: 'la' }), env())).json();
    expect(answer.guesses[0].title).toBe('El Taxi');
    expect(answer.guesses[0].ids).toBeUndefined();
  });
});
