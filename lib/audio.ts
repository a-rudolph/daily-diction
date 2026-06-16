/**
 * Lightweight audio feedback via Web Audio API.
 * No files, no deps, works offline. Client-only — never import from server code.
 *
 * AudioContext is lazy-created and reused. iOS Safari requires the context to be
 * created (or resumed) inside a user-gesture handler — both sounds are triggered
 * from button taps so they qualify.
 */

let _ctx: AudioContext | null = null;

function ctx(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  try {
    _ctx ??= new AudioContext();
    if (_ctx.state === 'suspended') _ctx.resume();
    return _ctx;
  } catch {
    return null;
  }
}

function tone(
  ac: AudioContext,
  freq: number,
  startOffset: number,
  duration: number,
  peakGain: number,
  type: OscillatorType = 'sine',
  endFreq?: number,
) {
  const osc = ac.createOscillator();
  const gain = ac.createGain();
  osc.connect(gain);
  gain.connect(ac.destination);

  const t = ac.currentTime + startOffset;
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t);
  if (endFreq !== undefined) osc.frequency.exponentialRampToValueAtTime(endFreq, t + duration);
  gain.gain.setValueAtTime(peakGain, t);
  gain.gain.exponentialRampToValueAtTime(0.001, t + duration);
  osc.start(t);
  osc.stop(t + duration + 0.01);
}

/** Two-note ascending chime — played when a phrase passes. */
export function playPass() {
  const ac = ctx();
  if (!ac) return;
  tone(ac, 523, 0,    0.18, 0.22); // C5
  tone(ac, 784, 0.13, 0.28, 0.18); // G5
}

/** Soft descending tone — played when a phrase doesn't match. */
export function playFail() {
  const ac = ctx();
  if (!ac) return;
  tone(ac, 370, 0, 0.35, 0.14, 'sine', 260); // F#4 → C4, descending bend
}
