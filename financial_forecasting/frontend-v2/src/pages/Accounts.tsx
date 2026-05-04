import { Fragment, memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronDown, ChevronRight, Plus, Search, Sparkles, X } from "lucide-react";
import { useVirtualizer } from "@tanstack/react-virtual";

import { PageHeader } from "@/components/PageHeader";
import { TaskExpandPanel, TASK_PANEL_HEIGHT } from "@/components/TaskExpandPanel";
import { ColumnChooser } from "@/components/ui/ColumnChooser";
import { InlineSelect } from "@/components/ui/InlineEdit";
import { ColGroup, ResizableTh } from "@/components/ui/ResizableTable";
import { SavedViewsPicker } from "@/components/ui/SavedViewsPicker";
import { SortableHeader } from "@/components/ui/SortableHeader";
import { ButtonGroup, Toolbar } from "@/components/ui/Toolbar";
import { useColumnVisibility } from "@/lib/columnVisibility";
import { totalWidth, useColumnWidths } from "@/lib/columnWidths";
import { fmtMoney } from "@/lib/format";
import { sortBy, useSort } from "@/lib/sort";
import { isOpen, isWon } from "@/lib/stages";
import { cn } from "@/lib/utils";
import { AccountAvatar } from "@/components/AccountAvatar";
import {
  useAccounts,
  useAccountsEnrichment,
  useCreateAccount,
  useUpdateAccount,
} from "@/services/accounts";
import { useOpportunities } from "@/services/opportunities";
import { usePerm } from "@/services/permissions";
import { useActiveUsers } from "@/services/users";
import type { SfAccount, SfOpportunity } from "@/types/salesforce";

const TYPE_FILTERS = ["All", "Foundation", "Corporate", "Government", "Individual"] as const;
type TypeFilter = (typeof TYPE_FILTERS)[number];

function matchesType(account: SfAccount, filter: TypeFilter): boolean {
  if (filter === "All") return true;
  const t = (account.Type ?? "").toLowerCase();
  if (filter === "Foundation") return t.includes("foundation");
  if (filter === "Corporate") return t.includes("corporate") || t.includes("corporation");
  if (filter === "Government") return t.includes("government") || t.includes("public");
  if (filter === "Individual") return t.includes("individual");
  return true;
}

interface AccountMetrics {
  openPipeline: number;
  amountWon: number;
  received: number;
  outstanding: number;
}

const ZERO_METRICS: AccountMetrics = {
  openPipeline: 0,
  amountWon: 0,
  received: 0,
  outstanding: 0,
};

function buildMetricsMap(opps: SfOpportunity[]): Map<string, AccountMetrics> {
  const m = new Map<string, AccountMetrics>();
  for (const o of opps) {
    const accountId = o.AccountId;
    if (!accountId) continue;
    let cur = m.get(accountId);
    if (!cur) {
      cur = { ...ZERO_METRICS };
      m.set(accountId, cur);
    }
    const amount = o.Amount ?? 0;
    if (isOpen(o)) {
      cur.openPipeline += amount;
    } else if (isWon(o)) {
      cur.amountWon += amount;
      cur.received += o.npe01__Payments_Made__c ?? 0;
    }
  }
  for (const v of m.values()) {
    v.outstanding = Math.max(0, v.amountWon - v.received);
  }
  return m;
}

type ColKey = "name" | "owner" | "openPipeline" | "amountWon" | "received" | "outstanding";

const COLUMN_ORDER: ColKey[] = [
  "name",
  "owner",
  "openPipeline",
  "amountWon",
  "received",
  "outstanding",
];

const DEFAULT_WIDTHS: Record<ColKey, number> = {
  name: 280,
  owner: 160,
  openPipeline: 130,
  amountWon: 130,
  received: 120,
  outstanding: 130,
};

const COL_LABELS: Record<ColKey, string> = {
  name: "Account",
  owner: "Account owner",
  openPipeline: "Open pipeline",
  amountWon: "Amount won",
  received: "Received",
  outstanding: "Outstanding",
};

const ROW_HEIGHT = 44; // px — must match the row's actual rendered height

