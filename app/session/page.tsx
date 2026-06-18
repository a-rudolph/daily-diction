"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getRecognizer, computeMatch } from "@/lib/speech";
import type { SpeechRecognizer, SpeechError } from "@/lib/speech";
import { playPass, playFail } from "@/lib/audio";
import { SESSION_TARGET, THRESHOLDS } from "@/lib/constants";
import Link from "next/link";

// ─── Types ────────────────────────────────────────────────────────────────────

type Mode = "wh" | "passage" | "freestyle" | "twister";
type Aid = "none" | "pen" | "teeth" | "slow";
type SessionStep = "setup" | "loading" | "primer" | "running";
type RecogState = "idle" | "listening" | "result";

interface Prompt {
  id: string | null;
  text: string;
}

interface PhraseResult {
  promptText: string;
  transcript: string;
  matchScore: number | null;
  passed: boolean;
  source: "speech" | "manual";
}

// ─── Static config ────────────────────────────────────────────────────────────

const MODE_OPTIONS: { id: Mode; label: string; desc: string }[] = [
  { id: "wh", label: "WH Questions", desc: "where, what, when…" },
  { id: "passage", label: "Passages", desc: "Rainbow, Grandfather…" },
  { id: "freestyle", label: "Freestyle", desc: "paste your own text" },
  { id: "twister", label: "Twisters", desc: "slow + exaggerated" },
];

const AID_OPTIONS: { id: Aid; label: string }[] = [
  { id: "none", label: "No aid" },
  { id: "pen", label: "Pen in mouth" },
  { id: "teeth", label: "Teeth together" },
  { id: "slow", label: "Slow speech" },
];

