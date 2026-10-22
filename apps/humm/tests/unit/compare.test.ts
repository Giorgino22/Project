import { describe, expect, it } from 'vitest';
import { compareMelodies, evenSteps, fitLabel, type TimedNote } from '../../src/lib/compare';
import { createFft } from '../../src/lib/fft';
import { melodyLine } from '../../src/lib/melody';
import { songMelody } from '../../src/lib/songmelody';
import { humPart, makeTune, randomFrom, renderSong, startTimes, type TuneNote } from './music';
import { listen, sing } from './voice';

/** A tune as one note every 0.1 s (what compareMelodies gets), starting at `offset` seconds. */
function asSteps(notes: TuneNote[], offset = 0, tempo = 1, transpose = 0): TimedNote[] {
  const points: { time: number; note: number | null }[] = [];
  let time = offset;
  for (const { note, seconds } of notes) {
    for (let t = 0; t < seconds / tempo; t += 0.05) points.push({ time: time + t, note: note === null ? null : note + transpose });
    time += seconds / tempo;
  }
  return evenSteps(points);
}

describe('FFT', () => {
  it('measures the same frequencies as the slow, obvious way', () => {
    const random = randomFrom(3);
    const samples = Float32Array.from({ length: 64 }, () => random() * 2 - 1);
    const fast = createFft(64)(samples);
    for (let k = 0; k < 32; k++) {
      let re = 0;
      let im = 0;
      samples.forEach((value, i) => {
        re += value * Math.cos((2 * Math.PI * k * i) / 64);
        im -= value * Math.sin((2 * Math.PI * k * i) / 64);
      });
      expect(fast[k]).toBeCloseTo(Math.hypot(re, im), 4);
    }
  });
});

describe('the melody of a song', () => {
  it.each([1, 2])('is found under chords, bass and drums (song %i)', (seed) => {
    const tune = makeTune(seed);
    const melody = songMelody(renderSong(tune, 8000, seed));
    const starts = startTimes(tune.notes);
    let checked = 0;
    let right = 0;
    melody.notes.forEach((note, t) => {
      const time = t * melody.step + 0.064; // the middle of the 128 ms that were looked at
      const i = starts.findIndex((start, k) => time >= start + 0.1 && time < start + tune.notes[k]!.seconds - 0.08);
      const truth = tune.notes[i]?.note;
      if (truth === undefined || truth === null) return; // between notes or in a rest
      checked++;
      if (note !== null && Math.abs(note - truth) <= 1) right++;
    });
    expect(right / checked).toBeGreaterThan(0.85);
  });
});

describe('comparing a hum with a song', () => {
  const tune = makeTune(5).notes;

  it('finds where the hummed part is, in another key and at another speed', () => {
    const song = asSteps(tune);
    const from = startTimes(tune).findIndex((start) => start >= 10);
    const hum = asSteps(tune.slice(from, from + 14), 0, 1.2, -5); // 20 % faster, 5 semitones lower
    const match = compareMelodies(hum, song)!;
    expect(fitLabel(match, hum.length)).toBe('good');
    expect(match.start).toBeCloseTo(startTimes(tune)[from]!, 0);
    expect(match.shift).toBe(5);
    expect(match.pairs.length).toBeGreaterThanOrEqual(hum.length);
  });

  it('gives an unrelated melody a low fit', () => {
    const other = makeTune(9).notes;
    const hum = asSteps(other.slice(0, 20));
    const match = compareMelodies(hum, asSteps(tune))!;
    expect(hum.length).toBeGreaterThan(60);
    expect(fitLabel(match, hum.length)).toBeNull();
  });

  it('claims nothing for very short hums – they fit many songs by chance', () => {
    const hum = asSteps(tune.slice(4, 8));
    expect(hum.length).toBeLessThan(60);
    expect(fitLabel(compareMelodies(hum, asSteps(tune))!, hum.length)).toBeNull();
  });

  it('needs at least a little melody', () => {
    expect(compareMelodies(asSteps(tune.slice(0, 1)), asSteps(tune))).toBeNull();
  });

  it('picks the right one of five songs for real-sounding hums', () => {
    const songs = [1, 2, 3, 4, 5].map((seed) => {
      const song = makeTune(seed);
      const melody = songMelody(renderSong(song, 8000, seed));
      return { song, notes: evenSteps(melody.notes.map((note, t) => ({ time: t * melody.step + 0.064, note }))) };
    });
    for (const k of [0, 2, 4]) {
      // Someone hums 8 s from 0:12 on, 7 semitones higher and 15 % faster, with a few wrong notes.
      const voice = sing(humPart(songs[k]!.song, { from: 12, seconds: 8, transpose: 7, tempo: 1.15, seed: k }), { loudness: 0.02 });
      const hum = evenSteps(melodyLine(listen(voice)).flat());
      const fits = songs.map((song) => compareMelodies(hum, song.notes)?.fit ?? 0);
      expect(fits.indexOf(Math.max(...fits)), `hum of song ${k + 1}`).toBe(k);
    }
  });
});
