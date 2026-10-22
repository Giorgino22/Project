/**
 * Does the hummed tune appear in a song, and where? Compares the visitor's melody line with the
 * melody found in the song's preview (src/lib/songmelody.ts).
 *
 * Three things make this hard, and each has its answer:
 * - People hum in their own key → we try every shift in half-semitone steps and keep the best.
 *   Notes an octave apart count as the same (people often hum an octave lower).
 * - People hum faster or slower, and not evenly → "dynamic time warping" (DTW) lines the two
 *   melodies up like two people walking the same path at different paces: each hummed step is
 *   paired with a step of the song, and the song may run up to twice as fast or slow.
 * - The hummed part is somewhere in the song → the pairing may start and end anywhere in it.
 *
 * Tested with made-up songs and hums (tests/unit/compare.test.ts): with 6 to 10 seconds of tune, the
 * right song got the best fit of five candidates 34 times in 36, mostly at the right place. Short
 * hums fit many songs by chance, and similar melodies can fit, too – so a fit means "listen to this
 * part", not "certainly this song" (see fitLabel).
 */

export interface TimedNote {
  /** Seconds since the start (of the recording, or of the song's preview) */
  time: number;
  /** The note (see frequencyToNote in pitch.ts) */
  note: number;
}

/** Notes are compared every 0.1 s. */
export const STEP_SECONDS = 0.1;
/** Differences up to this (semitones) are just a wobbly voice and cost nothing … */
const TOLERANCE = 0.5;
/** … and from this difference on, a note counts as completely wrong. */
const WORST = 3;
/** A change of speed (the song moving on 2 steps, or 2 hummed steps on one) costs a little extra. */
const SPEED_CHANGE = 0.2;
/** Long hums are compared in pieces of 8 s (80 steps); at most this many pieces. */
const PIECE = 80;
const MAX_PIECES = 5;
/** Less than 1.5 s of tune is too little to compare at all. */
const MIN_STEPS = 15;

/**
 * Whether a fit means something depends on how much tune there is. Measured with 36 made-up hums
 * of 12 made-up songs for each length (fits of the right song / the best of 396 wrong ones):
 * - 3 s of tune: right 0.92 in the middle, wrong up to 1.00 → useless
 * - 5 s: right 0.90 in the middle, wrong up to 0.92 → still too easy to fit by chance
 * - 6 s: right 0.89, wrong up to 0.89 (1 in 100 above 0.87)
 * - 8–10 s: right 0.89, wrong up to 0.86 (1 in 100 above 0.83)
 */
export const RELIABLE_STEPS = 60; // 6 s of tune
export function fitLabel(match: MelodyMatch, humSteps: number): 'good' | 'partly' | null {
  if (humSteps < RELIABLE_STEPS) return null;
  const strict = humSteps < 80; // 6 to 8 s
  if (match.fit >= (strict ? 0.9 : 0.88)) return 'good';
  if (match.fit >= (strict ? 0.88 : 0.85)) return 'partly';
  return null;
}

export interface MelodyMatch {
  /** 0–1: how well the tune fits the song (1 = every note fits) */
  fit: number;
  /** Where the matching part of the song starts and ends (seconds) */
  start: number;
  end: number;
  /** How many semitones the song is higher than the hum (0 … 11.5) */
  shift: number;
  /** Which moment of the hum goes with which moment of the song: [hum time, song time] */
  pairs: [number, number][];
}

/**
 * One note every STEP_SECONDS: the middle value ("median") of the notes in that time, so a single
 * wrong measurement doesn't count. Times without notes are left out.
 */
export function evenSteps(points: { time: number; note: number | null }[]): TimedNote[] {
  const groups = new Map<number, number[]>();
  for (const point of points) {
    if (point.note === null) continue;
    const index = Math.floor(point.time / STEP_SECONDS);
    groups.set(index, [...(groups.get(index) ?? []), point.note]);
  }
  return [...groups.entries()]
    .sort(([a], [b]) => a - b)
    .map(([index, notes]) => ({ time: (index + 0.5) * STEP_SECONDS, note: median(notes) }));
}

