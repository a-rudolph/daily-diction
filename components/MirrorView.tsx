"use client";

import { useEffect, useRef, useState } from "react";

interface MirrorViewProps {
  onError?: (msg: string) => void;
}

export function MirrorView({ onError }: MirrorViewProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const onErrorRef = useRef(onError);
  const [denied, setDenied] = useState(false);

  // Keep the ref current without triggering the camera effect.
  useEffect(() => {
    onErrorRef.current = onError;
  });

  useEffect(() => {
    let active = true;

    async function start() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user" },
          audio: false,
        });

        if (!active) {
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
        onErrorRef.current?.(msg);
      }
    }

    start();

    // Also stop tracks on browser back (bfcache prevents normal unmount cleanup).
    const handlePageHide = () => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    };
    window.addEventListener("pagehide", handlePageHide);

    return () => {
      active = false;
      window.removeEventListener("pagehide", handlePageHide);
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    };
  }, []); // empty — camera starts once on mount, stops on unmount

  if (denied) return null;

  return (
    <div className="flex justify-center mt-4">
      <div className="relative h-48 w-48 overflow-hidden rounded-full border-2 border-slate-200 shadow-sm dark:border-slate-700">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          style={{ transform: "scaleX(-1)", width: "100%", height: "100%", objectFit: "cover" }}
        />
      </div>
      <p className="sr-only">Live camera preview — nothing is recorded or saved.</p>
    </div>
  );
}
