import { WebSpeechRecognizer } from './web-speech';
import type { SpeechRecognizer } from './types';

export type { SpeechRecognizer, SpeechStartOpts, SpeechError } from './types';
export { computeMatch } from './match';

/**
 * Returns the active speech recognizer implementation.
 * v1: always WebSpeechRecognizer.
 * Future: swap in Whisper/Groq/transformers.js here without touching any UI.
 */
export function getRecognizer(): SpeechRecognizer {
  return new WebSpeechRecognizer();
}
