/**
 * Creates a site's social-media preview image (public/og-image.jpg – the picture shown when
 * someone shares a link) and its iPhone home-screen icon (public/apple-touch-icon.png),
 * in the network's design: paper background, the logo tile, a big headline and a yellow
 * label band with the site's address.
 *
 * Run from an app folder:  node ../../packages/shared/scripts/og-image.mjs "Name" "Headline" "subdomain"
 * (every app has this as `npm run images`; the hub passes "" as subdomain).
 * Needs Chromium once: npx playwright install chromium
 */
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { chromium } from '@playwright/test';

const [name = 'Tool', headline = '', subdomain = ''] = process.argv.slice(2);
const logo = readFileSync('public/favicon.svg', 'utf8');
const escape = (text) => text.replace(/&/g, '&amp;').replace(/</g, '&lt;');

// The address printed on the yellow band, e.g. "wheel.toolstin.com" (domain from network.ts).
const network = readFileSync(new URL('../src/network.ts', import.meta.url), 'utf8');
const domain = /domain:\s*'([^']+)'/.exec(network)?.[1] ?? 'example.com';
const address = subdomain ? `${subdomain}.${domain}` : domain;

// The typeface, embedded into the page so the screenshot needs no internet.
const require = createRequire(import.meta.url);
const fontFile = require.resolve('@fontsource-variable/archivo/files/archivo-latin-wdth-normal.woff2');
const font = readFileSync(fontFile).toString('base64');

const page = `<!doctype html><html><head><style>
  @font-face { font-family: Archivo; src: url(data:font/woff2;base64,${font}) format('woff2');
               font-weight: 100 900; font-stretch: 62% 125%; }
  body { margin: 0; width: 1200px; height: 630px; display: flex; flex-direction: column; box-sizing: border-box;
         background: #fbfbf9; color: #1d1e20; font-family: Archivo, sans-serif; }
  .brand { display: flex; align-items: center; gap: 22px; padding: 64px 80px 0; font-size: 46px; font-weight: 750;
           font-stretch: 112%; letter-spacing: -0.02em; }
  .brand svg { width: 84px; height: 84px; }
  h1 { flex: 1; display: flex; align-items: center; margin: 0; padding: 0 80px; max-width: 1060px; font-size: 74px;
       font-weight: 800; font-stretch: 116%; line-height: 1; letter-spacing: -0.035em; }
  .band { padding: 26px 80px; background: #ffd400; font-size: 34px; font-weight: 700; letter-spacing: -0.01em; }
</style></head><body>
  <div class="brand">${logo}<span>${escape(name)}</span></div>
  <h1>${escape(headline)}</h1>
  <div class="band">${escape(address)}</div>
</body></html>`;

const browser = await chromium.launch();
try {
  const tab = await browser.newPage({ viewport: { width: 1200, height: 630 } });
  await tab.setContent(page);
  await tab.evaluate(() => document.fonts.ready);
  await tab.screenshot({ path: 'public/og-image.jpg', type: 'jpeg', quality: 90 });

  // iPhones round the corners themselves, so the icon is drawn as a full square.
  const square = logo.replace('<svg ', '<svg width="180" height="180" ').replace('rx="8"', 'rx="0"');
  await tab.setViewportSize({ width: 180, height: 180 });
  await tab.setContent(`<body style="margin:0">${square}</body>`);
  await tab.screenshot({ path: 'public/apple-touch-icon.png' });
  console.log('Created public/og-image.jpg and public/apple-touch-icon.png');
} finally {
  await browser.close();
}
