import { useEffect, useRef, useState } from "react";
import { Bookmark, BookmarkPlus, Trash2 } from "lucide-react";

import { cn } from "@/lib/utils";

interface SavedView<F> {
  name: string;
  filters: F;
}

interface SavedViewsPickerProps<F> {
  storageKey: string;
  currentFilters: F;
  onLoad: (filters: F) => void;
}

export function SavedViewsPicker<F>({
  storageKey,
  currentFilters,
  onLoad,
}: SavedViewsPickerProps<F>) {
  const [views, setViews] = useState<SavedView<F>[]>(() => {
    try {
      return JSON.parse(localStorage.getItem(storageKey) ?? "[]") as SavedView<F>[];
    } catch {
      return [];
    }
  });
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [newName, setNewName] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) {
        setOpen(false);
        setSaving(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const persist = (next: SavedView<F>[]) => {
    setViews(next);
    try { localStorage.setItem(storageKey, JSON.stringify(next)); } catch {}
  };

  const saveView = () => {
    const name = newName.trim();
    if (!name) return;
    persist([...views.filter((v) => v.name !== name), { name, filters: currentFilters }]);
    setNewName("");
    setSaving(false);
  };

  const deleteView = (name: string) => persist(views.filter((v) => v.name !== name));

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "flex h-7 items-center gap-1.5 rounded-md border border-border-strong bg-surface px-2.5 text-[12px] font-medium text-ink-2 hover:bg-surface-2 hover:text-ink",
          open && "bg-surface-2 text-ink",
        )}
      >
        <Bookmark size={12} className={cn(views.length > 0 && "fill-current opacity-60")} />
        Views {views.length > 0 && `(${views.length})`}
      </button>

      {open && (
        <div className="absolute right-0 top-8 z-20 min-w-[190px] rounded-lg border border-border-strong bg-surface p-1.5 shadow-lg">
          {views.map((v) => (
            <div
              key={v.name}
              className="group flex items-center gap-1 rounded px-2 py-1.5 hover:bg-surface-2"
            >
              <button
                className="flex-1 truncate text-left text-[12.5px] text-ink"
                onClick={() => { onLoad(v.filters); setOpen(false); }}
              >
                {v.name}
              </button>
              <button
                className="hidden text-ink-3 hover:text-red group-hover:block"
                onClick={() => deleteView(v.name)}
              >
                <Trash2 size={11} />
              </button>
            </div>
          ))}

          {views.length > 0 && <div className="my-1 border-t border-border-strong" />}

          {saving ? (
            <div className="flex items-center gap-1.5 px-1 py-1">
              <input
                autoFocus
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") saveView();
                  if (e.key === "Escape") setSaving(false);
                }}
                placeholder="View name…"
                className="flex-1 rounded border border-border-strong px-2 py-1 text-[12px] outline-none"
              />
              <button
                onClick={saveView}
                className="rounded bg-ink px-2 py-1 text-[11px] font-medium text-surface hover:opacity-90"
              >
                Save
              </button>
            </div>
          ) : (
            <button
              onClick={() => setSaving(true)}
              className="flex w-full items-center gap-1.5 rounded px-2 py-1.5 text-[12.5px] text-ink-2 hover:bg-surface-2 hover:text-ink"
            >
              <BookmarkPlus size={12} />
              Save current view
            </button>
          )}
        </div>
      )}
    </div>
  );
}
