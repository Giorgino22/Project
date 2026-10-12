/**
 * Loads pdf.js (Mozilla's PDF renderer – the same one Firefox uses) to draw PDF pages as images.
 *
 * pdf.js needs some helper files at runtime (a "worker" that does the heavy lifting in the
 * background, fonts, WebAssembly decoders). scripts/copy-pdfjs-assets.mjs copies them to
 * /pdfjs/<version>/ on every build. The version in the path makes sure browsers never mix
 * an old cached worker with a new library.
 *
 * We use pdf.js's "legacy" build: the normal build needs brand-new browser features
 * (e.g. Map.getOrInsertComputed) and fails on browsers that are only a few months old.
 */
import { fill } from '../lib/format';
import type { PasswordPrompt } from './pdf-open';
import { CancelledError, UserError, type CommonTexts } from './ui';

export async function loadPdfJs() {
  const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs');
  pdfjs.GlobalWorkerOptions.workerSrc = `/pdfjs/${pdfjs.version}/pdf.worker.min.mjs`;
  return pdfjs;
}

type PdfJs = Awaited<ReturnType<typeof loadPdfJs>>;
export type PdfJsDocument = Awaited<ReturnType<PdfJs['getDocument']>['promise']>;

/** Opens a PDF for rendering, asking for the password if one is needed. */
export async function openPdfForRendering(file: File, prompt: PasswordPrompt, t: CommonTexts): Promise<PdfJsDocument> {
  const pdfjs = await loadPdfJs();
  const assets = `/pdfjs/${pdfjs.version}`;
  const bytes = new Uint8Array(await file.arrayBuffer());
  let password: string | undefined;

  for (;;) {
    try {
      return await pdfjs.getDocument({
        data: bytes.slice(), // pdf.js takes ownership of the bytes it gets, so we hand over a copy
        password,
        wasmUrl: `${assets}/wasm/`,
        standardFontDataUrl: `${assets}/standard_fonts/`,
        cMapUrl: `${assets}/cmaps/`,
        iccUrl: `${assets}/iccs/`,
      }).promise;
    } catch (error) {
      if (!(error instanceof pdfjs.PasswordException)) {
        console.error(error);
        throw new UserError(fill(t.errorNotPdf, { name: file.name }));
      }
      const wrong = error.code === pdfjs.PasswordResponses.INCORRECT_PASSWORD;
      const answer = await prompt.ask(fill(wrong ? t.passwordWrong : t.passwordNeeded, { name: file.name }));
      if (answer === null) throw new CancelledError();
      password = answer;
    }
  }
}
