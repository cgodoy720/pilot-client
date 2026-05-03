import { CheckSquare, Phone, Sparkles, StickyNote } from "lucide-react";

import { Tag } from "@/components/ui/Tag";

/**
 * Icon for an activity row, picked from `source` (preferred — explicit
 * provenance like "gmail" / "slack" / "fireflies") falling back to `type`
 * (generic categories: "email" / "meeting" / "call" / "note" / "task").
 *
 * Brand glyphs (Gmail, Google Calendar, Slack, Salesforce) are inline
 * SVG so we don't pull in an icon library — paths cribbed from
 * Simple Icons (CC0). Renders at brand color so the timeline reads
 * at a glance: red blob = email, blue calendar = meeting, etc.
 *
 * Resolution order:
 *   1. Explicit source (e.g. "gmail" → Gmail) wins
 *   2. Activity type (e.g. "meeting" → Google Calendar)
 *   3. Fallback chip with the raw type label
 */
export function ActivitySourceIcon({
  source,
  type,
  size = 16,
}: {
  source?: string | null;
  type?: string | null;
  size?: number;
}) {
  const s = (source || "").toLowerCase();
  const t = (type || "").toLowerCase();

  // Source-specific overrides (most explicit first)
  if (s.includes("fireflies") || t === "transcript") {
    return <Sparkles size={size} className="text-amber-600" aria-label="Fireflies" />;
  }
  if (s.includes("slack") || t === "message") {
    return <SlackIcon size={size} />;
  }

  // Generic types — these usually map cleanly to a known brand
  if (t === "email" || s.includes("gmail")) {
    return <GmailIcon size={size} />;
  }
  if (t === "meeting" || t === "calendar-event" || t === "calendar" || t === "event") {
    return <GoogleCalendarIcon size={size} />;
  }
  if (t === "call" || t === "phone") {
    return <Phone size={size} className="text-ink-3" aria-label="Call" />;
  }
  if (t === "task") {
    return <CheckSquare size={size} className="text-ink-3" aria-label="Task" />;
  }
  if (t === "note") {
    return <StickyNote size={size} className="text-ink-3" aria-label="Note" />;
  }

  // Salesforce-sourced fallback for anything else
  if (s === "salesforce") {
    return <SalesforceIcon size={size} />;
  }

  return <Tag>{type ?? "activity"}</Tag>;
}

/* ────────────────────────────────────────────────────────────────────
 * Brand SVGs — Simple Icons paths, full color.
 * ──────────────────────────────────────────────────────────────────── */

function GmailIcon({ size }: { size: number }) {
  // Multicolor "M" envelope. Source: Simple Icons.
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      role="img"
      aria-label="Gmail"
    >
      <title>Gmail</title>
      <path
        fill="#4285F4"
        d="M22.288 21.001H19.27V11.73L24 8.183v11.181c0 .904-.732 1.637-1.636 1.637z"
      />
      <path
        fill="#34A853"
        d="M1.638 21.001H4.73V11.73L0 8.183v11.181c0 .904.732 1.637 1.636 1.637z"
      />
      <path
        fill="#FBBC04"
        d="M19.27 11.73 24 8.183V5.457a3.27 3.27 0 0 0-3.27-3.27c-.578 0-1.123.155-1.594.426l-1.5 1.05L12 8.55 19.27 11.73z"
      />
      <path
        fill="#EA4335"
        d="M4.73 11.73V3.663l1.5-1.05a3.272 3.272 0 0 0-1.594-.426A3.27 3.27 0 0 0 1.366 5.457v2.726l3.364 3.547z"
      />
      <path
        fill="#C5221F"
        d="M4.73 11.73 12 8.55l7.27 3.18-7.27 4.91-7.27-4.91z"
      />
      <path
        fill="#EA4335"
        d="m12 8.55-7.27-4.887v8.067l7.27 4.91 7.27-4.91V3.663L12 8.55z"
      />
    </svg>
  );
}

function GoogleCalendarIcon({ size }: { size: number }) {
  // Multicolor square with "31". Source: Simple Icons.
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      role="img"
      aria-label="Meeting"
    >
      <title>Meeting</title>
      <path fill="#FFFFFF" d="M19.5 4.5h-15v15h15v-15z" />
      <path fill="#EA4335" d="M16.04 16.04H7.96V7.96h8.08v8.08z" />
      <path
        fill="#1A73E8"
        d="M19.5 4.5v3.46h-3.46V4.5h3.46zm-3.46 11.54h3.46v3.46h-3.46v-3.46zM7.96 19.5H4.5v-3.46h3.46v3.46zM4.5 7.96V4.5h3.46v3.46H4.5z"
      />
      <path
        fill="#34A853"
        d="M19.5 19.5v-3.46h-3.46v3.46h3.46zm0-15v3.46h-3.46V4.5h3.46zM4.5 4.5v3.46h3.46V4.5H4.5zm0 15h3.46v-3.46H4.5v3.46z"
      />
      <path
        fill="#4285F4"
        d="M16.04 7.96V4.5H7.96v3.46h8.08zm0 8.08v3.46H7.96v-3.46h8.08z"
      />
      <text
        x="12"
        y="14"
        textAnchor="middle"
        fontSize="6"
        fontWeight="700"
        fill="#1A73E8"
        fontFamily="-apple-system, BlinkMacSystemFont, sans-serif"
      >
        31
      </text>
    </svg>
  );
}

function SlackIcon({ size }: { size: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      role="img"
      aria-label="Slack"
    >
      <title>Slack</title>
      <path
        fill="#E01E5A"
        d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zM6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313z"
      />
      <path
        fill="#36C5F0"
        d="M8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zM8.834 6.313a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312z"
      />
      <path
        fill="#2EB67D"
        d="M18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zM17.688 8.834a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312z"
      />
      <path
        fill="#ECB22E"
        d="M15.165 18.956a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52zM15.165 17.688a2.527 2.527 0 0 1-2.52-2.523 2.526 2.526 0 0 1 2.52-2.52h6.313A2.527 2.527 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.523h-6.313z"
      />
    </svg>
  );
}

function SalesforceIcon({ size }: { size: number }) {
  // Cloud-shape blob in Salesforce blue. Source: Simple Icons.
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      role="img"
      aria-label="Salesforce"
    >
      <title>Salesforce</title>
      <path
        fill="#00A1E0"
        d="M9.998 5.688a4.118 4.118 0 0 1 3.21-1.547 4.142 4.142 0 0 1 3.626 2.108 5.013 5.013 0 0 1 2.05-.434c2.785 0 5.045 2.282 5.045 5.097 0 2.815-2.26 5.097-5.045 5.097-.34 0-.672-.034-.994-.099a3.692 3.692 0 0 1-3.225 1.886c-.561 0-1.092-.124-1.567-.346A4.224 4.224 0 0 1 9.18 19.85a4.211 4.211 0 0 1-3.916-2.604 3.851 3.851 0 0 1-1.6.346C1.638 17.59 0 15.929 0 13.86c0-1.4.752-2.622 1.872-3.275a4.296 4.296 0 0 1-.36-1.722c0-2.392 1.946-4.32 4.34-4.32a4.34 4.34 0 0 1 3.428 1.677c.215.243.456.7.718 1.468Z"
      />
    </svg>
  );
}
