"use client";

import type { MenuWithItems, MenuItemRow } from "@/app/api/menus/[id]/route";

interface MenuSelectScreenProps {
  menu: MenuWithItems;
  onBack: () => void;
  onConfirm: (selectedIds: string[], selectedItems: MenuItemRow[]) => void;
}

export function MenuSelectScreen({ menu, onBack, onConfirm }: MenuSelectScreenProps) {
  const [selected, setSelected] = React.useState<Set<string>>(new Set());

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function handleConfirm() {
    const selectedItems: MenuItemRow[] = [];
    for (const cat of menu.categories) {
      for (const item of cat.items) {
        if (selected.has(item.id)) selectedItems.push(item);
      }
    }
    // Shuffle so the user doesn't drill in menu order
    for (let i = selectedItems.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [selectedItems[i], selectedItems[j]] = [selectedItems[j], selectedItems[i]];
    }
    onConfirm([...selected], selectedItems);
  }

  const count = selected.size;

  return (
    <div className="flex min-h-dvh flex-col">
      {/* Sticky header */}
      <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white/90 px-5 py-3 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-950/90">
        <button
          onClick={onBack}
          className="flex items-center gap-1 text-sm text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300"
        >
          ← Back
        </button>
        <div className="text-center">
          <p className="text-sm font-semibold text-slate-900 dark:text-slate-50">{menu.name}</p>
          <p className="text-xs text-slate-400 dark:text-slate-500">{menu.cuisine}</p>
        </div>
        {count > 0 ? (
          <span className="inline-flex items-center rounded-full bg-indigo-100 px-2.5 py-1 text-xs font-semibold text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300">
            {count} selected
          </span>
        ) : (
          <span className="w-20 text-right text-xs text-slate-400 dark:text-slate-500">
            tap to flag
          </span>
        )}
      </div>

      {/* Helper text */}
      <p className="px-5 pt-4 pb-1 text-xs text-slate-400 dark:text-slate-500">
        Tap anything that looks hard to say.
      </p>

      {/* Menu body */}
      <div className="flex-1 overflow-y-auto px-5 pb-36">
        {menu.categories.map((cat) => (
          <div key={cat.name} className="mt-6">
            {/* Category header */}
            <div className="mb-3 flex items-center gap-3">
              <span className="shrink-0 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500">
                {cat.name}
              </span>
              <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
            </div>

            {/* Items */}
            <div className="flex flex-col gap-1">
              {cat.items.map((item) => {
                const isSelected = selected.has(item.id);
                return (
                  <button
                    key={item.id}
                    onClick={() => toggle(item.id)}
                    className={`flex w-full items-start justify-between gap-3 rounded-xl px-3 py-3 text-left transition-all active:scale-[0.98] ${
                      isSelected
                        ? "bg-indigo-50 ring-1 ring-indigo-300 dark:bg-indigo-950/60 dark:ring-indigo-600"
                        : "hover:bg-slate-50 dark:hover:bg-slate-900/50"
                    }`}
                  >
                    <div className="flex min-w-0 flex-1 items-start gap-2.5">
                      {/* Selection circle */}
                      <span
                        className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[10px] transition-all ${
                          isSelected
                            ? "border-indigo-500 bg-indigo-500 text-white dark:border-indigo-400 dark:bg-indigo-400"
                            : "border-slate-300 dark:border-slate-600"
                        }`}
                      >
                        {isSelected && "✓"}
                      </span>
                      <div className="min-w-0">
                        <p
                          className={`text-sm font-semibold leading-snug ${
                            isSelected
                              ? "text-indigo-700 dark:text-indigo-300"
                              : "text-slate-800 dark:text-slate-200"
                          }`}
                        >
                          {item.name}
                        </p>
                        {item.description && (
                          <p className="mt-0.5 text-xs leading-snug text-slate-400 dark:text-slate-500">
                            {item.description}
                          </p>
                        )}
                      </div>
                    </div>
                    {item.price && (
                      <span className="shrink-0 text-sm text-slate-400 dark:text-slate-500">
                        ${item.price}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Sticky bottom tray */}
      <div className="fixed inset-x-0 bottom-0 border-t border-slate-200 bg-white/95 px-5 pb-safe pt-3 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-950/95">
        <button
          onClick={handleConfirm}
          disabled={count === 0}
          className="w-full rounded-2xl bg-indigo-600 py-4 text-base font-semibold text-white shadow-sm transition-all hover:bg-indigo-700 active:scale-[0.98] disabled:opacity-40"
        >
          {count === 0 ? "Select items to practice" : `Practice these (${count}) →`}
        </button>
      </div>
    </div>
  );
}

// React import needed for useState
import React from "react";
