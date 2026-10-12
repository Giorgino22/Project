// Astro configuration for the hub (your central domain, e.g. https://example.com).
import { defineConfig } from 'astro/config';
import { siteUrl } from '@tools/shared/network';

export default defineConfig({
  site: siteUrl('hub'),
  trailingSlash: 'always',
  build: { format: 'directory' },
  devToolbar: { enabled: false },
});
