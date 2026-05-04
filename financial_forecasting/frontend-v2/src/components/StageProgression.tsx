/**
 * Stage progression visualization for the Opportunity detail page.
 *
 * Replaces the generic "stats row" with a 6-bucket funnel showing
 * which stage the opp is currently in and how long it spent in each
 * earlier bucket. Bucket-mapping collapses Pursuit's full SF picklist
 * (Identified, Lead Gen, Cultivation, Solicitation, Ask, etc.) into
 * the working-set funnel users actually think in.
 *
 * Time-in-stage is computed from OpportunityFieldHistory transitions:
 *   - Each transition gives `(OldValue, NewValue, CreatedDate)`.
 *   - Walk oldest-first; the time spent in `OldValue` is the gap from
 *     the previous transition (or the opp's CreatedDate for the first)
 *     to this transition.
 *   - The time spent in the *current* stage is from the last transition
 *     (or CreatedDate) to "now".
 *   - Aggregate per bucket — multi-visit stages sum their durations.
 *
 * If history is missing (older opp past SF's 18-mo retention), only
 * the current bucket is highlighted and the others are rendered as
 * unvisited dimmed steps.
 */
import { useMemo } from "react";
import { Check } from "lucide-react";

import { fmtDuration } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { StageHistoryEntry } from "@/services/opportunities";

/** A single bucket in the simplified funnel. */
export interface StageBucket {
  key: string;
  label: string;
  /** SF stage names that count as "in this bucket". A stage may map
   *  to exactly one bucket; ordering reflects funnel position. */
  stages: ReadonlySet<string>;
}

/**
 * The 6-bucket funnel users want to see — picked by JR. We include
 * the granular SF stages that conceptually belong to each bucket so
 * an opp marked "Cultivation" still highlights "Qualifying", an opp
 * marked "Contract Signing" still highlights "Contract Negotiation",
 * etc. Closed-won variants all roll up into "Collecting / In Effect"
 * since that's the funnel-end state from the user's POV.
 */
const FUNNEL: ReadonlyArray<StageBucket> = [
  {
    key: "lead",
    label: "New Lead",
    stages: new Set(["New Lead"]),
  },
  {
    key: "qualifying",
    label: "Qualifying",
    stages: new Set([
      "Qualifying",
      "Identified",
      "Lead Gen",
      "Discovery",
      "Cultivation",
      "Solicitation",
      "Ask",
    ]),
  },
  {
    key: "design",
    label: "Design / Proposal",
    stages: new Set(["Design / Proposal Creation", "Proposal Sent"]),
  },
  {
    key: "negotiation",
    label: "Proposal Negotiation",
    stages: new Set(["Proposal Negotiation", "Verbal Commitment"]),
  },
  {
    key: "contract",
    label: "Contract Negotiation",
    stages: new Set(["Contract Creation", "Contract Signing", "Contract Signed"]),
  },
  {
    key: "collecting",
    label: "Collecting / In Effect",
    stages: new Set([
      "Collecting / In Effect",
      "Collecting",
      "In Effect",
      "Closed Won",
      "closed-won",
      "Closed / Completed",
      "Closed / Fulfilled",
      "Closed / Full-Time or Successful Conversion",
      "Closed / Temporary Hire",
    ]),
  },
];

/** Map a raw SF stage name to its bucket key. Returns null when the
 *  stage isn't in our 6-bucket funnel (e.g. "Closed Lost", "Withdrawn",
 *  "Closed / Did not Fulfill") — those don't appear on the bar. */
function stageBucket(stage: string | null | undefined): string | null {
  if (!stage) return null;
  for (const bucket of FUNNEL) {
    if (bucket.stages.has(stage)) return bucket.key;
  }
  return null;
}

export interface StageProgressionProps {
  currentStage: string | null;
  /** Opportunity's CreatedDate (ISO). Anchors the start of the
   *  duration walk for the very first stage. */
  createdDate: string | null;
  /** Full OpportunityFieldHistory entries for this opp, oldest-first.
   *  Empty array is fine (older opps past SF's 18-mo retention) — the
   *  current stage still highlights, others render as unvisited. */
  history: StageHistoryEntry[];
}

interface BucketState {
  key: string;
  label: string;
  visited: boolean;
  /** True if the opp is currently in this bucket. */
  current: boolean;
  /** Total ms spent in any stage that maps to this bucket. */
  durationMs: number;
}

