/**
 * Shared bits for the Cleanup tabs (accounts/contacts) — selection cap,
 * the per-tab confirmation dialog, and a bounded-parallelism runner.
 *
 * Opportunities tab keeps its own (slightly more elaborate) dialog because
 * it has stage-specific picker logic; accounts/contacts only need owner-
 * picker + delete-confirm so they share this lighter version.
 */
import type React from "react";

export const SELECTION_CAP = 500;
export const BULK_PARALLELISM = 4;

/** Where the dialog sits in its lifecycle. */
export type BulkProgress = {
  done: number;
  total: number;
  failures: { id: string; name: string; error: string }[];
};

export type BulkMode = "owner" | "delete";

export interface BulkDialogProps {
  /** Singular label of the entity ("account", "contact"). */
  entity: string;
  mode: BulkMode;
  /** Owner picker value (mode === "owner"). */
  ownerValue: string;
  onOwnerValueChange: (v: string) => void;
  ownerOptions: { value: string; label: string }[];
  /** Items being acted on — only `id` + `name` are read here. */
  selected: { id: string; name: string }[];
  progress: BulkProgress | null;
  onRun: () => void;
  onClose: () => void;
}

export function BulkDialog({
  entity,
  mode,
  ownerValue,
  onOwnerValueChange,
  ownerOptions,
  selected,
  progress,
  onRun,
  onClose,
}: BulkDialogProps): React.ReactElement {
  const previewNames = selected.slice(0, 5).map((s) => s.name);
  const remaining = selected.length - previewNames.length;
  const running = progress != null && progress.done < progress.total;
  const finished = progress != null && progress.done === progress.total;

  const titleVerb = mode === "owner" ? "Change owner for" : "Delete";
  const plural = selected.length === 1 ? entity : `${entity}s`;
  const isDestructive = mode === "delete";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-lg bg-surface shadow-xl">
        <header className="border-b border-border-strong px-5 py-3">
          <h2 className="text-[15px] font-semibold text-ink">
            {titleVerb} {selected.length.toLocaleString()} {plural}
          </h2>
        </header>

        <div className="px-5 py-4">
          {!progress ? (
            <>
              {mode === "owner" ? (
                <>
                  <label className="block text-[12px] font-medium text-ink-3">
                    New owner
                  </label>
                  <select
                    value={ownerValue}
                    onChange={(e) => onOwnerValueChange(e.target.value)}
                    autoFocus
                    className="mt-1 h-9 w-full rounded border border-border-strong bg-surface px-2 text-[13px] text-ink outline-none focus:border-accent"
                  >
                    <option value="">Pick a user…</option>
                    {ownerOptions.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </>
              ) : (
                <div className="rounded border border-red/40 bg-red/5 px-3 py-2.5 text-[12.5px] text-red">
                  This permanently deletes the selected {plural} from
                  Salesforce. Children (contacts, opportunities, tasks)
                  may be cascaded by SF — review first.
                </div>
              )}

              <div className="mt-4 rounded border border-border-strong bg-surface-2 px-3 py-2.5 text-[12px] text-ink-2">
                <div className="font-medium text-ink">
                  First {previewNames.length} of {selected.length}:
                </div>
                <ul className="mt-1 list-disc pl-4 leading-relaxed">
                  {previewNames.map((n, i) => (
                    <li key={`${n}-${i}`} className="truncate">
                      {n || "(no name)"}
                    </li>
                  ))}
                </ul>
                {remaining > 0 ? (
                  <div className="mt-1 text-ink-3">
                    …and {remaining.toLocaleString()} more
                  </div>
                ) : null}
              </div>
            </>
          ) : (
            <div>
              <div className="text-[13px] text-ink">
                {running
                  ? `Updating ${progress.done.toLocaleString()} of ${progress.total.toLocaleString()}…`
                  : `Updated ${(progress.total - progress.failures.length).toLocaleString()} of ${progress.total.toLocaleString()}.`}
              </div>
              <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-surface-2">
                <div
                  className="h-full rounded-full bg-accent transition-all"
                  style={{ width: `${(progress.done / progress.total) * 100}%` }}
                />
              </div>
              {progress.failures.length > 0 ? (
                <div className="mt-3 max-h-40 overflow-y-auto rounded border border-red/40 bg-red/5 p-2 text-[11.5px] text-red">
                  <div className="font-semibold">Failed ({progress.failures.length}):</div>
                  <ul className="mt-1 list-disc pl-4">
                    {progress.failures.slice(0, 10).map((f) => (
                      <li key={f.id} className="truncate">
                        <span className="font-medium">{f.name}</span> — {f.error}
                      </li>
                    ))}
                    {progress.failures.length > 10 ? (
                      <li>…and {progress.failures.length - 10} more</li>
                    ) : null}
                  </ul>
                </div>
              ) : null}
            </div>
          )}
        </div>

        <footer className="flex items-center justify-end gap-2 border-t border-border-strong px-5 py-3">
          {!progress ? (
            <>
              <button
                type="button"
                onClick={onClose}
                className="rounded border border-border-strong bg-surface px-3 py-1.5 text-[12.5px] text-ink-2 hover:bg-surface-2"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={onRun}
                /* Disable when run is in flight (progress != null) — prevents
                   double-clicks producing parallel runs against the same ids
                   (where the second run 400s because SF already deleted). */
                disabled={progress != null || (mode === "owner" && !ownerValue)}
                className={
                  isDestructive
                    ? "rounded bg-red px-3 py-1.5 text-[12.5px] font-medium text-surface hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
                    : "rounded bg-ink px-3 py-1.5 text-[12.5px] font-medium text-surface hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
                }
              >
                {mode === "owner"
                  ? `Apply to ${selected.length.toLocaleString()} ${plural}`
                  : `Delete ${selected.length.toLocaleString()} ${plural}`}
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={onClose}
              disabled={running}
              className="rounded bg-ink px-3 py-1.5 text-[12.5px] font-medium text-surface hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {finished ? "Done" : "Running…"}
            </button>
          )}
        </footer>
      </div>
    </div>
  );
}

/**
 * Run a per-row mutation across `items` with bounded parallelism. Records
 * per-item failures via the supplied callback so the UI can render a
 * fail-list while the loop continues.
 *
 * Dedupes by `id` before queueing — SOQL relationship joins can return
 * the same record under multiple parents (e.g. a contact joined under
 * two accounts), and we'd otherwise fire DELETE/PUT against the same
 * id N times. After the first success the subsequent calls 400 because
 * SF already cleaned up the row, producing spurious failure entries.
 */
export async function runBulk<T extends { id: string; name: string }>(
  items: T[],
  mutate: (item: T) => Promise<void>,
  onProgress: (p: BulkProgress) => void,
  parallelism = BULK_PARALLELISM,
): Promise<void> {
  const seen = new Set<string>();
  const deduped: T[] = [];
  for (const it of items) {
    if (seen.has(it.id)) continue;
    seen.add(it.id);
    deduped.push(it);
  }

  const failures: BulkProgress["failures"] = [];
  let done = 0;
  onProgress({ done, total: deduped.length, failures });

  const queue = [...deduped];
  const workers = Array.from(
    { length: Math.min(parallelism, queue.length) },
    async () => {
      while (queue.length > 0) {
        const it = queue.shift();
        if (!it) return;
        try {
          await mutate(it);
        } catch (e: unknown) {
          const msg = e instanceof Error ? e.message : String(e);
          failures.push({ id: it.id, name: it.name, error: msg });
        } finally {
          done += 1;
          onProgress({ done, total: deduped.length, failures: [...failures] });
        }
      }
    },
  );
  await Promise.all(workers);
}
