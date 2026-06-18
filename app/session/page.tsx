"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getRecognizer, computeMatch } from "@/lib/speech";
import type { SpeechRecognizer, SpeechError } from "@/lib/speech";
import { playPass, playFail } from "@/lib/audio";
import { SESSION_TARGET, THRESHOLDS } from "@/lib/constants";
import { AUDIENCE_FACES, shuffleFaces } from "@/lib/audience";
import { MirrorView } from "@/components/MirrorView";
import { PlaybackModal } from "@/components/PlaybackModal";
import { getRecorder, isIOSSafari } from "@/lib/media";
import type { AudioRecorder } from "@/lib/media";
import Image from "next/image";
import Link from "next/link";

// ─── Types ────────────────────────────────────────────────────────────────────

type Mode = "wh" | "passage" | "freestyle" | "twister";
type Aid = "none" | "pen" | "teeth" | "slow";
type Listener = "none" | "mirror" | "audience" | "recording";
type SessionStep = "setup" | "loading" | "primer" | "running";
type RecogState = "idle" | "countdown" | "listening" | "result";

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

const LISTENER_OPTIONS: { id: Listener; label: string; desc: string }[] = [
  { id: "none", label: "No listener", desc: "solo practice" },
  { id: "mirror", label: "Mirror", desc: "see your own face · live only" },
  { id: "audience", label: "Pretend audience", desc: "a face watches · nothing saved" },
  { id: "recording", label: "Recording", desc: "play back after · not saved" },
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function SessionPage() {
  const router = useRouter();
  const recognizerRef = useRef<SpeechRecognizer | null>(null);
  const recorderRef = useRef<AudioRecorder | null>(null);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const shuffledFacesRef = useRef<string[]>(shuffleFaces(AUDIENCE_FACES));

  // Session-level state
  const [step, setStep] = useState<SessionStep>("setup");
  const [mode, setMode] = useState<Mode>("wh");
  const [aid, setAid] = useState<Aid>("none");
  const [listener, setListener] = useState<Listener>("none");
  const [timer, setTimer] = useState(false);
  const [freestyleText, setFreestyleText] = useState("");
  const [loadError, setLoadError] = useState<string | null>(null);

  // Practice loop state
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [recogState, setRecogState] = useState<RecogState>("idle");
  const [countdownValue, setCountdownValue] = useState(5);
  const [transcript, setTranscript] = useState("");
  const [matchResult, setMatchResult] = useState<{
    score: number;
    passed: boolean;
  } | null>(null);
  const [sessionResults, setSessionResults] = useState<PhraseResult[]>([]);
  const [recogError, setRecogError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [mirrorError, setMirrorError] = useState<string | null>(null);
  const [recordingBlob, setRecordingBlob] = useState<Blob | null>(null);
  const [showPlayback, setShowPlayback] = useState(false);

  // Abort the recognizer, recorder, and countdown when the component unmounts.
  useEffect(
    () => () => {
      recognizerRef.current?.abort();
      recorderRef.current?.stop();
      if (countdownRef.current) clearInterval(countdownRef.current);
    },
    [],
  );

  // Release mic/recorder on browser back (bfcache prevents normal unmount cleanup).
  useEffect(() => {
    const handlePageHide = () => {
      recognizerRef.current?.abort();
      recorderRef.current?.stop();
      if (countdownRef.current) {
        clearInterval(countdownRef.current);
        countdownRef.current = null;
      }
    };
    window.addEventListener("pagehide", handlePageHide);
    return () => window.removeEventListener("pagehide", handlePageHide);
  }, []);

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
      setMirrorError(null);
      shuffledFacesRef.current = shuffleFaces(AUDIENCE_FACES);
      // Twisters show a primer screen before starting
      setStep(mode === "twister" ? "primer" : "running");
    } catch {
      setLoadError(
        "Something went wrong loading exercises. Check your connection and try again.",
      );
      setStep("setup");
    }
  }, [mode, aid, listener, timer, freestyleText]);

  // ─── Recognition handlers ─────────────────────────────────────────────────

  const startRecognition = useCallback(async () => {
    const recognizer = recognizerRef.current ?? getRecognizer();
    recognizerRef.current = recognizer;

    // ── Recording mode setup ──────────────────────────────────────────────────
    // iOS spike: on iOS Safari, MediaRecorder + webkitSpeechRecognition may
    // conflict over the mic. Until the spike is validated empirically on device,
    // iOS falls back to recognition-only (user self-rates after listening back
    // via the manual path). On non-iOS, start the recorder alongside recognition.
    //
    // TODO: after validating the iOS spike, update the isIOSSafari() branch.
    const useRecording = listener === "recording" && !isIOSSafari();
    let recordingPromise: Promise<Blob> | null = null;

    if (useRecording) {
      const recorder = getRecorder();
      recorderRef.current = recorder;
      if (recorder.isSupported()) {
        recordingPromise = recorder.start().catch(() => {
          // If the recorder fails to start (e.g. mic denied), continue with
          // recognition only — don't block the session.
          return null as unknown as Blob;
        });
      }
    }
    // ─────────────────────────────────────────────────────────────────────────

    if (!recognizer.isSupported()) {
      setRecogError(
        'Speech recognition is not supported in this browser. Use "Mark as spoken" to continue.',
      );
      setRecogState("idle");
      return;
    }

    setRecogState("listening");

    try {
      const final = await recognizer.start({
        onInterim: (t) => setTranscript(t),
      });

      // Stop the recorder as soon as speech ends
      if (useRecording) {
        recorderRef.current?.stop();
        const blob = await recordingPromise;
        if (blob && blob.size > 0) {
          setRecordingBlob(blob);
          setShowPlayback(true);
        }
      }

      setTranscript(final);

      const match = computeMatch(prompts[currentIndex].text, final, THRESHOLDS[mode]);
      setMatchResult(match);
      setRecogState("result");
      if (match.passed) playPass();
      else playFail();
    } catch (err) {
      recorderRef.current?.stop();
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
  }, [prompts, currentIndex, mode, listener]);

  const handleStartRecording = useCallback(() => {
    setTranscript("");
    setMatchResult(null);
    setRecogError(null);

    if (!timer) {
      startRecognition();
      return;
    }

    // Pre-speech countdown (5 → 0), then start recognition.
    // The interval is started synchronously inside the user-gesture handler
    // to satisfy iOS Safari's gesture requirement for getUserMedia / SpeechRecognition.
    const COUNTDOWN_FROM = 5;
    setCountdownValue(COUNTDOWN_FROM);
    setRecogState("countdown");

    let remaining = COUNTDOWN_FROM;
    countdownRef.current = setInterval(() => {
      remaining -= 1;
      if (remaining <= 0) {
        clearInterval(countdownRef.current!);
        countdownRef.current = null;
        startRecognition();
      } else {
        setCountdownValue(remaining);
      }
    }, 1000);
  }, [timer, startRecognition]);

  const handleStop = useCallback(() => {
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
      countdownRef.current = null;
      setRecogState("idle");
    } else {
      recorderRef.current?.stop();
      recognizerRef.current?.stop();
    }
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
          listener,
          timer,
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
      setRecordingBlob(null);
      setShowPlayback(false);
    },
    [prompts, currentIndex, mode, aid, listener, timer, sessionResults, router],
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
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
      countdownRef.current = null;
    }
    setTranscript("");
    setMatchResult(null);
    setRecogState("idle");
    setRecogError(null);
    setRecordingBlob(null);
    setShowPlayback(false);
  }, []);

  // ─── Render ───────────────────────────────────────────────────────────────

  if (step === "setup" || step === "loading") {
    return (
      <SetupScreen
        mode={mode}
        setMode={setMode}
        aid={aid}
        setAid={setAid}
        listener={listener}
        setListener={setListener}
        timer={timer}
        setTimer={setTimer}
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
      {/* Playback modal — shown after recording stops, before result controls */}
      {showPlayback && recordingBlob && (
        <PlaybackModal
          blob={recordingBlob}
          onClose={() => setShowPlayback(false)}
        />
      )}

      {/* Top bar */}
      <div className="flex items-center justify-between px-5 pt-10">
        <button
          onClick={() => {
            if (countdownRef.current) {
              clearInterval(countdownRef.current);
              countdownRef.current = null;
            }
            recorderRef.current?.stop();
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

      {/* Listener overlays */}
      {listener === "audience" && (
        <div className="mt-4 flex justify-center">
          <div className="relative h-32 w-32 overflow-hidden rounded-full border-2 border-slate-200 shadow-sm dark:border-slate-700">
            <Image
              key={currentIndex}
              src={shuffledFacesRef.current[currentIndex % shuffledFacesRef.current.length]}
              alt="Audience member"
              fill
              className="object-cover object-top"
              priority
            />
          </div>
        </div>
      )}
      {listener === "mirror" && (
        <>
          <MirrorView onError={(msg) => setMirrorError(msg)} />
          {mirrorError && (
            <p className="mt-2 text-center text-xs text-slate-400 dark:text-slate-500">
              {mirrorError}
            </p>
          )}
          {!mirrorError && (
            <p className="mt-1 text-center text-[10px] text-slate-300 dark:text-slate-600">
              Live preview only — nothing is recorded or saved
            </p>
          )}
        </>
      )}

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
        ) : recogState === "countdown" ? (
          /* Countdown state — tap to cancel */
          <button
            onClick={handleStop}
            className="relative w-full overflow-hidden rounded-2xl bg-indigo-500 py-5 text-base font-semibold text-white shadow-sm transition-all"
          >
            <span className="relative text-2xl">{countdownValue}</span>
          </button>
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

        {/* Manual fallback — always available except during countdown/result */}
        {recogState !== "result" && recogState !== "countdown" && (
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
  const remaining = new Map<string, number>();
  for (const word of transcript
    .toLowerCase()
    .replace(/[^\w\s]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .split(" ")
    .filter(Boolean)) {
    remaining.set(word, (remaining.get(word) ?? 0) + 1);
  }

  return (
    <>
      {text.split(/(\s+)/).map((token, i) => {
        if (/^\s+$/.test(token)) return <span key={i}>{token}</span>;

        const normalized = token.toLowerCase().replace(/[^\w]/g, "");
        let isRecognized = false;
        if (normalized.length > 0 && (remaining.get(normalized) ?? 0) > 0) {
          isRecognized = true;
          remaining.set(normalized, remaining.get(normalized)! - 1);
        }

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

function SectionHeader({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3">
      <span className="shrink-0 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500">
        {children}
      </span>
      <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
    </div>
  );
}

function OptionCard({
  selected,
  onClick,
  children,
  compact = false,
}: {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
  compact?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      style={
        selected
          ? { boxShadow: "0 0 0 1px rgba(99,102,241,0.45), 0 0 20px rgba(99,102,241,0.14)" }
          : undefined
      }
      className={`flex flex-col items-center rounded-2xl border px-3 text-center transition-all duration-150 active:scale-[0.96] ${
        compact ? "py-3.5" : "py-[18px]"
      } ${
        selected
          ? "border-indigo-400/50 bg-indigo-500/10 text-indigo-700 dark:border-indigo-500/40 dark:bg-indigo-500/[0.13] dark:text-indigo-200"
          : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-300 dark:hover:border-slate-700"
      }`}
    >
      {children}
    </button>
  );
}

function SetupScreen({
  mode,
  setMode,
  aid,
  setAid,
  listener,
  setListener,
  timer,
  setTimer,
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
  listener: Listener;
  setListener: (l: Listener) => void;
  timer: boolean;
  setTimer: (t: boolean) => void;
  freestyleText: string;
  setFreestyleText: (t: string) => void;
  onStart: () => void;
  loading: boolean;
  error: string | null;
}) {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-xl flex-col">
      {/* Header */}
      <div className="relative px-5 pt-10">
        <div className="pointer-events-none absolute inset-x-0 top-0 hidden h-56 bg-gradient-to-b from-indigo-950/25 via-indigo-950/8 to-transparent dark:block" />
        <Link
          href="/"
          className="relative inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 transition-colors hover:text-slate-700 dark:text-slate-500 dark:hover:text-slate-300"
        >
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
            <path
              d="M8 2.5L4 6.5L8 10.5"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Home
        </Link>
        <div className="relative mt-5 mb-8">
          <h1 className="text-[26px] font-bold tracking-tight text-slate-900 dark:text-slate-50">
            New session
          </h1>
          <p className="mt-1 text-sm text-slate-500">Configure your practice</p>
        </div>
      </div>

      {/* Option groups */}
      <div className="flex-1 space-y-7 px-5">
        {/* Mode */}
        <div>
          <SectionHeader>Mode</SectionHeader>
          <div className="mt-3 grid grid-cols-2 gap-2">
            {MODE_OPTIONS.map((m) => (
              <OptionCard
                key={m.id}
                selected={mode === m.id}
                onClick={() => setMode(m.id)}
              >
                <span className="text-[13px] font-semibold leading-tight">
                  {m.label}
                </span>
                <span className="mt-1 text-[11px] leading-tight opacity-60">
                  {m.desc}
                </span>
              </OptionCard>
            ))}
          </div>

          {mode === "freestyle" && (
            <textarea
              value={freestyleText}
              onChange={(e) => setFreestyleText(e.target.value)}
              placeholder="Paste a paragraph you'd like to practise…"
              rows={4}
              className="mt-3 w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 placeholder-slate-400 transition-all focus:border-indigo-400/60 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-800 dark:bg-slate-900/80 dark:text-slate-200 dark:placeholder-slate-600"
            />
          )}
        </div>

        {/* Physical aid */}
        <div>
          <SectionHeader>Physical aid</SectionHeader>
          <div className="mt-3 grid grid-cols-2 gap-2">
            {AID_OPTIONS.map((a) => (
              <OptionCard
                key={a.id}
                selected={aid === a.id}
                onClick={() => setAid(a.id)}
                compact
              >
                <span className="text-[13px] font-semibold">{a.label}</span>
              </OptionCard>
            ))}
          </div>
        </div>

        {/* Listener */}
        <div>
          <SectionHeader>Listener</SectionHeader>
          <div className="mt-3 grid grid-cols-2 gap-2">
            {LISTENER_OPTIONS.map((l) => (
              <OptionCard
                key={l.id}
                selected={listener === l.id}
                onClick={() => setListener(l.id)}
              >
                <span className="text-[13px] font-semibold leading-tight">
                  {l.label}
                </span>
                <span className="mt-1 text-[11px] leading-tight opacity-60">
                  {l.desc}
                </span>
              </OptionCard>
            ))}
          </div>
        </div>

        {/* Countdown */}
        <div>
          <SectionHeader>Countdown</SectionHeader>
          <div className="mt-3 grid grid-cols-2 gap-2">
            {(
              [
                { val: false, label: "No countdown", desc: "start immediately" },
                { val: true, label: "5 s countdown", desc: "before each phrase" },
              ] as const
            ).map(({ val, label, desc }) => (
              <OptionCard
                key={String(val)}
                selected={timer === val}
                onClick={() => setTimer(val)}
              >
                <span className="text-[13px] font-semibold leading-tight">
                  {label}
                </span>
                <span className="mt-1 text-[11px] leading-tight opacity-60">
                  {desc}
                </span>
              </OptionCard>
            ))}
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mx-5 mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 dark:border-red-800/50 dark:bg-red-950/50">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Start */}
      <div className="px-5 pb-safe pt-8">
        <button
          onClick={onStart}
          disabled={loading}
          className="session-start-btn w-full rounded-2xl py-[18px] text-[15px] font-semibold text-white transition-transform active:scale-[0.98] disabled:opacity-50"
        >
          {loading ? "Loading…" : "Start Practice →"}
        </button>
      </div>
    </main>
  );
}
