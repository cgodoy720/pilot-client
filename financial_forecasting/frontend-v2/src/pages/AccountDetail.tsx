import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, ChevronDown, ChevronRight, ExternalLink, Mail, Phone, Plus, X } from "lucide-react";

import { AccountTasksSection } from "@/components/AccountTasksSection";
import { ActivityTimeline } from "@/components/ActivityTimeline";
import { InlineSelect, InlineText } from "@/components/ui/InlineEdit";
import { StageChip } from "@/components/ui/StageChip";
import { Tag } from "@/components/ui/Tag";
import { fmtDate, fmtMoney, fmtMoneyFull, initials } from "@/lib/format";
import { useCollapsible } from "@/lib/collapsible";
import { isLost, isOpen, isWon, stageStatus } from "@/lib/stages";
import { cn } from "@/lib/utils";
import { useAccounts, useUpdateAccount } from "@/services/accounts";
import { useAccountFullActivities } from "@/services/activities";
import { useContacts, useCreateContact } from "@/services/contacts";
import { useOpportunities, useOpportunityPriorStages, type PriorStage } from "@/services/opportunities";
import { useActiveUsers } from "@/services/users";
import type { SfOpportunity } from "@/types/salesforce";

const ACCOUNT_TYPE_OPTIONS = [
  { value: "Prospect", label: "Prospect" },
  { value: "Customer", label: "Customer" },
  { value: "Partner", label: "Partner" },
  { value: "Government", label: "Government" },
  { value: "Foundation", label: "Foundation" },
  { value: "Corporation", label: "Corporation" },
  { value: "Other", label: "Other" },
];

const ACCOUNT_TIER_OPTIONS = [
  { value: "Tier 1", label: "Tier 1" },
  { value: "Tier 2", label: "Tier 2" },
  { value: "Tier 3", label: "Tier 3" },
  { value: "Tier 4", label: "Tier 4" },
];

