import { useMemo, useState } from "react";
import { Search } from "lucide-react";

import { PageHeader } from "@/components/PageHeader";
import { Tag } from "@/components/ui/Tag";
import { ButtonGroup, Toolbar } from "@/components/ui/Toolbar";
import { fmtDate, fmtMoney, initials } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useAwards, type Award, type AwardStatus } from "@/services/awards";
import { useOpportunities } from "@/services/opportunities";
import type { SfOpportunity } from "@/types/salesforce";

const STATUS_FILTERS: { value: "All" | AwardStatus; label: string }[] = [
  { value: "All", label: "All" },
  { value: "Active", label: "Active" },
  { value: "Closing", label: "Closing" },
  { value: "Closed", label: "Closed" },
];

function statusVariant(s: AwardStatus): "green" | "amber" | "default" {
  if (s === "Active") return "green";
  if (s === "Closing") return "amber";
  return "default";
}

export function AwardsPage() {
  const [filter, setFilter] = useState<"All" | AwardStatus>("All");
  const [q, setQ] = useState("");

  const { data: awardsData, isLoading: awardsLoading, isError, error } = useAwards(
    filter === "All" ? undefined : filter,
  );
  // Opps come from SF — used to enrich each Award with its parent's name +
  // account + amount. We restrict to Philanthropy since that's the only
  // record type that produces awards today.
  const { data: oppsData } = useOpportunities({ recordType: "Philanthropy" });

  const oppById = useMemo(() => {
    const m = new Map<string, SfOpportunity>();
    for (const o of oppsData ?? []) m.set(o.Id, o);
    return m;
  }, [oppsData]);

  const awards = awardsData ?? [];
  const filtered = useMemo(() => {
    if (!q) return awards;
    const needle = q.toLowerCase();
    return awards.filter((a) => {
      const opp = oppById.get(a.opportunity_id);
      const oppName = (opp?.Name ?? "").toLowerCase();
      const account = (opp?.Account?.Name ?? "").toLowerCase();
      return oppName.includes(needle) || account.includes(needle);
    });
  }, [awards, oppById, q]);

  const totalAmount = filtered.reduce(
    (s, a) => s + (oppById.get(a.opportunity_id)?.Amount ?? 0),
    0,
  );

  return (
    <div className="mx-auto max-w-[1320px] px-7 py-6 pb-20">
      <PageHeader
        title="Awards"
        subtitle={
          awardsLoading
            ? "Loading…"
            : `${filtered.length.toLocaleString()} awards · ${fmtMoney(totalAmount)}`
        }
      />

      <Toolbar>
        <ButtonGroup
          value={filter}
          onChange={(v) => setFilter(v as "All" | AwardStatus)}
          options={STATUS_FILTERS}
        />
        <div className="relative">
          <Search
            size={13}
            className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-ink-3"
          />
          <input
            placeholder="Search by opp or funder"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="h-7 w-64 rounded border border-border-strong bg-surface pl-7 pr-3 text-[12.5px] text-ink outline-none focus:border-accent"
          />
        </div>
        <span className="ml-auto text-[11.5px] text-ink-3">
          {filtered.length.toLocaleString()} of {awards.length.toLocaleString()}
        </span>
      </Toolbar>

      <div className="overflow-hidden rounded-b-lg border border-border-strong bg-surface">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              {[
                "Award",
                "Status",
                "Amount",
                "Awarded",
                "Period ends",
                "Notes",
              ].map((h, i) => (
                <th
                  key={h}
                  className={cn(
                    "border-b border-border-strong bg-surface-2 px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-ink-3",
                    i === 2 ? "text-right" : "text-left",
                  )}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {awardsLoading ? (
              <SkeletonRows />
            ) : isError ? (
              <tr>
                <td colSpan={6} className="px-7 py-10 text-center text-[13px] text-red">
                  Failed to load awards
                  {error instanceof Error ? `: ${error.message}` : ""}
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-7 py-12 text-center text-[13px] text-ink-3">
                  {awards.length === 0 ? (
                    <div className="flex flex-col gap-1">
                      <span className="font-medium text-ink">No awards yet</span>
                      <span>
                        Run{" "}
                        <code className="mono rounded border border-border-strong bg-surface-2 px-1.5 py-0.5 text-[11.5px]">
                          python -m scripts.backfill_awards --verify-stages
                        </code>{" "}
                        then{" "}
                        <code className="mono rounded border border-border-strong bg-surface-2 px-1.5 py-0.5 text-[11.5px]">
                          --yes
                        </code>{" "}
                        to backfill from Salesforce.
                      </span>
                    </div>
                  ) : (
                    "No awards match your filters."
                  )}
                </td>
              </tr>
            ) : (
              filtered.map((a) => (
                <AwardRow key={a.id} a={a} opp={oppById.get(a.opportunity_id)} />
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function AwardRow({ a, opp }: { a: Award; opp: SfOpportunity | undefined }) {
  const account = opp?.Account?.Name ?? "—";
  const oppName = opp?.Name ?? a.opportunity_id;

  return (
    <tr className="cursor-pointer border-b border-border-strong hover:bg-surface-2">
      <td className="px-3 py-2.5 text-[13px]">
        <div className="flex min-w-0 items-center gap-2">
          <div
            className="grid h-[18px] w-[18px] flex-shrink-0 place-items-center rounded text-[9px] font-semibold text-surface"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.65 0.10 250), oklch(0.50 0.13 270))",
            }}
          >
            {initials(account === "—" ? oppName : account)}
          </div>
          <div className="flex min-w-0 flex-1 flex-col leading-tight">
            <span className="truncate font-medium">{oppName}</span>
            <span className="truncate text-[11px] text-ink-3">{account}</span>
          </div>
        </div>
      </td>
      <td className="px-3 py-2.5 text-[13px]">
        <Tag variant={statusVariant(a.award_status)}>{a.award_status}</Tag>
      </td>
      <td className="mono px-3 py-2.5 text-right text-[13px] font-medium tabular-nums">
        {opp?.Amount ? (
          fmtMoney(opp.Amount)
        ) : (
          <span className="text-ink-4">—</span>
        )}
      </td>
      <td className="mono px-3 py-2.5 text-[11.5px] text-ink-3">
        {fmtDate(a.award_date)}
      </td>
      <td className="mono px-3 py-2.5 text-[11.5px] text-ink-3">
        {fmtDate(a.period_end_date)}
      </td>
      <td className="px-3 py-2.5 text-[12.5px] text-ink-3">
        <span className="line-clamp-1">{a.notes || "—"}</span>
      </td>
    </tr>
  );
}

function SkeletonRows() {
  return (
    <>
      {Array.from({ length: 6 }).map((_, i) => (
        <tr key={i} className="border-b border-border-strong">
          <td colSpan={6} className="px-3 py-2.5">
            <div className="h-4 w-full animate-pulse rounded bg-surface-2" />
          </td>
        </tr>
      ))}
    </>
  );
}