export function StageProgression({
  currentStage,
  createdDate,
  history,
}: StageProgressionProps) {
  const states = useMemo<BucketState[]>(
    () => computeBucketStates(currentStage, createdDate, history),
    [currentStage, createdDate, history],
  );

  // Find the funnel index of the current bucket so steps before it
  // render as completed even when their durations are zero (legacy
  // opps with no history still get a visually correct "current at
  // step N" bar).
  const currentIdx = states.findIndex((s) => s.current);

  return (
    <div
      className="mt-6 flex w-full items-stretch overflow-hidden rounded-lg border border-border-strong bg-surface shadow-sm"
      role="list"
      aria-label="Stage progression"
    >
      {states.map((s, i) => {
        const completed = currentIdx >= 0 && i < currentIdx;
        const current = s.current;
        const last = i === states.length - 1;
        return (
          <div
            key={s.key}
            role="listitem"
            /* `min-w-0` lets the flex item shrink below its content's
               intrinsic width — without it, long labels like
               "Proposal Negotiation" force the cell to its content
               size and the bar overflows the section's width. */
            className={cn(
              "relative flex min-w-0 flex-1 flex-col px-2.5 py-2.5",
              !last && "border-r border-border-strong",
              current && "bg-accent/10",
              completed && "bg-surface-2",
            )}
          >
            <div className="flex items-start gap-1.5">
              <div
                className={cn(
                  "grid h-4 w-4 flex-shrink-0 place-items-center rounded-full text-[9px] font-semibold",
                  current
                    ? "bg-accent text-surface"
                    : completed
                      ? "bg-ink text-surface"
                      : "bg-surface-2 text-ink-3 ring-1 ring-border-strong",
                )}
                aria-hidden="true"
              >
                {completed ? <Check size={8} strokeWidth={3} /> : i + 1}
              </div>
              <span
                /* `whitespace-normal` + `leading-tight` lets long labels
                   wrap to a second line cleanly when the cell is narrow,
                   instead of truncating mid-word. tooltip stays for
                   the rare case where the wrap still cuts something. */
                className={cn(
                  "min-w-0 whitespace-normal break-words text-[10.5px] font-semibold uppercase leading-tight tracking-wide",
                  current
                    ? "text-ink"
                    : completed
                      ? "text-ink-2"
                      : "text-ink-3",
                )}
                title={s.label}
              >
                {s.label}
              </span>
            </div>
            <div className="mt-1.5 text-[12px]">
              {current ? (
                <span className="mono font-medium text-ink">
                  {s.durationMs > 0 ? `${fmtDuration(s.durationMs)} so far` : "Just entered"}
                </span>
              ) : completed ? (
                <span className="mono text-ink-3">
                  {s.durationMs > 0 ? fmtDuration(s.durationMs) : "—"}
                </span>
              ) : (
                <span className="text-ink-4">—</span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/**
 * Walk the history oldest-first, aggregating ms-per-bucket. The
 * first stage's start anchor is the opp's CreatedDate when present,
 * otherwise the first transition's CreatedDate. The current stage's
 * end anchor is "now".
 */
function computeBucketStates(
  currentStage: string | null,
  createdDate: string | null,
  history: StageHistoryEntry[],
): BucketState[] {
  const totals: Map<string, number> = new Map();
  const visited: Set<string> = new Set();

  // OpportunityFieldHistory carries OldValue → NewValue. Each row
  // represents the *exit* of OldValue (and entry of NewValue). The
  // time spent in OldValue is `(this.created_date - prev.created_date)`,
  // anchoring the first row at the opp's CreatedDate.
  let anchor = parseDate(createdDate) ?? parseDate(history[0]?.created_date);
  for (const h of history) {
    const transitionedAt = parseDate(h.created_date);
    if (anchor && transitionedAt && h.old_value) {
      const stagedFor = transitionedAt.getTime() - anchor.getTime();
      const bucket = stageBucket(h.old_value);
      if (bucket && stagedFor > 0) {
        totals.set(bucket, (totals.get(bucket) ?? 0) + stagedFor);
        visited.add(bucket);
      }
    }
    if (transitionedAt) anchor = transitionedAt;
  }

  // Current stage: time from the last transition (or CreatedDate if
  // no transitions yet) to now.
  if (currentStage && anchor) {
    const stagedFor = Date.now() - anchor.getTime();
    const bucket = stageBucket(currentStage);
    if (bucket && stagedFor > 0) {
      totals.set(bucket, (totals.get(bucket) ?? 0) + stagedFor);
      visited.add(bucket);
    }
  }

  const currentBucket = stageBucket(currentStage);
  return FUNNEL.map((b) => ({
    key: b.key,
    label: b.label,
    visited: visited.has(b.key),
    current: b.key === currentBucket,
    durationMs: totals.get(b.key) ?? 0,
  }));
}

function parseDate(iso: string | null | undefined): Date | null {
  if (!iso) return null;
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? null : d;
}
