/**
 * Creates a short "hummed" tune as a WAV file for the browser tests: eight notes going up and
 * down, with short pauses – and one long pause in the middle, which the staff shows in red.
 * Chromium plays it as if it came from the microphone.
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { encodeWav } from '../../src/lib/wav';

export const MELODY_NOTES_HZ = [220, 247, 277, 294, 330, 294, 277, 247];

export function writeMelodyFile(path: string): string {
  const sampleRate = 44_100;
  const note = 0.4 * sampleRate; // each note lasts 0.4 s …
  const pause = 0.1 * sampleRate; // … followed by 0.1 s of silence
  const longPause = 0.8 * sampleRate; // after the fourth note
  const samples = new Float32Array(MELODY_NOTES_HZ.length * (note + pause) + longPause);
  MELODY_NOTES_HZ.forEach((hz, n) => {
    const start = n * (note + pause) + (n >= 4 ? longPause : 0);
    for (let i = 0; i < note; i++) samples[start + i] = 0.5 * Math.sin((2 * Math.PI * hz * i) / sampleRate);
  });
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, encodeWav(samples, sampleRate));
  return path;
}

/**
 * A made-up song's 30-second preview for the melody check: other notes first, then the test
 * tune twice (5 semitones higher, over a quiet bass), then other notes again. The hum that the
 * fake microphone plays should be found in it, between 0:04 and 0:14.
 */
export function songWithTune(withTune = true): Buffer {
  const sampleRate = 16_000;
  const parts: { hz: number | null; seconds: number }[] = [];
  const other = [392, 330, 262, 330, 392, 523, 392, 262]; // a C major chord, up and down
  const filler = () => other.forEach((hz) => parts.push({ hz, seconds: 0.5 }));
  const tune = () =>
    MELODY_NOTES_HZ.forEach((hz, n) => {
      parts.push({ hz: hz * 2 ** (5 / 12), seconds: 0.4 }, { hz: null, seconds: n === 3 ? 0.9 : 0.1 });
    });
  filler();
  if (withTune) {
    tune();
    tune();
  } else {
    filler();
    filler();
  }
  filler();

  const total = parts.reduce((sum, part) => sum + part.seconds, 0);
  const samples = new Float32Array(Math.round(total * sampleRate));
  let start = 0;
  for (const { hz, seconds } of parts) {
    const first = Math.round(start * sampleRate);
    for (let i = 0; i < Math.round(seconds * sampleRate); i++) {
      const t = i / sampleRate;
      let value = 0.03 * Math.sin(2 * Math.PI * 98 * (first + i) / sampleRate); // a quiet low G under everything
      if (hz) for (let k = 1; k <= 6; k++) value += (0.3 / k) * Math.sin(2 * Math.PI * k * hz * t); // a sung note with overtones
      samples[first + i] = value;
    }
    start += seconds;
  }
  return Buffer.from(encodeWav(samples, sampleRate));
}