export function AccountDetailPage() {
  const { id = "" } = useParams<{ id: string }>();

  const { data: accounts } = useAccounts();
  const account = useMemo(
    () => (accounts ?? []).find((a) => a.Id === id),
    [accounts, id],
  );

  const { data: contacts = [] } = useContacts(id);
  const { data: allOpps = [] } = useOpportunities();
  const opps = useMemo(
    () => allOpps.filter((o) => o.AccountId === id),
    [allOpps, id],
  );
  const { data: activities = [] } = useAccountFullActivities(id, 150);
  const usersQ = useActiveUsers();
  const updateAccount = useUpdateAccount();

  const ownerOptions = useMemo(
    () => (usersQ.data ?? []).map((u) => ({ value: u.Id, label: u.Name })),
    [usersQ.data],
  );

  const [showAddContact, setShowAddContact] = useState(false);

  if (!account) {
    return (
      <div className="mx-auto max-w-[1320px] px-7 py-6">
        <BackLink />
        <div className="mt-6 rounded-lg border border-border-strong bg-surface p-10 text-center text-[13px] text-ink-3 shadow-sm">
          Loading account…
        </div>
      </div>
    );
  }

  const patch = (field: string, val: unknown) =>
    updateAccount.mutateAsync({ id: account.Id, patch: { [field]: val } }).then(() => undefined);

  const saveOwner = async (ownerId: string) => {
    const ownerName = (usersQ.data ?? []).find((u) => u.Id === ownerId)?.Name ?? null;
    await updateAccount.mutateAsync({
      id: account.Id,
      patch: { OwnerId: ownerId },
      displayPatch: { Owner: { Name: ownerName } },
    });
  };

  const closedCount = account.npo02__NumberOfClosedOpps__c ?? 0;
  const lastActivity = account.Last_Activity_Date__c ?? account.LastActivityDate ?? null;

  const openOpps = opps.filter(isOpen);
  const wonOpps = opps.filter(isWon);
  const lostOpps = opps.filter(isLost);

  // Lifetime is computed from wonOpps so it matches the History chart
  // and "Awarded" section line-by-line. (NPSP's roll-up
  // npo02__TotalOppAmount__c uses SF's strict "IsWon" picklist values,
  // which differs from our award-eligibility set — using NPSP here led
  // to the headline disagreeing with the chart.)
  const lifetime = wonOpps.reduce((s, o) => s + (o.Amount ?? 0), 0);

  // Fetch the prior StageName for each lost opp so account owners can
  // see at what funnel position the opp was withdrawn / lost.
  const lostOppIds = useMemo(() => lostOpps.map((o) => o.Id), [lostOpps]);
  const priorStagesQ = useOpportunityPriorStages(lostOppIds);
  const priorStages = priorStagesQ.data ?? {};

  return (
    <div className="mx-auto max-w-[1320px] px-7 py-6 pb-20">
      <BackLink />

      {/* Header */}
      <div className="mt-4 flex items-start gap-4">
        <div
          className="grid h-12 w-12 flex-shrink-0 place-items-center rounded-md text-[16px] font-semibold text-surface"
          style={{
            background:
              "linear-gradient(135deg, oklch(0.65 0.10 250), oklch(0.50 0.13 270))",
          }}
        >
          {initials(account.Name)}
        </div>
        <div className="flex-1 min-w-0">
          <InlineText
            value={account.Name}
            onSave={(v) => patch("Name", v)}
            className="text-[24px] font-bold leading-tight tracking-tight text-ink py-0"
          />
          <div className="mt-1 flex flex-wrap items-center gap-2 text-[12.5px] text-ink-3">
            {account.Type ? <Tag>{account.Type}</Tag> : null}
            {account.Account_Tier__c ? (
              <Tag variant="accent">{account.Account_Tier__c}</Tag>
            ) : null}
            {account.Industry ? <span>· {account.Industry}</span> : null}
            {account.BillingCity ? (
              <span>
                · {[account.BillingCity, account.BillingState].filter(Boolean).join(", ")}
              </span>
            ) : null}
            {account.Owner?.Name ? <span>· Owner: {account.Owner.Name}</span> : null}
          </div>
        </div>
        {account.Website ? (
          <a
            href={
              account.Website.startsWith("http") ? account.Website : `https://${account.Website}`
            }
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-[30px] items-center gap-1.5 rounded border border-border-strong bg-surface px-3 text-[13px] font-medium text-ink-2 hover:bg-surface-2"
          >
            <ExternalLink size={14} /> Website
          </a>
        ) : null}
      </div>

      {/* Stats row */}
      <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
        <Stat label="Lifetime" value={lifetime > 0 ? fmtMoneyFull(lifetime) : "—"} />
        <Stat label="Closed opps" value={closedCount > 0 ? String(closedCount) : "—"} />
        <Stat label="Open opps" value={String(openOpps.length)} />
        <Stat label="Last activity" value={fmtDate(lastActivity)} />
      </div>

      {/* Outcomes over time */}
      {wonOpps.length + lostOpps.length > 0 ? (
        <SectionCard title="History">
          <HistoryChart wonOpps={wonOpps} lostOpps={lostOpps} />
        </SectionCard>
      ) : null}

      {/* Editable details */}
      <SectionCard title="Details">
        <div className="grid grid-cols-2 gap-x-8 gap-y-3 px-5 py-4 md:grid-cols-3">
          <EditField label="Owner">
            <InlineSelect
              value={account.OwnerId ?? null}
              options={ownerOptions}
              onSave={saveOwner}
              renderValue={() => (
                <span className="text-[13px] text-ink-2">
                  {account.Owner?.Name ?? ownerOptions.find((o) => o.value === account.OwnerId)?.label ?? "—"}
                </span>
              )}
            />
          </EditField>
          <EditField label="Type">
            <InlineSelect
              value={account.Type ?? null}
              options={ACCOUNT_TYPE_OPTIONS}
              onSave={(v) => patch("Type", v)}
              emptyLabel="—"
            />
          </EditField>
          <EditField label="Account tier">
            <InlineSelect
              value={account.Account_Tier__c ?? null}
              options={ACCOUNT_TIER_OPTIONS}
              onSave={(v) => patch("Account_Tier__c", v)}
              emptyLabel="—"
            />
          </EditField>
          <EditField label="Industry">
            <InlineText
              value={account.Industry ?? ""}
              onSave={(v) => patch("Industry", v)}
              placeholder="—"
            />
          </EditField>
          <EditField label="Website">
            <InlineText
              value={account.Website ?? ""}
              onSave={(v) => patch("Website", v)}
              placeholder="—"
            />
          </EditField>
          <EditField label="Phone">
            <InlineText
              value={account.Phone ?? ""}
              onSave={(v) => patch("Phone", v)}
              placeholder="—"
            />
          </EditField>
          <EditField label="City">
            <InlineText
              value={account.BillingCity ?? ""}
              onSave={(v) => patch("BillingCity", v)}
              placeholder="—"
            />
          </EditField>
          <EditField label="State">
            <InlineText
              value={account.BillingState ?? ""}
              onSave={(v) => patch("BillingState", v)}
              placeholder="—"
            />
          </EditField>
        </div>
      </SectionCard>

      {/* Description */}
      <SectionCard title="About">
        <div className="px-5 py-3">
          <InlineText
            value={account.Description ?? ""}
            onSave={(v) => patch("Description", v)}
            placeholder="Add a description…"
            multiline
          />
        </div>
      </SectionCard>

      {/* Open opportunities */}
      {openOpps.length > 0 ? (
        <SectionCard title={`Open opportunities (${openOpps.length})`}>
          <OppTable opps={openOpps} />
        </SectionCard>
      ) : null}

      <AccountTasksSection accountId={account.Id} />

      {/* Closed-won opportunities */}
      {wonOpps.length > 0 ? (
        <SectionCard title={`Awarded / closed-won (${wonOpps.length})`}>
          <OppTable opps={wonOpps} />
        </SectionCard>
      ) : null}

      {/* Closed-lost / withdrawn opportunities */}
      {lostOpps.length > 0 ? (
        <SectionCard title={`Closed lost / withdrawn (${lostOpps.length})`}>
          <OppTable opps={lostOpps} priorStages={priorStages} showPriorStage />
        </SectionCard>
      ) : null}

      {/* Contacts */}
      <SectionCard
        title={`Contacts (${contacts.length})`}
        action={
          <button
            onClick={() => setShowAddContact(true)}
            className="inline-flex items-center gap-1 rounded border border-border-strong bg-surface px-2 py-0.5 text-[11px] font-medium text-ink-2 hover:bg-surface-2"
          >
            <Plus size={11} /> Add
          </button>
        }
      >
        {contacts.length === 0 ? (
          <Empty>No contacts on this account.</Empty>
        ) : (
          <table className="w-full border-collapse">
            <tbody>
              {contacts.map((c) => (
                <tr
                  key={c.Id}
                  className="border-b border-border-strong last:border-b-0"
                >
                  <td className="px-5 py-2.5 text-[13px]">
                    <div className="flex items-center gap-2.5">
                      <div className="grid h-6 w-6 place-items-center rounded-full bg-surface-2 text-[10px] font-semibold text-ink-2">
                        {initials(`${c.FirstName ?? ""} ${c.LastName ?? ""}`.trim() || "?")}
                      </div>
                      <div className="flex flex-col leading-tight">
                        <span className="font-medium">
                          {[c.FirstName, c.LastName].filter(Boolean).join(" ") || c.Name || "—"}
                        </span>
                        {c.Title ? (
                          <span className="text-[11.5px] text-ink-3">{c.Title}</span>
                        ) : null}
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-2.5 text-[12.5px] text-ink-2">
                    {c.Email ? (
                      <a
                        href={`mailto:${c.Email}`}
                        className="inline-flex items-center gap-1 hover:text-accent-ink"
                      >
                        <Mail size={12} /> {c.Email}
                      </a>
                    ) : null}
                  </td>
                  <td className="px-5 py-2.5 text-[12.5px] text-ink-3">
                    {c.Phone || c.MobilePhone ? (
                      <span className="inline-flex items-center gap-1">
                        <Phone size={12} /> {c.Phone || c.MobilePhone}
                      </span>
                    ) : null}
                  </td>
                  <td className="mono px-5 py-2.5 text-right text-[11.5px] text-ink-3">
                    {fmtDate(c.Last_Activity_Date__c ?? c.LastActivityDate)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </SectionCard>

      {/* Activity timeline */}
      <ActivityTimeline activities={activities} grouped />

      <div className="h-3" />
      <p className="mt-2 text-[11px] text-ink-4">
        SF Id: <span className="mono">{account.Id}</span>
      </p>

      {showAddContact ? (
        <AddContactModal
          accountId={account.Id}
          onClose={() => setShowAddContact(false)}
        />
      ) : null}
    </div>
  );
}

function AddContactModal({
  accountId,
  onClose,
}: {
  accountId: string;
  onClose: () => void;
}) {
  const createContact = useCreateContact();
  const [form, setForm] = useState({
    FirstName: "",
    LastName: "",
    Email: "",
    Phone: "",
    Title: "",
  });
  const [error, setError] = useState<string | null>(null);

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.LastName.trim()) return;
    setError(null);
    try {
      await createContact.mutateAsync({
        AccountId: accountId,
        FirstName: form.FirstName.trim() || undefined,
        LastName: form.LastName.trim(),
        Email: form.Email.trim() || undefined,
        Phone: form.Phone.trim() || undefined,
        Title: form.Title.trim() || undefined,
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create contact.");
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="w-full max-w-md rounded-lg border border-border-strong bg-surface shadow-xl">
        <div className="flex items-center justify-between border-b border-border-strong px-5 py-3">
          <span className="text-[14px] font-semibold">Add contact</span>
          <button onClick={onClose} className="text-ink-3 hover:text-ink">
            <X size={16} />
          </button>
        </div>
        <form onSubmit={submit} className="flex flex-col gap-3 px-5 py-4">
          <div className="grid grid-cols-2 gap-3">
            <Field label="First name">
              <input
                value={form.FirstName}
                onChange={set("FirstName")}
                placeholder="Jane"
                className={inputCls}
              />
            </Field>
            <Field label="Last name *">
              <input
                value={form.LastName}
                onChange={set("LastName")}
                placeholder="Doe"
                required
                className={inputCls}
              />
            </Field>
          </div>
          <Field label="Email">
            <input
              type="email"
              value={form.Email}
              onChange={set("Email")}
              placeholder="jane@example.com"
              className={inputCls}
            />
          </Field>
          <Field label="Phone">
            <input
              value={form.Phone}
              onChange={set("Phone")}
              placeholder="(555) 555-5555"
              className={inputCls}
            />
          </Field>
          <Field label="Title">
            <input
              value={form.Title}
              onChange={set("Title")}
              placeholder="VP of Engineering"
              className={inputCls}
            />
          </Field>
          {error ? (
            <p className="text-[12px] text-red-500">{error}</p>
          ) : null}
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
              disabled={!form.LastName.trim() || createContact.isPending}
              className="rounded border border-ink bg-ink px-3 py-1.5 text-[12.5px] font-medium text-surface hover:opacity-90 disabled:opacity-50"
            >
              {createContact.isPending ? "Creating…" : "Create contact"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const inputCls =
  "w-full rounded border border-border-strong bg-surface px-2.5 py-1.5 text-[13px] text-ink outline-none focus:border-ink-3 placeholder:text-ink-4";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[10.5px] font-semibold uppercase tracking-wider text-ink-3">
        {label}
      </span>
      {children}
    </div>
  );
}

function BackLink() {
  return (
    <Link
      to="/accounts"
      className="inline-flex items-center gap-1 text-[12.5px] text-ink-3 hover:text-ink"
    >
      <ArrowLeft size={14} /> Accounts
    </Link>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-border-strong bg-surface px-4 py-3 shadow-sm">
      <div className="text-[10.5px] font-semibold uppercase tracking-wider text-ink-3">
        {label}
      </div>
      <div className="mono mt-1 text-[18px] font-semibold tabular-nums">{value}</div>
    </div>
  );
}

// ── History chart ─────────────────────────────────────────────────────────

/**
 * Year-by-year outcomes for an account: won (green) vs lost (red),
 * sized by total $ amount per bucket. Years with zero activity render
 * as empty columns so gaps in the relationship are visible at a
 * glance (e.g. won 2018-2019, lost 2020-2025, won 2026 again).
 */
function HistoryChart({
  wonOpps,
  lostOpps,
}: {
  wonOpps: SfOpportunity[];
  lostOpps: SfOpportunity[];
}) {
  type YearBucket = {
    year: number;
    wonAmount: number;
    wonCount: number;
    lostAmount: number;
    lostCount: number;
  };

  const buckets = useMemo<YearBucket[]>(() => {
    const m = new Map<number, YearBucket>();
    const add = (y: number) => {
      let b = m.get(y);
      if (!b) {
        b = { year: y, wonAmount: 0, wonCount: 0, lostAmount: 0, lostCount: 0 };
        m.set(y, b);
      }
      return b;
    };
    for (const o of wonOpps) {
      if (!o.CloseDate) continue;
      const y = new Date(o.CloseDate).getUTCFullYear();
      if (!Number.isFinite(y)) continue;
      const b = add(y);
      b.wonAmount += o.Amount ?? 0;
      b.wonCount += 1;
    }
    for (const o of lostOpps) {
      if (!o.CloseDate) continue;
      const y = new Date(o.CloseDate).getUTCFullYear();
      if (!Number.isFinite(y)) continue;
      const b = add(y);
      b.lostAmount += o.Amount ?? 0;
      b.lostCount += 1;
    }
    if (m.size === 0) return [];
    const minY = Math.min(...m.keys());
    const maxY = Math.max(Math.max(...m.keys()), new Date().getUTCFullYear());
    const out: YearBucket[] = [];
    for (let y = minY; y <= maxY; y++) {
      out.push(
        m.get(y) ?? {
          year: y,
          wonAmount: 0,
          wonCount: 0,
          lostAmount: 0,
          lostCount: 0,
        },
      );
    }
    return out;
  }, [wonOpps, lostOpps]);

  if (buckets.length === 0) return null;

  const maxAmount = Math.max(
    1,
    ...buckets.map((b) => Math.max(b.wonAmount, b.lostAmount)),
  );

  const totalWon = buckets.reduce((s, b) => s + b.wonAmount, 0);
  const totalLost = buckets.reduce((s, b) => s + b.lostAmount, 0);
  const totalWonCount = buckets.reduce((s, b) => s + b.wonCount, 0);
  const totalLostCount = buckets.reduce((s, b) => s + b.lostCount, 0);

  return (
    <div className="px-5 py-2.5">
      <div className="flex items-center justify-between text-[11px] text-ink-3">
        <div className="flex items-center gap-2.5">
          <span className="inline-flex items-center gap-1">
            <LegendDot color="bg-green-500" /> {totalWonCount} · {fmtMoney(totalWon)}
          </span>
          <span className="inline-flex items-center gap-1">
            <LegendDot color="bg-red" /> {totalLostCount} · {fmtMoney(totalLost)}
          </span>
        </div>
        <span className="text-ink-4">{buckets[0].year}–{buckets[buckets.length - 1].year}</span>
      </div>

      <div className="mt-1.5 flex items-end gap-1 overflow-x-auto pb-0.5">
        {buckets.map((b) => {
          const wonPct = (b.wonAmount / maxAmount) * 100;
          const lostPct = (b.lostAmount / maxAmount) * 100;
          const empty = b.wonCount === 0 && b.lostCount === 0;
          const tooltip = empty
            ? `${b.year}: no activity`
            : [
                `${b.year}`,
                b.wonCount > 0 ? `Won: ${b.wonCount} · ${fmtMoneyFull(b.wonAmount)}` : null,
                b.lostCount > 0 ? `Lost: ${b.lostCount} · ${fmtMoneyFull(b.lostAmount)}` : null,
              ]
                .filter(Boolean)
                .join("\n");
          return (
            <div
              key={b.year}
              className="flex min-w-[22px] flex-1 flex-col items-center gap-0.5"
              title={tooltip}
            >
              <div className="flex h-[56px] w-full items-end justify-center gap-px">
                <BarSegment pct={wonPct} className="bg-green-500" />
                <BarSegment pct={lostPct} className="bg-red" />
              </div>
              <span className={cn(
                "mono text-[9.5px] tabular-nums leading-none",
                empty ? "text-ink-4" : "text-ink-2",
              )}>
                {`'${b.year % 100 < 10 ? `0${b.year % 100}` : b.year % 100}`}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function BarSegment({ pct, className }: { pct: number; className: string }) {
  // Empty bars render as a 1px line at the baseline so the year still
  // has a visible column anchor.
  const visible = pct > 0.5;
  return (
    <div
      className={cn(
        "w-1.5 rounded-t transition-all",
        visible ? className : "bg-surface-2",
      )}
      style={{ height: visible ? `${pct}%` : "1px" }}
    />
  );
}

function LegendDot({ color }: { color: string }) {
  return <span className={cn("inline-block h-2 w-2 rounded-full", color)} />;
}

function SectionCard({
  title,
  action,
  children,
  defaultOpen = true,
}: {
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  // Persist collapse state per section title so the user's preference
  // carries across accounts. Key off title alone — same section name
  // means same intent regardless of which account you're viewing.
  const { open, toggle } = useCollapsible(
    `bedrock-v2:account-section:${title}`,
    defaultOpen,
  );
  return (
    <section className="mt-6 overflow-hidden rounded-lg border border-border-strong bg-surface shadow-sm">
      <div className="flex items-center justify-between border-b border-border-strong bg-surface-2 px-5 py-2.5">
        <button
          type="button"
          onClick={toggle}
          aria-expanded={open}
          className="flex flex-1 items-center gap-2 text-left"
        >
          {open ? (
            <ChevronDown size={12} className="flex-shrink-0 text-ink-3" />
          ) : (
            <ChevronRight size={12} className="flex-shrink-0 text-ink-3" />
          )}
          <span className="text-[12px] font-semibold uppercase tracking-wider text-ink-3">
            {title}
          </span>
        </button>
        {action ?? null}
      </div>
      {open ? children : null}
    </section>
  );
}

function EditField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[10.5px] font-semibold uppercase tracking-wider text-ink-3">
        {label}
      </span>
      {children}
    </div>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return (
    <div className="px-5 py-8 text-center text-[12.5px] text-ink-3">{children}</div>
  );
}

function OppTable({
  opps,
  priorStages,
  showPriorStage,
}: {
  opps: SfOpportunity[];
  priorStages?: Record<string, PriorStage>;
  showPriorStage?: boolean;
}) {
  return (
    <table className="w-full border-collapse">
      <tbody>
        {opps.map((o) => {
          const prior = showPriorStage ? priorStages?.[o.Id] : undefined;
          return (
            <tr
              key={o.Id}
              className="border-b border-border-strong last:border-b-0"
            >
              <td className="px-5 py-2.5">
                <Link
                  to={`/opportunities/${o.Id}`}
                  className={cn(
                    "block min-w-0 text-[13px] font-medium hover:underline",
                  )}
                >
                  {o.Name}
                </Link>
                {o.NextStep ? (
                  <div className="mt-0.5 line-clamp-1 text-[11.5px] text-ink-3">
                    {o.NextStep}
                  </div>
                ) : null}
              </td>
              <td className="px-3 py-2.5">
                <div className="flex flex-col gap-0.5 leading-tight">
                  <StageChip stage={o.StageName} status={stageStatus(o)} />
                  {showPriorStage && prior?.prior_stage ? (
                    <span className="text-[10.5px] text-ink-3" title="Stage just before close">
                      from {prior.prior_stage}
                    </span>
                  ) : null}
                </div>
              </td>
              <td className="mono px-3 py-2.5 text-right text-[13px] font-medium tabular-nums">
                {o.Amount ? fmtMoney(o.Amount) : <span className="text-ink-4">—</span>}
              </td>
              <td className="mono px-3 py-2.5 text-[11.5px] text-ink-3">
                {fmtDate(o.CloseDate)}
              </td>
              <td className="px-3 py-2.5 text-[12px] text-ink-2">
                {o.Owner?.Name ?? "—"}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