function extractAccount(
  a: SfAccount,
  metrics: AccountMetrics,
  key: ColKey,
): unknown {
  switch (key) {
    case "name": return a.Name;
    case "owner": return a.Owner?.Name;
    case "openPipeline": return metrics.openPipeline;
    case "amountWon": return metrics.amountWon;
    case "received": return metrics.received;
    case "outstanding": return metrics.outstanding;
  }
}

export function AccountsPage() {
  const navigate = useNavigate();
  const accountsQ = useAccounts();
  const oppsQ = useOpportunities();
  const usersQ = useActiveUsers();
  const updateAccount = useUpdateAccount();
  const canEdit = usePerm("edit_accounts");

  const [filter, setFilter] = useState<TypeFilter>("All");
  const [q, setQ] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const { visible: visibleCols, toggle: toggleCol } = useColumnVisibility(
    "bedrock-v2:vis:accounts",
    COLUMN_ORDER,
  );

  const { sort, toggle } = useSort<ColKey>({
    key: "openPipeline",
    direction: "desc",
  });
  const { widths, startResize } = useColumnWidths<ColKey>(
    "bedrock-v2:cols:accounts",
    DEFAULT_WIDTHS,
  );

  const accounts = accountsQ.data ?? [];
  const opps = oppsQ.data ?? [];

  const metricsByAccount = useMemo(() => buildMetricsMap(opps), [opps]);

  // Logos / domains from public.companies via the bridge map. Fetch once
  // for every visible account in a single batched request (cap 1000).
  const accountIds = useMemo(() => accounts.map((a) => a.Id), [accounts]);
  const enrichmentQ = useAccountsEnrichment(accountIds);
  const enrichment = enrichmentQ.data ?? {};

  const filtered = useMemo(() => {
    const f = accounts.filter(
      (a) =>
        matchesType(a, filter) &&
        (!q ||
          (a.Name ?? "").toLowerCase().includes(q.toLowerCase()) ||
          (a.Owner?.Name ?? "").toLowerCase().includes(q.toLowerCase())),
    );
    return sortBy(f, sort, (a, key) =>
      extractAccount(a, metricsByAccount.get(a.Id) ?? ZERO_METRICS, key),
    );
  }, [accounts, filter, q, sort, metricsByAccount]);

  const totals = useMemo(
    () =>
      filtered.reduce<AccountMetrics>(
        (acc, a) => {
          const m = metricsByAccount.get(a.Id);
          if (!m) return acc;
          return {
            openPipeline: acc.openPipeline + m.openPipeline,
            amountWon: acc.amountWon + m.amountWon,
            received: acc.received + m.received,
            outstanding: acc.outstanding + m.outstanding,
          };
        },
        { ...ZERO_METRICS },
      ),
    [filtered, metricsByAccount],
  );

  const ownerOptions = useMemo(
    () =>
      (usersQ.data ?? []).map((u) => ({
        value: u.Id,
        label: u.Name,
      })),
    [usersQ.data],
  );

  const saveOwner = useCallback(
    async (id: string, ownerId: string) => {
      // Resolve the owner's name so the row's display label updates
      // optimistically alongside OwnerId.
      const ownerName =
        (usersQ.data ?? []).find((u) => u.Id === ownerId)?.Name ?? null;
      await updateAccount.mutateAsync({
        id,
        patch: { OwnerId: ownerId },
        displayPatch: { Owner: { Name: ownerName } },
      });
    },
    [updateAccount, usersQ.data],
  );

  const isLoading = accountsQ.isLoading || oppsQ.isLoading;
  const isError = accountsQ.isError || oppsQ.isError;
  const error = accountsQ.error ?? oppsQ.error;

  const tableMinWidth = totalWidth(widths);

  // ── Virtualization ─────────────────────────────────────────────────
  const scrollRef = useRef<HTMLDivElement>(null);
  const virtualizer = useVirtualizer({
    count: filtered.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: (i) =>
      filtered[i]?.Id === expandedId ? ROW_HEIGHT + TASK_PANEL_HEIGHT : ROW_HEIGHT,
    overscan: 8,
  });
  useEffect(() => { virtualizer.measure(); }, [expandedId, virtualizer]);
  const virtualItems = virtualizer.getVirtualItems();
  const totalSize = virtualizer.getTotalSize();
  const paddingTop = virtualItems[0]?.start ?? 0;
  const paddingBottom =
    totalSize - (virtualItems[virtualItems.length - 1]?.end ?? 0);

  return (
    <div className="flex h-full flex-col px-7 py-6 pb-6">
      <PageHeader
        title="Accounts"
        subtitle={
          isLoading
            ? "Loading…"
            : `${accounts.length.toLocaleString()} funder organizations · ${fmtMoney(totals.openPipeline)} open pipeline · ${fmtMoney(totals.amountWon)} won`
        }
        actions={
          <>
            <button className="inline-flex h-[30px] items-center gap-1.5 rounded border border-border-strong bg-surface px-3 text-[13px] font-medium text-ink hover:bg-surface-2">
              <Sparkles size={14} /> Enrich with Donor Atlas
            </button>
            <button
              onClick={() => setShowCreate(true)}
              className="inline-flex h-[30px] items-center gap-1.5 rounded border border-ink bg-ink px-3 text-[13px] font-medium text-surface hover:opacity-90"
            >
              <Plus size={14} /> New account
            </button>
          </>
        }
      />

      <Toolbar>
        <ButtonGroup
          value={filter}
          onChange={(v) => setFilter(v as TypeFilter)}
          options={TYPE_FILTERS.map((t) => ({ value: t, label: t }))}
        />
        <div className="relative">
          <Search
            size={13}
            className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-ink-3"
          />
          <input
            placeholder="Search by name or owner"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="h-7 w-72 rounded border border-border-strong bg-surface pl-7 pr-3 text-[12.5px] text-ink outline-none focus:border-accent"
          />
        </div>
        <span className="ml-auto text-[11.5px] text-ink-3">
          {filtered.length.toLocaleString()} of {accounts.length.toLocaleString()}
        </span>
        <SavedViewsPicker
          storageKey="bedrock-v2:views:accounts"
          currentFilters={{ filter }}
          onLoad={(v) => setFilter(v.filter)}
        />
        <ColumnChooser
          allColumns={COLUMN_ORDER}
          labels={COL_LABELS}
          visible={visibleCols}
          required={["name"]}
          onToggle={toggleCol}
        />
      </Toolbar>

      {/*
        Single scroll container. Header is sticky, body is virtualized via
        spacer rows above + below the visible window. Total row count
        stays under ~30 in the DOM regardless of dataset size.
      */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-auto rounded-b-lg border border-border-strong bg-surface"
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
            {isLoading ? (
              <SkeletonRows colCount={visibleCols.length} />
            ) : isError ? (
              <tr>
                <td
                  colSpan={visibleCols.length}
                  className="px-7 py-10 text-center text-[13px] text-red"
                >
                  Failed to load accounts
                  {error instanceof Error ? `: ${error.message}` : ""}
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td
                  colSpan={visibleCols.length}
                  className="px-7 py-10 text-center text-[13px] text-ink-3"
                >
                  {accounts.length === 0
                    ? "No accounts. (Is Salesforce connected?)"
                    : "No accounts match your filters."}
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
                  const isExpanded = a.Id === expandedId;
                  return (
                    <Fragment key={a.Id}>
                      <AccountRow
                        a={a}
                        m={metricsByAccount.get(a.Id) ?? ZERO_METRICS}
                        logoUrl={enrichment[a.Id]?.logo_url ?? null}
                        ownerOptions={ownerOptions}
                        onOpen={() => navigate(`/accounts/${a.Id}`)}
                        onSaveOwner={(id) => saveOwner(a.Id, id)}
                        isExpanded={isExpanded}
                        onToggleExpand={() => setExpandedId(isExpanded ? null : a.Id)}
                        canEdit={canEdit}
                        visibleCols={visibleCols}
                      />
                      {isExpanded ? (
                        <tr>
                          <td colSpan={visibleCols.length} className="p-0">
                            <TaskExpandPanel scope={{ type: "account", accountId: a.Id }} />
                          </td>
                        </tr>
                      ) : null}
                    </Fragment>
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
          {filtered.length > 0 && !isLoading ? (
            <tfoot className="sticky bottom-0 z-10">
              <tr className="border-t border-border-strong bg-surface-2">
                {visibleCols.map((key, idx) => {
                  const totalsMap: Partial<Record<ColKey, string>> = {
                    openPipeline: fmtMoney(totals.openPipeline),
                    amountWon: fmtMoney(totals.amountWon),
                    received: fmtMoney(totals.received),
                    outstanding: fmtMoney(totals.outstanding),
                  };
                  const label = totalsMap[key];
                  if (idx === 0) {
                    return (
                      <td key={key} className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-ink-3">
                        Totals
                      </td>
                    );
                  }
                  return (
                    <td key={key} className="mono px-3 py-2 text-right text-[13px] font-semibold tabular-nums">
                      {label ?? ""}
                    </td>
                  );
                })}
              </tr>
            </tfoot>
          ) : null}
        </table>
      </div>

      {showCreate ? (
        <CreateAccountModal
          ownerOptions={ownerOptions}
          onClose={() => setShowCreate(false)}
          onCreated={(id) => {
            setShowCreate(false);
            navigate(`/accounts/${id}`);
          }}
        />
      ) : null}
    </div>
  );
}

function CreateAccountModal({
  ownerOptions,
  onClose,
  onCreated,
}: {
  ownerOptions: { value: string; label: string }[];
  onClose: () => void;
  onCreated: (id: string) => void;
}) {
  const createAccount = useCreateAccount();
  const [form, setForm] = useState({
    Name: "",
    Type: "",
    Industry: "",
    Website: "",
    BillingCity: "",
    BillingState: "",
    OwnerId: "",
  });
  const [error, setError] = useState<string | null>(null);

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.Name.trim()) return;
    setError(null);
    try {
      const result = await createAccount.mutateAsync({
        Name: form.Name.trim(),
        Type: form.Type || undefined,
        Industry: form.Industry.trim() || undefined,
        Website: form.Website.trim() || undefined,
        BillingCity: form.BillingCity.trim() || undefined,
        BillingState: form.BillingState.trim() || undefined,
        OwnerId: form.OwnerId || undefined,
      });
      onCreated(result.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create account.");
    }
  };

  const ACCT_TYPES = ["Prospect", "Customer", "Partner", "Government", "Foundation", "Corporation", "Other"];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="w-full max-w-md rounded-lg border border-border-strong bg-surface shadow-xl">
        <div className="flex items-center justify-between border-b border-border-strong px-5 py-3">
          <span className="text-[14px] font-semibold">New account</span>
          <button onClick={onClose} className="text-ink-3 hover:text-ink">
            <X size={16} />
          </button>
        </div>
        <form onSubmit={submit} className="flex flex-col gap-3 px-5 py-4">
          <AcctField label="Name *">
            <input
              value={form.Name}
              onChange={set("Name")}
              placeholder="Organization name"
              required
              className={acctInputCls}
            />
          </AcctField>
          <AcctField label="Type">
            <select value={form.Type} onChange={set("Type")} className={acctInputCls}>
              <option value="">— select type —</option>
              {ACCT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </AcctField>
          <AcctField label="Industry">
            <input
              value={form.Industry}
              onChange={set("Industry")}
              placeholder="Technology, Finance…"
              className={acctInputCls}
            />
          </AcctField>
          <AcctField label="Website">
            <input
              value={form.Website}
              onChange={set("Website")}
              placeholder="https://example.com"
              className={acctInputCls}
            />
          </AcctField>
          <div className="grid grid-cols-2 gap-3">
            <AcctField label="City">
              <input value={form.BillingCity} onChange={set("BillingCity")} placeholder="New York" className={acctInputCls} />
            </AcctField>
            <AcctField label="State">
              <input value={form.BillingState} onChange={set("BillingState")} placeholder="NY" className={acctInputCls} />
            </AcctField>
          </div>
          <AcctField label="Owner">
            <select value={form.OwnerId} onChange={set("OwnerId")} className={acctInputCls}>
              <option value="">— unassigned —</option>
              {ownerOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </AcctField>
          {error ? <p className="text-[12px] text-red-500">{error}</p> : null}
          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="rounded border border-border-strong px-3 py-1.5 text-[12.5px] font-medium text-ink-2 hover:bg-surface-2"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!form.Name.trim() || createAccount.isPending}
              className="rounded border border-ink bg-ink px-3 py-1.5 text-[12.5px] font-medium text-surface hover:opacity-90 disabled:opacity-50"
            >
              {createAccount.isPending ? "Creating…" : "Create account"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const acctInputCls =
  "w-full rounded border border-border-strong bg-surface px-2.5 py-1.5 text-[13px] text-ink outline-none focus:border-ink-3 placeholder:text-ink-4";

function AcctField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[10.5px] font-semibold uppercase tracking-wider text-ink-3">
        {label}
      </span>
      {children}
    </div>
  );
}

interface RowProps {
  a: SfAccount;
  m: AccountMetrics;
  logoUrl: string | null;
  ownerOptions: { value: string; label: string }[];
  onOpen: () => void;
  onSaveOwner: (ownerId: string) => Promise<void>;
  isExpanded: boolean;
  onToggleExpand: () => void;
  canEdit: boolean;
  visibleCols: ColKey[];
}

const AccountRow = memo(function AccountRow({
  a,
  m,
  logoUrl,
  ownerOptions,
  onOpen,
  onSaveOwner,
  isExpanded,
  onToggleExpand,
  canEdit,
  visibleCols,
}: RowProps) {
  const dash = <span className="text-ink-4">—</span>;

  const cells: Partial<Record<ColKey, React.ReactNode>> = {
    name: (
      <div className="flex items-center gap-2">
        <button
          onClick={(e) => { e.stopPropagation(); onToggleExpand(); }}
          className="flex-shrink-0 text-ink-4 hover:text-ink-2 transition-colors"
          aria-label={isExpanded ? "Collapse tasks" : "Expand tasks"}
        >
          {isExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
        </button>
        <AccountAvatar name={a.Name} logoUrl={logoUrl} website={a.Website} size={22} />
        <div className="min-w-0 flex-1 cursor-pointer" onClick={onOpen}>
          <span className="block truncate font-medium hover:underline" title={a.Name}>
            {a.Name}
          </span>
          {a.BillingCity || a.BillingState ? (
            <span className="block truncate text-[11px] text-ink-3">
              {[a.BillingCity, a.BillingState].filter(Boolean).join(", ")}
            </span>
          ) : null}
        </div>
      </div>
    ),
    owner: canEdit ? (
      <InlineSelect
        value={a.OwnerId}
        options={ownerOptions}
        onSave={onSaveOwner}
        renderValue={(v) => (
          <span className="truncate text-[12.5px] text-ink-2">
            {a.Owner?.Name ?? ownerOptions.find((o) => o.value === v)?.label ?? "—"}
          </span>
        )}
      />
    ) : (
      <span className="truncate text-[12.5px] text-ink-2">{a.Owner?.Name ?? "—"}</span>
    ),
    openPipeline: m.openPipeline > 0 ? fmtMoney(m.openPipeline) : dash,
    amountWon: m.amountWon > 0 ? fmtMoney(m.amountWon) : dash,
    received: m.received > 0 ? fmtMoney(m.received) : dash,
    outstanding: m.outstanding > 0 ? fmtMoney(m.outstanding) : dash,
  };

  const cellCls: Partial<Record<ColKey, string>> = {
    name: "overflow-hidden px-3 py-1 text-[13px]",
    owner: "overflow-hidden px-3 py-1 text-[12.5px] text-ink-2",
    openPipeline: cn(numCell, m.openPipeline > 0 && "font-semibold text-accent-ink"),
    amountWon: cn(numCell, m.amountWon > 0 && "font-semibold text-green"),
    received: cn(numCell, m.received > 0 && "font-medium text-green"),
    outstanding: cn(numCell, m.outstanding > 0 && "font-medium text-amber"),
  };

  const clickable = new Set<ColKey>(["openPipeline", "amountWon", "received", "outstanding"]);

  return (
    <tr
      className="group/row border-b border-border-strong hover:bg-surface-2"
      style={{ height: ROW_HEIGHT }}
    >
      {visibleCols.map((key) => (
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

const numCell =
  "mono px-3 py-1 text-right text-[13px] tabular-nums overflow-hidden truncate cursor-pointer";

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
