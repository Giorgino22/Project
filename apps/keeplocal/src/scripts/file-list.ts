/**
 * A list of chosen files that the visitor can reorder and remove
 * (used by "Merge PDF" and "JPG to PDF", where the order matters).
 */
import { iconSvg } from '@tools/shared/icons/svg';
import type { CommonTexts } from './ui';

export interface ListItem {
  file: File;
  /** Small grey text under the name, e.g. "3 pages, 1.2 MB" */
  meta: string;
  /** Optional preview image (an object URL created with URL.createObjectURL) */
  thumbnail?: string;
}

export class FileListView<T extends ListItem> {
  items: T[] = [];

  constructor(
    private readonly list: HTMLElement,
    private readonly t: CommonTexts,
    private readonly onChange: () => void,
  ) {
    // One click handler for all buttons ("event delegation") instead of one per button.
    list.addEventListener('click', (event) => {
      const button = (event.target as Element).closest<HTMLButtonElement>('button[data-action]');
      const row = button?.closest<HTMLElement>('li');
      if (!button || !row) return;
      const index = Number(row.dataset.index);
      if (button.dataset.action === 'up') this.move(index, -1);
      if (button.dataset.action === 'down') this.move(index, +1);
      if (button.dataset.action === 'remove') this.remove(index);
    });
  }

  add(items: T[]): void {
    this.items.push(...items);
    this.update();
  }

  remove(index: number): void {
    const [item] = this.items.splice(index, 1);
    if (item?.thumbnail) URL.revokeObjectURL(item.thumbnail); // free the memory of the preview
    this.update();
  }

  move(index: number, delta: number): void {
    const target = index + delta;
    if (target < 0 || target >= this.items.length) return;
    [this.items[index], this.items[target]] = [this.items[target]!, this.items[index]!];
    this.update();
    // Keep keyboard focus on the button that was pressed, now in its new row.
    const action = delta < 0 ? 'up' : 'down';
    this.list.querySelector<HTMLButtonElement>(`li[data-index="${target}"] button[data-action="${action}"]`)?.focus();
  }

  clear(): void {
    for (const item of this.items) if (item.thumbnail) URL.revokeObjectURL(item.thumbnail);
    this.items = [];
    this.update();
  }

  private update(): void {
    this.render();
    this.onChange();
  }

  private render(): void {
    const last = this.items.length - 1;
    const rows = this.items.map((item, index) => {
      const row = document.createElement('li');
      row.dataset.index = String(index);
      // Only fixed HTML here – file names are inserted with textContent below, never as HTML,
      // so a file called "<img onerror=…>.pdf" can't run code (that would be an XSS hole).
      row.innerHTML = `
        <span class="file-index">${index + 1}</span>
        ${item.thumbnail ? '<img class="file-thumb" alt="">' : ''}
        <span class="file-main"><span class="file-name"></span><span class="file-meta"></span></span>
        <button type="button" class="icon-button" data-action="up" ${index === 0 ? 'disabled' : ''}>${iconSvg('arrow-up')}</button>
        <button type="button" class="icon-button" data-action="down" ${index === last ? 'disabled' : ''}>${iconSvg('arrow-down')}</button>
        <button type="button" class="icon-button" data-action="remove">${iconSvg('x')}</button>`;
      row.querySelector('.file-name')!.textContent = item.file.name;
      row.querySelector('.file-meta')!.textContent = item.meta;
      if (item.thumbnail) row.querySelector('img')!.src = item.thumbnail;
      const label = (action: string, text: string) =>
        row.querySelector(`[data-action="${action}"]`)!.setAttribute('aria-label', `${text}: ${item.file.name}`);
      label('up', this.t.moveUp);
      label('down', this.t.moveDown);
      label('remove', this.t.remove);
      return row;
    });
    this.list.replaceChildren(...rows);
  }
}
