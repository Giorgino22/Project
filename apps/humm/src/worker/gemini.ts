/**
 * Asks Google's Gemini AI which song it is.
 *
 * - The first try is a quick one: Gemini listens and answers from what it knows.
 * - From the second try on ("Search again"), Gemini may also search Google for the words it
 *   heard. That finds songs it doesn't know by heart, but costs a bit more, so it's not the default.
 * - Several models are tried in turn: if one is busy, too slow or not available for this
 *   API key, the next one gets the question.
 */
import type { Answer, IdentifyRequest } from '../lib/types';
import { ANSWER_SCHEMA, SYSTEM_PROMPT, buildPrompt, cleanAnswer, extractJson } from './answer';

export interface GeminiSettings {
  /** The secret key from Google AI Studio (Cloudflare → the Worker → Settings → Variables and Secrets) */
  GEMINI_API_KEY?: string;
  /** Optional: a model to try first, e.g. "gemini-3.8-flash" */
  GEMINI_MODEL?: string;
}

/** Best first. All are fast "Flash" models that understand audio. */
export const MODELS = ['gemini-3.8-flash', 'gemini-3.6-flash', 'gemini-flash-latest'];

/** How long we wait for one model, and for all tries together (milliseconds). */
export const LIMITS = { quick: 40_000, search: 55_000, total: 85_000 };

/** Answers where another model (or the same one, later) might work: 400 unsupported, 404 unknown model, 429 quota, 5xx busy. */
const TRY_NEXT = [400, 404, 429, 500, 502, 503, 504];

export type Result = { answer: Answer } | { error: string; status: number };

export async function identify(input: IdentifyRequest, settings: GeminiSettings, limits = LIMITS): Promise<Result> {
  const rounds = input.rounds ?? [];
  const started = Date.now();
  const firstTry = await ask(input, settings, limits, rounds.length > 0, started);
  if ('answer' in firstTry || rounds.length === 0) return firstTry;

  // The web search didn't work (e.g. its daily limit is used up): ask again without it.
  console.log('web search failed, trying without it');
  const withoutSearch = await ask(input, settings, limits, false, started);
  return 'answer' in withoutSearch ? withoutSearch : firstTry;
}

async function ask(input: IdentifyRequest, settings: GeminiSettings, limits: typeof LIMITS, search: boolean, started: number): Promise<Result> {
  const rounds = input.rounds ?? [];
  const parts: object[] = [];
  if (input.audio) parts.push({ inlineData: { mimeType: 'audio/wav', data: input.audio } });
  parts.push({ text: buildPrompt({ hasAudio: Boolean(input.audio), hint: input.hint ?? '', rounds, search }) });

  // "low" thinking: Gemini answers in seconds instead of up to a minute.
  const thinkingConfig = { thinkingLevel: 'low' };
  const body = {
    systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
    contents: [{ role: 'user', parts }],
    ...(search
      ? { tools: [{ google_search: {} }], generationConfig: { thinkingConfig } }
      : { generationConfig: { responseMimeType: 'application/json', responseSchema: ANSWER_SCHEMA, thinkingConfig } }),
  };

  const errors: string[] = [];
  const models = [...new Set([settings.GEMINI_MODEL, ...MODELS].filter((model): model is string => Boolean(model)))];
  for (const model of models) {
    const timeLeft = limits.total - (Date.now() - started);
    if (timeLeft < 3000) break; // not enough time left for another try
    const reply = await callModel(model, body, settings.GEMINI_API_KEY ?? '', Math.min(search ? limits.search : limits.quick, timeLeft));

    if (!reply.ok) {
      errors.push(`${model}: ${reply.message}`);
      // A wrong API key (Google answers 400 or 403) – other models won't help.
      const wrongKey = /api key/i.test(reply.message);
      if (TRY_NEXT.includes(reply.status) && !wrongKey) continue;
      return { error: wrongKey ? `The song finder’s API key doesn’t work: ${reply.message}` : reply.message, status: 502 };
    }

    const candidate = reply.data.candidates?.[0];
    // Gemini may split its reply into several parts; "thought" parts are its private notes.
    const replyText = candidate?.content?.parts?.filter((part) => !part.thought).map((part) => part.text ?? '').join('') ?? '';
    const cleaned = cleanAnswer(extractJson(replyText), rounds.flatMap((round) => round.guesses));
    if (!cleaned) {
      errors.push(`${model}: the answer could not be read${candidate?.finishReason ? ` (${candidate.finishReason})` : ''}`);
      continue;
    }

    const grounding = candidate?.groundingMetadata;
    const sources = (grounding?.groundingChunks ?? [])
      .map((chunk) => ({ title: chunk.web?.title ?? '', url: chunk.web?.uri ?? '' }))
      .filter((source) => source.title && source.url.startsWith('https://'));
    return {
      answer: {
        ...cleaned,
        searched: Boolean(grounding?.webSearchQueries?.length),
        searchSuggestions: grounding?.searchEntryPoint?.renderedContent,
        // The same page can appear several times – keep each once, at most five.
        sources: sources.filter((source, i) => sources.findIndex((other) => other.title === source.title) === i).slice(0, 5),
        model,
      },
    };
  }
  return { error: `No AI model could answer right now. Please try again in a minute.\n${errors.join('\n')}`, status: 502 };
}

/** The parts of Gemini's reply we use (https://ai.google.dev/api/generate-content#generatecontentresponse). */
interface GeminiReply {
  candidates?: {
    finishReason?: string;
    content?: { parts?: { text?: string; thought?: boolean }[] };
    groundingMetadata?: {
      webSearchQueries?: string[];
      searchEntryPoint?: { renderedContent?: string };
      groundingChunks?: { web?: { uri?: string; title?: string } }[];
    };
  }[];
  error?: { message?: string };
}

type Reply = { ok: true; data: GeminiReply } | { ok: false; status: number; message: string };

/** One request to one model. If the model doesn't know the "thinking" setting, it's asked once more without it. */
async function callModel(model: string, body: Record<string, unknown>, apiKey: string, timeoutMs: number): Promise<Reply> {
  const reply = await post(model, body, apiKey, timeoutMs);
  if (!reply.ok && reply.status === 400 && /thinking/i.test(reply.message)) {
    const config = { ...(body.generationConfig as Record<string, unknown>) };
    delete config.thinkingConfig;
    return post(model, { ...body, generationConfig: config }, apiKey, timeoutMs);
  }
  return reply;
}

async function post(model: string, body: unknown, apiKey: string, timeoutMs: number): Promise<Reply> {
  const started = Date.now();
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-goog-api-key': apiKey },
      body: JSON.stringify(body),
      // Give up on this model after a while instead of waiting forever.
      signal: AbortSignal.timeout(timeoutMs),
    });
    const data = (await response.json().catch(() => ({}))) as GeminiReply;
    // Only the model, the status and the time are logged – never the recording or the answer.
    console.log(`${model}: status ${response.status} after ${Date.now() - started} ms`);
    if (!response.ok) return { ok: false, status: response.status, message: data.error?.message ?? `error ${response.status}` };
    return { ok: true, data };
  } catch {
    console.log(`${model}: no answer after ${Date.now() - started} ms`);
    return { ok: false, status: 504, message: `no answer after ${Math.round((Date.now() - started) / 1000)} s` };
  }
}
