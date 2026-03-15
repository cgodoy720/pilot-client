import { useState, useEffect, useCallback } from 'react';

/**
 * Generic hook for a localStorage-backed collection with deduplication.
 *
 * Replaces the identical patterns in LeadsContext and useLinkedInContacts with
 * a single reusable primitive.
 *
 * @param storageKey  localStorage key
 * @param dedupeKeyFn function that returns a dedup string for an item
 */
export function useLocalCollection<T>(
  storageKey: string,
  dedupeKeyFn: (item: T) => string,
) {
  const [items, setItems] = useState<T[]>(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      return raw ? (JSON.parse(raw) as T[]) : [];
    } catch {
      return [];
    }
  });

  // Persist on every change
  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(items));
  }, [storageKey, items]);

  const importItems = useCallback(
    (
      newItems: T[],
      /** Optional transform applied to each new item before insertion */
      transform?: (item: T) => T,
    ): { added: number; duplicates: number } => {
      let added = 0;
      let duplicates = 0;

      setItems((prev) => {
        const existing = new Set(prev.map(dedupeKeyFn));
        const toAdd: T[] = [];

        for (const item of newItems) {
          const key = dedupeKeyFn(item);
          if (existing.has(key)) {
            duplicates++;
          } else {
            existing.add(key);
            toAdd.push(transform ? transform(item) : item);
            added++;
          }
        }

        return [...prev, ...toAdd];
      });

      return { added, duplicates };
    },
    [dedupeKeyFn],
  );

  const updateItem = useCallback(
    (predicate: (item: T) => boolean, updates: Partial<T>) => {
      setItems((prev) =>
        prev.map((item) => (predicate(item) ? { ...item, ...updates } : item)),
      );
    },
    [],
  );

  const removeItems = useCallback(
    (predicate: (item: T) => boolean) => {
      setItems((prev) => prev.filter((item) => !predicate(item)));
    },
    [],
  );

  const clear = useCallback(() => setItems([]), []);

  return { items, setItems, importItems, updateItem, removeItems, clear };
}
