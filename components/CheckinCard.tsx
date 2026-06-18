"use client";

import { useState } from "react";

type Situation = "call" | "in_person" | "ordering" | "presentation" | "other";
type Rating = "rough" | "okay" | "good";

const SITUATIONS: { id: Situation; label: string }[] = [
  { id: "call", label: "Phone/video call" },
  { id: "in_person", label: "In person" },
  { id: "ordering", label: "Ordering something" },
  { id: "presentation", label: "Presentation" },
  { id: "other", label: "Other" },
];

const RATINGS: {
  id: Rating;
  label: string;
  cls: string;
  activeCls: string;
}[] = [
  {
    id: "rough",
    label: "Rough",
    cls: "border-slate-200 bg-white text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300",
    activeCls:
      "border-amber-400 bg-amber-50 text-amber-700 dark:border-amber-500 dark:bg-amber-950 dark:text-amber-300",
  },
  {
    id: "okay",
    label: "Okay",
    cls: "border-slate-200 bg-white text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300",
    activeCls:
      "border-indigo-500 bg-indigo-50 text-indigo-700 dark:border-indigo-500 dark:bg-indigo-950 dark:text-indigo-300",
  },
  {
    id: "good",
    label: "Good",
    cls: "border-slate-200 bg-white text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300",
    activeCls:
      "border-emerald-500 bg-emerald-50 text-emerald-700 dark:border-emerald-500 dark:bg-emerald-950 dark:text-emerald-300",
  },
];

export function CheckinCard() {
  const [open, setOpen] = useState(false);
  const [situation, setSituation] = useState<Situation | null>(null);
  const [rating, setRating] = useState<Rating | null>(null);
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSave() {
    if (!situation || !rating) return;
    setSaving(true);
    try {
      await fetch("/api/checkins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ situation, rating, note: note.trim() || null }),
      });
      setSaved(true);
      setOpen(false);
      // Reset for next time
      setSituation(null);
      setRating(null);
      setNote("");
    } catch {
      // Fail silently — not a critical operation
    } finally {
      setSaving(false);
    }
  }

  if (saved) {
    return (
      <p className="text-center text-xs text-slate-400 dark:text-slate-500">
        logged ✓
      </p>
    );
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="w-full text-center text-xs text-slate-400 hover:text-slate-500 dark:text-slate-500 dark:hover:text-slate-400"
      >
        Log a real-world conversation?
      </button>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
          Real-world speaking
        </p>
        <button
          onClick={() => setOpen(false)}
          className="text-xs text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300"
        >
          cancel
        </button>
      </div>

      {/* Situation */}
      <div className="mt-4">
        <p className="mb-2 text-xs font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500">
          Situation
        </p>
        <div className="grid grid-cols-2 gap-2">
          {SITUATIONS.map((s) => (
            <button
              key={s.id}
              onClick={() => setSituation(s.id)}
              className={`rounded-xl border py-2.5 text-xs font-medium transition-all active:scale-[0.97] ${
                situation === s.id
                  ? "border-indigo-500 bg-indigo-50 text-indigo-700 dark:border-indigo-500 dark:bg-indigo-950 dark:text-indigo-300"
                  : "border-slate-200 bg-white text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Rating */}
      <div className="mt-4">
        <p className="mb-2 text-xs font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500">
          How it felt
        </p>
        <div className="grid grid-cols-3 gap-2">
          {RATINGS.map((r) => (
            <button
              key={r.id}
              onClick={() => setRating(r.id)}
              className={`rounded-xl border py-2.5 text-xs font-medium transition-all active:scale-[0.97] ${
                rating === r.id ? r.activeCls : r.cls
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* Note */}
      <div className="mt-4">
        <input
          type="text"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Optional note…"
          maxLength={200}
          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:placeholder-slate-500"
        />
      </div>

      {/* Save */}
      <div className="mt-4">
        <button
          onClick={handleSave}
          disabled={!situation || !rating || saving}
          className="w-full rounded-2xl bg-indigo-600 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-indigo-700 active:scale-[0.98] disabled:opacity-40"
        >
          {saving ? "Saving…" : "Save"}
        </button>
      </div>
    </div>
  );
}
