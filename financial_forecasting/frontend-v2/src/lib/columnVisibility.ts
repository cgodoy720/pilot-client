import { useState } from "react";

export function useColumnVisibility<K extends string>(
  storageKey: string,
  allColumns: K[],
) {
  const [visible, setVisible] = useState<K[]>(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const parsed = JSON.parse(stored) as K[];
        const valid = parsed.filter((k) => allColumns.includes(k));
        if (valid.length > 0) return valid;
      }
    } catch {}
    return [...allColumns];
  });

  const toggle = (col: K) => {
    setVisible((prev) => {
      const next = prev.includes(col)
        ? prev.filter((k) => k !== col)
        : [...prev, col].sort((a, b) => allColumns.indexOf(a) - allColumns.indexOf(b));
      try { localStorage.setItem(storageKey, JSON.stringify(next)); } catch {}
      return next;
    });
  };

  return { visible, toggle };
}
