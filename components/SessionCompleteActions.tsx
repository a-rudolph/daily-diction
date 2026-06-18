"use client";

import Link from "next/link";
import { getRecognizer } from "@/lib/speech";
import { getRecorder } from "@/lib/media";

function releaseActiveMedia() {
  getRecognizer().abort();
  getRecorder().stop();

  // Defensive cleanup: if any media tracks are still attached to live elements,
  // stop them before navigating away.
  const mediaElements = Array.from(
    document.querySelectorAll<HTMLMediaElement>("video, audio"),
  );
  for (const element of mediaElements) {
    const stream = element.srcObject;
    if (stream instanceof MediaStream) {
      stream.getTracks().forEach((track) => track.stop());
      element.srcObject = null;
    }
  }
}

export function SessionCompleteActions() {
  return (
    <div className="mt-10 flex w-full max-w-xs flex-col gap-3">
      <Link
        href="/session"
        className="flex w-full items-center justify-center rounded-2xl bg-indigo-600 py-4 text-base font-semibold text-white shadow-sm transition-all hover:bg-indigo-700 active:scale-[0.98]"
      >
        Practice again
      </Link>
      <Link
        href="/"
        onClick={releaseActiveMedia}
        className="flex w-full items-center justify-center rounded-2xl border border-slate-200 bg-white py-4 text-base font-medium text-slate-600 transition-all hover:bg-slate-50 active:scale-[0.98] dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
      >
        Home
      </Link>
    </div>
  );
}
