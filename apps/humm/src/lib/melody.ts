/**
 * Turns the raw measurements of detectPitch() – about 30 per second, a bit shaky – into a smooth
 * melody line for the staff:
 *
 * 1. Phrases: the stretches where the visitor makes a sound. How loud that is depends on the
 *    visitor (see soundLevel), so soft humming late at night works as well as loud singing.
 *    A short pause (a breath) doesn't end a phrase.
 * 2. Inside a phrase the line goes on, even where no clear note was heard (the "n" in "na na",
 *    a breathy bit): it connects the notes before and after. So red only shows where it was quiet.
 * 3. A note that is far from its neighbours is a measuring error (often exactly one octave off).
 *    Each note is replaced by the middle value ("median") of itself and its 4 neighbours, which
 *    removes such single outliers but keeps real steps in the melody.
 * 4. Phrases without a tune in them (a cough, a click, talking without notes) are left out.
 * 5. What's left is smoothed: each point moves 40 % of the way towards the next note, like a
 *    steady hand drawing instead of a shaky one.
 */
import { QUIET } from './pitch';

export interface MelodyPoint {
  /** Seconds since the recording started */
  time: number;
  /** The note (see frequencyToNote), or null when no clear note was heard */
  note: number | null;
  /** How loud it was (see loudness() in pitch.ts) */
  level: number;
}

type Note = { time: number; note: number };
export type Segment = Note[];

/** Pauses shorter than this (seconds) don't break the line. */
export const BRIDGE_SECONDS = 0.3;
/** Phrases shorter than this (seconds) are left out – a click or a cough. */
export const MIN_SEGMENT_SECONDS = 0.15;
/** A phrase needs at least this many clear notes (a tenth of a second) to count as a tune. */
const MIN_NOTES = 3;
/** Quieter than this share of the singing counts as a pause: a tenth, "20 decibels quieter". */
const PAUSE_SHARE = 0.1;

/**
 * How loud a moment must be to count as sound in this recording: a tenth of how loud the visitor
 * sings, but at least QUIET. "How loud the visitor sings" is measured on the clear notes only,
 * so a bump against the phone doesn't count.
 */
export function soundLevel(points: MelodyPoint[]): number {
  const singing = points.flatMap((point) => (point.note === null ? [] : [point.level])).sort((a, b) => a - b);
  // The 90th of 100 values: the loud parts of the singing, but not the single loudest moment.
  const loud = singing[Math.floor(singing.length * 0.9)] ?? 0;
  return Math.max(QUIET, loud * PAUSE_SHARE);
}

export function melodyLine(points: MelodyPoint[]): Segment[] {
  // 1. Phrases: the moments with sound, cut where it was quiet for longer than a breath.
  const threshold = soundLevel(points);
  const phrases: MelodyPoint[][] = [];
  for (const point of points) {
    if (point.level < threshold) continue;
    const phrase = phrases[phrases.length - 1];
    const last = phrase?.[phrase.length - 1];
    if (phrase && last && point.time - last.time <= BRIDGE_SECONDS) phrase.push(point);
    else phrases.push([point]);
  }

  return phrases.flatMap((phrase) => {
    const start = phrase[0]!.time;
    const end = phrase[phrase.length - 1]!.time;
    // 3. The clear notes, without single measuring errors
    const notes = steady(phrase.flatMap((point) => (point.note === null ? [] : [{ time: point.time, note: point.note }])));
    // 4. No tune in it
    if (end - start < MIN_SEGMENT_SECONDS || notes.length < MIN_NOTES) return [];

    // 2. The voice is there from the first to the last sound of the phrase, so the line is too:
    //    it starts at the first note, ends at the last one and connects the notes in between.
    const first = notes[0]!;
    const last = notes[notes.length - 1]!;
    const segment = [
      ...(first.time > start ? [{ time: start, note: first.note }] : []),
      ...notes,
      ...(last.time < end ? [{ time: end, note: last.note }] : []),
    ];

    // 5. Smooth ("moving average")
    let smooth = segment[0]!.note;
    return [
      segment.map((point) => {
        smooth += 0.4 * (point.note - smooth);
        return { time: point.time, note: smooth };
      }),
    ];
  });
}

/** Each note becomes the median of itself and its 4 neighbours (only neighbours close in time count). */
function steady(notes: Note[]): Note[] {
  return notes.map((point, i) => {
    const near = notes
      .slice(Math.max(0, i - 2), i + 3)
      .filter((other) => Math.abs(other.time - point.time) <= 0.25)
      .map((other) => other.note)
      .sort((a, b) => a - b);
    return { time: point.time, note: near[Math.floor(near.length / 2)]! };
  });
}

/** A stretch without a tune: drawn in red, so a gap in the line clearly means "silent here". */
export interface Silence {
  start: number;
  end: number;
  /** Height to draw it at: the note before (or after) the silence; null = no note heard yet */
  fromNote: number | null;
  toNote: number | null;
}

/**
 * Where the melody line has gaps: before the first piece, between pieces and after the last one,
 * up to `endTime` (the length of the recording so far). Pauses shorter than BRIDGE_SECONDS are
 * already bridged by melodyLine(), so every gap here is a real pause.
 */
export function silences(line: Segment[], endTime: number): Silence[] {
  if (line.length === 0) return endTime > BRIDGE_SECONDS ? [{ start: 0, end: endTime, fromNote: null, toNote: null }] : [];
  const result: Silence[] = [];
  const first = line[0]![0]!;
  if (first.time > BRIDGE_SECONDS) result.push({ start: 0, end: first.time, fromNote: first.note, toNote: first.note });
  for (let i = 1; i < line.length; i++) {
    const before = line[i - 1]![line[i - 1]!.length - 1]!;
    const after = line[i]![0]!;
    if (after.time - before.time > BRIDGE_SECONDS) result.push({ start: before.time, end: after.time, fromNote: before.note, toNote: after.note });
  }
  const lastPiece = line[line.length - 1]!;
  const last = lastPiece[lastPiece.length - 1]!;
  if (endTime - last.time > BRIDGE_SECONDS) result.push({ start: last.time, end: endTime, fromNote: last.note, toNote: last.note });
  return result;
}
