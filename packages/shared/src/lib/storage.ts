/**
 * Saving small things in the visitor's browser (localStorage), e.g. wheel entries or a
 * personal typing record. The data never leaves the device. Browsers can block storage
 * (private mode, strict settings), so every access is wrapped in try/catch: the tools
 * must keep working without it.
 */
export function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw === null ? fallback : (JSON.parse(raw) as T);
  } catch {
    return fallback;
  }
}

export function save(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage blocked or full – not a problem, the tool still works.
  }
}
