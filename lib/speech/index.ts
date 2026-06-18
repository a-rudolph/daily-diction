import { WebSpeechRecognizer } from "./web-speech";
import type { SpeechRecognizer } from "./types";

export type { SpeechRecognizer, SpeechStartOpts, SpeechError } from "./types";
export { computeMatch } from "./match";

/**
 * Returns the shared speech recognizer singleton.
 * v1: always WebSpeechRecognizer.
 * Future: swap in Whisper/Groq/transformers.js here without touching any UI.
 */
let _recognizerInstance: WebSpeechRecognizer | null = null;

export function getRecognizer(): SpeechRecognizer {
  _recognizerInstance ??= new WebSpeechRecognizer();
  return _recognizerInstance;
}
