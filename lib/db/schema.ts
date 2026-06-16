import {
  pgTable,
  pgEnum,
  uuid,
  text,
  boolean,
  real,
  integer,
  timestamp,
  date,
  unique,
} from 'drizzle-orm/pg-core';

// ─── Enums ────────────────────────────────────────────────────────────────────

export const exerciseTypeEnum = pgEnum('exercise_type', ['passage', 'wh_question']);
export const sessionModeEnum = pgEnum('session_mode', ['passage', 'wh', 'freestyle']);
export const aidTypeEnum = pgEnum('aid_type', ['none', 'pen', 'teeth', 'slow']);
export const attemptSourceEnum = pgEnum('attempt_source', ['speech', 'manual']);

// ─── Users ────────────────────────────────────────────────────────────────────

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').notNull().unique(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

// ─── Auth (Phase 2 — seeded in schema now to avoid a later disruptive migration) ──

export const authTokens = pgTable('auth_tokens', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  tokenHash: text('token_hash').notNull(),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  usedAt: timestamp('used_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const sessions = pgTable('sessions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  tokenHash: text('token_hash').notNull().unique(),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

// ─── Exercises (seeded content) ───────────────────────────────────────────────

export const exercises = pgTable('exercises', {
  id: uuid('id').primaryKey().defaultRandom(),
  /** Stable identifier used for idempotent seeding. */
  slug: text('slug').notNull().unique(),
  type: exerciseTypeEnum('type').notNull(),
  title: text('title').notNull(),
  /** The full prompt text — a sentence, question, or short passage. */
  body: text('body').notNull(),
  sortOrder: integer('sort_order').notNull().default(0),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

// ─── Attempts ─────────────────────────────────────────────────────────────────

export const attempts = pgTable('attempts', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  /** null for freestyle attempts */
  exerciseId: uuid('exercise_id').references(() => exercises.id, { onDelete: 'set null' }),
  mode: sessionModeEnum('mode').notNull(),
  aid: aidTypeEnum('aid').notNull(),
  /** Snapshot of the prompt at attempt time — needed for freestyle + edits. */
  promptText: text('prompt_text').notNull(),
  /** What the speech recognizer heard. Empty string for manual completions. */
  transcript: text('transcript').notNull().default(''),
  /** 0–1 similarity score. null when source='manual' or recognition unsupported. */
  matchScore: real('match_score'),
  passed: boolean('passed').notNull(),
  source: attemptSourceEnum('source').notNull(),
  /** Calendar date in America/Toronto, stored as YYYY-MM-DD. */
  localDate: date('local_date').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

// ─── Daily completions ────────────────────────────────────────────────────────

/**
 * Rollup of how many phrases were passed on a given day.
 * Derivable from `attempts`, kept here for O(1) streak reads.
 */
export const dailyCompletions = pgTable(
  'daily_completions',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    /** Calendar date in America/Toronto (YYYY-MM-DD). */
    localDate: date('local_date').notNull(),
    passedCount: integer('passed_count').notNull().default(0),
    targetCount: integer('target_count').notNull().default(5),
    completed: boolean('completed').notNull().default(false),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [unique('uq_dc_user_date').on(table.userId, table.localDate)],
);

// ─── Types ────────────────────────────────────────────────────────────────────

export type User = typeof users.$inferSelect;
export type Exercise = typeof exercises.$inferSelect;
export type Attempt = typeof attempts.$inferSelect;
export type DailyCompletion = typeof dailyCompletions.$inferSelect;
