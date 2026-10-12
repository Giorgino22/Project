// Astro configuration for the typing site (typing.<your domain>).
import { defineConfig } from 'astro/config';
import { siteUrl } from '@tools/shared/network';

export default defineConfig({
  site: siteUrl('typing'),
  trailingSlash: 'always',
  build: { format: 'directory' },
  devToolbar: { enabled: false },
});
