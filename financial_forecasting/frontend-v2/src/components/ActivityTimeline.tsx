import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, ChevronRight, Search, X } from "lucide-react";

import { ActivitySourceIcon } from "@/components/ActivitySourceIcon";
import { useCollapsible } from "@/lib/collapsible";
import { fmtDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { BedrockActivity } from "@/types/salesforce";

/**
 * Email snippets and SF descriptions arrive with lots of dead whitespace
 * — leading spaces on every line from quoted-reply chevrons, runs of
 * blank lines from signature blocks, and trailing junk. Trim per line
 * and collapse 3+ consecutive blank lines into one paragraph break.
 */
function normalizeBody(raw: string): string {
  return raw
    .replace(/\r\n/g, "\n")
    .split("\n")
    .map((line) => line.replace(/\s+$/, ""))
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function activityTimestamp(a: BedrockActivity): string | null {
  return a.activity_date ?? a.occurred_at ?? a.created_at ?? null;
}

/**
 * Returns a human-readable time bucket for grouping.
 * Buckets: Today, This week, This month, Month Year (e.g. "March 2025"), Older
 */
function timeGroup(dateStr: string | null | undefined): string {
  if (!dateStr) return "Older";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "Older";
  const now = new Date();
  const dayMs = 86_400_000;
  const diffMs = now.getTime() - d.getTime();
  if (diffMs < dayMs) return "Today";
  if (diffMs < 7 * dayMs) return "This week";
  if (
    d.getMonth() === now.getMonth() &&
    d.getFullYear() === now.getFullYear()
  ) {
    return "This month";
  }
  const prevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  if (
    d.getMonth() === prevMonth.getMonth() &&
    d.getFullYear() === prevMonth.getFullYear()
  ) {
    return "Last month";
  }
  return d.toLocaleString("en-US", { month: "long", year: "numeric" });
}

function groupOrder(group: string): number {
  const fixed: Record<string, number> = {
    Today: 0,
    "This week": 1,
    "This month": 2,
    "Last month": 3,
  };
  if (group in fixed) return fixed[group];
  try {
    const d = new Date(`1 ${group}`);
    if (!isNaN(d.getTime())) return 1000 - d.getFullYear() * 12 - d.getMonth();
  } catch {}
  return 9999;
}

const DEFAULT_MAX_H = 520;

const ALL_TYPE = "__all_types__";
const ALL_SOURCE = "__all_sources__";

/**
 * Full-text searchable activity timeline. Searches across subject,
 * body, and owner email. Type and source filters dropdown-style
 * (chips would scale poorly when there are 8+ types). Match terms
 * are highlighted in both the row preview and the expanded body.
 *
 * The list virtualizes-by-grouping rather than per-row — typical
 * accounts have <500 activities so a virtualizer is overkill, but the
 * scroll container is height-capped (520px default) so even a
 * thousand-row list stays usable.
 */
export function ActivityTimeline({
  activities,
  title,
  maxHeight = DEFAULT_MAX_H,
  grouped = false,
}: {
  activities: BedrockActivity[];
  title?: string;
  maxHeight?: number;
  grouped?: boolean;
}) {
  const { open, toggle } = useCollapsible(
    "bedrock-v2:section:activity-timeline",
    true,
  );

  // Search + filter state — all client-side since the data is already
  // loaded for the page.
  const [q, setQ] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>(ALL_TYPE);
  const [sourceFilter, setSourceFilter] = useState<string>(ALL_SOURCE);

  const facets = useMemo(() => {
    const types = new Map<string, number>();
    const sources = new Map<string, number>();
    for (const a of activities) {
      if (a.type) types.set(a.type, (types.get(a.type) ?? 0) + 1);
      if (a.source) sources.set(a.source, (sources.get(a.source) ?? 0) + 1);
    }
    return {
      types: Array.from(types.entries()).sort((a, b) => b[1] - a[1]),
      sources: Array.from(sources.entries()).sort((a, b) => b[1] - a[1]),
    };
  }, [activities]);

  const needle = q.trim().toLowerCase();

  const filtered = useMemo(() => {
    if (!needle && typeFilter === ALL_TYPE && sourceFilter === ALL_SOURCE) {
      return activities;
    }
    return activities.filter((a) => {
      if (typeFilter !== ALL_TYPE && a.type !== typeFilter) return false;
      if (sourceFilter !== ALL_SOURCE && a.source !== sourceFilter) return false;
      if (!needle) return true;
      const hay = [
        a.subject,
        a.description,
        a.email_snippet,
        a.owner_email,
        a._context_name,
      ]
        .filter(Boolean)
        .join("\n")
        .toLowerCase();
      return hay.includes(needle);
    });
  }, [activities, needle, typeFilter, sourceFilter]);

  const groups = useMemo(() => {
    if (!grouped) return null;
    const map = new Map<string, BedrockActivity[]>();
    for (const a of filtered) {
      const key = timeGroup(activityTimestamp(a));
      const arr = map.get(key);
      if (arr) arr.push(a);
      else map.set(key, [a]);
    }
    return Array.from(map.entries()).sort(
      ([a], [b]) => groupOrder(a) - groupOrder(b),
    );
  }, [filtered, grouped]);

  const heading =
    title ??
    `Activity${
      filtered.length === activities.length
        ? ` · ${activities.length}`
        : ` · ${filtered.length} of ${activities.length}`
    }`;

  const filtersActive =
    needle.length > 0 ||
    typeFilter !== ALL_TYPE ||
    sourceFilter !== ALL_SOURCE;

  const clearFilters = () => {
    setQ("");
    setTypeFilter(ALL_TYPE);
    setSourceFilter(ALL_SOURCE);
  };

  return (
    <section className="mt-6 overflow-hidden rounded-lg border border-border-strong bg-surface shadow-sm">
      <button
        type="button"
        onClick={toggle}
        aria-expanded={open}
        className="flex w-full items-center gap-2 border-b border-border-strong bg-surface-2 px-5 py-2.5 text-left text-[12px] font-semibold uppercase tracking-wider text-ink-3"
      >
        {open ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
        {heading}
      </button>

      {!open ? null : (
        <>
          {/* Search + filter bar */}
          {activities.length > 0 ? (
            <div className="flex flex-wrap items-center gap-2 border-b border-border-strong bg-surface px-4 py-2">
              <div className="flex min-w-[240px] flex-1 items-center gap-2 rounded border border-border-strong bg-surface-2 px-2.5 focus-within:border-accent">
                <Search size={13} className="flex-shrink-0 text-ink-3" />
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Search by contact, email, or content…"
                  className="h-8 flex-1 bg-transparent text-[12.5px] text-ink outline-none"
                />
                {q ? (
                  <button
                    type="button"
                    onClick={() => setQ("")}
                    className="text-ink-3 hover:text-ink"
                    aria-label="Clear search"
                  >
                    <X size={11} />
                  </button>
                ) : null}
              </div>

              {facets.types.length > 1 ? (
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="h-8 rounded border border-border-strong bg-surface px-2 text-[12px] text-ink outline-none focus:border-accent"
                  aria-label="Filter by type"
                >
                  <option value={ALL_TYPE}>All types</option>
                  {facets.types.map(([t, n]) => (
                    <option key={t} value={t}>
                      {prettyType(t)} ({n})
                    </option>
                  ))}
                </select>
              ) : null}

              {facets.sources.length > 1 ? (
                <select
                  value={sourceFilter}
                  onChange={(e) => setSourceFilter(e.target.value)}
                  className="h-8 rounded border border-border-strong bg-surface px-2 text-[12px] text-ink outline-none focus:border-accent"
                  aria-label="Filter by source"
                >
                  <option value={ALL_SOURCE}>All sources</option>
                  {facets.sources.map(([s, n]) => (
                    <option key={s} value={s}>
                      {prettySource(s)} ({n})
                    </option>
                  ))}
                </select>
              ) : null}

              {filtersActive ? (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="text-[11.5px] text-ink-3 underline-offset-4 hover:text-ink-2 hover:underline"
                >
                  Clear
                </button>
              ) : null}
            </div>
          ) : null}

          {activities.length === 0 ? (
            <div className="px-5 py-10 text-center text-[12.5px] text-ink-3">
              No activities logged.
            </div>
          ) : filtered.length === 0 ? (
            <div className="px-5 py-10 text-center text-[12.5px] text-ink-3">
              No activities match this search.
              <button
                type="button"
                onClick={clearFilters}
                className="ml-2 text-accent underline-offset-4 hover:underline"
              >
                Clear filters
              </button>
            </div>
          ) : grouped && groups ? (
            <div className="overflow-auto" style={{ maxHeight: `${maxHeight}px` }}>
              {groups.map(([group, rows]) => (
                <div key={group}>
                  <div className="sticky top-0 z-10 border-b border-border-strong bg-surface-2/90 px-5 py-1.5 text-[10.5px] font-semibold uppercase tracking-wider text-ink-3 backdrop-blur-sm">
                    {group}
                    <span className="ml-1.5 font-normal normal-case tracking-normal text-ink-4">
                      · {rows.length}
                    </span>
                  </div>
                  <ul className="flex flex-col">
                    {rows.map((a) => (
                      <ActivityRow
                        key={a.id}
                        a={a}
                        showContext
                        needle={needle}
                      />
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          ) : (
            <ul
              className="flex flex-col overflow-auto"
              style={{ maxHeight: `${maxHeight}px` }}
            >
              {filtered.map((a) => (
                <ActivityRow key={a.id} a={a} needle={needle} />
              ))}
            </ul>
          )}
        </>
      )}
    </section>
  );
}

// ── Pretty labels ──────────────────────────────────────────────────────────

const TYPE_LABELS: Record<string, string> = {
  email: "Email",
  meeting: "Meeting",
  call: "Call",
  task: "Task",
  note: "Note",
  event: "Event",
};

function prettyType(t: string): string {
  const k = t.toLowerCase();
  return TYPE_LABELS[k] ?? capitalize(t);
}

const SOURCE_LABELS: Record<string, string> = {
  salesforce: "Salesforce",
  fireflies: "Fireflies",
  gmail: "Gmail",
  slack: "Slack",
  manual: "Manual",
};

function prettySource(s: string): string {
  const k = s.toLowerCase();
  return SOURCE_LABELS[k] ?? capitalize(s);
}

function capitalize(s: string): string {
  return s ? s[0].toUpperCase() + s.slice(1) : s;
}

// ── Context chip ──────────────────────────────────────────────────────────

const CONTEXT_STYLES: Record<
  string,
  { bg: string; text: string; label?: string }
> = {
  opportunity: { bg: "bg-accent/10", text: "text-accent-ink" },
  contact: { bg: "bg-purple-100", text: "text-purple-700" },
  account: { bg: "bg-surface-2", text: "text-ink-3", label: "Account" },
};

function ContextChip({
  type,
  name,
}: {
  type: string | null | undefined;
  name: string | null | undefined;
}) {
  if (!type || type === "account") return null;
  const style = CONTEXT_STYLES[type] ?? CONTEXT_STYLES.account;
  const display = name ?? style.label ?? type;
  return (
    <span
      className={cn(
        "inline-flex max-w-[140px] flex-shrink-0 items-center truncate rounded px-1.5 py-px text-[10.5px] font-medium",
        style.bg,
        style.text,
      )}
      title={display}
    >
      {display}
    </span>
  );
}

// ── Match highlighting ─────────────────────────────────────────────────────

/**
 * Returns the text with all occurrences of `needle` wrapped in <mark>.
 * Case-insensitive. Falls back to plain text if no needle.
 */
function highlightMatches(text: string, needle: string): React.ReactNode {
  if (!needle || !text) return text;
  const lower = text.toLowerCase();
  const parts: React.ReactNode[] = [];
  let i = 0;
  let last = 0;
  while ((i = lower.indexOf(needle, last)) !== -1) {
    if (i > last) parts.push(text.slice(last, i));
    parts.push(
      <mark
        key={`m-${i}`}
        className="rounded bg-amber-100 px-0.5 text-ink"
      >
        {text.slice(i, i + needle.length)}
      </mark>,
    );
    last = i + needle.length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return parts;
}

// ── Activity row ──────────────────────────────────────────────────────────

function ActivityRow({
  a,
  showContext = false,
  needle = "",
}: {
  a: BedrockActivity;
  showContext?: boolean;
  needle?: string;
}) {
  // Auto-expand rows when a search match lives in the body — so users
  // see why their search hit. Closes again when they clear.
  const matchInBody = useMemo(() => {
    if (!needle) return false;
    const body = (a.email_snippet ?? a.description ?? "").toLowerCase();
    if (!body) return false;
    const subject = (a.subject ?? "").toLowerCase();
    return body.includes(needle) && !subject.includes(needle);
  }, [a, needle]);
  const [expanded, setExpanded] = useState(false);
  const expandedNow = expanded || matchInBody;

  // Reset manual-expand state when the search changes — so closing a row
  // and then changing the search auto-collapses it correctly.
  const prevNeedleRef = useRef(needle);
  useEffect(() => {
    if (prevNeedleRef.current !== needle) {
      setExpanded(false);
      prevNeedleRef.current = needle;
    }
  }, [needle]);

  const rawBody = a.email_snippet ?? a.description ?? "";
  const hasBody = rawBody.trim().length > 0;
  const body = hasBody ? normalizeBody(rawBody) : "";
  const date = fmtDate(activityTimestamp(a));

  return (
    <li className="border-b border-border-strong last:border-b-0">
      <button
        type="button"
        onClick={() => hasBody && setExpanded((v) => !v)}
        disabled={!hasBody}
        className={cn(
          "flex w-full items-center gap-3 px-5 py-2.5 text-left",
          hasBody ? "hover:bg-surface-2" : "cursor-default",
        )}
        aria-expanded={hasBody ? expandedNow : undefined}
      >
        <span className="flex-shrink-0 text-ink-3">
          {hasBody ? (
            expandedNow ? (
              <ChevronDown size={14} />
            ) : (
              <ChevronRight size={14} />
            )
          ) : (
            <span className="block h-[14px] w-[14px]" />
          )}
        </span>
        <span className="flex-shrink-0">
          <ActivitySourceIcon source={a.source} type={a.type} size={16} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="truncate text-[13px] font-medium text-ink">
            {highlightMatches(a.subject ?? "(no subject)", needle)}
          </div>
          {hasBody && !expandedNow ? (
            <div className="line-clamp-1 text-[12px] text-ink-3">
              {highlightMatches(body, needle)}
            </div>
          ) : null}
          {a.owner_email ? (
            <div className="truncate text-[10.5px] text-ink-4">
              {highlightMatches(a.owner_email, needle)}
            </div>
          ) : null}
        </div>
        {showContext && a._context_type && a._context_type !== "account" && (
          <ContextChip type={a._context_type} name={a._context_name} />
        )}
        <div className="mono flex-shrink-0 text-[11px] text-ink-3">{date}</div>
      </button>
      {expandedNow && hasBody ? (
        <div className="border-t border-border-strong bg-surface-2/40 px-5 py-3 pl-[58px] text-[12.5px] leading-relaxed text-ink-2">
          <div className="whitespace-pre-wrap break-words">
            {highlightMatches(body, needle)}
          </div>
          {a.owner_email ? (
            <div className="mt-3 text-[11px] text-ink-3">{a.owner_email}</div>
          ) : null}
        </div>
      ) : null}
    </li>
  );
}
