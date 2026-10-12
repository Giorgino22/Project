/**
 * Small helpers shared by all tool scripts (they run in the browser).
 *
 * How tools work: every tool component renders its HTML on the server with
 * data-* attributes (data-run, data-status, …). Its <script> then finds those
 * elements and adds the behaviour. The translated texts travel along as JSON
 * in data-i18n, so scripts can show messages in the visitor's language.
 */
import type { Dictionary } from '../i18n/en';
import { fill } from '../lib/format';
import { PageRangeError, parsePageSelection } from '../lib/page-ranges';

export type CommonTexts = Dictionary['common'];

/** querySelector that fails loudly – a missing element means the HTML and the script don't match. */
export function $<T extends Element = HTMLElement>(root: ParentNode, selector: string): T {
  const element = root.querySelector<T>(selector);
  if (!element) throw new Error(`Element not found: ${selector}`);
  return element;
}

/** All elements of one tool on the page, e.g. toolRoots('MergePdf'). */
export function toolRoots(component: string): HTMLElement[] {
  return [...document.querySelectorAll<HTMLElement>(`[data-tool="${component}"]`)];
}

/** The translated texts the server put into data-i18n (see ToolShell.astro). */
export function readTexts<T>(root: HTMLElement): T {
  return JSON.parse(root.dataset.i18n ?? '{}') as T;
}

/** An error whose message is already translated and can be shown as it is. */
export class UserError extends Error {
  override name = 'UserError';
}

/** The visitor cancelled (e.g. closed the password prompt). */
export class CancelledError extends Error {
  override name = 'CancelledError';
}

/** Turns any error into a message a visitor can understand. */
export function describeError(error: unknown, t: CommonTexts): string {
  if (error instanceof UserError) return error.message;
  if (error instanceof CancelledError) return t.cancelled;
  if (error instanceof PageRangeError) {
    if (error.code === 'empty') return t.rangeEmpty;
    if (error.code === 'out-of-range') return fill(t.rangeOutOfRange, { token: error.token, count: error.pageCount });
    return fill(t.rangeInvalid, { token: error.token });
  }
  const message = error instanceof Error ? error.message : String(error);
  if (error instanceof RangeError || /out of memory|allocation failed/i.test(message)) return t.errorMemory;
  return fill(t.errorGeneric, { message });
}

/** The status line under the main button ("Working on it…", "Done!", errors). */
export class Status {
  constructor(private readonly element: HTMLElement) {}

  set(text: string, kind: 'info' | 'success' | 'error' = 'info'): void {
    this.element.textContent = text;
    this.element.dataset.kind = kind;
  }

  clear(): void {
    this.element.textContent = '';
    delete this.element.dataset.kind;
  }
}

/**
 * Waits until the browser has drawn the screen once. Heavy work blocks the page,
 * so without this pause "Working on it…" would never become visible.
 */
export function nextPaint(): Promise<void> {
  return new Promise((resolve) => requestAnimationFrame(() => setTimeout(resolve, 0)));
}

/**
 * Runs the main action of a tool: disables the button while working,
 * shows "Working on it…" and turns errors into friendly messages.
 */
export async function runTask(
  button: HTMLButtonElement,
  status: Status,
  t: CommonTexts,
  task: () => Promise<void>,
): Promise<void> {
  button.disabled = true;
  status.set(t.processing);
  await nextPaint();
  try {
    await task();
  } catch (error) {
    console.error(error);
    status.set(describeError(error, t), 'error');
  } finally {
    button.disabled = false;
  }
}

/** "1 page" / "12 pages" in the visitor's language. */
export function pagesLabel(count: number, t: CommonTexts): string {
  return count === 1 ? t.pagesOne : fill(t.pagesMany, { count });
}

/** The value of the checked radio button with this name inside `root`. */
export function radioValue(root: ParentNode, name: string): string {
  return $<HTMLInputElement>(root, `input[name="${name}"]:checked`).value;
}

/** A Blob (file in memory) from bytes. */
export function bytesToBlob(bytes: Uint8Array, type: string): Blob {
  // The cast tells TypeScript these bytes live in a normal ArrayBuffer (pdf-lib's types are less precise).
  return new Blob([bytes as Uint8Array<ArrayBuffer>], { type });
}

// ---------------------------------------------------------------------------
// Page selection (PageSelector.astro): "All pages" or "Only these pages: 1-3, 5"
// ---------------------------------------------------------------------------

export function setupPageSelector(root: HTMLElement): void {
  const selector = root.querySelector<HTMLElement>('[data-page-selector]');
  if (!selector) return;
  const input = $<HTMLInputElement>(selector, '[data-pages-input]');
  for (const radio of selector.querySelectorAll<HTMLInputElement>('input[type="radio"]')) {
    radio.addEventListener('change', () => {
      input.disabled = radio.value === 'all' && radio.checked;
      if (!input.disabled) input.focus();
    });
  }
}

/** The pages the visitor selected, as 0-based indices. Throws PageRangeError for bad input. */
export function selectedPages(root: HTMLElement, pageCount: number): number[] {
  const selector = $(root, '[data-page-selector]');
  const all = selector.querySelector<HTMLInputElement>('input[value="all"]');
  if (all?.checked) return Array.from({ length: pageCount }, (_, index) => index);
  return parsePageSelection($<HTMLInputElement>(selector, '[data-pages-input]').value, pageCount);
}
