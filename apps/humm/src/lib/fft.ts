/**
 * The Fast Fourier Transform ("FFT"): tells which frequencies are in a short piece of sound and how
 * loud each one is – like the bars of a music visualiser. Used to find the melody of a song
 * (src/lib/songmelody.ts).
 *
 * A piece of `size` samples becomes size / 2 "bins". Bin k is the frequency k × sampleRate / size.
 * The clever part (Cooley–Tukey, 1965): the spectrum of a piece can be put together from the
 * spectra of its even and odd samples, again and again, which is much faster than measuring every
 * frequency on its own (size × log2(size) instead of size × size steps).
 */
export function createFft(size: number): (samples: Float32Array) => Float32Array {
  if (size < 2 || (size & (size - 1)) !== 0) throw new Error('The FFT size must be a power of two.');

  // Prepared once: the order in which the samples are combined ("bit reversal") and the
  // sine/cosine values ("twiddle factors") the combining needs.
  const bits = Math.log2(size);
  const order = new Uint32Array(size);
  for (let i = 0; i < size; i++) {
    let reversed = 0;
    for (let bit = 0; bit < bits; bit++) reversed |= ((i >> bit) & 1) << (bits - 1 - bit);
    order[i] = reversed;
  }
  const cos = new Float64Array(size / 2);
  const sin = new Float64Array(size / 2);
  for (let i = 0; i < size / 2; i++) {
    cos[i] = Math.cos((2 * Math.PI * i) / size);
    sin[i] = -Math.sin((2 * Math.PI * i) / size);
  }
  const real = new Float64Array(size);
  const imaginary = new Float64Array(size);
  const magnitudes = new Float32Array(size / 2);

  /** Returns how strong each frequency is (bins 0 … size/2 − 1). The returned array is reused. */
  return (samples) => {
    for (let i = 0; i < size; i++) {
      real[i] = samples[order[i]!] ?? 0;
      imaginary[i] = 0;
    }
    for (let half = 1; half < size; half *= 2) {
      const step = size / (2 * half);
      for (let start = 0; start < size; start += 2 * half) {
        for (let i = 0; i < half; i++) {
          const a = start + i;
          const b = a + half;
          const c = cos[i * step]!;
          const s = sin[i * step]!;
          const re = real[b]! * c - imaginary[b]! * s;
          const im = real[b]! * s + imaginary[b]! * c;
          real[b] = real[a]! - re;
          imaginary[b] = imaginary[a]! - im;
          real[a] = real[a]! + re;
          imaginary[a] = imaginary[a]! + im;
        }
      }
    }
    for (let k = 0; k < size / 2; k++) magnitudes[k] = Math.hypot(real[k]!, imaginary[k]!);
    return magnitudes;
  };
}