const AID_LABELS: Record<Aid, string> = {
  none: "",
  pen: "Pen in mouth",
  teeth: "Teeth together",
  slow: "Slow speech",
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function SessionPage() {
  const router = useRouter();
  const recognizerRef = useRef<SpeechRecognizer | null>(null);

  // Session-level state
  const [step, setStep] = useState<SessionStep>("setup");
  const [mode, setMode] = useState<Mode>("wh");
  const [aid, setAid] = useState<Aid>("none");
  const [freestyleText, setFreestyleText] = useState("");
  const [loadError, setLoadError] = useState<string | null>(null);

  // Practice loop state
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [recogState, setRecogState] = useState<RecogState>("idle");
  const [transcript, setTranscript] = useState("");
  const [matchResult, setMatchResult] = useState<{
    score: number;
    passed: boolean;
  } | null>(null);
  const [sessionResults, setSessionResults] = useState<PhraseResult[]>([]);
  const [recogError, setRecogError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Abort the recognizer when the component unmounts so the mic indicator goes away.
  useEffect(
    () => () => {
      recognizerRef.current?.abort();
    },
    [],
  );

  // ─── Setup handlers ──────────────────────────────────────────────────────────

  const handleStart = useCallback(async () => {
    setLoadError(null);
    setStep("loading");

    try {
      let fetchedPrompts: Prompt[];

      if (mode === "freestyle") {
        const trimmed = freestyleText.trim();
        if (!trimmed) {
          setLoadError("Please enter some text to practice with.");
          setStep("setup");
          return;
        }
        // Split on sentence boundaries, take up to SESSION_TARGET
        const sentences = trimmed
          .split(/(?<=[.!?])\s+/)
          .map((s) => s.trim())
          .filter((s) => s.length > 0)
          .slice(0, SESSION_TARGET);
        fetchedPrompts = sentences.map((s) => ({ id: null, text: s }));
      } else {
        const type =
          mode === "passage" ? "passage" :
          mode === "twister" ? "tongue_twister" :
          "wh_question";
        const res = await fetch(`/api/exercises?type=${type}`);
        if (!res.ok) throw new Error("Failed to load exercises");
        const exercises: { id: string; body: string }[] = await res.json();

        if (exercises.length === 0) {
          setLoadError("No exercises found. Make sure the database is seeded.");
          setStep("setup");
          return;
        }

        // Shuffle and take SESSION_TARGET
        const shuffled = [...exercises].sort(() => Math.random() - 0.5);
        fetchedPrompts = shuffled.slice(0, SESSION_TARGET).map((e) => ({
          id: e.id,
          text: e.body,
        }));
      }

      setPrompts(fetchedPrompts);
      setCurrentIndex(0);
      setSessionResults([]);
      setTranscript("");
      setMatchResult(null);
      setRecogState("idle");
      setRecogError(null);
      // Twisters show a primer screen before starting
      setStep(mode === "twister" ? "primer" : "running");
    } catch {
      setLoadError(
        "Something went wrong loading exercises. Check your connection and try again.",
      );
      setStep("setup");
    }
  }, [mode, aid, freestyleText]);

  // ─── Recognition handlers ─────────────────────────────────────────────────

  const handleStartRecording = useCallback(async () => {
    setTranscript("");
    setMatchResult(null);
    setRecogError(null);
    setRecogState("listening");

    const recognizer = recognizerRef.current ?? getRecognizer();
    recognizerRef.current = recognizer;

    if (!recognizer.isSupported()) {
      setRecogError(
        'Speech recognition is not supported in this browser. Use "Mark as spoken" to continue.',
      );
      setRecogState("idle");
      return;
    }

    try {
      const final = await recognizer.start({
        onInterim: (t) => setTranscript(t),
      });

      setTranscript(final);

      const match = computeMatch(prompts[currentIndex].text, final, THRESHOLDS[mode]);
      setMatchResult(match);
      setRecogState("result");
      if (match.passed) playPass();
      else playFail();
    } catch (err) {
      const e = err as SpeechError;
      if (e.code === "not-allowed" || e.code === "service-not-allowed") {
        setRecogError(
          'Microphone access was denied. Check your browser settings, or use "Mark as spoken" to continue.',
        );
      } else if (e.code === "no-speech") {
        setRecogError("Didn't catch anything — try again.");
      } else if (e.code === "network") {
        setRecogError(
          'Speech recognition needs an internet connection. Use "Mark as spoken" to continue.',
        );
      } else if (e.code !== "aborted") {
        setRecogError("Recognition error. Try again or mark as spoken.");
      }
      setRecogState("idle");
    }
  }, [prompts, currentIndex, mode]);

  const handleStop = useCallback(() => {
    recognizerRef.current?.stop();
  }, []);

  // ─── Attempt logging + advance ────────────────────────────────────────────

  const logAndAdvance = useCallback(
    async (result: PhraseResult) => {
      setIsSaving(true);

      // Fire-and-forget — UI stays responsive; a failure shows a transient note
      const savePromise = fetch("/api/attempts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          exerciseId: prompts[currentIndex].id,
          mode,
          aid,
          promptText: result.promptText,
          transcript: result.transcript,
          matchScore: result.matchScore,
          passed: result.passed,
          source: result.source,
        }),
      }).catch(() => {
        // No-op: offline save failure is surfaced on the complete page
      });

      const newResults = [...sessionResults, result];
      setSessionResults(newResults);

      const nextIndex = currentIndex + 1;

      if (nextIndex >= prompts.length) {
        await savePromise;
        const passedCount = newResults.filter((r) => r.passed).length;
        router.push(
          `/session/complete?passed=${passedCount}&total=${prompts.length}`,
        );
        return;
      }

      setIsSaving(false);
      setCurrentIndex(nextIndex);
      setTranscript("");
      setMatchResult(null);
      setRecogState("idle");
      setRecogError(null);
    },
    [prompts, currentIndex, mode, aid, sessionResults, router],
  );

  const handleSpeechAdvance = useCallback(() => {
    if (!matchResult) return;
    logAndAdvance({
      promptText: prompts[currentIndex].text,
      transcript,
      matchScore: matchResult.score,
      passed: matchResult.passed,
      source: "speech",
    });
  }, [matchResult, transcript, prompts, currentIndex, logAndAdvance]);

  const handleManualComplete = useCallback(() => {
    playPass();
    logAndAdvance({
      promptText: prompts[currentIndex].text,
      transcript: transcript,
      matchScore: null,
      passed: true,
      source: "manual",
    });
  }, [prompts, currentIndex, transcript, logAndAdvance]);

  const handleRetry = useCallback(() => {
    setTranscript("");
    setMatchResult(null);
    setRecogState("idle");
    setRecogError(null);
  }, []);

  // ─── Render ───────────────────────────────────────────────────────────────

  if (step === "setup" || step === "loading") {
    return (
      <SetupScreen
        mode={mode}
        setMode={setMode}
        aid={aid}
        setAid={setAid}
        freestyleText={freestyleText}
        setFreestyleText={setFreestyleText}
        onStart={handleStart}
        loading={step === "loading"}
        error={loadError}
      />
    );
  }

  if (step === "primer") {
    return <PrimerScreen onContinue={() => setStep("running")} />;
  }

  const currentPrompt = prompts[currentIndex];
  const progress = { current: currentIndex + 1, total: prompts.length };
  const aidLabel = AID_LABELS[aid];

  return (
    <div className="flex min-h-dvh flex-col pb-safe">
      {/* Top bar */}
      <div className="flex items-center justify-between px-5 pt-10">
        <button
          onClick={() => {
            recognizerRef.current?.abort();
            setStep("setup");
          }}
          className="flex items-center gap-1 text-sm text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300"
          aria-label="Back to setup"
        >
          ← Back
        </button>
        <ProgressDots current={progress.current} total={progress.total} />
      </div>

      {/* Aid chip */}
      {aidLabel && (
        <div className="mt-4 flex justify-center">
          <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-400">
            {aidLabel}
          </span>
        </div>
      )}

      {/* Phrase display */}
      <div className="flex flex-1 items-center justify-center px-6 py-8">
        <blockquote
          key={currentIndex}
          className={`animate-phrase-in text-center font-medium ${
            mode === "twister"
              ? "text-3xl leading-loose"
              : "text-2xl leading-relaxed"
          }`}
        >
          &ldquo;
          <HighlightedPrompt
            text={currentPrompt.text}
            transcript={transcript}
            recogState={recogState}
            matchPassed={matchResult?.passed}
          />
          &rdquo;
        </blockquote>
      </div>

      {/* Feedback area */}
      <div className="min-h-[4rem] px-6 pb-4 text-center">
        {transcript && (
          <p className="text-sm italic text-slate-400 dark:text-slate-500">
            &ldquo;{transcript}&rdquo;
          </p>
        )}
        {matchResult && (
          <p
            className={`mt-1 text-sm font-medium ${
              matchResult.passed
                ? "text-emerald-600 dark:text-emerald-400"
                : "text-amber-600 dark:text-amber-400"
            }`}
          >
            {matchResult.passed ? "✓" : "~"}{" "}
            {Math.round(matchResult.score * 100)}% match
          </p>
        )}
        {recogError && (
          <p className="text-xs text-slate-400 dark:text-slate-500">
            {recogError}
          </p>
        )}
      </div>

      {/* Controls (sticky bottom) */}
      <div className="px-5 pb-6 space-y-3">
        {recogState === "result" ? (
          /* Result state */
          <ResultControls
            passed={matchResult?.passed ?? false}
            isSaving={isSaving}
            isLast={currentIndex === prompts.length - 1}
            onContinue={handleSpeechAdvance}
            onRetry={handleRetry}
            onManual={handleManualComplete}
          />
        ) : recogState === "listening" ? (
          /* Listening state */
          <button
            onClick={handleStop}
            className="relative w-full overflow-hidden rounded-2xl bg-red-500 py-5 text-base font-semibold text-white shadow-sm transition-all hover:bg-red-600 active:scale-[0.98]"
          >
            <span className="absolute inset-0 animate-ping rounded-2xl bg-red-400 opacity-20" />
            <span className="relative">■ Stop</span>
          </button>
        ) : (
          /* Idle state */
          <button
            onClick={handleStartRecording}
            className="w-full rounded-2xl bg-indigo-600 py-5 text-base font-semibold text-white shadow-sm transition-all hover:bg-indigo-700 active:scale-[0.98]"
          >
            Start Speaking
          </button>
        )}

        {/* Manual fallback — always available */}
        {recogState !== "result" && (
          <button
            onClick={handleManualComplete}
            disabled={isSaving}
            className="w-full py-2 text-sm text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 disabled:opacity-40"
          >
            Mark as spoken
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function HighlightedPrompt({
  text,
  transcript,
  recogState,
  matchPassed,
}: {
  text: string;
  transcript: string;
  recogState: RecogState;
  matchPassed?: boolean;
}) {
  const transcriptWords = new Set(
    transcript
      .toLowerCase()
      .replace(/[^\w\s]/g, "")
      .replace(/\s+/g, " ")
      .trim()
      .split(" ")
      .filter(Boolean),
  );

  return (
    <>
      {text.split(/(\s+)/).map((token, i) => {
        if (/^\s+$/.test(token)) return <span key={i}>{token}</span>;

        const normalized = token.toLowerCase().replace(/[^\w]/g, "");
        const isRecognized =
          normalized.length > 0 && transcriptWords.has(normalized);

        let cls = "transition-colors duration-200 ";
        if (recogState === "idle" || !transcript) {
          cls += "text-slate-900 dark:text-slate-50";
        } else if (recogState === "listening") {
          cls += isRecognized
            ? "text-indigo-500 dark:text-indigo-400"
            : "text-slate-900 dark:text-slate-50";
        } else {
          cls += isRecognized
            ? matchPassed
              ? "text-emerald-600 dark:text-emerald-400"
              : "text-indigo-500 dark:text-indigo-400"
            : "text-slate-400 dark:text-slate-500";
        }

        return (
          <span key={i} className={cls}>
            {token}
          </span>
        );
      })}
    </>
  );
}

function ProgressDots({ current, total }: { current: number; total: number }) {
  return (
    <div
      className="flex items-center gap-1.5"
      aria-label={`${current} of ${total}`}
    >
      {Array.from({ length: total }, (_, i) => (
        <div
          key={i}
          className={`h-1.5 w-6 rounded-full transition-colors ${
            i < current ? "bg-indigo-500" : "bg-slate-200 dark:bg-slate-700"
          }`}
        />
      ))}
      <span className="ml-1 text-xs text-slate-400 dark:text-slate-500">
        {current}/{total}
      </span>
    </div>
  );
}

function ResultControls({
  passed,
  isSaving,
  isLast,
  onContinue,
  onRetry,
  onManual,
}: {
  passed: boolean;
  isSaving: boolean;
  isLast: boolean;
  onContinue: () => void;
  onRetry: () => void;
  onManual: () => void;
}) {
  const continueLabel = isLast
    ? passed
      ? "Finish session →"
      : "Finish anyway →"
    : passed
      ? "Continue →"
      : "Next phrase →";

  return (
    <>
      {passed ? (
        <button
          onClick={onContinue}
          disabled={isSaving}
          className="w-full rounded-2xl bg-emerald-600 py-5 text-base font-semibold text-white shadow-sm transition-all hover:bg-emerald-700 active:scale-[0.98] disabled:opacity-60"
        >
          {isSaving ? "Saving…" : continueLabel}
        </button>
      ) : (
        <>
          <button
            onClick={onRetry}
            className="w-full rounded-2xl bg-indigo-600 py-5 text-base font-semibold text-white shadow-sm transition-all hover:bg-indigo-700 active:scale-[0.98]"
          >
            Try again
          </button>
          <button
            onClick={onContinue}
            disabled={isSaving}
            className="w-full rounded-2xl border border-slate-200 bg-white py-4 text-sm font-medium text-slate-600 transition-all hover:bg-slate-50 active:scale-[0.98] disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
          >
            {isSaving ? "Saving…" : continueLabel}
          </button>
          <button
            onClick={onManual}
            disabled={isSaving}
            className="w-full py-2 text-sm text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 disabled:opacity-40"
          >
            Mark as spoken
          </button>
        </>
      )}
    </>
  );
}

function PrimerScreen({ onContinue }: { onContinue: () => void }) {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center px-8 pb-safe text-center">
      <div className="text-5xl" aria-hidden>🐌</div>
      <h2 className="mt-6 text-xl font-semibold tracking-tight">Articulation warmup</h2>
      <div className="mt-6 flex flex-col gap-3 text-slate-500 dark:text-slate-400">
        <p className="text-base font-medium">Go slow.</p>
        <p className="text-base font-medium">Exaggerate every sound.</p>
        <p className="text-base font-medium">Don&apos;t race.</p>
      </div>
      <p className="mt-4 text-xs text-slate-400 dark:text-slate-500">
        Twisters don&apos;t count toward your daily practice — this is just a warmup.
      </p>
      <button
        onClick={onContinue}
        className="mt-10 w-full max-w-xs rounded-2xl bg-indigo-600 py-5 text-base font-semibold text-white shadow-sm transition-all hover:bg-indigo-700 active:scale-[0.98]"
      >
        Got it →
      </button>
    </main>
  );
}

function SetupScreen({
  mode,
  setMode,
  aid,
  setAid,
  freestyleText,
  setFreestyleText,
  onStart,
  loading,
  error,
}: {
  mode: Mode;
  setMode: (m: Mode) => void;
  aid: Aid;
  setAid: (a: Aid) => void;
  freestyleText: string;
  setFreestyleText: (t: string) => void;
  onStart: () => void;
  loading: boolean;
  error: string | null;
}) {
  return (
    <main className="mx-auto w-full max-w-xl px-5 pt-10 pb-safe">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/"
          className="text-sm text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300"
        >
          ← Home
        </Link>
      </div>

      <h1 className="mt-6 text-xl font-semibold tracking-tight">New session</h1>

      {/* Mode selection */}
      <div className="mt-6">
        <p className="mb-2 text-xs font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500">
          Mode
        </p>
        <div className="grid grid-cols-2 gap-2">
          {MODE_OPTIONS.map((m) => (
            <button
              key={m.id}
              onClick={() => setMode(m.id)}
              className={`flex flex-col items-center rounded-xl border px-2 py-3 text-center transition-all active:scale-[0.97] ${
                mode === m.id
                  ? "border-indigo-500 bg-indigo-50 text-indigo-700 dark:border-indigo-500 dark:bg-indigo-950 dark:text-indigo-300"
                  : "border-slate-200 bg-white text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
              }`}
            >
              <span className="text-sm font-medium">{m.label}</span>
              <span className="mt-0.5 text-[10px] text-slate-400 dark:text-slate-500">
                {m.desc}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Freestyle textarea */}
      {mode === "freestyle" && (
        <div className="mt-4">
          <textarea
            value={freestyleText}
            onChange={(e) => setFreestyleText(e.target.value)}
            placeholder="Paste a paragraph you'd like to practise…"
            rows={5}
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 placeholder-slate-400 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:placeholder-slate-500"
          />
        </div>
      )}

      {/* Aid selection */}
      <div className="mt-6">
        <p className="mb-2 text-xs font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500">
          Physical aid
        </p>
        <div className="grid grid-cols-2 gap-2">
          {AID_OPTIONS.map((a) => (
            <button
              key={a.id}
              onClick={() => setAid(a.id)}
              className={`rounded-xl border py-3 text-sm font-medium transition-all active:scale-[0.97] ${
                aid === a.id
                  ? "border-indigo-500 bg-indigo-50 text-indigo-700 dark:border-indigo-500 dark:bg-indigo-950 dark:text-indigo-300"
                  : "border-slate-200 bg-white text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
              }`}
            >
              {a.label}
            </button>
          ))}
        </div>
      </div>

      {/* Error */}
      {error && (
        <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-800 dark:bg-red-950 dark:text-red-400">
          {error}
        </p>
      )}

      {/* Start button */}
      <div className="mt-10">
        <button
          onClick={onStart}
          disabled={loading}
          className="w-full rounded-2xl bg-indigo-600 py-5 text-base font-semibold text-white shadow-sm transition-all hover:bg-indigo-700 active:scale-[0.98] disabled:opacity-60"
        >
          {loading ? "Loading…" : "Start Practice →"}
        </button>
      </div>
    </main>
  );
}
