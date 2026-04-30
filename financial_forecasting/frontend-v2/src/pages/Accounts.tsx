import { useMemo, useState } from "react";
import { Filter, Plus, Search, Sparkles } from "lucide-react";

import { PageHeader } from "@/components/PageHeader";
import { Tag } from "@/components/ui/Tag";
import { ButtonGroup, FilterPill, Toolbar } from "@/components/ui/Toolbar";
import { fmtDateShort, fmtMoney, initials } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useAccounts } from "@/services/accounts";
import type { SfAccount } from "@/types/salesforce";

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

export function AccountsPage() {
  const { data, isLoading, isError, error } = useAccounts();
  const [filter, setFilter] = useState<TypeFilter>("All");
  const [q, setQ] = useState("");

  const accounts = data ?? [];
  const filtered = useMemo(
    () =>
      accounts.filter(
        (a) =>
          matchesType(a, filter) &&
          (!q || (a.Name ?? "").toLowerCase().includes(q.toLowerCase())),
      ),
    [accounts, filter, q],
  );

  return (
    <div className="mx-auto max-w-[1320px] px-7 py-6 pb-20">
      <PageHeader
        title="Accounts"
        subtitle={
          isLoading
            ? "Loading…"
            : `${accounts.length.toLocaleString()} funder organizations`
        }
        actions={
          <>
            <button className="inline-flex h-[30px] items-center gap-1.5 rounded border border-border-strong bg-surface px-3 text-[13px] font-medium text-ink hover:bg-surface-2">
              <Sparkles size={14} /> Enrich with Donor Atlas
            </button>
            <button className="inline-flex h-[30px] items-center gap-1.5 rounded border border-ink bg-ink px-3 text-[13px] font-medium text-surface hover:opacity-90">
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
            placeholder="Search accounts"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="h-7 w-56 rounded border border-border-strong bg-surface pl-7 pr-3 text-[12.5px] text-ink outline-none focus:border-accent"
          />
        </div>
        <FilterPill>
          <Filter size={12} /> Tier <span className="text-ink-4">·</span> Any
        </FilterPill>
        <FilterPill>
          <Filter size={12} /> Owner <span className="text-ink-4">·</span> Any
        </FilterPill>
        <span className="ml-auto text-[11.5px] text-ink-3">
          {filtered.length.toLocaleString()} of {accounts.length.toLocaleString()}
        </span>
      </Toolbar>

      <div className="overflow-hidden rounded-b-lg border border-border-strong bg-surface">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              {[
                "Account",
                "Type",
                "Tier",
                "Industry",
                "Active opps",
                "Closed opps",
                "Lifetime",
                "Last activity",
              ].map((h, i) => (
                <th
                  key={h}
                  className={cn(
                    "border-b border-border-strong bg-surface-2 px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-ink-3",
                    i >= 4 && i <= 6 ? "text-right" : "text-left",
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
                  Failed to load accounts
                  {error instanceof Error ? `: ${error.message}` : ""}
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-7 py-10 text-center text-[13px] text-ink-3">
                  {accounts.length === 0
                    ? "No accounts. (Is Salesforce connected?)"
                    : "No accounts match your filters."}
                </td>
              </tr>
            ) : (
              filtered.map((a) => <AccountRow key={a.Id} a={a} />)
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function AccountRow({ a }: { a: SfAccount }) {
  const lifetime = a.npo02__TotalOppAmount__c ?? a.Total_Revenue_Generated__c ?? 0;
  const lastActivity = a.Last_Activity_Date__c ?? a.LastActivityDate ?? null;

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
            {initials(a.Name)}
          </div>
          <div className="flex min-w-0 flex-1 flex-col leading-tight">
            <span className="truncate font-medium">{a.Name}</span>
            {a.BillingCity || a.BillingState ? (
              <span className="truncate text-[11px] text-ink-3">
                {[a.BillingCity, a.BillingState].filter(Boolean).join(", ")}
              </span>
            ) : null}
          </div>
        </div>
      </td>
      <td className="px-3 py-2.5 text-[13px]">
        {a.Type ? <Tag>{a.Type}</Tag> : <span className="text-ink-4">—</span>}
      </td>
      <td className="px-3 py-2.5 text-[13px]">
        {a.Account_Tier__c ? (
          <Tag variant="accent">{a.Account_Tier__c}</Tag>
        ) : (
          <span className="text-ink-4">—</span>
        )}
      </td>
      <td className="px-3 py-2.5 text-[13px] text-ink-3">{a.Industry ?? "—"}</td>
      <td className="mono px-3 py-2.5 text-right text-[13px] tabular-nums">
        {/* Active opps not in current SF response — show — until we wire it */}
        <span className="text-ink-4">—</span>
      </td>
      <td className="mono px-3 py-2.5 text-right text-[13px] tabular-nums">
        {a.npo02__NumberOfClosedOpps__c ?? <span className="text-ink-4">—</span>}
      </td>
      <td className="mono px-3 py-2.5 text-right text-[13px] font-medium tabular-nums">
        {lifetime > 0 ? fmtMoney(lifetime) : <span className="text-ink-4">—</span>}
      </td>
      <td className="mono px-3 py-2.5 text-[11.5px] text-ink-3">
        {fmtDateShort(lastActivity)}
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
