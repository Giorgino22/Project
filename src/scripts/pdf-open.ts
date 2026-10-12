/**
 * Opening PDFs in the browser, including password-protected ones.
 * The password prompt (PasswordPrompt.astro) appears inside the tool – no popups.
 */
import type { PDFDocument } from '@cantoo/pdf-lib';
import { fill } from '../lib/format';
import { $, CancelledError, UserError, type CommonTexts } from './ui';

export class PasswordPrompt {
  private readonly form: HTMLFormElement;
  private readonly message: HTMLElement;
  private readonly input: HTMLInputElement;
  private readonly cancelButton: HTMLButtonElement;

  constructor(root: HTMLElement) {
    this.form = $<HTMLFormElement>(root, '[data-password-prompt]');
    this.message = $(this.form, '[data-password-message]');
    this.input = $<HTMLInputElement>(this.form, 'input[type="password"]');
    this.cancelButton = $<HTMLButtonElement>(this.form, '[data-password-cancel]');
  }

  /** Shows the prompt and waits. Resolves with the password, or null if the visitor cancels. */
  ask(message: string): Promise<string | null> {
    this.message.textContent = message;
    this.input.value = '';
    this.form.hidden = false;
    this.input.focus();

    return new Promise((resolve) => {
      const finish = (value: string | null) => {
        this.form.hidden = true;
        this.form.removeEventListener('submit', onSubmit);
        this.cancelButton.removeEventListener('click', onCancel);
        resolve(value);
      };
      const onSubmit = (event: Event) => {
        event.preventDefault(); // a form would normally reload the page – we don't want that
        finish(this.input.value);
      };
      const onCancel = () => finish(null);
      this.form.addEventListener('submit', onSubmit);
      this.cancelButton.addEventListener('click', onCancel);
    });
  }
}

/**
 * Opens a PDF file with pdf-lib. If it needs a password, the visitor is asked –
 * again and again until the password is right or they cancel.
 */
export async function openPdfFile(file: File, prompt: PasswordPrompt, t: CommonTexts): Promise<PDFDocument> {
  // "await import(…)" loads the PDF library only when it's needed, so pages open faster.
  const { loadPdf, PdfPasswordError } = await import('../lib/pdf-ops');
  const bytes = new Uint8Array(await file.arrayBuffer());
  let password = '';

  for (;;) {
    try {
      return await loadPdf(bytes, password);
    } catch (error) {
      if (!(error instanceof PdfPasswordError)) {
        console.error(error);
        throw new UserError(fill(t.errorNotPdf, { name: file.name }));
      }
      const question = error.reason === 'needs-password' ? t.passwordNeeded : t.passwordWrong;
      const answer = await prompt.ask(fill(question, { name: file.name }));
      if (answer === null) throw new CancelledError();
      password = answer;
    }
  }
}
