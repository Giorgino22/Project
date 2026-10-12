/**
 * Copies the text recognition engine (tesseract.js) and its English and German language data
 * from node_modules into public/ocr/<version>/, so the "Image to text" tool loads everything
 * from our own website – never from another server. Runs automatically before `npm run dev`
 * and `npm run build` (see package.json). The version in the path works like for pdf.js:
 * browsers may cache the files forever, and a new version gets a new address.
 */
import { cpSync, mkdirSync, readFileSync, rmSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';

const require = createRequire(import.meta.url);
const tesseractRoot = dirname(require.resolve('tesseract.js/package.json'));
// tesseract.js-core is a dependency of tesseract.js, so we look it up from there.
const coreRoot = dirname(createRequire(join(tesseractRoot, 'package.json')).resolve('tesseract.js-core/package.json'));
const { version } = JSON.parse(readFileSync(join(tesseractRoot, 'package.json'), 'utf8'));

const target = join('public', 'ocr', version);
rmSync(join('public', 'ocr'), { recursive: true, force: true }); // start clean, removes old versions
mkdirSync(join(target, 'core'), { recursive: true });
mkdirSync(join(target, 'lang'), { recursive: true });

// The worker runs the recognition in the background, so the page stays responsive.
cpSync(join(tesseractRoot, 'dist', 'worker.min.js'), join(target, 'worker.min.js'));

// The engine itself (WebAssembly) in three builds; the worker picks the fastest one the browser supports.
for (const file of ['tesseract-core-lstm.wasm.js', 'tesseract-core-simd-lstm.wasm.js', 'tesseract-core-relaxedsimd-lstm.wasm.js']) {
  cpSync(join(coreRoot, file), join(target, 'core', file));
}

// Language data ("best_int" = accurate and compact). To add a language, install @tesseract.js-data/<code>.
for (const lang of ['eng', 'deu']) {
  const dataRoot = dirname(require.resolve(`@tesseract.js-data/${lang}/package.json`));
  cpSync(join(dataRoot, '4.0.0_best_int', `${lang}.traineddata.gz`), join(target, 'lang', `${lang}.traineddata.gz`));
}
console.log(`Copied tesseract.js ${version} assets to ${target}`);
