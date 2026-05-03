import { useMemo, useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";

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

/** Ordering for group keys so groups appear newest-first */
function groupOrder(group: string): number {
  const fixed: Record<string, number> = {
    Today: 0,
    "This week": 1,
    "This month": 2,
    "Last month": 3,
  };
  if (group in fixed) return fixed[group];
  // Named month groups: parse "Month Year" and use the date as a sortable number
  try {
    const d = new Date(`1 ${group}`);
    if (!isNaN(d.getTime())) return 1000 - d.getFullYear() * 12 - d.getMonth();
  } catch {}
  return 9999;
}

const DEFAULT_MAX_H = 480;

/**
 * Activity timeline section. Each row collapses to a one-line preview;
 * clicking expands to show the full body. When `grouped` is true, rows
 * are separated by time-period headers and each row shows a context chip
 * indicating whether the activity belongs to the account, an opportunity,
 * or a contact.
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
  const heading = title ?? `Activity timeline (${activities.length})`;
  const { open, toggle } = useCollapsible(
    "bedrock-v2:section:activity-timeline",
    true,
  );

  const groups = useMemo(() => {
    if (!grouped) return null;
    const map = new Map<string, BedrockActivity[]>();
    for (const a of activities) {
      const key = timeGroup(activityTimestamp(a));
      const arr = map.get(key);
      if (arr) arr.push(a);
      else map.set(key, [a]);
    }
    return Array.from(map.entries()).sort(
      ([a], [b]) => groupOrder(a) - groupOrder(b),
    );
  }, [activities, grouped]);

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
      {!open ? null : activities.length === 0 ? (
        <div className="px-5 py-8 text-center text-[12.5px] text-ink-3">
          No activities logged.
        </div>
      ) : grouped && groups ? (
        <div
          className="overflow-auto"
          style={{ maxHeight: `${maxHeight}px` }}
        >
          {groups.map(([group, rows]) => (
            <div key={group}>
              <div className="sticky top-0 z-10 border-b border-border-strong bg-surface-2/80 px-5 py-1.5 text-[10.5px] font-semibold uppercase tracking-wider text-ink-3 backdrop-blur-sm">
                {group}
                <span className="ml-1.5 font-normal normal-case tracking-normal text-ink-4">
                  · {rows.length}
                </span>
              </div>
              <ul className="flex flex-col">
                {rows.map((a) => (
                  <ActivityRow key={a.id} a={a} showContext />
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
          {activities.map((a) => (
            <ActivityRow key={a.id} a={a} />
          ))}
        </ul>
      )}
    </section>
  );
}

// ── Context chip ──────────────────────────────────────────────────────────────

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
        "inline-flex flex-shrink-0 max-w-[140px] items-center truncate rounded px-1.5 py-px text-[10.5px] font-medium",
        style.bg,
        style.text,
      )}
      title={display}
    >
      {display}
    </span>
  );
}

// ── Activity row ──────────────────────────────────────────────────────────────

function ActivityRow({
  a,
  showContext = false,
}: {
  a: BedrockActivity;
  showContext?: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
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
        aria-expanded={hasBody ? expanded : undefined}
      >
        <span className="flex-shrink-0 text-ink-3">
          {hasBody ? (
            expanded ? (
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
            {a.subject ?? "(no subject)"}
          </div>
          {hasBody && !expanded ? (
            <div className="line-clamp-1 text-[12px] text-ink-3">{body}</div>
          ) : null}
        </div>
        {showContext && a._context_type && a._context_type !== "account" && (
          <ContextChip type={a._context_type} name={a._context_name} />
        )}
        <div className="mono flex-shrink-0 text-[11px] text-ink-3">{date}</div>
      </button>
      {expanded && hasBody ? (
        <div className="border-t border-border-strong bg-surface-2/40 px-5 py-3 pl-[58px] text-[12.5px] leading-relaxed text-ink-2">
          <div className="whitespace-pre-wrap break-words">{body}</div>
          {a.owner_email ? (
            <div className="mt-3 text-[11px] text-ink-3">{a.owner_email}</div>
          ) : null}
        </div>
      ) : null}
    </li>
  );
}
