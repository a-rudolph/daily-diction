"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { getRecognizer } from "@/lib/speech";
import { getRecorder } from "@/lib/media";

/**
 * Releases any active microphone or camera held by the session page whenever
 * the user navigates away from /session. Rendered in the root layout so it
 * covers every destination page automatically.
 */
export function MediaReleaseOnNavigate() {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname.startsWith("/session")) {
      getRecognizer().abort();
      getRecorder().stop();
    }
  }, [pathname]);

  return null;
}
