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
