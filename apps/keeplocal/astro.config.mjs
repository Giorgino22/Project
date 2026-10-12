// Astro configuration – https://docs.astro.build/en/reference/configuration-reference/
import { defineConfig } from 'astro/config';
import { isPlaceholderDomain } from '@tools/shared/network';
import { config, features } from './src/config';

/**
 * A tiny Astro "integration" that prints a launch checklist at the end of every build,
 * so you can see in the Cloudflare build log which money features are switched on.
 */
function launchReport() {
  return {
    name: 'launch-report',
    hooks: {
      'astro:build:done': ({ logger }) => {
        const status = (on) => (on ? 'ON ' : 'off');
        logger.info(`Site URL ............ ${config.siteUrl}`);
        logger.info(`Ads (AdSense) ....... ${status(features.ads)}`);
        logger.info(`Tip button .......... ${status(features.support)}`);
        logger.info(`Affiliate offers .... ${status(features.affiliates)}`);
        logger.info(`Visitor statistics .. ${status(features.analytics)}`);
        if (isPlaceholderDomain) {
          logger.warn('The domain is still the placeholder – set it in packages/shared/src/network.ts before telling Google about the site.');
        }
        if (!config.owner.name || !config.owner.email) {
          logger.warn('Your name and e-mail are missing in packages/shared/src/network.ts → owner (needed for the legal pages).');
        }
      },
    },
  };
}

export default defineConfig({
  site: config.siteUrl,
  // Every page is a folder with index.html (/merge-pdf/index.html), so URLs end with "/".
  trailingSlash: 'always',
  build: { format: 'directory' },
  devToolbar: { enabled: false },
  integrations: [launchReport()],
  vite: {
    // The PDF library is ~550 KB. That's fine: it is only downloaded when someone
    // actually uses a PDF tool (dynamic import), so this raises the warning limit.
    build: { chunkSizeWarningLimit: 700 },
  },
});
