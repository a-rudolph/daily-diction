import Link from 'next/link';

/**
 * History page — full attempt log.
 * Placeholder for Phase 2; Phase 1 ships the practice loop first.
 */
export default function HistoryPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-xl flex-col px-5 pt-10 pb-safe">
      <div className="flex items-center gap-3">
        <Link
          href="/"
          className="text-sm text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300"
        >
          ← Home
        </Link>
      </div>

      <h1 className="mt-6 text-xl font-semibold tracking-tight">History</h1>

      <div className="mt-8 rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center dark:border-slate-700 dark:bg-slate-900">
        <p className="text-slate-400 dark:text-slate-500">
          Full history coming in Phase 2.
        </p>
        <p className="mt-1 text-xs text-slate-300 dark:text-slate-600">
          Your attempts are being saved — the log view will display them here.
        </p>
      </div>
    </main>
  );
}
