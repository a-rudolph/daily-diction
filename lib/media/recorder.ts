/**
 * MediaRecorder-backed implementation of AudioRecorder.
 *
 * iOS spike notes
 * ───────────────
 * On iOS Safari, webkitSpeechRecognition and MediaRecorder may both claim
 * the microphone. This has NOT been empirically verified (Phase 5 spike).
 *
 * BEFORE using this in production:
 *   1. Test on a real iOS device (not simulator) with both
 *      webkitSpeechRecognition and MediaRecorder active simultaneously.
 *   2. If they conflict:
 *      - In "recording" listener mode, skip startRecognition() entirely.
 *      - Let the user listen back and self-rate (source: "manual").
 *      - The existing "Mark as spoken" path already supports this.
 *
 * The isIOSSafari() helper below can gate this fallback once the spike
 * has been validated.
 */

import type { AudioRecorder } from './types';

function isIOSSafari(): boolean {
  if (typeof window === 'undefined') return false;
  const ua = navigator.userAgent;
  return /iP(ad|hone|od)/.test(ua) && /WebKit/.test(ua) && !/CriOS|FxiOS/.test(ua);
}

class MediaAudioRecorder implements AudioRecorder {
  private _recorder: MediaRecorder | null = null;
  private _chunks: Blob[] = [];
  private _resolve: ((blob: Blob) => void) | null = null;

  isSupported(): boolean {
    return typeof window !== 'undefined' && typeof MediaRecorder !== 'undefined';
  }

  async start(): Promise<Blob> {
    if (!this.isSupported()) {
      return Promise.reject(new Error('MediaRecorder is not supported'));
    }

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    this._chunks = [];

    return new Promise((resolve) => {
      this._resolve = resolve;

      // Prefer webm/opus on desktop; fall back for Safari which supports mp4/aac.
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : MediaRecorder.isTypeSupported('audio/mp4')
          ? 'audio/mp4'
          : '';

      const options = mimeType ? { mimeType } : {};
      const recorder = new MediaRecorder(stream, options);
      this._recorder = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) this._chunks.push(e.data);
      };

      recorder.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(this._chunks, {
          type: mimeType || 'audio/webm',
        });
        this._chunks = [];
        this._recorder = null;
        this._resolve = null;
        resolve(blob);
      };

      recorder.start();
    });
  }

  stop(): void {
    if (this._recorder && this._recorder.state !== 'inactive') {
      this._recorder.stop();
    }
  }
}

let _instance: MediaAudioRecorder | null = null;

/** Returns a shared AudioRecorder instance. */
export function getRecorder(): AudioRecorder {
  _instance ??= new MediaAudioRecorder();
  return _instance;
}

export { isIOSSafari };
