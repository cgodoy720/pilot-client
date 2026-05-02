/**
 * Display helpers — match the mockup's conventions
 * (bedrock-mockup/project/primitives.jsx).
 */

/**
 * Compact currency for tables, summaries, footers. Always whole dollars
 * (rounds), uses K / M / B suffixes, one decimal up to 9.9, no decimal at
 * 10+. Negatives render as -$1.5K (sign before the dollar).
 */
export function fmtMoney(n: number | null | undefined): string {
  if (n == null || n === 0) return "$0";
  const sign = n < 0 ? "-" : "";
  const abs = Math.abs(n);

  // Thresholds are slightly under each tier boundary so rounding never
  // produces "$1000K" or "$1000M" — those roll up to the next tier.
  if (abs >= 999_500_000_000) return `${sign}$${trimAbbr(abs / 1_000_000_000_000)}T`;
  if (abs >= 999_500_000)     return `${sign}$${trimAbbr(abs / 1_000_000_000)}B`;
  if (abs >= 999_500)         return `${sign}$${trimAbbr(abs / 1_000_000)}M`;
  if (abs >= 999.5)           return `${sign}$${trimAbbr(abs / 1_000)}K`;
  return `${sign}$${Math.round(abs).toLocaleString("en-US")}`;
}

/** "1.5" up to 9.9; "16" at 10+; trims trailing ".0". */
function trimAbbr(n: number): string {
  if (n >= 10) return Math.round(n).toString();
  const r = Math.round(n * 10) / 10;
  return r % 1 === 0 ? r.toString() : r.toFixed(1);
}

const _moneyFullFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const _moneyFullCentsFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/**
 * Full currency with commas. By default, whole dollars only (`$1,500`).
 * Pass `showCents` for two-decimal precision (`$1,500.50`) — appropriate
 * for line-item payment amounts where cents matter.
 */
export function fmtMoneyFull(
  n: number | null | undefined,
  showCents = false,
): string {
  const value = n ?? 0;
  return showCents
    ? _moneyFullCentsFormatter.format(value)
    : _moneyFullFormatter.format(value);
}

export function fmtDateShort(iso: string | null | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function fmtDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function initials(name: string): string {
  return name
    .split(/\s+/)
    .map((w) => w[0] ?? "")
    .join("")
    .slice(0, 2)
    .toUpperCase();
}