/** Compares a hummed tune with a song's melody. Null if one of them has too little melody. */
export function compareMelodies(hum: TimedNote[], song: TimedNote[]): MelodyMatch | null {
  if (hum.length < MIN_STEPS || song.length < MIN_STEPS) return null;

  // The pieces of the hum to try: the whole hum if it is short, else up to 5 pieces spread over it.
  const pieces: TimedNote[][] = [];
  if (hum.length <= PIECE) pieces.push(hum);
  else {
    const count = Math.min(MAX_PIECES, Math.ceil((hum.length - PIECE) / (PIECE / 2)) + 1);
    for (let n = 0; n < count; n++) {
      const from = Math.round((n * (hum.length - PIECE)) / Math.max(1, count - 1));
      pieces.push(hum.slice(from, from + PIECE));
    }
  }

  let best = { cost: Infinity, piece: pieces[0]!, shift: 0 };
  for (const piece of pieces) {
    // First every whole semitone, then the half steps next to the best one.
    let pieceBest = { cost: Infinity, shift: 0 };
    for (let shift = 0; shift < 12; shift++) {
      const cost = align(piece, song, shift).cost;
      if (cost < pieceBest.cost) pieceBest = { cost, shift };
    }
    for (const shift of [pieceBest.shift - 0.5, pieceBest.shift + 0.5]) {
      const cost = align(piece, song, (shift + 12) % 12).cost;
      if (cost < pieceBest.cost) pieceBest = { cost, shift: (shift + 12) % 12 };
    }
    if (pieceBest.cost < best.cost) best = { ...pieceBest, piece };
  }

  const { pairs } = align(best.piece, song, best.shift, true);
  return { fit: Math.max(0, 1 - best.cost), start: pairs[0]![1], end: pairs[pairs.length - 1]![1], shift: best.shift, pairs };
}

/** 0 = same note (or an octave apart), 1 = WORST semitones or more apart. */
function difference(a: number, b: number): number {
  const semitones = Math.abs(a - b);
  const folded = Math.abs(semitones - 12 * Math.round(semitones / 12)); // an octave apart = the same
  return Math.min(Math.max(0, folded - TOLERANCE), WORST - TOLERANCE) / (WORST - TOLERANCE);
}

/**
 * The DTW itself. cost[i][j] = the smallest total difference when hummed step i is paired with
 * song step j. Each hummed step gets one song step; from one hummed step to the next, the song
 * moves on by 1 step (same speed) or 2 (the hum is slower) – or two hummed steps share one song
 * step (the hum is faster). The result is the average difference per hummed step.
 */
function align(hum: TimedNote[], song: TimedNote[], shift: number, withPairs = false): { cost: number; pairs: [number, number][] } {
  const n = hum.length;
  const m = song.length;
  const at = (i: number, j: number) => difference(hum[i]!.note + shift, song[j]!.note);
  // Only the last two rows are needed for the cost; the way back is stored only when the pairs are wanted.
  let twoBack = new Float64Array(m).fill(Infinity);
  let oneBack = new Float64Array(m);
  let current = new Float64Array(m);
  const steps = withPairs ? new Uint8Array(n * m) : null; // 1 = same speed, 2 = song skips one, 3 = hum shares

  for (let j = 0; j < m; j++) oneBack[j] = at(0, j); // the hum may start anywhere in the song
  for (let i = 1; i < n; i++) {
    for (let j = 0; j < m; j++) {
      const here = at(i, j);
      let value = Infinity;
      let step = 0;
      if (j >= 1 && oneBack[j - 1]! + here < value) [value, step] = [oneBack[j - 1]! + here, 1];
      if (j >= 2 && oneBack[j - 2]! + here + SPEED_CHANGE < value) [value, step] = [oneBack[j - 2]! + here + SPEED_CHANGE, 2];
      if (i === 1 || j >= 1) {
        // Hummed steps i − 1 and i both go with song step j (at the very start, nothing comes before).
        const shared = (i === 1 ? 0 : twoBack[j - 1]!) + at(i - 1, j) + here + SPEED_CHANGE;
        if (shared < value) [value, step] = [shared, 3];
      }
      current[j] = value;
      if (steps) steps[i * m + j] = step;
    }
    [twoBack, oneBack, current] = [oneBack, current, twoBack];
  }

  let end = 0;
  for (let j = 1; j < m; j++) if (oneBack[j]! < oneBack[end]!) end = j;
  const cost = oneBack[end]! / n;
  if (!steps) return { cost, pairs: [] };

  // Walk back along the stored steps to collect the pairs.
  const pairs: [number, number][] = [];
  let i = n - 1;
  let j = end;
  while (i >= 0) {
    pairs.push([hum[i]!.time, song[j]!.time]);
    const step = i > 0 ? steps[i * m + j] : 0;
    if (step === 1) [i, j] = [i - 1, j - 1];
    else if (step === 2) [i, j] = [i - 1, j - 2];
    else if (step === 3) {
      pairs.push([hum[i - 1]!.time, song[j]!.time]);
      [i, j] = [i - 2, j - 1];
    } else i = -1;
  }
  return { cost, pairs: pairs.reverse() };
}

function median(values: number[]): number {
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.floor(sorted.length / 2)]!;
}
