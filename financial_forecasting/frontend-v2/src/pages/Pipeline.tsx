import { useMemo, useState } from "react";
import { Filter, Plus, Search } from "lucide-react";

import { PageHeader } from "@/components/PageHeader";
import { StageChip } from "@/components/ui/StageChip";
import { Tag } from "@/components/ui/Tag";
import { ButtonGroup, FilterPill, Toolbar } from "@/components/ui/Toolbar";
import { fmtDate, fmtMoney, initials } from "@/lib/format";
import {
  bucketForStage,
  CLOSED_BUCKETS,
  OPEN_BUCKETS,
  type StageBucket,
} from "@/lib/stages";
import { cn } from "@/lib/utils";
import { useOpportunities } from "@/services/opportunities";
import type { SfOpportunity } from "@/types/salesforce";

const SCOPES = [
  { value: "open", label: "Open" },
  { value: "won", label: "Closed / Won" },
  { value: "lost", label: "Closed / Lost" },
  { value: "all", label: "All" },
] as const;
type Scope = (typeof SCOPES)[number]["value"];

const RECORD_TYPES = [
  { value: "All", label: "All" },
  { value: "Philanthropy", label: "Philanthropy" },
  { value: "PBC", label: "PBC" },
] as const;
type RecordType = (typeof RECORD_TYPES)[number]["value"];

function inScope(o: SfOpportunity, scope: Scope): boolean {
  const b = bucketForStage(o.StageName);
  if (scope === "all") return true;
  if (scope === "open") return OPEN_BUCKETS.includes(b);
  if (scope === "won") return b === "won";
  if (scope === "lost") return b === "lost";
  return true;
}

function bucketCount(opps: SfOpportunity[], bucket: StageBucket): number {
  return opps.filter((o) => bucketForStage(o.StageName) === bucket).length;
}

function bucketAmount(opps: SfOpportunity[], bucket: StageBucket): number {
  return opps
    .filter((o) => bucketForStage(o.StageName) === bucket)
    .reduce((s, o) => s + (o.Amount ?? 0), 0);
}

