/**
 * Abstraction layer for speech recognition.
 * WebSpeechRecognizer is the v1 implementation; swap for Whisper/Groq later
 * by adding a new implementation and updating lib/speech/index.ts.
 */
export interface SpeechRecognizer {
  /** Returns false if the current environment doesn't support recognition. */
  isSupported(): boolean;

  /**
   * Starts listening. Resolves with the final transcript when speech ends.
   * Rejects with a SpeechError if something goes wrong.
   */
  start(opts?: SpeechStartOpts): Promise<string>;

  /** Graceful stop — finalizes in-progress speech and resolves the promise. */
  stop(): void;

  /** Hard cancel — rejects the in-flight promise with code 'aborted'. */
  abort(): void;
}

export interface SpeechStartOpts {
  lang?: string;
  /** Called with the live (interim) transcript as the user speaks. */
  onInterim?: (transcript: string) => void;
}

export interface SpeechError {
  code:
    | 'not-allowed'
    | 'service-not-allowed'
    | 'no-speech'
    | 'network'
    | 'aborted'
    | 'audio-capture'
    | 'not-supported'
    | 'unknown';
  message: string;
}
