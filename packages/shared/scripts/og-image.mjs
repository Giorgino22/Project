/**
 * Creates a site's social-media preview image (public/og-image.jpg) and iPhone home-screen
 * icon (public/apple-touch-icon.png) from its public/favicon.svg.
 *
 * Run from an app folder:  node ../../packages/shared/scripts/og-image.mjs "Name" "Tagline" "#6d28d9"
 * (every app has this as `npm run images`). Needs Chromium once: npx playwright install chromium
 */
import { readFileSync } from 'node:fs';
import { chromium } from '@playwright/test';

const [name = 'Tool', tagline = '', color = '#0f766e'] = process.argv.slice(2);
const logo = readFileSync('public/favicon.svg', 'utf8');
const escape = (text) => text.replace(/&/g, '&amp;').replace(/</g, '&lt;');

const page = `<!doctype html><html><head><style>
  body { margin: 0; width: 1200px; height: 630px; display: flex; flex-direction: column; justify-content: center;
         gap: 36px; padding: 0 90px; box-sizing: border-box; color: #fff;
         font-family: system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
         background: linear-gradient(135deg, ${color} 0%, #111827 140%); }
  .brand { display: flex; align-items: center; gap: 28px; font-size: 76px; font-weight: 800; }
  .brand svg { width: 130px; height: 130px; filter: drop-shadow(0 8px 24px rgb(0 0 0 / 0.3)); }
  p { margin: 0; font-size: 40px; line-height: 1.25; max-width: 980px; opacity: 0.92; }
</style></head><body><div class="brand">${logo}<span>${escape(name)}</span></div><p>${escape(tagline)}</p></body></html>`;

const browser = await chromium.launch();
try {
  const tab = await browser.newPage({ viewport: { width: 1200, height: 630 } });
  await tab.setContent(page);
  await tab.screenshot({ path: 'public/og-image.jpg', type: 'jpeg', quality: 88 });
  await tab.setViewportSize({ width: 180, height: 180 });
  await tab.setContent(`<body style="margin:0">${logo.replace('<svg ', '<svg width="180" height="180" ')}</body>`);
  await tab.screenshot({ path: 'public/apple-touch-icon.png', omitBackground: true });
  console.log('Created public/og-image.jpg and public/apple-touch-icon.png');
} finally {
  await browser.close();
}
