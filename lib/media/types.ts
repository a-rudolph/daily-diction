/**
 * Abstraction over MediaRecorder so the UI doesn't import it directly.
 * Mirrors the lib/speech/types.ts pattern so it can be swapped without
 * touching the session page.
 */

export interface AudioRecorder {
  /** Returns false if MediaRecorder is unavailable (e.g. some iOS versions). */
  isSupported(): boolean;

  /**
   * Start capturing audio. Returns a Blob when stop() is called.
   * In-memory only — nothing is written to disk or sent anywhere.
   */
  start(): Promise<Blob>;

  /**
   * Gracefully stop recording and resolve the Promise from start().
   * Safe to call if not currently recording.
   */
  stop(): void;
}
