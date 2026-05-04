/**
 * Search-based picker for Salesforce Account (~20K rows org-wide).
 *
 * Renders the current account name as a clickable label; click to
 * expand a search dropdown that filters by name. Saves on selection
 * via the `onSave` callback (intended to wire to a useUpdate*
 * mutation that patches the parent record's AccountId).
 *
 * Why not a plain InlineSelect: Pursuit has 20K+ accounts; mounting
 * them all in a `<select>` makes the browser jank. The search list
 * caps at 50 visible matches per query, which keeps it fast.
 */
import { useEffect, useMemo, useRef, useState } from "react";
import { Pencil, X } from "lucide-react";

import { cn } from "@/lib/utils";

export interface AccountOption {
  value: string;
  label: string;
}

export interface AccountPickerProps {
  /** Current AccountId. Null when the parent record has no account. */
  value: string | null;
  /** Display name for the current account — surfaced on the resting
   *  state so we don't make the user re-search to see what it is. */
  currentLabel: string | null;
  /** All accounts (id + name). Filtered client-side as the user types. */
  options: AccountOption[];
  onSave: (next: string) => Promise<void>;
  /** Maximum match-list height before the user has to scroll. */
  maxVisible?: number;
}

export function AccountPicker({
  value,
  currentLabel,
  options,
  onSave,
  maxVisible = 50,
}: AccountPickerProps) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      // Microtask so the popover mounts before we focus.
      queueMicrotask(() => inputRef.current?.focus());
    } else {
      setQ("");
      setError(null);
    }
  }, [open]);

  // Click-outside dismiss — the dropdown is portal-less and lives in
  // a relative parent, so we listen on document and check the wrapper.
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return options.slice(0, maxVisible);
    return options
      .filter((o) => o.label.toLowerCase().includes(needle))
      .slice(0, maxVisible);
  }, [options, q, maxVisible]);

  const pick = async (next: AccountOption) => {
    if (next.value === value) {
      setOpen(false);
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await onSave(next.value);
      setOpen(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="relative" ref={popoverRef}>
      {!open ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className={cn(
            "group/edit relative flex w-full max-w-full items-center gap-1.5 rounded px-1.5 py-1 text-left text-[13px] text-ink-2 hover:bg-surface hover:ring-1 hover:ring-border-strong",
            !currentLabel && "italic text-ink-4",
          )}
          title={currentLabel ?? "No account"}
        >
          <span className="min-w-0 flex-1 truncate">
            {currentLabel ?? "—"}
          </span>
          <Pencil
            size={11}
            className="flex-shrink-0 text-ink-4 opacity-0 transition-opacity group-hover/edit:opacity-100"
            aria-hidden="true"
          />
        </button>
      ) : (
        <div className="rounded-md border border-border-strong bg-surface shadow-md">
          <div className="flex items-center gap-1 border-b border-border-strong px-2 py-1.5">
            <input
              ref={inputRef}
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search accounts…"
              className="flex-1 bg-transparent text-[13px] text-ink outline-none placeholder:text-ink-4"
            />
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="text-ink-3 hover:text-ink"
              aria-label="Close"
            >
              <X size={12} />
            </button>
          </div>
          <div className="max-h-[260px] overflow-y-auto">
            {filtered.length === 0 ? (
              <div className="px-3 py-3 text-center text-[12px] text-ink-3">
                {q ? `No accounts match “${q}”` : "Start typing to search…"}
              </div>
            ) : (
              filtered.map((o) => (
                <button
                  key={o.value}
                  type="button"
                  onClick={() => void pick(o)}
                  disabled={saving}
                  className={cn(
                    "block w-full truncate px-3 py-1.5 text-left text-[12.5px] hover:bg-surface-2 disabled:opacity-50",
                    o.value === value && "bg-accent/10 font-medium text-ink",
                  )}
                  title={o.label}
                >
                  {o.label}
                </button>
              ))
            )}
          </div>
          {options.length > maxVisible && !q ? (
            <div className="border-t border-border-strong bg-surface-2 px-3 py-1 text-[11px] text-ink-3">
              Showing first {maxVisible} of {options.length.toLocaleString()} —
              type to narrow.
            </div>
          ) : null}
          {error ? (
            <div className="border-t border-red/40 bg-red/5 px-3 py-1 text-[11px] text-red">
              {error}
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