export function PipelinePage() {
  const [scope, setScope] = useState<Scope>("open");
  const [recordType, setRecordType] = useState<RecordType>("All");
  const [q, setQ] = useState("");

  const { data, isLoading, isError, error } = useOpportunities({
    recordType: recordType === "All" ? undefined : recordType,
  });
  const opps = data ?? [];

  const filtered = useMemo(
    () =>
      opps.filter(
        (o) =>
          inScope(o, scope) &&
          (!q ||
            (o.Name ?? "").toLowerCase().includes(q.toLowerCase()) ||
            (o.Account?.Name ?? "").toLowerCase().includes(q.toLowerCase())),
      ),
    [opps, scope, q],
  );

  // Summary counts shown above the toolbar
  const total = filtered.reduce((s, o) => s + (o.Amount ?? 0), 0);

  return (
    <div className="px-7 py-6 pb-20">
      <PageHeader
        title="Pipeline"
        subtitle={
          isLoading
            ? "Loading…"
            : `${filtered.length.toLocaleString()} opportunities · ${fmtMoney(total)}`
        }
        actions={
          <button className="inline-flex h-[30px] items-center gap-1.5 rounded border border-ink bg-ink px-3 text-[13px] font-medium text-surface hover:opacity-90">
            <Plus size={14} /> New opportunity
          </button>
        }
      />

      {/* Funnel summary bar */}
      <FunnelStrip opps={opps} scope={scope} />

      <Toolbar className="mt-4">
        <ButtonGroup
          value={scope}
          onChange={(v) => setScope(v as Scope)}
          options={SCOPES.map((s) => ({ value: s.value, label: s.label }))}
        />
        <ButtonGroup
          value={recordType}
          onChange={(v) => setRecordType(v as RecordType)}
          options={RECORD_TYPES.map((r) => ({ value: r.value, label: r.label }))}
        />
        <div className="relative">
          <Search
            size={13}
            className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-ink-3"
          />
          <input
            placeholder="Search opps or accounts"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="h-7 w-64 rounded border border-border-strong bg-surface pl-7 pr-3 text-[12.5px] text-ink outline-none focus:border-accent"
          />
        </div>
        <FilterPill>
          <Filter size={12} /> Owner <span className="text-ink-4">·</span> Any
        </FilterPill>
        <span className="ml-auto text-[11.5px] text-ink-3">
          {filtered.length.toLocaleString()} of {opps.length.toLocaleString()}
        </span>
      </Toolbar>

      <div className="overflow-hidden rounded-b-lg border border-border-strong bg-surface">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              {[
                "Opportunity",
                "Stage",
                "Type",
                "Amount",
                "Probability",
                "Close",
                "Owner",
                "Next step",
              ].map((h, i) => (
                <th
                  key={h}
                  className={cn(
                    "border-b border-border-strong bg-surface-2 px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-ink-3",
                    i === 3 || i === 4 ? "text-right" : "text-left",
                  )}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <SkeletonRows />
            ) : isError ? (
              <tr>
                <td colSpan={8} className="px-7 py-10 text-center text-[13px] text-red">
                  Failed to load opportunities
                  {error instanceof Error ? `: ${error.message}` : ""}
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-7 py-10 text-center text-[13px] text-ink-3">
                  {opps.length === 0
                    ? "No opportunities. (Is Salesforce connected?)"
                    : "No opportunities match your filters."}
                </td>
              </tr>
            ) : (
              filtered.map((o) => <OpportunityRow key={o.Id} o={o} />)
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function FunnelStrip({ opps, scope }: { opps: SfOpportunity[]; scope: Scope }) {
  const buckets =
    scope === "open"
      ? OPEN_BUCKETS
      : scope === "won"
        ? (["won"] as StageBucket[])
        : scope === "lost"
          ? (["lost"] as StageBucket[])
          : [...OPEN_BUCKETS, ...CLOSED_BUCKETS];

  return (
    <div className="grid grid-cols-[repeat(auto-fit,minmax(140px,1fr))] gap-2">
      {buckets.map((b) => {
        const count = bucketCount(opps, b);
        const amt = bucketAmount(opps, b);
        return (
          <div
            key={b}
            className="flex flex-col rounded-md border border-border-strong bg-surface px-3 py-2.5 shadow-sm"
          >
            <div className="flex items-center gap-2">
              <StageChip stage={b} />
              <span className="text-[11.5px] uppercase tracking-wide text-ink-3">
                {count}
              </span>
            </div>
            <span className="mono mt-1 text-[15px] font-semibold tabular-nums">
              {fmtMoney(amt)}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function OpportunityRow({ o }: { o: SfOpportunity }) {
  const account = o.Account?.Name ?? "—";
  const owner = o.Owner?.Name ?? "—";
  const recordType = o.RecordType?.Name ?? null;

  return (
    <tr className="cursor-pointer border-b border-border-strong hover:bg-surface-2">
      <td className="px-3 py-2.5 text-[13px]">
        <div className="flex min-w-0 items-center gap-2">
          <div className="grid h-[18px] w-[18px] flex-shrink-0 place-items-center rounded bg-surface-2 text-[9px] font-semibold text-ink-2">
            {initials(account)}
          </div>
          <div className="flex min-w-0 flex-1 flex-col leading-tight">
            <span className="truncate font-medium">{o.Name}</span>
            <span className="truncate text-[11px] text-ink-3">{account}</span>
          </div>
        </div>
      </td>
      <td className="px-3 py-2.5 text-[13px]">
        <StageChip stage={o.StageName} />
      </td>
      <td className="px-3 py-2.5 text-[13px]">
        {recordType ? (
          <Tag>{recordType}</Tag>
        ) : (
          <span className="text-ink-4">—</span>
        )}
      </td>
      <td className="mono px-3 py-2.5 text-right text-[13px] font-medium tabular-nums">
        {o.Amount ? fmtMoney(o.Amount) : <span className="text-ink-4">—</span>}
      </td>
      <td className="mono px-3 py-2.5 text-right text-[13px] tabular-nums text-ink-2">
        {o.Probability != null ? `${o.Probability}%` : "—"}
      </td>
      <td className="mono px-3 py-2.5 text-[11.5px] text-ink-3">
        {fmtDate(o.CloseDate)}
      </td>
      <td className="px-3 py-2.5 text-[12.5px] text-ink-2">{owner}</td>
      <td className="px-3 py-2.5 text-[12.5px] text-ink-3">
        <span className="line-clamp-1">{o.NextStep ?? "—"}</span>
      </td>
    </tr>
  );
}

function SkeletonRows() {
  return (
    <>
      {Array.from({ length: 8 }).map((_, i) => (
        <tr key={i} className="border-b border-border-strong">
          <td colSpan={8} className="px-3 py-2.5">
            <div className="h-4 w-full animate-pulse rounded bg-surface-2" />
          </td>
        </tr>
      ))}
    </>
  );
}
