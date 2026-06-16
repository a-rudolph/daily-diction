import Link from 'next/link';

/**
 * Session complete summary page.
 * Receives `passed` and `total` via URL searchParams from the session runner.
 */
export default async function CompletePage(props: { searchParams: Promise<Record<string, string>> }) {
  const params = await props.searchParams;
  const passed = Number(params.passed ?? 0);
  const total = Number(params.total ?? 0);
  const allPassed = passed === total && total > 0;

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-xl flex-col items-center justify-center px-5 pb-safe">
      {/* Icon / emoji summary */}
      <div className="text-5xl">
        {allPassed ? '🎉' : '✓'}
      </div>

      <h1 className="mt-4 text-2xl font-semibold tracking-tight">
        Session done
      </h1>

      <p className="mt-2 text-slate-500 dark:text-slate-400">
        {passed} of {total} phrase{total !== 1 ? 's' : ''} passed
      </p>

      {/* Progress bar */}
      {total > 0 && (
        <div className="mt-6 w-full max-w-xs">
          <div className="h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
            <div
              className="h-full rounded-full bg-emerald-500 transition-all duration-700"
              style={{ width: `${Math.round((passed / total) * 100)}%` }}
            />
          </div>
          <p className="mt-1.5 text-center text-xs text-slate-400 dark:text-slate-500">
            {Math.round((passed / total) * 100)}% completion
          </p>
        </div>
      )}

      {/* Encouragement copy */}
      <p className="mt-6 max-w-xs text-center text-sm text-slate-500 dark:text-slate-400">
        {allPassed
          ? 'Great work — every session adds up.'
          : 'Practice is the point. Keep going.'}
      </p>

      {/* Actions */}
      <div className="mt-10 flex w-full max-w-xs flex-col gap-3">
        <Link
          href="/session"
          className="flex w-full items-center justify-center rounded-2xl bg-indigo-600 py-4 text-base font-semibold text-white shadow-sm transition-all hover:bg-indigo-700 active:scale-[0.98]"
        >
          Practice again
        </Link>
        <Link
          href="/"
          className="flex w-full items-center justify-center rounded-2xl border border-slate-200 bg-white py-4 text-base font-medium text-slate-600 transition-all hover:bg-slate-50 active:scale-[0.98] dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
        >
          Home
        </Link>
      </div>
    </main>
  );
}
