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
];

const STATUS_OPTIONS: { value: AwardStatus; label: string }[] = [
  { value: "Active", label: "Active" },
  { value: "Closing", label: "Closing" },
  { value: "Closed", label: "Closed" },
];

function statusVariant(s: AwardStatus): "green" | "amber" | "default" {
  if (s === "Active") return "green";
  if (s === "Closing") return "amber";
  return "default";
}

type ColKey =
  | "name"
  | "status"
  | "amount"
  | "awardDate"
  | "periodEnd"
  | "notes";

const COLUMN_ORDER: ColKey[] = [
  "name",
  "status",
  "amount",
  "awardDate",
  "periodEnd",
  "notes",
];

const DEFAULT_WIDTHS: Record<ColKey, number> = {
  name: 320,
  status: 110,
  amount: 130,
  awardDate: 130,
  periodEnd: 130,
  notes: 360,
};

const COL_LABELS: Record<ColKey, string> = {
  name: "Award",
  status: "Status",
  amount: "Amount",
  awardDate: "Awarded",
  periodEnd: "Period ends",
  notes: "Notes",
};

const ROW_HEIGHT = 44;

function extractAward(
  a: Award,
  opp: SfOpportunity | undefined,
  key: ColKey,
): unknown {
  switch (key) {
    case "name":
      return opp?.Name ?? a.opportunity_id;
    case "status":
      return a.award_status;
    case "amount":
      return opp?.Amount ?? 0;
    case "awardDate":
      return a.award_date;
    case "periodEnd":
      return a.period_end_date;
    case "notes":
      return a.notes;
  }
}

export function AwardsPage() {
  const [filter, setFilter] = useState<AwardFilter>({ status: "All" });
  const [q, setQ] = useState("");
  const [drawerAward, setDrawerAward] = useState<Award | null>(null);

  const canEdit = usePerm("edit_awards");
  const { visible: visibleCols, toggle: toggleCol } = useColumnVisibility<ColKey>(
    "bedrock-v2:vis:awards",
    COLUMN_ORDER,
  );

  const { sort, toggle } = useSort<ColKey>({
    key: "awardDate",
    direction: "desc",
  });
  const { widths, startResize } = useColumnWidths<ColKey>(
    "bedrock-v2:cols:awards",
    DEFAULT_WIDTHS,
  );

  const {
    data: awardsData,
    isLoading: awardsLoading,
    isError,
    error,
  } = useAwards(filter.status === "All" ? undefined : filter.status);
  const { data: oppsData } = useOpportunities({ recordType: "Philanthropy" });
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
          const oppName = (opp?.Name ?? "").toLowerCase();
          const account = (opp?.Account?.Name ?? "").toLowerCase();
          const notes = (a.notes ?? "").toLowerCase();
          const needle = q.toLowerCase();
          return (
            oppName.includes(needle) ||
            account.includes(needle) ||
            notes.includes(needle)
          );
        })
      : awards;
    return sortBy(filt, sort, (a, key) =>
      extractAward(a, oppById.get(a.opportunity_id), key),
    );
  }, [awards, oppById, q, sort]);

  const totalAmount = filtered.reduce(
    (s, a) => s + (oppById.get(a.opportunity_id)?.Amount ?? 0),
    0,
  );

  const tableMinWidth = totalWidth(widths);

  // ── Virtualization ─────────────────────────────────────────────────
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
  const paddingBottom =
    totalSize - (virtualItems[virtualItems.length - 1]?.end ?? 0);

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
          onChange={(v) =>
            setFilter((f) => ({ ...f, status: v as "All" | AwardStatus }))
          }
          options={STATUS_FILTERS}
        />
        <div className="relative">
          <Search
            size={13}
            className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-ink-3"
          />
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
          style={{
            tableLayout: "fixed",
            width: "100%",
            minWidth: tableMinWidth,
          }}
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
                  <SortableHeader
                    label={COL_LABELS[key]}
                    sortKey={key}
                    sort={sort}
                    onToggle={toggle}
                  />
                </ResizableTh>
              ))}
            </tr>
          </thead>
          <tbody>
            {awardsLoading ? (
              <SkeletonRows colCount={visibleCols.length} />
            ) : isError ? (
              <tr>
                <td
                  colSpan={visibleCols.length}
                  className="px-7 py-10 text-center text-[13px] text-red"
                >
                  Failed to load awards
                  {error instanceof Error ? `: ${error.message}` : ""}
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td
                  colSpan={visibleCols.length}
                  className="px-7 py-12 text-center text-[13px] text-ink-3"
                >
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
              <>
                {paddingTop > 0 ? (
                  <tr aria-hidden style={{ height: paddingTop }}>
                    <td colSpan={visibleCols.length} />
                  </tr>
                ) : null}
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
                      onSaveStatus={async (status) => {
                        await updateAward.mutateAsync({
                          id: a.id,
                          patch: { award_status: status as AwardStatus },
                        });
                      }}
                      onSavePeriodEnd={async (period_end_date) => {
                        await updateAward.mutateAsync({
                          id: a.id,
                          patch: { period_end_date },
                        });
                      }}
                      onSaveNotes={async (notes) => {
                        await updateAward.mutateAsync({
                          id: a.id,
                          patch: { notes },
                        });
                      }}
                    />
                  );
                })}
                {paddingBottom > 0 ? (
                  <tr aria-hidden style={{ height: paddingBottom }}>
                    <td colSpan={visibleCols.length} />
                  </tr>
                ) : null}
              </>
            )}
          </tbody>
          {filtered.length > 0 && !awardsLoading ? (
            <tfoot className="sticky bottom-0 z-10">
              <tr className="border-t border-border-strong bg-surface-2">
                {visibleCols.map((key: ColKey, idx: number) => {
                  if (idx === 0)
                    return (
                      <td
                        key={key}
                        className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-ink-3"
                      >
                        Totals
                      </td>
                    );
                  if (key === "amount")
                    return (
                      <td
                        key={key}
                        className="mono px-3 py-2 text-[13px] font-semibold tabular-nums"
                      >
                        {fmtMoney(totalAmount)}
                      </td>
                    );
                  return <td key={key} />;
                })}
              </tr>
            </tfoot>
          ) : null}
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
  onSaveStatus: (status: string) => Promise<void>;
  onSavePeriodEnd: (date: string) => Promise<void>;
  onSaveNotes: (notes: string) => Promise<void>;
}

