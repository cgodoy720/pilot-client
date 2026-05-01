import { Calendar, Phone, Sparkles, StickyNote } from "lucide-react";

import { Tag } from "@/components/ui/Tag";

/**
 * Icon for an activity row, picked from `source` (preferred — explicit
 * provenance like "gmail" / "slack" / "fireflies") falling back to `type`
 * (generic categories: "email" / "meeting" / "call" / "note").
 *
 * Brand glyphs (Gmail, Slack) are inline SVG (Simple Icons paths) so we
 * don't pull in an icon library. Fireflies is stubbed with the Sparkles
 * lucide icon until the real source data flows.
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
  const key = (source || type || "").toLowerCase();

  if (key.includes("gmail") || key === "email") {
    return <GmailIcon size={size} />;
  }
  if (key.includes("slack") || key === "message") {
    return <SlackIcon size={size} />;
  }
  if (key.includes("fireflies") || key === "meeting" || key === "transcript") {
    return (
      <Sparkles
        size={size}
        className="text-amber"
        aria-label="Fireflies"
      />
    );
  }
  if (key === "call" || key === "phone") {
    return <Phone size={size} className="text-ink-3" aria-label="Call" />;
  }
  if (key === "calendar" || key === "event") {
    return <Calendar size={size} className="text-ink-3" aria-label="Event" />;
  }
  if (key === "note") {
    return <StickyNote size={size} className="text-ink-3" aria-label="Note" />;
  }

  // Unknown source/type — fall back to the original type chip.
  return <Tag>{type ?? "activity"}</Tag>;
}

/* ────────────────────────────────────────────────────────────────────
 * Brand SVGs — Simple Icons paths, monochrome rendering at brand color.
 * ──────────────────────────────────────────────────────────────────── */

function GmailIcon({ size }: { size: number }) {
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
        fill="#EA4335"
        d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L5.455 4.64 12 9.548l6.545-4.91 1.528-1.145C21.69 2.28 24 3.434 24 5.457z"
      />
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
