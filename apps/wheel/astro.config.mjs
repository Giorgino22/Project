// Astro configuration for the wheel site (wheel.<your domain>).
import { defineConfig } from 'astro/config';
import { siteUrl } from '@tools/shared/network';

export default defineConfig({
  site: siteUrl('wheel'),
  trailingSlash: 'always',
  build: { format: 'directory' },
  devToolbar: { enabled: false },
});
