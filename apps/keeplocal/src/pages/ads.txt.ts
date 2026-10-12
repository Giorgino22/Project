/**
 * Builds /ads.txt – Google AdSense requires it. It publicly states that Google may sell
 * ads on this site for your account, which protects you from fake ad sellers.
 */
import type { APIRoute } from 'astro';
import { config, features } from '../config';

export const GET: APIRoute = () => {
  const publisherId = config.ads.adsenseClient.replace(/^ca-/, ''); // "ca-pub-123" → "pub-123"
  const body = features.ads
    ? `google.com, ${publisherId}, DIRECT, f08c47fec0942fa0\n`
    : '# Fill in adsenseClient in packages/shared/src/network.ts to activate this file.\n';
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
