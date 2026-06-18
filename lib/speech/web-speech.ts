import type { SpeechRecognizer, SpeechStartOpts, SpeechError } from "./types";

function getSpeechRecognitionImpl(): ISpeechRecognitionConstructor | null {
  if (typeof window === "undefined") return null;
  return window.SpeechRecognition ?? window.webkitSpeechRecognition ?? null;
}

/**
 * Web Speech API implementation of SpeechRecognizer.
 *
 * Browser notes:
 * - Chrome/Edge (desktop + Android): full support, requires network.
 * - Safari (iOS 14.5+/macOS): webkitSpeechRecognition, continuous=false most reliable,
 *   must be triggered from a user gesture, may end early.
 * - Firefox: not supported — isSupported() returns false.
 *
 * Recognition requires a network connection in Chrome/Edge; it may work briefly
 * offline in Safari but isn't guaranteed.
 */
export class WebSpeechRecognizer implements SpeechRecognizer {
  private _active: ISpeechRecognition | null = null;

  isSupported(): boolean {
    return getSpeechRecognitionImpl() !== null;
  }

  async start(opts: SpeechStartOpts = {}): Promise<string> {
    const Impl = getSpeechRecognitionImpl();
    if (!Impl) {
      const err: SpeechError = {
        code: "not-supported",
        message: "Speech recognition is not supported in this browser.",
      };
      return Promise.reject(err);
    }

    return new Promise<string>((resolve, reject) => {
      const recognition = new Impl();
      this._active = recognition;

      recognition.lang = opts.lang ?? "en-US";
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;

      let finalTranscript = "";

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        let interim = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          if (result.isFinal) {
            finalTranscript += result[0].transcript;
          } else {
            interim += result[0].transcript;
          }
        }
        opts.onInterim?.(finalTranscript + interim);
      };

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        const code = event.error as SpeechError["code"];
        // 'aborted' fires when we call .abort() ourselves — resolve quietly.
        if (code === "aborted") {
          resolve(finalTranscript);
          return;
        }
        const err: SpeechError = {
          code,
          message: event.message ?? event.error,
        };
        reject(err);
      };

      recognition.onend = () => {
        // Leave _active set so abort() can release the mic even after natural end.
        resolve(finalTranscript);
      };

      recognition.start();
    });
  }

  stop(): void {
    this._active?.stop();
  }

  abort(): void {
    const rec = this._active;
    this._active = null;
    try {
      rec?.abort();
    } catch {
      // Ignore InvalidStateError if recognition is already inactive
    }
  }
}
