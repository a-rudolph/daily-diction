import { distance } from 'fastest-levenshtein';
import { MATCH_THRESHOLD } from '@/lib/constants';

/** Strip punctuation, lowercase, collapse whitespace. */
function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Character-level Levenshtein similarity (0–1).
 * Good for short phrases; degrades on long passages where small word
 * differences create large edit distances.
 */
function charSimilarity(expected: string, transcript: string): number {
  const a = normalize(expected);
  const b = normalize(transcript);
  if (a.length === 0 && b.length === 0) return 1;
  const maxLen = Math.max(a.length, b.length);
  return 1 - distance(a, b) / maxLen;
}

/**
 * Word coverage: fraction of expected words that appear in the transcript.
 * Forgiving for long passages where the speaker may drift slightly.
 */
function wordCoverage(expected: string, transcript: string): number {
  const expectedWords = normalize(expected).split(' ').filter(Boolean);
  if (expectedWords.length === 0) return 1;
  const transcriptCounts = new Map<string, number>();
  for (const w of normalize(transcript).split(' ').filter(Boolean)) {
    transcriptCounts.set(w, (transcriptCounts.get(w) ?? 0) + 1);
  }
  let matched = 0;
  for (const w of expectedWords) {
    const count = transcriptCounts.get(w) ?? 0;
    if (count > 0) {
      matched++;
      transcriptCounts.set(w, count - 1);
    }
  }
  return matched / expectedWords.length;
}

export interface MatchResult {
  /** Best of charSimilarity and wordCoverage, 0–1. */
  score: number;
  passed: boolean;
}

/**
 * Computes a match score between the expected phrase and what was heard.
 * Takes the best of character-level similarity and word coverage so that
 * both short questions and long passages score fairly.
 *
 * @param threshold - Pass a per-mode threshold from THRESHOLDS; defaults to MATCH_THRESHOLD.
 */
export function computeMatch(expected: string, transcript: string, threshold = MATCH_THRESHOLD): MatchResult {
  if (!transcript.trim()) return { score: 0, passed: false };
  const score = Math.max(charSimilarity(expected, transcript), wordCoverage(expected, transcript));
  return { score, passed: score >= threshold };
}
