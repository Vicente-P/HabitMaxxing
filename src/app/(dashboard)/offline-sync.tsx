"use client";

import { useEffect } from "react";
import { pendingRuntime } from "@/lib/offline-logs/pending-runtime";

/** Loads the owner's pending queue and replays it on start, on reconnect and on return to the foreground (ADR-08 §6). */
export default function OfflineSync({ ownerId }: { ownerId: string }) {
  useEffect(() => {
    let active = true;
    const sync = () => { void pendingRuntime.sync(); };
    const onVisibility = () => { if (document.visibilityState === "visible") sync(); };

    void pendingRuntime.init(ownerId).then(() => { if (active) sync(); });
    window.addEventListener("online", sync);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      active = false;
      window.removeEventListener("online", sync);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [ownerId]);

  return null;
}
