"use client";

import { useEffect, useRef, useState } from "react";

interface MirrorViewProps {
  /** Called when the stream is torn down (useful for graceful-degradation UI). */
  onError?: (msg: string) => void;
}

/**
 * MirrorView — shows a live, mirrored self-view from the front camera.
 *
 * Live only — nothing is recorded or saved.
 * Tears down the camera track on unmount / when removed from the tree.
 *
 * Audio is NOT requested so this doesn't contend with SpeechRecognition.
 */
export function MirrorView({ onError }: MirrorViewProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [denied, setDenied] = useState(false);

  useEffect(() => {
    let active = true;

    async function start() {
      try {
        // Video only — no audio to avoid mic conflicts with SpeechRecognition.
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user" },
          audio: false,
        });

        if (!active) {
          // Component unmounted before stream resolved — stop immediately.
          stream.getTracks().forEach((t) => t.stop());
          return;
        }

        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        if (!active) return;
        const msg =
          err instanceof DOMException && err.name === "NotAllowedError"
            ? "Camera access was denied. You can continue without the mirror."
            : "Camera unavailable. You can continue without the mirror.";
        setDenied(true);
        onError?.(msg);
      }
    }

    start();

    return () => {
      active = false;
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    };
  }, [onError]);

  if (denied) return null;

  return (
    <div className="flex justify-center mt-4">
      <div className="relative h-28 w-28 overflow-hidden rounded-full border-2 border-slate-200 shadow-sm dark:border-slate-700">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          // Mirror the self-view (transform applied via style for compatibility)
          style={{ transform: "scaleX(-1)", width: "100%", height: "100%", objectFit: "cover" }}
        />
      </div>
      <p className="sr-only">Live camera preview — nothing is recorded or saved.</p>
    </div>
  );
}