const AwardRow = memo(function AwardRow({
  a,
  opp,
  visibleCols,
  canEdit,
  onOpen,
  onSaveStatus,
  onSavePeriodEnd,
  onSaveNotes,
}: RowProps) {
  const account = opp?.Account?.Name ?? "—";
  const oppName = opp?.Name ?? a.opportunity_id;

  const cells: Record<ColKey, React.ReactNode> = {
    name: (
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
          <span className="truncate font-medium hover:underline" title={oppName}>
            {oppName}
          </span>
          <span className="truncate text-[11px] text-ink-3">{account}</span>
        </div>
      </div>
    ),
    status: canEdit ? (
      <InlineSelect
        value={a.award_status}
        options={STATUS_OPTIONS}
        onSave={(v) => onSaveStatus(v)}
        renderValue={(v) =>
          v ? (
            <Tag variant={statusVariant(v as AwardStatus)}>{v}</Tag>
          ) : (
            <Tag>—</Tag>
          )
        }
      />
    ) : a.award_status ? (
      <Tag variant={statusVariant(a.award_status)}>{a.award_status}</Tag>
    ) : (
      <Tag>—</Tag>
    ),
    amount: opp?.Amount ? (
      fmtMoney(opp.Amount)
    ) : (
      <span className="text-ink-4">—</span>
    ),
    awardDate: fmtDate(a.award_date),
    periodEnd: canEdit ? (
      <InlineText
        value={a.period_end_date}
        onSave={onSavePeriodEnd}
        placeholder="YYYY-MM-DD"
      />
    ) : (
      <span className="mono text-[11.5px] text-ink-3">{fmtDate(a.period_end_date)}</span>
    ),
    notes: canEdit ? (
      <InlineText value={a.notes} onSave={onSaveNotes} placeholder="Add notes…" />
    ) : (
      <span className="text-[12.5px] text-ink-3">{a.notes ?? "—"}</span>
    ),
  };

  const cellCls: Record<ColKey, string> = {
    name: "cursor-pointer overflow-hidden px-3 py-1 text-[13px]",
    status: "overflow-hidden px-3 py-1 text-[13px]",
    amount: "mono cursor-pointer overflow-hidden truncate px-3 py-1 text-[13px] font-medium tabular-nums",
    awardDate: "mono cursor-pointer overflow-hidden truncate px-3 py-1 text-[11.5px] text-ink-3",
    periodEnd: "mono overflow-hidden px-3 py-1 text-[11.5px] text-ink-3",
    notes: "overflow-hidden px-3 py-1 text-[12.5px] text-ink-3",
  };

  const clickable = new Set<ColKey>(["name", "amount", "awardDate"]);

  return (
    <tr
      className="group/row border-b border-border-strong hover:bg-surface-2"
      style={{ height: ROW_HEIGHT }}
    >
      {visibleCols.map((key: ColKey) => (
        <td
          key={key}
          className={cellCls[key]}
          onClick={clickable.has(key) ? onOpen : undefined}
        >
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
