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
  // Official Gmail 2020 mark from Wikipedia's Gmail_icon_(2020).svg —
  // five color zones (blue / green / red / yellow / dark red) layered
  // to form the iconic "M" with rounded corners. Aspect 4:3.
  // Width is set so the rendered glyph sits in a square box; native
  // 256:193 keeps the brand proportions correct.
  return (
    <svg
      width={size}
      height={Math.round((size * 193) / 256)}
      viewBox="0 0 256 193"
      role="img"
      aria-label="Gmail"
      style={{ verticalAlign: "middle" }}
    >
      <title>Gmail</title>
      <path
        fill="#4285F4"
        d="M58.182 192.05V93.14L27.507 65.077 0 49.504v125.091c0 9.658 7.825 17.455 17.455 17.455z"
      />
      <path
        fill="#34A853"
        d="M197.818 192.05h40.727c9.659 0 17.455-7.826 17.455-17.455V49.505l-31.156 17.837-27.026 25.798z"
      />
      <path
        fill="#EA4335"
        d="M58.182 93.14V17.504L128 69.804l69.818-52.3v75.636L128 145.45z"
      />
      <path
        fill="#FBBC04"
        d="M197.818 17.504v75.638L256 49.505V26.231c0-21.585-24.64-33.89-41.89-20.945z"
      />
      <path
        fill="#C5221F"
        d="M0 49.505 17.45 36.494l40.732-18.99v75.636L0 49.505z"
      />
    </svg>
  );
}

function GoogleCalendarIcon({ size }: { size: number }) {
  // Stylized "31" calendar in Google blue — reads as a calendar at
  // 16px without trying to recreate the multi-color tile pattern that
  // breaks at small sizes.
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      role="img"
      aria-label="Meeting"
    >
      <title>Meeting</title>
      <rect
        x="3"
        y="4"
        width="18"
        height="17"
        rx="2"
        fill="#FFFFFF"
        stroke="#1A73E8"
        strokeWidth="1.6"
      />
      <line x1="3" y1="9" x2="21" y2="9" stroke="#1A73E8" strokeWidth="1.6" />
      <line x1="8" y1="2.5" x2="8" y2="6" stroke="#1A73E8" strokeWidth="1.6" strokeLinecap="round" />
      <line x1="16" y1="2.5" x2="16" y2="6" stroke="#1A73E8" strokeWidth="1.6" strokeLinecap="round" />
      <text
        x="12"
        y="17.5"
        textAnchor="middle"
        fontSize="7"
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
