import { db } from '@/lib/db';
import { attempts, dailyCompletions } from '@/lib/db/schema';
import { and, eq, sql } from 'drizzle-orm';
import { getTodayLocalDate } from '@/lib/date';
import { SESSION_TARGET } from '@/lib/constants';
import { getCurrentUserId } from '@/lib/auth/server';

interface AttemptBody {
  exerciseId?: string | null;
  mode: 'passage' | 'wh' | 'freestyle' | 'twister' | 'menu';
  aid: 'none' | 'pen' | 'teeth' | 'slow';
  listener?: 'none' | 'mirror' | 'audience' | 'recording';
  timer?: boolean;
  promptText: string;
  transcript: string;
  matchScore?: number | null;
  passed: boolean;
  source: 'speech' | 'manual';
}

/**
 * POST /api/attempts
 * Logs a single phrase attempt and upserts the daily completion rollup.
 * Returns the updated day progress.
 */
export async function POST(request: Request) {
  const body: AttemptBody = await request.json();

  const userId = await getCurrentUserId();
  const localDate = getTodayLocalDate();

  // Insert the attempt
  await db.insert(attempts).values({
    userId,
    exerciseId: body.exerciseId ?? null,
    mode: body.mode,
    aid: body.aid,
    listener: body.listener ?? 'none',
    timer: body.timer ?? false,
    promptText: body.promptText,
    transcript: body.transcript ?? '',
    matchScore: body.matchScore ?? null,
    passed: body.passed,
    source: body.source,
    localDate,
  });

  // Upsert daily completion rollup (only increment if passed AND not a warmup twister session)
  if (body.passed && body.mode !== 'twister') {
    await db
      .insert(dailyCompletions)
      .values({
        userId,
        localDate,
        passedCount: 1,
        targetCount: SESSION_TARGET,
        completed: 1 >= SESSION_TARGET,
      })
      .onConflictDoUpdate({
        target: [dailyCompletions.userId, dailyCompletions.localDate],
        set: {
          passedCount: sql`daily_completions.passed_count + 1`,
          completed: sql`daily_completions.passed_count + 1 >= daily_completions.target_count`,
          updatedAt: sql`now()`,
        },
      });
  }

  // Return current day state
  const [day] = await db
    .select({
      passedCount: dailyCompletions.passedCount,
      targetCount: dailyCompletions.targetCount,
      completed: dailyCompletions.completed,
    })
    .from(dailyCompletions)
    .where(
      and(eq(dailyCompletions.userId, userId), eq(dailyCompletions.localDate, localDate)),
    );

  return Response.json({
    day: day ?? {
      passedCount: body.passed ? 1 : 0,
      targetCount: SESSION_TARGET,
      completed: false,
    },
  });
}
