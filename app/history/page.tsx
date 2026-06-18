import { db } from '@/lib/db';
import { attempts, dailyCheckins, dailyCompletions } from '@/lib/db/schema';
import { getCurrentUserId } from '@/lib/auth/server';
import { desc, eq } from 'drizzle-orm';
import Link from 'next/link';

const MODE_LABELS: Record<string, string> = {
  passage: 'Passages',
  wh: 'WH Questions',
  freestyle: 'Freestyle',
  twister: 'Twisters',
  menu: 'Menu Practice',
};
const AID_LABELS = { none: '', pen: 'Pen in mouth', teeth: 'Teeth together', slow: 'Slow speech' };
const LISTENER_LABELS: Record<string, string> = {
  none: '',
  mirror: 'Mirror',
  audience: 'Pretend audience',
  recording: 'Recording',
};

const SITUATION_LABELS: Record<string, string> = {
  call: 'Phone/video call',
  in_person: 'In person',
  ordering: 'Ordering',
  presentation: 'Presentation',
  other: 'Other',
};
const RATING_LABELS: Record<string, string> = {
  rough: 'Rough',
  okay: 'Okay',
  good: 'Good',
};

function formatDate(dateStr: string) {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

export default async function HistoryPage() {
  const userId = await getCurrentUserId();

  const [completionRows, recentAttempts, recentCheckins] = await Promise.all([
    db
      .select()
      .from(dailyCompletions)
      .where(eq(dailyCompletions.userId, userId))
      .orderBy(desc(dailyCompletions.localDate))
      .limit(30),
    db
      .select({
        localDate: attempts.localDate,
        mode: attempts.mode,
        aid: attempts.aid,
        listener: attempts.listener,
        timer: attempts.timer,
        passed: attempts.passed,
        transcript: attempts.transcript,
        promptText: attempts.promptText,
        matchScore: attempts.matchScore,
        source: attempts.source,
        createdAt: attempts.createdAt,
      })
      .from(attempts)
      .where(eq(attempts.userId, userId))
      .orderBy(desc(attempts.createdAt))
      .limit(200),
    db
      .select({
        localDate: dailyCheckins.localDate,
        situation: dailyCheckins.situation,
        rating: dailyCheckins.rating,
        note: dailyCheckins.note,
        createdAt: dailyCheckins.createdAt,
      })
      .from(dailyCheckins)
      .where(eq(dailyCheckins.userId, userId))
      .orderBy(desc(dailyCheckins.createdAt))
      .limit(200),
  ]);

  // Index attempts and check-ins by localDate for O(1) lookup
  const attemptsByDate = recentAttempts.reduce<Record<string, typeof recentAttempts>>(
    (acc, a) => {
      (acc[a.localDate] ??= []).push(a);
      return acc;
    },
    {},
  );

  const checkinsByDate = recentCheckins.reduce<Record<string, typeof recentCheckins>>(
    (acc, c) => {
      (acc[c.localDate] ??= []).push(c);
      return acc;
    },
    {},
  );

  // Merge date keys from both completions and check-ins so days with only a
  // check-in still show up in history.
  const checkinOnlyDates = Object.keys(checkinsByDate).filter(
    (d) => !completionRows.find((r) => r.localDate === d),
  );

  return (
    <main className="mx-auto w-full max-w-xl px-5 pt-10 pb-safe">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Link
          href="/"
          className="text-sm text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300"
        >
          ← Home
        </Link>
        <LogoutButton />
      </div>

      <h1 className="mt-6 text-xl font-semibold tracking-tight">History</h1>

      {completionRows.length === 0 && checkinOnlyDates.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center dark:border-slate-700 dark:bg-slate-900">
          <p className="text-slate-400 dark:text-slate-500">
            Your practice sessions will show up here.
          </p>
          <Link
            href="/session"
            className="mt-4 inline-block text-sm font-medium text-indigo-600 hover:underline dark:text-indigo-400"
          >
            Start your first session →
          </Link>
        </div>
      ) : (
        <div className="mt-6 flex flex-col gap-3 pb-8">
          {completionRows.map((day) => {
            const dayAttempts = attemptsByDate[day.localDate] ?? [];
            const dayCheckins = checkinsByDate[day.localDate] ?? [];
            const modes = [...new Set(dayAttempts.map((a) => a.mode))];
            const aids = [...new Set(dayAttempts.map((a) => a.aid).filter((a) => a !== 'none'))];
            const listeners = [...new Set(dayAttempts.map((a) => a.listener).filter((l) => l !== 'none'))];

            return (
              <details
                key={day.localDate}
                className="group rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"
              >
                <summary className="flex cursor-pointer select-none items-center justify-between px-5 py-4">
                  <div className="flex items-center gap-3">
                    {/* Completion indicator */}
                    <span
                      className={`inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                        day.completed
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300'
                          : 'bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500'
                      }`}
                    >
                      {day.completed ? '✓' : '○'}
                    </span>
                    <div>
                      <p className="text-sm font-medium text-slate-900 dark:text-slate-50">
                        {formatDate(day.localDate)}
                      </p>
                      <p className="text-xs text-slate-400 dark:text-slate-500">
                        {modes.map((m) => MODE_LABELS[m]).join(' · ')}
                        {aids.length > 0 && ` · ${aids.map((a) => AID_LABELS[a]).join(', ')}`}
                        {listeners.length > 0 && ` · ${listeners.map((l) => LISTENER_LABELS[l]).join(', ')}`}
                        {dayCheckins.length > 0 && ` · 💬 ${dayCheckins.length} real-world`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      {day.passedCount}/{day.targetCount}
                    </span>
                    <span className="text-xs text-slate-300 transition-transform group-open:rotate-180 dark:text-slate-600">
                      ▾
                    </span>
                  </div>
                </summary>

                {/* Attempt list */}
                {(dayAttempts.length > 0 || dayCheckins.length > 0) && (
                  <div className="border-t border-slate-100 px-5 pb-3 pt-2 dark:border-slate-800">
                    <ul className="flex flex-col gap-2">
                      {dayAttempts.map((a, i) => (
                        <li
                          key={i}
                          className="flex items-start justify-between gap-3 py-2 text-xs"
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5">
                              {a.mode === 'twister' && (
                                <span className="inline-flex shrink-0 items-center rounded-full bg-violet-100 px-1.5 py-0.5 text-[10px] font-medium text-violet-700 dark:bg-violet-900 dark:text-violet-300">
                                  Warmup
                                </span>
                              )}
                              <p className="truncate font-medium text-slate-700 dark:text-slate-300">
                                {a.promptText}
                              </p>
                            </div>
                            {a.transcript && a.source === 'speech' && (
                              <p className="mt-0.5 truncate italic text-slate-400 dark:text-slate-500">
                                &ldquo;{a.transcript}&rdquo;
                              </p>
                            )}
                            {a.source === 'manual' && (
                              <p className="mt-0.5 text-slate-400 dark:text-slate-500">
                                Marked as spoken
                              </p>
                            )}
                          </div>
                          <div className="flex shrink-0 flex-col items-end gap-0.5">
                            <span
                              className={`font-semibold ${
                                a.passed
                                  ? 'text-emerald-600 dark:text-emerald-400'
                                  : 'text-slate-400 dark:text-slate-500'
                              }`}
                            >
                              {a.passed ? '✓' : '✗'}
                            </span>
                            {a.source === 'speech' && a.matchScore !== null && (
                              <span className="text-[10px] text-slate-400 dark:text-slate-500">
                                {Math.round(a.matchScore * 100)}%
                              </span>
                            )}
                          </div>
                        </li>
                      ))}
                      {dayCheckins.map((c, i) => (
                        <CheckinRow key={`c-${i}`} checkin={c} />
                      ))}
                    </ul>
                  </div>
                )}
              </details>
            );
          })}

          {/* Days that have only check-ins (no practice session) */}
          {checkinOnlyDates
            .sort((a, b) => b.localeCompare(a))
            .map((dateStr) => {
              const dayCheckins = checkinsByDate[dateStr] ?? [];
              return (
                <details
                  key={dateStr}
                  className="group rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"
                >
                  <summary className="flex cursor-pointer select-none items-center justify-between px-5 py-4">
                    <div className="flex items-center gap-3">
                      <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-400 dark:bg-slate-800 dark:text-slate-500">
                        💬
                      </span>
                      <div>
                        <p className="text-sm font-medium text-slate-900 dark:text-slate-50">
                          {formatDate(dateStr)}
                        </p>
                        <p className="text-xs text-slate-400 dark:text-slate-500">
                          {dayCheckins.length} real-world conversation{dayCheckins.length !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs text-slate-300 transition-transform group-open:rotate-180 dark:text-slate-600">
                      ▾
                    </span>
                  </summary>
                  <div className="border-t border-slate-100 px-5 pb-3 pt-2 dark:border-slate-800">
                    <ul className="flex flex-col gap-2">
                      {dayCheckins.map((c, i) => (
                        <CheckinRow key={i} checkin={c} />
                      ))}
                    </ul>
                  </div>
                </details>
              );
            })}
        </div>
      )}
    </main>
  );
}

function CheckinRow({
  checkin,
}: {
  checkin: { situation: string; rating: string; note: string | null };
}) {
  const ratingCls =
    checkin.rating === 'good'
      ? 'text-emerald-600 dark:text-emerald-400'
      : checkin.rating === 'rough'
        ? 'text-amber-600 dark:text-amber-400'
        : 'text-slate-500 dark:text-slate-400';

  return (
    <li className="flex items-start justify-between gap-3 py-2 text-xs">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="inline-flex shrink-0 items-center rounded-full bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-400">
            💬 Real world
          </span>
          <p className="truncate font-medium text-slate-700 dark:text-slate-300">
            {SITUATION_LABELS[checkin.situation] ?? checkin.situation}
          </p>
        </div>
        {checkin.note && (
          <p className="mt-0.5 truncate italic text-slate-400 dark:text-slate-500">
            {checkin.note}
          </p>
        )}
      </div>
      <span className={`shrink-0 font-semibold ${ratingCls}`}>
        {RATING_LABELS[checkin.rating] ?? checkin.rating}
      </span>
    </li>
  );
}

function LogoutButton() {
  return (
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
        className="text-sm text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300"
      >
        Log out
      </button>
    </form>
  );
}
