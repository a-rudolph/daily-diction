"use client";

import { useEffect, useRef, useState } from "react";

interface PlaybackModalProps {
  blob: Blob;
  onClose: () => void;
}

/**
 * PlaybackModal — plays back a recorded audio blob and lets the user
 * self-rate before discarding it.
 *
 * Nothing is saved: the object URL is revoked on unmount, and the blob
 * is held only in the parent's React ref (drops with the session).
 */
export function PlaybackModal({ blob, onClose }: PlaybackModalProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const urlRef = useRef<string | null>(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const url = URL.createObjectURL(blob);
    urlRef.current = url;
    return () => {
      URL.revokeObjectURL(url);
      urlRef.current = null;
    };
  }, [blob]);

  function togglePlay() {
    const audio = audioRef.current;
    if (!audio || !urlRef.current) return;
    if (!audio.src) audio.src = urlRef.current;

    if (playing) {
      audio.pause();
      setPlaying(false);
    } else {
      audio.play();
      setPlaying(true);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/30 pb-safe backdrop-blur-sm">
      <div className="mx-auto w-full max-w-xl rounded-t-2xl bg-white p-6 shadow-2xl dark:bg-slate-900">
        <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
          Listen back
        </p>
        <p className="mt-0.5 text-xs text-slate-400 dark:text-slate-500">
          Not saved — audio is discarded when you continue.
        </p>

        {/* Hidden audio element */}
        <audio
          ref={audioRef}
          onEnded={() => setPlaying(false)}
          className="hidden"
        />

        <button
          onClick={togglePlay}
          className="mt-4 w-full rounded-2xl bg-indigo-600 py-4 text-base font-semibold text-white shadow-sm transition-all hover:bg-indigo-700 active:scale-[0.98]"
        >
          {playing ? "⏸ Pause" : "▶ Play recording"}
        </button>

        <button
          onClick={onClose}
          className="mt-3 w-full py-2 text-sm text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300"
        >
          Done — continue
        </button>
      </div>
    </div>
  );
}
