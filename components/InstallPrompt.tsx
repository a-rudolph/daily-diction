'use client';

import { useState, useEffect } from 'react';

/**
 * Shows a native install prompt on browsers that support beforeinstallprompt
 * (Chrome/Edge on Android and desktop). That event only fires when the app is
 * actually installable — it won't fire if already installed, so no extra checks needed.
 *
 * iOS doesn't support beforeinstallprompt and users who want to add to home
 * screen already know how — we don't prompt them.
 */
export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    const handler = (e: BeforeInstallPromptEvent) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  async function install() {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') setDeferredPrompt(null);
  }

  if (!deferredPrompt) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-slate-200 bg-white px-5 py-4 shadow-lg dark:border-slate-800 dark:bg-slate-900">
      <div className="mx-auto flex max-w-xl items-center justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-medium text-slate-900 dark:text-slate-50">
            Add to home screen
          </p>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
            Install for the full app experience
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <button
            onClick={() => setDeferredPrompt(null)}
            className="text-sm text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300"
          >
            Not now
          </button>
          <button
            onClick={install}
            className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 active:scale-[0.97]"
          >
            Install
          </button>
        </div>
      </div>
    </div>
  );
}
