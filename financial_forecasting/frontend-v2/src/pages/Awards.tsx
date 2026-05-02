import { memo, useMemo, useRef, useState } from "react";
import { Search } from "lucide-react";
import { useVirtualizer } from "@tanstack/react-virtual";

import { AwardDrawer } from "@/components/AwardDrawer";
import { PageHeader } from "@/components/PageHeader";
import { ColumnChooser } from "@/components/ui/ColumnChooser";
import { InlineSelect, InlineText } from "@/components/ui/InlineEdit";
import { SavedViewsPicker } from "@/components/ui/SavedViewsPicker";
import { ColGroup, ResizableTh } from "@/components/ui/ResizableTable";
import { SortableHeader } from "@/components/ui/SortableHeader";
import { Tag } from "@/components/ui/Tag";
import { ButtonGroup, Toolbar } from "@/components/ui/Toolbar";
import { totalWidth, useColumnWidths } from "@/lib/columnWidths";
import { useColumnVisibility } from "@/lib/columnVisibility";
import { fmtDate, fmtMoney, initials } from "@/lib/format";
import { cn } from "@/lib/utils";
import { sortBy, useSort } from "@/lib/sort";
import {
  useAwards,
  useUpdateAward,
  type Award,
  type AwardStatus,
} from "@/services/awards";
import { useOpportunities } from "@/services/opportunities";
import { usePerm } from "@/services/permissions";
import type { SfOpportunity } from "@/types/salesforce";

interface AwardFilter {
  status: "All" | AwardStatus;
}

const STATUS_FILTERS: { value: "All" | AwardStatus; label: string }[] = [
  { value: "All", label: "All" },
  { value: "Active", label: "Active" },
  { value: "Closing", label: "Closing" },
  { value: "Closed", label: "Closed" },
  { value: "Did Not Fulfill", label: "Did Not Fulfill" },
];

const STATUS_OPTIONS: { value: AwardStatus; label: string }[] = [
  { value: "Active", label: "Active" },
  { value: "Closing", label: "Closing" },
  { value: "Closed", label: "Closed" },
  { value: "Did Not Fulfill", label: "Did Not Fulfill" },
];

function statusVariant(s: AwardStatus): "green" | "amber" | "default" | "red" {
  if (s === "Active") return "green";
  if (s === "Closing") return "amber";
  if (s === "Did Not Fulfill") return "red";
  return "default";
}

type ColKey =
  | "name"
  | "funder"
  | "status"
  | "paymentBar"
  | "paid"
  | "pending"
  | "reporting"
  | "amount"
  | "awardDate"
  | "periodEnd"
  | "notes";

const COLUMN_ORDER: ColKey[] = [
  "name",
  "funder",
  "status",
  "paymentBar",
  "paid",
  "pending",
  "reporting",
  "amount",
  "awardDate",
  "periodEnd",
  "notes",
];

const DEFAULT_WIDTHS: Record<ColKey, number> = {
  name: 280,
  funder: 180,
  status: 120,
  paymentBar: 140,
  paid: 110,
  pending: 110,
  reporting: 200,
  amount: 120,
  awardDate: 120,
  periodEnd: 120,
  notes: 300,
};

const COL_LABELS: Record<ColKey, string> = {
  name: "Award",
  funder: "Funder",
  status: "Status",
  paymentBar: "Payment status",
  paid: "Paid",
  pending: "Pending",
  reporting: "Reporting",
  amount: "Total",
  awardDate: "Awarded",
  periodEnd: "Period ends",
  notes: "Notes",
};

// Default visible columns matching the screenshot layout
const DEFAULT_VISIBLE: ColKey[] = [
  "name", "funder", "status", "paymentBar", "paid", "pending", "reporting",
];

const ROW_HEIGHT = 44;

const REPORTING_FREQ_OPTIONS = [
  { value: "Annual", label: "Annual" },
  { value: "Semi-Annual", label: "Semi-Annual" },
  { value: "Quarterly", label: "Quarterly" },
  { value: "Monthly", label: "Monthly" },
  { value: "Interim + Final", label: "Interim + Final" },
  { value: "Final Only", label: "Final Only" },
  { value: "None", label: "None" },
];

function extractAward(
  a: Award,
  opp: SfOpportunity | undefined,
  key: ColKey,
): unknown {
  switch (key) {
    case "name": return opp?.Name ?? a.opportunity_id;
    case "funder": return opp?.Account?.Name ?? "";
    case "status": return a.award_status;
    case "amount": return opp?.Amount ?? 0;
    case "paid": return opp?.npe01__Payments_Made__c ?? 0;
    case "pending": return opp?.Outstanding_Payments__c ?? 0;
    case "paymentBar": return opp?.npe01__Payments_Made__c ?? 0;
    case "awardDate": return a.award_date;
    case "periodEnd": return a.period_end_date;
    case "reporting": return a.next_report_due ?? a.reporting_frequency ?? "";
    case "notes": return a.notes;
  }
}

