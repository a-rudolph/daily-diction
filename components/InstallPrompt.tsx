'use client';

import { useState, useEffect } from 'react';

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [show, setShow] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Already installed — don't show.
    if (window.matchMedia('(display-mode: standalone)').matches) return;
    // User already dismissed — don't nag.
    if (sessionStorage.getItem('install-dismissed')) return;

    const ios = /iphone|ipad|ipod/i.test(navigator.userAgent) && !('MSStream' in window);
    setIsIOS(ios);

    if (ios) {
      // Show iOS share-sheet hint after a short delay (they get no beforeinstallprompt).
      const t = setTimeout(() => setShow(true), 4000);
      return () => clearTimeout(t);
    }

    const handler = (e: BeforeInstallPromptEvent) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShow(true);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  function dismiss() {
    sessionStorage.setItem('install-dismissed', '1');
    setShow(false);
  }

  async function install() {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') setShow(false);
    else dismiss();
  }

  if (!show) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-slate-200 bg-white px-5 py-4 shadow-lg dark:border-slate-800 dark:bg-slate-900">
      <div className="mx-auto flex max-w-xl items-center justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-medium text-slate-900 dark:text-slate-50">
            Add to home screen
          </p>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
            {isIOS
              ? 'Tap the Share button, then "Add to Home Screen"'
              : 'Install for the full app experience'}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <button
            onClick={dismiss}
            className="text-sm text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300"
          >
            Not now
          </button>
          {!isIOS && (
            <button
              onClick={install}
              className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 active:scale-[0.97]"
            >
              Install
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
