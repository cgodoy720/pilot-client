import { useState } from "react";

/**
 * Tiny hook for sections that should remember whether they're expanded
 * across reloads. Persists to localStorage under the given key, so the
 * same key in different parts of the app shares state intentionally
 * (e.g. "Activity timeline" stays collapsed everywhere if the user
 * collapses it once).
 */
export function useCollapsible(storageKey: string, defaultOpen = true) {
  const [open, setOpen] = useState<boolean>(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored === "open") return true;
      if (stored === "closed") return false;
    } catch {}
    return defaultOpen;
  });
  const toggle = () => {
    setOpen((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(storageKey, next ? "open" : "closed");
      } catch {}
      return next;
    });
  };
  return { open, toggle };
}
