/**
 * The keyboard drawn on the keyboard test page (US layout without number pad).
 * `code` is the browser's name for a physical key (KeyboardEvent.code) – it stays the same
 * whatever language the keyboard is set to. An empty code is a gap between keys.
 * `width` is in key units: 1 = a letter key. Every row of the main block adds up to 15.
 */

export interface Key {
  code: string;
  label: string;
  width: number;
}

const key = (code: string, label: string, width = 1): Key => ({ code, label, width });
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

/** What to show for a pressed key: "a", "Shift", "Space"… */
export function keyName(key: string): string {
  if (key === ' ') return 'Space';
  if (key === 'Dead') return 'Dead key (accent)';
  return key || 'Unknown';
}
