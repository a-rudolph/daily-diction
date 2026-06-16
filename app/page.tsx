import { db } from '@/lib/db';
import { dailyCompletions } from '@/lib/db/schema';
import { getTodayLocalDate, addDays, shortDayLabel } from '@/lib/date';
import { SESSION_TARGET } from '@/lib/constants';
import { getCurrentUserId } from '@/lib/auth/server';
import { and, eq, gte, lte } from 'drizzle-orm';
import Link from 'next/link';

async function getStreakData(userId: string) {
  const today = getTodayLocalDate();
  const windowStart = addDays(today, -6);

  const completions = await db
    .select()
    .from(dailyCompletions)
    .where(
      and(
        eq(dailyCompletions.userId, userId),
        gte(dailyCompletions.localDate, windowStart),
        lte(dailyCompletions.localDate, today),
      ),
    );

  const days = Array.from({ length: 7 }, (_, i) => {
    const date = addDays(today, i - 6);
    const record = completions.find((c) => c.localDate === date);
    return {
      date,
      label: shortDayLabel(date),
      isToday: i === 6,
      completed: record?.completed ?? false,
    };
  });

  const todayRecord = completions.find((c) => c.localDate === today);

  return {
    days,
    completedThisWeek: days.filter((d) => d.completed).length,
    completedToday: todayRecord?.completed ?? false,
    todayPassed: todayRecord?.passedCount ?? 0,
    todayTarget: SESSION_TARGET,
  };
}

export default async function HomePage() {
  let streak;
  let dbError = false;

  try {
    const userId = await getCurrentUserId();
    streak = await getStreakData(userId);
  } catch {
    dbError = true;
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-xl flex-col px-5 pt-12 pb-safe">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Daily Diction</h1>
          <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
            Personal speaking practice
          </p>
        </div>
        <form
          action={async () => {
            'use server';
            const { cookies } = await import('next/headers');
            const { COOKIE_NAME } = await import('@/lib/auth/session');
            const { redirect } = await import('next/navigation');
            const cookieStore = await cookies();
            cookieStore.delete(COOKIE_NAME);
            redirect('/login');
          }}
        >
          <button
            type="submit"
            className="mt-1 text-sm text-slate-300 hover:text-slate-500 dark:text-slate-600 dark:hover:text-slate-400"
          >
            Log out
          </button>
        </form>
      </div>

      {/* Streak card */}
      <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        {dbError || !streak ? (
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Set up your database to start tracking your streak.
          </p>
        ) : (
          <>
            {/* 7-day bars */}
            <div className="flex items-end gap-1.5">
              {streak.days.map((day) => (
                <div key={day.date} className="flex flex-1 flex-col items-center gap-1.5">
                  <div
                    className={`h-8 w-full rounded-md transition-colors ${
                      day.completed
                        ? 'bg-indigo-500'
                        : day.isToday
                          ? 'bg-slate-200 ring-2 ring-indigo-300 dark:bg-slate-700 dark:ring-indigo-500'
                          : 'bg-slate-200 dark:bg-slate-700'
                    }`}
                  />
                  <span className="text-[10px] text-slate-400 dark:text-slate-500">
                    {day.label.slice(0, 1)}
                  </span>
                </div>
              ))}
            </div>

            {/* Streak count */}
            <div className="mt-4">
              <p className="text-3xl font-semibold">
                {streak.completedThisWeek}
                <span className="ml-1 text-lg font-normal text-slate-400 dark:text-slate-500">
                  / 7 days this week
                </span>
              </p>
            </div>

            {/* Today progress */}
            <div className="mt-4 border-t border-slate-100 pt-4 dark:border-slate-800">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500 dark:text-slate-400">Today</span>
                <span className="font-medium">
                  {streak.todayPassed} / {streak.todayTarget} phrases
                </span>
              </div>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                <div
                  className="h-full rounded-full bg-indigo-500 transition-all duration-500"
                  style={{
                    width: `${Math.min(100, (streak.todayPassed / streak.todayTarget) * 100)}%`,
                  }}
                />
              </div>
            </div>
          </>
        )}
      </div>

      {/* CTA */}
      <div className="mt-6 flex flex-col gap-3">
        {streak?.completedToday ? (
          <>
            <p className="text-center text-sm font-medium text-emerald-600 dark:text-emerald-400">
              ✓ Today&apos;s practice complete
            </p>
            <Link
              href="/session"
              className="flex w-full items-center justify-center rounded-2xl border border-indigo-200 bg-indigo-50 py-4 text-base font-medium text-indigo-700 transition-all active:scale-[0.98] dark:border-indigo-800 dark:bg-indigo-950 dark:text-indigo-300"
            >
              Practice more
            </Link>
          </>
        ) : (
          <Link
            href="/session"
            className="flex w-full items-center justify-center rounded-2xl bg-indigo-600 py-4 text-base font-semibold text-white shadow-sm transition-all hover:bg-indigo-700 active:scale-[0.98]"
          >
            Start practice →
          </Link>
        )}

        <Link
          href="/history"
          className="text-center text-sm text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300"
        >
          View history
        </Link>
      </div>

      {/* Footer note */}
      <p className="mt-auto pt-8 text-center text-xs text-slate-300 dark:text-slate-700">
        Personal practice tool · Not a substitute for SLP work
      </p>
    </main>
  );
}
