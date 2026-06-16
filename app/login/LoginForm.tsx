'use client';

import { useState } from 'react';

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  );
}

export default function LoginForm({ errorMessage }: { errorMessage: string | null }) {
  const [email, setEmail] = useState('');
  const [sendStatus, setSendStatus] = useState<'idle' | 'sending' | 'sent'>('idle');

  async function handleMagicLink(e: React.FormEvent) {
    e.preventDefault();
    setSendStatus('sending');
    await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    setSendStatus('sent');
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-sm flex-col items-center justify-center px-5 pb-safe">
      <div className="w-full">
        <h1 className="text-2xl font-semibold tracking-tight">Daily Diction</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Personal speaking practice
        </p>

        {errorMessage && (
          <p className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-800 dark:bg-red-950 dark:text-red-400">
            {errorMessage}
          </p>
        )}

        <div className="mt-8 flex flex-col gap-3">
          {/* Google OAuth — primary path */}
          <a
            href="/api/auth/google"
            className="flex w-full items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white py-4 text-base font-medium text-slate-700 shadow-sm transition-all hover:bg-slate-50 active:scale-[0.98] dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            <GoogleIcon />
            Continue with Google
          </a>

          {/* Divider */}
          <div className="flex items-center gap-3 py-1">
            <div className="flex-1 border-t border-slate-200 dark:border-slate-800" />
            <span className="text-xs text-slate-400 dark:text-slate-500">or</span>
            <div className="flex-1 border-t border-slate-200 dark:border-slate-800" />
          </div>

          {/* Magic link fallback */}
          {sendStatus === 'sent' ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
              <p className="font-medium text-slate-900 dark:text-slate-50">Check your email</p>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Sent a login link to <strong>{email}</strong>. Expires in 15 minutes.
              </p>
              <button
                onClick={() => setSendStatus('idle')}
                className="mt-3 text-sm text-indigo-600 hover:underline dark:text-indigo-400"
              >
                Send another link
              </button>
            </div>
          ) : (
            <form onSubmit={handleMagicLink} className="flex flex-col gap-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email address"
                required
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-base text-slate-900 placeholder-slate-400 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-50 dark:placeholder-slate-500"
              />
              <button
                type="submit"
                disabled={sendStatus === 'sending' || !email}
                className="w-full rounded-2xl bg-indigo-600 py-4 text-base font-semibold text-white shadow-sm transition-all hover:bg-indigo-700 active:scale-[0.98] disabled:opacity-60"
              >
                {sendStatus === 'sending' ? 'Sending…' : 'Send magic link →'}
              </button>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}
