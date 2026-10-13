/**
 * Shows the files a tool created, with download buttons, an optional
 * "Download all (ZIP)" button and "Start over". Markup: Results.astro.
 */
import { iconSvg } from '@tools/shared/icons/svg';
import { formatBytes } from '../lib/format';
import { $, type CommonTexts } from './ui';

export interface OutputFile {
  name: string;
  blob: Blob;
  /** Extra info shown next to the file, e.g. "62% smaller" */
  note?: string;
}

interface ResultsOptions {
  /** File name of the ZIP archive when there are several results */
  zipName: string;
  /** Called when the visitor clicks "Start over" */
  onStartOver: () => void;
}

export class Results {
  private readonly container: HTMLElement;
  private readonly list: HTMLElement;
  private readonly zipButton: HTMLButtonElement;
  private files: OutputFile[] = [];
  private objectUrls: string[] = [];

  constructor(
    root: HTMLElement,
    private readonly t: CommonTexts,
    private readonly lang: string,
    private readonly options: ResultsOptions,
  ) {
    this.container = $(root, '[data-results]');
    this.list = $(this.container, '[data-result-list]');
    this.zipButton = $<HTMLButtonElement>(this.container, '[data-download-all]');
    this.zipButton.addEventListener('click', () => void this.downloadZip());
    $(this.container, '[data-start-over]').addEventListener('click', () => {
      this.clear();
      options.onStartOver();
      root.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }

  show(files: OutputFile[]): void {
    this.clear();
    this.files = files;
    const rows = files.map((file) => {
      const url = URL.createObjectURL(file.blob); // a temporary address for the file in memory
      this.objectUrls.push(url);
      const row = document.createElement('li');
      row.innerHTML = `<span class="result-name"></span><span class="result-meta"></span>
        <a class="btn btn-primary btn-small">${iconSvg('download')} <span></span></a>`;
      row.querySelector('.result-name')!.textContent = file.name;
      row.querySelector('.result-meta')!.textContent = [formatBytes(file.blob.size, this.lang), file.note]
        .filter(Boolean)
        .join(', ');
      const link = row.querySelector('a')!;
      link.href = url;
      link.download = file.name; // the "download" attribute makes the browser save instead of open
      link.querySelector('span')!.textContent = this.t.download;
      return row;
    });
    this.list.replaceChildren(...rows);
    this.zipButton.hidden = files.length < 2;
    this.container.hidden = false;
    this.container.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  clear(): void {
    for (const url of this.objectUrls) URL.revokeObjectURL(url); // free the memory
    this.objectUrls = [];
    this.files = [];
    this.list.replaceChildren();
    this.container.hidden = true;
  }

  private async downloadZip(): Promise<void> {
    this.zipButton.disabled = true;
    try {
      const { zipFiles } = await import('./zip');
      downloadBlob(await zipFiles(this.files), this.options.zipName);
    } finally {
      this.zipButton.disabled = false;
    }
  }
}

/** Starts a download of a file that only exists in memory. */
export function downloadBlob(blob: Blob, name: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = name;
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 60_000); // give the browser time to start the download
}
