import { describe, expect, it } from 'vitest';
import { detectPitch, frequencyToNote } from '../../src/lib/pitch';
import { estimateSeconds, progressFraction, timeLeftText } from '../../src/lib/progress';
import { bytesToBase64, encodeWav, normalize } from '../../src/lib/wav';

/** A pure tone, like someone humming one steady note. */
function tone(hz: number, sampleRate: number, length = 2048, volume = 0.5): Float32Array {
  return Float32Array.from({ length }, (_, i) => volume * Math.sin((2 * Math.PI * hz * i) / sampleRate));
}

describe('WAV file', () => {
  it('writes a correct header and 16-bit samples', () => {
    const wav = encodeWav(new Float32Array([0, 1, -1, 0.5]), 16_000);
    const view = new DataView(wav.buffer);
    const text = (start: number) => String.fromCharCode(...wav.subarray(start, start + 4));
    expect(text(0)).toBe('RIFF');
    expect(text(8)).toBe('WAVE');
    expect(text(36)).toBe('data');
    expect(view.getUint16(22, true)).toBe(1); // mono
    expect(view.getUint32(24, true)).toBe(16_000);
    expect(view.getUint32(40, true)).toBe(8); // 4 samples × 2 bytes
    expect(wav.length).toBe(44 + 8);
    expect(view.getInt16(46, true)).toBe(32767);
    expect(view.getInt16(48, true)).toBe(-32767);
  });

  it('makes quiet humming louder, but leaves silence alone', () => {
    const louder = normalize(new Float32Array([0.1, -0.2, 0.05]));
    expect(Math.max(...louder.map(Math.abs))).toBeCloseTo(0.9);
    expect([...normalize(new Float32Array(3))]).toEqual([0, 0, 0]);
  });

  it('turns bytes into base64 text, also for big files', () => {
    expect(bytesToBase64(new Uint8Array([72, 105]))).toBe('SGk=');
    const big = new Uint8Array(100_000).fill(7);
    expect(Buffer.from(bytesToBase64(big), 'base64')).toEqual(Buffer.from(big));
  });
});

describe('note detection', () => {
  it.each([98, 220, 440, 880, 1760])('hears a %i Hz tone', (hz) => {
    for (const sampleRate of [44_100, 48_000, 16_000]) {
      const found = detectPitch(tone(hz, sampleRate), sampleRate);
      expect(found, `${hz} Hz at ${sampleRate}`).not.toBeNull();
      expect(Math.abs(found! - hz) / hz, `${hz} Hz at ${sampleRate}`).toBeLessThan(0.02);
    }
  });

  it('hears soft humming too – phone microphones are quiet', () => {
    expect(detectPitch(tone(220, 48_000, 2048, 0.005), 48_000)).toBeCloseTo(220, -1);
    expect(detectPitch(tone(220, 48_000, 2048, 0.001), 48_000)).toBeNull(); // as quiet as an empty room
  });

  it('returns nothing for silence and for noise', () => {
    expect(detectPitch(new Float32Array(2048), 44_100)).toBeNull();
    let seed = 1;
    const random = () => ((seed = (seed * 16807) % 2147483647) / 2147483647) * 2 - 1;
    expect(detectPitch(Float32Array.from({ length: 2048 }, random), 44_100)).toBeNull();
  });

  it('does not jump an octave down when the tone has overtones', () => {
    const sampleRate = 44_100;
    const hum = tone(196, sampleRate).map((value, i) => value + 0.3 * Math.sin((2 * Math.PI * 392 * i) / sampleRate));
    expect(detectPitch(hum, sampleRate)).toBeCloseTo(196, -1);
  });

  it('turns frequencies into evenly spaced notes', () => {
    expect(frequencyToNote(440)).toBeCloseTo(69);
    expect(frequencyToNote(880)).toBeCloseTo(81); // one octave = 12 semitones higher
  });
});

describe('waiting circle', () => {
  it('guesses the time from earlier searches', () => {
    expect(estimateSeconds([], 12)).toBe(12);
    expect(estimateSeconds([8, 9, 30], 12)).toBe(9); // the middle value, not the slow outlier
    expect(estimateSeconds([1], 12)).toBe(4); // never shorter than 4 s
  });

  it('fills to 90 % at the estimate and never closes on its own', () => {
    expect(progressFraction(0, 10)).toBe(0);
    expect(progressFraction(5, 10)).toBeCloseTo(0.45);
    expect(progressFraction(10, 10)).toBeCloseTo(0.9);
    expect(progressFraction(60, 10)).toBeLessThan(0.99);
    expect(progressFraction(60, 10)).toBeGreaterThan(progressFraction(20, 10));
  });

  it('says how long it still takes', () => {
    expect(timeLeftText(2, 12)).toBe('About 10 seconds left');
    expect(timeLeftText(11.5, 12)).toBe('About 1 second left');
    expect(timeLeftText(13, 12)).toBe('Taking a little longer than usual');
  });
});
