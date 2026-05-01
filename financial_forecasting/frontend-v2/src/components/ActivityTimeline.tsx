import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";

import { ActivitySourceIcon } from "@/components/ActivitySourceIcon";
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
    .map((line) => line.replace(/\s+$/, "")) // trim trailing spaces only
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

const DEFAULT_MAX_H = 420; // px — ~7 collapsed rows visible; scrolls past

/**
 * Activity timeline section. Each row collapses to a one-line preview;
 * clicking expands to show the full body (description / email_snippet /
 * subject). The whole list scrolls inside a capped-height container so
 * an account with hundreds of activities doesn't push everything else
 * off the page.
 */
export function ActivityTimeline({
  activities,
  title,
  maxHeight = DEFAULT_MAX_H,
}: {
  activities: BedrockActivity[];
  title?: string;
  maxHeight?: number;
}) {
  const heading = title ?? `Activity timeline (${activities.length})`;

  return (
    <section className="mt-6 overflow-hidden rounded-lg border border-border-strong bg-surface shadow-sm">
      <div className="border-b border-border-strong bg-surface-2 px-5 py-2.5 text-[12px] font-semibold uppercase tracking-wider text-ink-3">
        {heading}
      </div>
      {activities.length === 0 ? (
        <div className="px-5 py-8 text-center text-[12.5px] text-ink-3">
          No activities logged.
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

function ActivityRow({ a }: { a: BedrockActivity }) {
  const [expanded, setExpanded] = useState(false);
  const rawBody = a.email_snippet ?? a.description ?? "";
  const hasBody = rawBody.trim().length > 0;
  const body = hasBody ? normalizeBody(rawBody) : "";
  const date = fmtDate(a.occurred_at ?? a.created_at);

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
