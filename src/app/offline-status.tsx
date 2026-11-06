"use client";

import { useSyncExternalStore } from "react";
import AuthIcon from "./(auth)/auth-icons";

function subscribe(listener: () => void) {
  window.addEventListener("online", listener);
  window.addEventListener("offline", listener);
  return () => {
    window.removeEventListener("online", listener);
    window.removeEventListener("offline", listener);
  };
}

/** Warns that what is on screen comes from the last saved copy (HU-19, CA-02). */
export default function OfflineBanner() {
  const online = useSyncExternalStore(subscribe, () => navigator.onLine, () => true);
  if (online) return null;
  return (
    <div role="status" className="flex items-center gap-2 border-b border-hm-border-lo bg-hm-warn-soft px-4 py-2 text-hm-caption font-medium text-hm-warn">
      <AuthIcon name="alert" size={14} />
      Sin conexión: puede que los datos no estén al día.
    </div>
  );
}
