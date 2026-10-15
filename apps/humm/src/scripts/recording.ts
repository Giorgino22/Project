/**
 * Browser helper: turns what MediaRecorder recorded (WebM, MP4 … depending on the browser)
 * into the small WAV file the AI gets (see src/lib/wav.ts).
 */
import { WAV_SAMPLE_RATE, bytesToBase64, encodeWav, normalize } from '../lib/wav';

/** Longest recording (seconds). The AI needs only a few seconds; longer just takes longer to send. */
export const MAX_SECONDS = 30;
/** Shorter recordings are almost always a mis-tap. */
export const MIN_SECONDS = 2;

export async function recordingToWavBase64(recording: Blob): Promise<string> {
  // 1. Decode the recording into plain samples (numbers between −1 and 1).
  const context = new AudioContext();
  let decoded: AudioBuffer;
  try {
    decoded = await context.decodeAudioData(await recording.arrayBuffer());
  } finally {
    void context.close();
  }

  // 2. An OfflineAudioContext "plays" the sound into memory instead of the speakers. Giving it
  //    1 channel and 16,000 samples per second makes it mix to mono and resample for us.
  const offline = new OfflineAudioContext(1, Math.ceil(decoded.duration * WAV_SAMPLE_RATE), WAV_SAMPLE_RATE);
  const source = offline.createBufferSource();
  source.buffer = decoded;
  source.connect(offline.destination);
  source.start();
  const mono = (await offline.startRendering()).getChannelData(0);

  // 3. Louder, then WAV, then text (base64) for the request.
  return bytesToBase64(encodeWav(normalize(mono)));
}
