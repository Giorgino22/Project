/**
 * The keyboards drawn on the keyboard test pages (without number pad):
 * - English page: US layout ("ANSI": wide Enter key, long left Shift).
 * - German page: QWERTZ layout ("ISO": tall Enter key over two rows, an extra < key next to the
 *   left Shift), with the labels of German/Austrian or – one click away – Swiss keyboards.
 *
 * `code` is the browser's name for a physical key (KeyboardEvent.code) – it stays the same
 * whatever language the keyboard is set to. That's why the QWERTZ "Z" key has the code "KeyY":
 * it sits where the US keyboard has its Y. An empty code is a gap between keys.
 * `width` is in key units: 1 = a letter key. Every row of the main block adds up to 15.
 */

export interface Key {
  code: string;
  label: string;
  width: number;
  /** Label on Swiss keyboards, where it differs (e.g. "§" instead of "^") */
  ch?: string;
  /** 2 = the key is two rows tall (the Enter key of QWERTZ keyboards) */
  rows?: number;
}

const key = (code: string, label: string, width = 1, extra: Partial<Key> = {}): Key => ({ code, label, width, ...extra });
const gap = (width: number): Key => ({ code: '', label: '', width });
/** 'QWE' → letter keys Q, W, E */
const letters = (text: string): Key[] => [...text].map((letter) => key(`Key${letter}`, letter));

export const mainBlock: Key[][] = [
  [
    key('Escape', 'Esc'),
    gap(1),
    ...[1, 2, 3, 4].map((n) => key(`F${n}`, `F${n}`)),
    gap(0.5),
    ...[5, 6, 7, 8].map((n) => key(`F${n}`, `F${n}`)),
    gap(0.5),
    ...[9, 10, 11, 12].map((n) => key(`F${n}`, `F${n}`)),
  ],
  [
    key('Backquote', '`'),
    ...[1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map((n) => key(`Digit${n}`, String(n))),
    key('Minus', '-'),
    key('Equal', '='),
    key('Backspace', 'Backspace', 2),
  ],
  [key('Tab', 'Tab', 1.5), ...letters('QWERTYUIOP'), key('BracketLeft', '['), key('BracketRight', ']'), key('Backslash', '\\', 1.5)],
  [key('CapsLock', 'Caps Lock', 1.75), ...letters('ASDFGHJKL'), key('Semicolon', ';'), key('Quote', "'"), key('Enter', 'Enter', 2.25)],
  [key('ShiftLeft', 'Shift', 2.25), ...letters('ZXCVBNM'), key('Comma', ','), key('Period', '.'), key('Slash', '/'), key('ShiftRight', 'Shift', 2.75)],
  [
    key('ControlLeft', 'Ctrl', 1.25),
    key('MetaLeft', 'Win', 1.25),
    key('AltLeft', 'Alt', 1.25),
    key('Space', 'Space', 6.25),
    key('AltRight', 'Alt', 1.25),
    key('MetaRight', 'Win', 1.25),
    key('ContextMenu', 'Menu', 1.25),
    key('ControlRight', 'Ctrl', 1.25),
  ],
];

/** Arrows and the keys above them – drawn next to the main block. */
export const navBlock: Key[][] = [
  [key('PrintScreen', 'PrtSc'), key('ScrollLock', 'ScrLk'), key('Pause', 'Pause')],
  [key('Insert', 'Ins'), key('Home', 'Home'), key('PageUp', 'PgUp')],
  [key('Delete', 'Del'), key('End', 'End'), key('PageDown', 'PgDn')],
  [gap(3)],
  [gap(1), key('ArrowUp', '↑'), gap(1)],
  [key('ArrowLeft', '←'), key('ArrowDown', '↓'), key('ArrowRight', '→')],
];

// ---------- QWERTZ (Germany, Austria, Switzerland) ----------

/** Letter keys with their codes: the codes stay those of the US positions, the labels are QWERTZ. */
const qwertz = (codes: string, labels: string): Key[] => [...labels].map((label, i) => key(`Key${codes[i]}`, label));

export const qwertzMainBlock: Key[][] = [
  mainBlock[0]!, // Esc and F1–F12 are the same
  [
    key('Backquote', '^', 1, { ch: '§' }),
    ...[1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map((n) => key(`Digit${n}`, String(n))),
    key('Minus', 'ß', 1, { ch: "'" }),
    key('Equal', '´', 1, { ch: '^' }),
    key('Backspace', 'Rücktaste', 2),
  ],
  [
    key('Tab', 'Tab', 1.5),
    ...qwertz('QWERTYUIOP', 'QWERTZUIOP'),
    key('BracketLeft', 'Ü', 1, { ch: 'ü' }),
    key('BracketRight', '+', 1, { ch: '¨' }),
    key('Enter', 'Enter', 1.5, { rows: 2 }), // reaches down into the next row
  ],
  [
    key('CapsLock', 'Feststell', 1.5),
    ...qwertz('ASDFGHJKL', 'ASDFGHJKL'),
    key('Semicolon', 'Ö', 1, { ch: 'ö' }),
    key('Quote', 'Ä', 1, { ch: 'ä' }),
    key('Backslash', '#', 1, { ch: '$' }),
    // the last 1.5 units of this row belong to the Enter key above
  ],
  [
    key('ShiftLeft', 'Shift', 1.25),
    key('IntlBackslash', '<'),
    ...qwertz('ZXCVBNM', 'YXCVBNM'),
    key('Comma', ','),
    key('Period', '.'),
    key('Slash', '-'),
    key('ShiftRight', 'Shift', 2.75),
  ],
  [
    key('ControlLeft', 'Strg', 1.25, { ch: 'Ctrl' }),
    key('MetaLeft', 'Win', 1.25),
    key('AltLeft', 'Alt', 1.25),
    key('Space', 'Leertaste', 6.25),
    key('AltRight', 'AltGr', 1.25),
    key('MetaRight', 'Win', 1.25),
    key('ContextMenu', 'Menü', 1.25),
    key('ControlRight', 'Strg', 1.25, { ch: 'Ctrl' }),
  ],
];

export const qwertzNavBlock: Key[][] = [
  [key('PrintScreen', 'Druck'), key('ScrollLock', 'Rollen'), key('Pause', 'Pause')],
  [key('Insert', 'Einfg'), key('Home', 'Pos1'), key('PageUp', 'Bild↑')],
  [key('Delete', 'Entf'), key('End', 'Ende'), key('PageDown', 'Bild↓')],
  [gap(3)],
  [gap(1), key('ArrowUp', '↑'), gap(1)],
  [key('ArrowLeft', '←'), key('ArrowDown', '↓'), key('ArrowRight', '→')],
];

/** The keyboards by name: 'us' for the English page, 'qwertz' for the German one. */
export const keyboards = {
  us: { main: mainBlock, nav: navBlock },
  qwertz: { main: qwertzMainBlock, nav: qwertzNavBlock },
};

export type KeyboardId = keyof typeof keyboards;

/** Names of special keys in the "Last key" line, in the page's language. */
export interface KeyNames {
  space: string;
  dead: string;
  unknown: string;
}

/** What to show for a pressed key: "a", "Shift", "Space"… */
export function keyName(key: string, names: KeyNames = { space: 'Space', dead: 'Dead key (accent)', unknown: 'Unknown' }): string {
  if (key === ' ') return names.space;
  if (key === 'Dead') return names.dead;
  return key || names.unknown;
}
