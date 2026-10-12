/**
 * Makes a FileDrop component (FileDrop.astro) work: files can be chosen with the
 * button or dragged onto the page. We listen on the whole window, because a file
 * dropped next to the box would otherwise be opened by the browser, replacing our page.
 */
import { matchesAccept } from '../lib/format';
import { $ } from './ui';

export function setupFileDrop(root: HTMLElement, onFiles: (files: File[]) => void): void {
  const zone = $(root, '[data-dropzone]');
  const input = $<HTMLInputElement>(zone, 'input[type="file"]');

  const deliver = (list: FileList | null | undefined) => {
    const files = [...(list ?? [])].filter((file) => matchesAccept(file, input.accept));
    if (files.length > 0) onFiles(input.multiple ? files : files.slice(0, 1));
  };

  input.addEventListener('change', () => {
    deliver(input.files);
    input.value = ''; // reset, so choosing the same file again still triggers "change"
  });

  const isFileDrag = (event: DragEvent) => event.dataTransfer?.types.includes('Files') ?? false;

  // dragenter/dragleave fire for every element the pointer crosses – counting them
  // keeps the highlight from flickering.
  let depth = 0;
  window.addEventListener('dragenter', (event) => {
    if (!isFileDrag(event)) return;
    depth++;
    zone.classList.add('is-dragging');
  });
  window.addEventListener('dragleave', () => {
    depth = Math.max(0, depth - 1);
    if (depth === 0) zone.classList.remove('is-dragging');
  });
  window.addEventListener('dragover', (event) => {
    if (isFileDrag(event)) event.preventDefault(); // allows dropping
  });
  window.addEventListener('drop', (event) => {
    if (!isFileDrag(event)) return;
    event.preventDefault(); // don't let the browser open the file
    depth = 0;
    zone.classList.remove('is-dragging');
    deliver(event.dataTransfer?.files);
  });
}
