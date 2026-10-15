// Astro configuration for the Humm site (humm.<your domain>).
// Astro builds the page; the part that talks to Google's AI is the Worker in src/worker/.
import { defineConfig } from 'astro/config';
import { siteUrl } from '@tools/shared/network';

export default defineConfig({
  site: siteUrl('humm'),
  trailingSlash: 'always',
  build: { format: 'directory' },
  devToolbar: { enabled: false },
});
