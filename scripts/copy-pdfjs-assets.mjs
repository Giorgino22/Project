/**
 * Copies the runtime files of pdf.js (worker, fonts, WebAssembly decoders) from
 * node_modules into public/pdfjs/<version>/, so they are published with the website.
 * Runs automatically before `npm run dev` and `npm run build` (see package.json).
 *
 * We use the "legacy" worker, which also runs on browsers that are a few years old
 * (src/scripts/pdfjs.ts loads the matching legacy library).
 */
import { cpSync, mkdirSync, readFileSync, rmSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';

const require = createRequire(import.meta.url);
const pdfjsRoot = dirname(require.resolve('pdfjs-dist/package.json'));
const { version } = JSON.parse(readFileSync(join(pdfjsRoot, 'package.json'), 'utf8'));

const target = join('public', 'pdfjs', version);
rmSync(join('public', 'pdfjs'), { recursive: true, force: true }); // start clean, removes old versions
mkdirSync(target, { recursive: true });
cpSync(join(pdfjsRoot, 'legacy', 'build', 'pdf.worker.min.mjs'), join(target, 'pdf.worker.min.mjs'));
for (const folder of ['wasm', 'standard_fonts', 'cmaps', 'iccs']) {
  cpSync(join(pdfjsRoot, folder), join(target, folder), { recursive: true });
}
console.log(`Copied pdf.js ${version} assets to ${target}`);
