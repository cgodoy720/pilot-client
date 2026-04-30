/**
 * Display helpers — match the mockup's conventions
 * (bedrock-mockup/project/primitives.jsx).
 */

export function fmtMoney(n: number | null | undefined): string {
  if (n == null || n === 0) return "$0";
  if (n >= 1_000_000) {
    const v = n / 1_000_000;
    return "$" + v.toFixed(v % 1 === 0 ? 0 : 2).replace(/\.00$/, "") + "M";
  }
  if (n >= 1_000) return "$" + Math.round(n / 1_000) + "K";
  return "$" + n;
}

export function fmtMoneyFull(n: number | null | undefined): string {
  return "$" + (n ?? 0).toLocaleString("en-US");
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
