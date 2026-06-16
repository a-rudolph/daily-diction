/** How many passed phrases count as a completed day. */
export const SESSION_TARGET = 5;

/** Minimum match score (0–1) to automatically pass a phrase via speech recognition. */
export const MATCH_THRESHOLD = 0.7;

/**
 * Phase 1: hardcoded single user.
 * This UUID is seeded into the DB by `scripts/seed.ts`.
 * Replace with session-based auth in Phase 2.
 */
export const SEED_USER_ID = '00000000-0000-0000-0000-000000000001';
export const SEED_USER_EMAIL = 'adam.rdlph@gmail.com';