// ── Payment bar ───────────────────────────────────────────────────────────

function PaymentBar({ paid, total }: { paid: number; total: number }) {
  const pct = total > 0 ? Math.min(100, (paid / total) * 100) : 0;
  const allPaid = pct >= 99.9;
  return (
    <div className="flex w-full items-center gap-1.5">
      <div className="relative h-1.5 min-w-0 flex-1 overflow-hidden rounded-full bg-surface-2">
        <div
          className={cn(
            "absolute left-0 top-0 h-full rounded-full transition-all",
            allPaid ? "bg-green-500" : "bg-accent",
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="mono flex-shrink-0 text-[11px] text-ink-3">
        {Math.round(pct)}%
      </span>
    </div>
  );
}

export function AwardsPage() {
  const [filter, setFilter] = useState<AwardFilter>({ status: "All" });
  const [q, setQ] = useState("");
  const [drawerAward, setDrawerAward] = useState<Award | null>(null);

  const canEdit = usePerm("edit_awards");
  const { visible: visibleCols, toggle: toggleCol } = useColumnVisibility<ColKey>(
    "bedrock-v2:vis:awards",
    COLUMN_ORDER,
    DEFAULT_VISIBLE,
  );

  const { sort, toggle } = useSort<ColKey>({ key: "awardDate", direction: "desc" });
  const { widths, startResize } = useColumnWidths<ColKey>("bedrock-v2:cols:awards", DEFAULT_WIDTHS);

  const { data: awardsData, isLoading: awardsLoading, isError, error } =
    useAwards(filter.status === "All" ? undefined : filter.status);
  // Fetch all record types — awards now span Philanthropy, PBC, Debt/Equity, etc.
  const { data: oppsData } = useOpportunities({});
  const updateAward = useUpdateAward();

  const oppById = useMemo(() => {
    const m = new Map<string, SfOpportunity>();
    for (const o of oppsData ?? []) m.set(o.Id, o);
    return m;
  }, [oppsData]);

  const awards = awardsData ?? [];
  const filtered = useMemo(() => {
    const filt = q
      ? awards.filter((a) => {
          const opp = oppById.get(a.opportunity_id);
          const needle = q.toLowerCase();
          return (
            (opp?.Name ?? "").toLowerCase().includes(needle) ||
            (opp?.Account?.Name ?? "").toLowerCase().includes(needle) ||
            (a.notes ?? "").toLowerCase().includes(needle)
          );
        })
      : awards;
    return sortBy(filt, sort, (a, key) =>
      extractAward(a, oppById.get(a.opportunity_id), key),
    );
  }, [awards, oppById, q, sort]);

  const totalAmount = filtered.reduce((s, a) => s + (oppById.get(a.opportunity_id)?.Amount ?? 0), 0);
  const totalPaid = filtered.reduce((s, a) => s + (oppById.get(a.opportunity_id)?.npe01__Payments_Made__c ?? 0), 0);
  const totalPending = filtered.reduce((s, a) => s + (oppById.get(a.opportunity_id)?.Outstanding_Payments__c ?? 0), 0);

  const tableMinWidth = totalWidth(widths);

  const scrollRef = useRef<HTMLDivElement>(null);
  const virtualizer = useVirtualizer({
    count: filtered.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => ROW_HEIGHT,
    overscan: 8,
  });
  const virtualItems = virtualizer.getVirtualItems();
  const totalSize = virtualizer.getTotalSize();
  const paddingTop = virtualItems[0]?.start ?? 0;
  const paddingBottom = totalSize - (virtualItems[virtualItems.length - 1]?.end ?? 0);

  return (
    <div className="flex h-full flex-col px-7 py-6 pb-6">
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
          value={filter.status}
          onChange={(v) => setFilter((f) => ({ ...f, status: v as "All" | AwardStatus }))}
          options={STATUS_FILTERS}
        />
        <div className="relative">
          <Search size={13} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-ink-3" />
          <input
            placeholder="Search by opp, funder, notes"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="h-7 w-72 rounded border border-border-strong bg-surface pl-7 pr-3 text-[12.5px] text-ink outline-none focus:border-accent"
          />
        </div>
        <SavedViewsPicker<AwardFilter>
          storageKey="bedrock-v2:views:awards"
          currentFilters={filter}
          onLoad={setFilter}
        />
        <ColumnChooser<ColKey>
          allColumns={COLUMN_ORDER}
          labels={COL_LABELS}
          visible={visibleCols}
          onToggle={toggleCol}
          required={["name"]}
        />
        <span className="ml-auto text-[11.5px] text-ink-3">
          {filtered.length.toLocaleString()} of {awards.length.toLocaleString()}
        </span>
      </Toolbar>

      <div
        ref={scrollRef}
        className="flex-1 overflow-x-auto rounded-b-lg border border-border-strong bg-surface"
      >
        <table
          className="border-collapse"
          style={{ tableLayout: "fixed", width: "100%", minWidth: tableMinWidth }}
        >
          <ColGroup order={visibleCols} widths={widths} />
          <thead className="sticky top-0 z-10">
            <tr>
              {visibleCols.map((key, idx) => (
                <ResizableTh
                  key={key}
                  width={widths[key]}
                  onStartResize={(e) => startResize(key, e)}
                  align="left"
                  isLast={idx === visibleCols.length - 1}
                >
                  <SortableHeader label={COL_LABELS[key]} sortKey={key} sort={sort} onToggle={toggle} />
                </ResizableTh>
              ))}
            </tr>
          </thead>
          <tbody>
            {awardsLoading ? (
              <SkeletonRows colCount={visibleCols.length} />
            ) : isError ? (
              <tr>
                <td colSpan={visibleCols.length} className="px-7 py-10 text-center text-[13px] text-red">
                  Failed to load awards{error instanceof Error ? `: ${error.message}` : ""}
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={visibleCols.length} className="px-7 py-12 text-center text-[13px] text-ink-3">
                  {awards.length === 0 ? "No awards yet." : "No awards match your filters."}
                </td>
              </tr>
            ) : (
              <>
                {paddingTop > 0 && <tr aria-hidden style={{ height: paddingTop }}><td colSpan={visibleCols.length} /></tr>}
                {virtualItems.map((vi) => {
                  const a = filtered[vi.index];
                  const opp = oppById.get(a.opportunity_id);
                  return (
                    <AwardRow
                      key={a.id}
                      a={a}
                      opp={opp}
                      visibleCols={visibleCols}
                      canEdit={canEdit}
                      onOpen={() => setDrawerAward(a)}
                      onSave={async (patch) => {
                        await updateAward.mutateAsync({ id: a.id, patch });
                      }}
                    />
                  );
                })}
                {paddingBottom > 0 && <tr aria-hidden style={{ height: paddingBottom }}><td colSpan={visibleCols.length} /></tr>}
              </>
            )}
          </tbody>
          {filtered.length > 0 && !awardsLoading && (
            <tfoot className="sticky bottom-0 z-10">
              <tr className="border-t border-border-strong bg-surface-2">
                {visibleCols.map((key, idx) => {
                  if (idx === 0) return <td key={key} className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-ink-3">Totals</td>;
                  if (key === "amount") return <td key={key} className="mono px-3 py-2 text-[13px] font-semibold tabular-nums">{fmtMoney(totalAmount)}</td>;
                  if (key === "paid") return <td key={key} className="mono px-3 py-2 text-[13px] font-semibold tabular-nums text-green-700">{fmtMoney(totalPaid)}</td>;
                  if (key === "pending") return <td key={key} className="mono px-3 py-2 text-[13px] font-semibold tabular-nums text-amber-700">{fmtMoney(totalPending)}</td>;
                  return <td key={key} />;
                })}
              </tr>
            </tfoot>
          )}
        </table>
      </div>

      <AwardDrawer
        award={drawerAward}
        opp={drawerAward ? oppById.get(drawerAward.opportunity_id) : undefined}
        onClose={() => setDrawerAward(null)}
      />
    </div>
  );
}

interface RowProps {
  a: Award;
  opp: SfOpportunity | undefined;
  visibleCols: ColKey[];
  canEdit: boolean;
  onOpen: () => void;
  onSave: (patch: Record<string, unknown>) => Promise<void>;
}

const AwardRow = memo(function AwardRow({ a, opp, visibleCols, canEdit, onOpen, onSave }: RowProps) {
  const account = opp?.Account?.Name ?? "—";
  const oppName = opp?.Name ?? a.opportunity_id;
  const total = opp?.Amount ?? 0;
  const paid = opp?.npe01__Payments_Made__c ?? 0;
  const pending = opp?.Outstanding_Payments__c ?? 0;

  const cells: Record<ColKey, React.ReactNode> = {
    name: (
      <div className="flex min-w-0 items-center gap-2">
        <div
          className="grid h-[18px] w-[18px] flex-shrink-0 place-items-center rounded text-[9px] font-semibold text-surface"
          style={{ background: "linear-gradient(135deg, oklch(0.65 0.10 250), oklch(0.50 0.13 270))" }}
        >
          {initials(account === "—" ? oppName : account)}
        </div>
        <span className="truncate font-medium" title={oppName}>{oppName}</span>
      </div>
    ),
    funder: <span className="truncate text-[12.5px] text-ink-2">{account}</span>,
    status: canEdit ? (
      <InlineSelect
        value={a.award_status}
        options={STATUS_OPTIONS}
        onSave={(v) => onSave({ award_status: v })}
        renderValue={(v) => v ? <Tag variant={statusVariant(v as AwardStatus)}>{v}</Tag> : <Tag>—</Tag>}
      />
    ) : (
      <Tag variant={statusVariant(a.award_status)}>{a.award_status}</Tag>
    ),
    paymentBar: total > 0
      ? <PaymentBar paid={paid} total={total} />
      : <span className="text-[11px] text-ink-4">—</span>,
    paid: paid > 0
      ? <span className="mono text-[12px] font-medium text-green-700 tabular-nums">{fmtMoney(paid)}</span>
      : <span className="text-ink-4">—</span>,
    pending: pending > 0
      ? <span className="mono text-[12px] font-medium text-amber-700 tabular-nums">{fmtMoney(pending)}</span>
      : <span className="text-ink-4">—</span>,
    reporting: (
      <div className="flex min-w-0 flex-col leading-tight">
        {canEdit ? (
          <InlineSelect
            value={a.reporting_frequency ?? ""}
            options={REPORTING_FREQ_OPTIONS}
            onSave={(v) => onSave({ reporting_frequency: v || null })}
            renderValue={(v) => (
              <span className={cn("text-[12px]", v ? "text-ink" : "text-ink-4")}>
                {v || "Set frequency…"}
              </span>
            )}
          />
        ) : (
          <span className="text-[12px] text-ink">{a.reporting_frequency ?? "—"}</span>
        )}
        {a.next_report_due ? (
          <span className="mono text-[10.5px] text-ink-3">
            next: {fmtDate(a.next_report_due)}
          </span>
        ) : opp?.npsp__Next_Grant_Deadline_Due_Date__c ? (
          <span className="mono text-[10.5px] text-ink-3">
            next: {fmtDate(opp.npsp__Next_Grant_Deadline_Due_Date__c)}
          </span>
        ) : null}
      </div>
    ),
    amount: total > 0 ? <span className="mono tabular-nums">{fmtMoney(total)}</span> : <span className="text-ink-4">—</span>,
    awardDate: <span className="mono text-[11.5px] text-ink-3">{fmtDate(a.award_date)}</span>,
    periodEnd: canEdit ? (
      <InlineText value={a.period_end_date} onSave={(v) => onSave({ period_end_date: v })} placeholder="YYYY-MM-DD" />
    ) : (
      <span className="mono text-[11.5px] text-ink-3">{fmtDate(a.period_end_date)}</span>
    ),
    notes: canEdit ? (
      <InlineText value={a.notes} onSave={(v) => onSave({ notes: v })} placeholder="Add notes…" />
    ) : (
      <span className="text-[12.5px] text-ink-3">{a.notes ?? "—"}</span>
    ),
  };

  const cellCls: Record<ColKey, string> = {
    name: "cursor-pointer overflow-hidden px-3 py-1 text-[13px]",
    funder: "overflow-hidden px-3 py-1 text-[12.5px]",
    status: "overflow-hidden px-3 py-1",
    paymentBar: "overflow-hidden px-3 py-1",
    paid: "mono overflow-hidden px-3 py-1 text-[12px]",
    pending: "mono overflow-hidden px-3 py-1 text-[12px]",
    reporting: "overflow-hidden px-3 py-1",
    amount: "mono cursor-pointer overflow-hidden truncate px-3 py-1 text-[12px] tabular-nums",
    awardDate: "mono cursor-pointer overflow-hidden truncate px-3 py-1 text-[11.5px] text-ink-3",
    periodEnd: "mono overflow-hidden px-3 py-1 text-[11.5px] text-ink-3",
    notes: "overflow-hidden px-3 py-1 text-[12.5px] text-ink-3",
  };

  const clickable = new Set<ColKey>(["name", "amount", "awardDate"]);

  return (
    <tr className="group/row border-b border-border-strong hover:bg-surface-2" style={{ height: ROW_HEIGHT }}>
      {visibleCols.map((key) => (
        <td key={key} className={cellCls[key]} onClick={clickable.has(key) ? onOpen : undefined}>
          {cells[key]}
        </td>
      ))}
    </tr>
  );
});

function SkeletonRows({ colCount }: { colCount: number }) {
  return (
    <>
      {Array.from({ length: 8 }).map((_, i) => (
        <tr key={i} className="border-b border-border-strong">
          <td colSpan={colCount} className="px-3 py-2.5">
            <div className="h-4 w-full animate-pulse rounded bg-surface-2" />
          </td>
        </tr>
      ))}
    </>
  );
}
