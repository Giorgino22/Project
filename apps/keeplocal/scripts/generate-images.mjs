/**
 * Creates the social-media preview image (public/og-image.jpg, shown when someone shares
 * a link) and the iPhone home-screen icon (public/apple-touch-icon.png).
 *
 * Run it again after changing the site name:  npm run images
 * It takes a screenshot of a small HTML page with Playwright's Chromium browser
 * (install it once with: npx playwright install chromium).
 */
import { readFileSync } from 'node:fs';
import { chromium } from '@playwright/test';

// Read the site name straight from src/config.ts, so there's only one place to change it.
const siteName = /siteName:\s*'([^']+)'/.exec(readFileSync('src/config.ts', 'utf8'))?.[1] ?? 'KeepLocal';
const logo = readFileSync('public/favicon.svg', 'utf8');

const ogPage = `<!doctype html><html><head><style>
  body { margin: 0; width: 1200px; height: 630px; display: flex; flex-direction: column; justify-content: center;
         padding: 0 90px; box-sizing: border-box; font-family: system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
         background: linear-gradient(135deg, #0f766e 0%, #134e4a 100%); color: #fff; }
  .brand { display: flex; align-items: center; gap: 24px; font-size: 64px; font-weight: 800; }
  .brand svg { width: 110px; height: 110px; border-radius: 26px; box-shadow: 0 8px 30px rgb(0 0 0 / 0.25); }
  h1 { font-size: 54px; line-height: 1.15; margin: 48px 0 24px; max-width: 980px; }
  p { font-size: 30px; margin: 0; opacity: 0.85; }
</style></head><body>
  <div class="brand">${logo}<span>${siteName}</span></div>
  <h1>Free PDF &amp; image tools that never upload your files</h1>
  <p>Merge · Split · Compress · Convert · QR codes · 100% in your browser</p>
</body></html>`;

const browser = await chromium.launch();
try {
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
  await page.setContent(ogPage);
  await page.screenshot({ path: 'public/og-image.jpg', type: 'jpeg', quality: 88 });

  await page.setViewportSize({ width: 180, height: 180 });
  await page.setContent(`<body style="margin:0">${logo.replace('<svg ', '<svg width="180" height="180" ')}</body>`);
  await page.screenshot({ path: 'public/apple-touch-icon.png', omitBackground: true });
  console.log('Created public/og-image.jpg and public/apple-touch-icon.png');
} finally {
  await browser.close();
}
