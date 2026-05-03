import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

import { api } from "@/lib/api";
import { ArrowLeft, ChevronDown, ChevronRight, ExternalLink, Mail, Pencil, Phone, Plus, Search, UserPlus, X } from "lucide-react";

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
import { useContacts, useCreateContact, useUpdateContact } from "@/services/contacts";
import { useAwards, type Award, type AwardStatus } from "@/services/awards";
import { useOpportunities, useOpportunityPriorStages, type PriorStage } from "@/services/opportunities";
import { useActiveUsers } from "@/services/users";
import type { SfContact, SfOpportunity } from "@/types/salesforce";

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

  // Engagement types — derived from RecordType.Name across the
  // account's opportunity history. Each type gets a status:
  //   won  (green)  — at least one opp of this type closed-won
  //   open (grey)   — currently in flight, no win yet
  //   lost (red)    — all opps of this type closed lost / withdrawn
  // Captures the actual relationship shape rather than user-set
  // checkboxes that often go stale.
  const engagementTypes = useMemo<{ name: string; status: "won" | "open" | "lost" }[]>(() => {
    const m = new Map<string, { won: boolean; open: boolean; lost: boolean }>();
    for (const o of opps) {
      const rt = o.RecordType?.Name;
      if (!rt) continue;
      const cur = m.get(rt) ?? { won: false, open: false, lost: false };
      if (isWon(o)) cur.won = true;
      else if (isLost(o)) cur.lost = true;
      else if (isOpen(o)) cur.open = true;
      m.set(rt, cur);
    }
    return Array.from(m.entries())
      .map(([name, s]) => ({
        name,
        status: s.won ? ("won" as const) : s.open ? ("open" as const) : ("lost" as const),
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [opps]);

  // Primary contact — first contact flagged Philanthropic_Contact__c,
  // falling back to the first contact in the list if none are flagged.
  const primaryContact = useMemo(() => {
    return (
      contacts.find((c) => c.Philanthropic_Contact__c) ??
      contacts[0] ??
      null
    );
  }, [contacts]);

  // Fetch the prior StageName for each lost opp so account owners can
  // see at what funnel position the opp was withdrawn / lost.
  const lostOppIds = useMemo(() => lostOpps.map((o) => o.Id), [lostOpps]);
  const priorStagesQ = useOpportunityPriorStages(lostOppIds);
  const priorStages = priorStagesQ.data ?? {};

  // Awards are the SoT for "what we've won" — they layer payment status
  // and reporting lifecycle onto closed-won opps. Filter to awards
  // whose opportunity_id is among this account's opps.
  const awardsQ = useAwards();
  const accountAwards = useMemo(() => {
    const oppIds = new Set(opps.map((o) => o.Id));
    return (awardsQ.data ?? []).filter((a) => oppIds.has(a.opportunity_id));
  }, [awardsQ.data, opps]);

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

      {/* Details + History — half width each on lg+, single column below. */}
      <div
        className={cn(
          "grid gap-x-4",
          wonOpps.length + lostOpps.length > 0
            ? "lg:grid-cols-2"
            : "grid-cols-1",
        )}
      >
        <SectionCard title="Details" collapsible={false}>
          <div className="flex flex-col gap-2 px-5 py-3">
            <DetailRow label="Account owner">
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
            </DetailRow>
            <DetailRow label="Engagement types">
              {engagementTypes.length === 0 ? (
                <span className="text-[12.5px] text-ink-4">—</span>
              ) : (
                <div className="flex flex-wrap gap-1">
                  {engagementTypes.map((t) => (
                    <Tag
                      key={t.name}
                      variant={
                        t.status === "won"
                          ? "green"
                          : t.status === "lost"
                            ? "red"
                            : "default"
                      }
                    >
                      {t.name}
                    </Tag>
                  ))}
                </div>
              )}
            </DetailRow>
            <DetailRow label="Primary contact">
              <PrimaryContactPicker
                accountId={account.Id}
                accountName={account.Name}
                accountContacts={contacts}
                primary={primaryContact}
              />
            </DetailRow>
          </div>
        </SectionCard>

        {wonOpps.length + lostOpps.length > 0 ? (
          <SectionCard title="History">
            <HistoryChart wonOpps={wonOpps} lostOpps={lostOpps} />
          </SectionCard>
        ) : null}
      </div>

      {/* Tasks — full width */}
      <AccountTasksSection accountId={account.Id} />

      {/* Activity timeline — full width */}
      <ActivityTimeline
        activities={activities}
        scopeKey={`account:${account.Id}`}
      />

      {/* Open opportunities */}
      {openOpps.length > 0 ? (
        <SectionCard title={`Open opportunities (${openOpps.length})`}>
          <OppTable opps={openOpps} />
        </SectionCard>
      ) : null}

      {/* Awards — pulled from bedrock.award (not opp.IsWon). Each row
          shows payment progress + status + reporting in the same compact
          format as the global Awards page. */}
      {accountAwards.length > 0 ? (
        <SectionCard title={`Awards (${accountAwards.length})`}>
          <AwardsForAccountTable awards={accountAwards} opps={opps} />
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
  asPrimary,
  previousPrimaryId,
}: {
  accountId: string;
  onClose: () => void;
  /** Mark the new contact as the account's primary on creation. */
  asPrimary?: boolean;
  /** Existing primary to demote (clear Philanthropic_Contact__c). */
  previousPrimaryId?: string | null;
}) {
  const createContact = useCreateContact();
  const updateContact = useUpdateContact();
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
      // Demote the previous primary first so we never have two flagged
      // at once even momentarily.
      if (asPrimary && previousPrimaryId) {
        await updateContact.mutateAsync({
          id: previousPrimaryId,
          patch: { Philanthropic_Contact__c: false },
        });
      }
      await createContact.mutateAsync({
        AccountId: accountId,
        FirstName: form.FirstName.trim() || undefined,
        LastName: form.LastName.trim(),
        Email: form.Email.trim() || undefined,
        Phone: form.Phone.trim() || undefined,
        Title: form.Title.trim() || undefined,
        Philanthropic_Contact__c: asPrimary || undefined,
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
          <span className="text-[14px] font-semibold">
            {asPrimary ? "Add primary contact" : "Add contact"}
          </span>
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

// ── Primary contact picker ────────────────────────────────────────────────

/**
 * Pencil button next to the primary-contact display opens a
 * full-screen modal — search field at top, scrollable list grouped
 * "On this account" / "Elsewhere in the org" / inline create-new
 * fallback when no match.
 */
function PrimaryContactPicker({
  accountId,
  accountName,
  accountContacts,
  primary,
}: {
  accountId: string;
  accountName: string;
  accountContacts: SfContact[];
  primary: SfContact | null;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="flex min-w-0 items-center gap-2">
        {primary ? (
          <Link
            to={`/contacts/${primary.Id}`}
            className="truncate text-[13px] text-ink-2 hover:underline"
            title={primary.Name ?? primary.Id}
          >
            {primary.Name ?? "—"}
          </Link>
        ) : (
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="text-[12.5px] text-accent underline-offset-2 hover:underline"
          >
            Set primary contact
          </button>
        )}
        {primary ? (
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="flex-shrink-0 rounded p-0.5 text-ink-3 hover:bg-surface-2 hover:text-ink"
            aria-label="Change primary contact"
          >
            <Pencil size={11} />
          </button>
        ) : null}
      </div>

      {open ? (
        <PrimaryContactPickerModal
          accountId={accountId}
          accountName={accountName}
          accountContacts={accountContacts}
          primary={primary}
          onClose={() => setOpen(false)}
        />
      ) : null}
    </>
  );
}

function PrimaryContactPickerModal({
  accountId,
  accountName,
  accountContacts,
  primary,
  onClose,
}: {
  accountId: string;
  accountName: string;
  accountContacts: SfContact[];
  primary: SfContact | null;
  onClose: () => void;
}) {
  const [q, setQ] = useState("");
  const [debouncedQ, setDebouncedQ] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [confirmReparent, setConfirmReparent] = useState<SfContact | null>(null);
  const updateContact = useUpdateContact();

  // Debounce so we don't re-filter the org-wide list on every keystroke.
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQ(q.trim().toLowerCase()), 150);
    return () => clearTimeout(t);
  }, [q]);

  // Fetch org-wide only after the user has typed — keeps initial open
  // snappy (account-only contacts already loaded by parent).
  const wantOrgWide = debouncedQ.length >= 2;
  const orgWideQ = useQuery({
    queryKey: ["contacts", "all"],
    queryFn: async () => {
      const { data } = await api.get<SfContact[]>("/api/salesforce/contacts");
      return data;
    },
    enabled: wantOrgWide,
    staleTime: 60_000,
  });

  const onAccount = useMemo(() => {
    const needle = debouncedQ;
    if (!needle) return accountContacts;
    return accountContacts.filter((c) =>
      contactMatches(c, needle),
    );
  }, [accountContacts, debouncedQ]);

  const offAccount = useMemo(() => {
    if (!wantOrgWide || !orgWideQ.data) return [];
    const onIds = new Set(accountContacts.map((c) => c.Id));
    return orgWideQ.data
      .filter((c) => !onIds.has(c.Id))
      .filter((c) => contactMatches(c, debouncedQ))
      .slice(0, 50);
  }, [orgWideQ.data, accountContacts, debouncedQ, wantOrgWide]);

  const promote = async (c: SfContact, opts: { reparent?: boolean } = {}) => {
    setBusyId(c.Id);
    try {
      // Demote previous primary first.
      if (primary && primary.Id !== c.Id) {
        await updateContact.mutateAsync({
          id: primary.Id,
          patch: { Philanthropic_Contact__c: false },
        });
      }
      const patch: Record<string, unknown> = { Philanthropic_Contact__c: true };
      if (opts.reparent) patch.AccountId = accountId;
      await updateContact.mutateAsync({
        id: c.Id,
        patch,
        displayPatch: opts.reparent
          ? { AccountId: accountId, Philanthropic_Contact__c: true }
          : { Philanthropic_Contact__c: true },
      });
      onClose();
    } finally {
      setBusyId(null);
    }
  };

  // Esc closes the modal.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !showCreate && !confirmReparent) onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, showCreate, confirmReparent]);

  return (
    <>
      <div
        className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 pt-[12vh]"
        onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      >
        <div className="w-full max-w-xl rounded-lg border border-border-strong bg-surface shadow-2xl">
          <div className="flex items-center justify-between border-b border-border-strong px-5 py-3">
            <div className="flex flex-col">
              <span className="text-[14px] font-semibold text-ink">
                {primary ? "Change primary contact" : "Set primary contact"}
              </span>
              <span className="text-[11.5px] text-ink-3">{accountName}</span>
            </div>
            <button
              onClick={onClose}
              className="rounded p-1 text-ink-3 hover:bg-surface-2 hover:text-ink"
              aria-label="Close"
            >
              <X size={16} />
            </button>
          </div>

          <div className="border-b border-border-strong px-4 py-2">
            <div className="flex items-center gap-2 rounded border border-border-strong bg-surface-2 px-2.5 focus-within:border-accent">
              <Search size={14} className="flex-shrink-0 text-ink-3" />
              <input
                autoFocus
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search by name, email, or title…"
                className="h-9 flex-1 bg-transparent text-[13px] text-ink outline-none"
              />
              {q ? (
                <button
                  type="button"
                  onClick={() => setQ("")}
                  className="text-ink-3 hover:text-ink"
                  aria-label="Clear search"
                >
                  <X size={12} />
                </button>
              ) : null}
            </div>
          </div>

          <div className="max-h-[420px] overflow-y-auto">
            {/* On-account section */}
            <PickerSection
              heading={`On this account · ${onAccount.length}`}
              empty={
                accountContacts.length === 0
                  ? "No contacts on this account yet."
                  : !debouncedQ
                    ? null
                    : "No matches on this account."
              }
            >
              {onAccount.map((c) => (
                <PickerRow
                  key={c.Id}
                  c={c}
                  isCurrent={primary?.Id === c.Id}
                  isBusy={busyId === c.Id}
                  onPick={() => promote(c)}
                />
              ))}
            </PickerSection>

            {/* Org-wide section (only after typing) */}
            {wantOrgWide ? (
              <PickerSection
                heading={`Elsewhere in the org · ${offAccount.length}${
                  offAccount.length === 50 ? " (showing 50)" : ""
                }`}
                empty={
                  orgWideQ.isLoading
                    ? "Searching…"
                    : offAccount.length === 0
                      ? "No matches in other accounts."
                      : null
                }
              >
                {offAccount.map((c) => (
                  <PickerRow
                    key={c.Id}
                    c={c}
                    isCurrent={false}
                    isBusy={busyId === c.Id}
                    fromAccount={c.Account?.Name ?? null}
                    onPick={() => setConfirmReparent(c)}
                  />
                ))}
              </PickerSection>
            ) : (
              <p className="px-5 py-2 text-[11.5px] text-ink-4">
                Type at least 2 characters to search across all accounts.
              </p>
            )}
          </div>

          <div className="border-t border-border-strong px-4 py-2">
            <button
              type="button"
              onClick={() => setShowCreate(true)}
              className="inline-flex items-center gap-2 rounded border border-border-strong bg-surface px-3 py-1.5 text-[12.5px] font-medium text-ink-2 hover:bg-surface-2"
            >
              <UserPlus size={12} /> Create new contact
            </button>
          </div>
        </div>
      </div>

      {/* Confirm dialog before re-parenting an off-account contact. */}
      {confirmReparent ? (
        <ConfirmReparentDialog
          contact={confirmReparent}
          targetAccount={accountName}
          busy={busyId === confirmReparent.Id}
          onCancel={() => setConfirmReparent(null)}
          onConfirm={async () => {
            const c = confirmReparent;
            setConfirmReparent(null);
            await promote(c, { reparent: true });
          }}
        />
      ) : null}

      {showCreate ? (
        <AddContactModal
          accountId={accountId}
          asPrimary
          previousPrimaryId={primary?.Id ?? null}
          onClose={() => {
            setShowCreate(false);
            onClose();
          }}
        />
      ) : null}
    </>
  );
}

function contactMatches(c: SfContact, needle: string): boolean {
  const hay = [
    c.Name,
    c.FirstName,
    c.LastName,
    c.Email,
    c.Title,
    c.Account?.Name,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  return hay.includes(needle);
}

function PickerSection({
  heading,
  empty,
  children,
}: {
  heading: string;
  empty?: string | null;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="sticky top-0 z-10 border-b border-border-strong bg-surface-2/90 px-5 py-1 text-[10.5px] font-semibold uppercase tracking-wider text-ink-3 backdrop-blur-sm">
        {heading}
      </div>
      {empty ? (
        <p className="px-5 py-3 text-[12px] text-ink-4">{empty}</p>
      ) : (
        <ul className="divide-y divide-border-strong">{children}</ul>
      )}
    </div>
  );
}

function PickerRow({
  c,
  isCurrent,
  isBusy,
  fromAccount,
  onPick,
}: {
  c: SfContact;
  isCurrent: boolean;
  isBusy: boolean;
  fromAccount?: string | null;
  onPick: () => void;
}) {
  return (
    <li>
      <button
        type="button"
        onClick={onPick}
        disabled={isCurrent || isBusy}
        className={cn(
          "flex w-full items-center gap-3 px-5 py-2.5 text-left hover:bg-surface-2 disabled:cursor-not-allowed",
          isCurrent && "opacity-60",
        )}
      >
        <div className="grid h-7 w-7 flex-shrink-0 place-items-center rounded-full bg-surface-2 text-[10px] font-semibold text-ink-2">
          {initials(c.Name ?? c.LastName ?? "")}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="truncate text-[13px] font-medium text-ink">
              {c.Name ?? "(no name)"}
            </span>
            {isCurrent ? (
              <span className="rounded bg-accent/15 px-1.5 py-px text-[10px] font-medium text-accent">
                current primary
              </span>
            ) : null}
          </div>
          <div className="mt-0.5 flex items-center gap-2 text-[11.5px] text-ink-3">
            {c.Title ? <span className="truncate">{c.Title}</span> : null}
            {c.Title && c.Email ? <span className="text-ink-4">·</span> : null}
            {c.Email ? <span className="truncate">{c.Email}</span> : null}
          </div>
        </div>
        {fromAccount ? (
          <span className="hidden flex-shrink-0 truncate text-right text-[11px] text-amber-700 sm:block">
            @ {fromAccount}
          </span>
        ) : null}
        {isBusy ? (
          <span className="text-[11px] text-ink-3">…</span>
        ) : null}
      </button>
    </li>
  );
}

function ConfirmReparentDialog({
  contact,
  targetAccount,
  busy,
  onCancel,
  onConfirm,
}: {
  contact: SfContact;
  targetAccount: string;
  busy: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const fromAccount = contact.Account?.Name ?? "their current account";
  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onCancel(); }}
    >
      <div className="w-full max-w-md rounded-lg border border-border-strong bg-surface shadow-2xl">
        <div className="border-b border-border-strong px-5 py-3 text-[14px] font-semibold text-ink">
          Move contact to {targetAccount}?
        </div>
        <div className="px-5 py-4 text-[13px] text-ink-2">
          <p>
            <strong>{contact.Name ?? "This contact"}</strong> is currently on{" "}
            <strong>{fromAccount}</strong>. Setting them as primary on{" "}
            <strong>{targetAccount}</strong> will reassign their AccountId in
            Salesforce.
          </p>
          <p className="mt-2 text-[12px] text-ink-3">
            They'll no longer appear as a contact on {fromAccount}.
          </p>
        </div>
        <div className="flex items-center justify-end gap-2 border-t border-border-strong px-5 py-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={busy}
            className="rounded border border-border-strong bg-surface px-3 py-1.5 text-[12.5px] text-ink-2 hover:bg-surface-2"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={busy}
            className="rounded bg-ink px-3 py-1.5 text-[12.5px] font-medium text-surface hover:opacity-90 disabled:opacity-60"
          >
            {busy ? "Moving…" : "Move and set as primary"}
          </button>
        </div>
      </div>
    </div>
  );
}

function SectionCard({
  title,
  action,
  children,
  defaultOpen = true,
  collapsible = true,
}: {
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
  collapsible?: boolean;
}) {
  // Persist collapse state per section title so the user's preference
  // carries across accounts. Key off title alone — same section name
  // means same intent regardless of which account you're viewing.
  const { open, toggle } = useCollapsible(
    `bedrock-v2:account-section:${title}`,
    defaultOpen,
  );
  const isOpen = collapsible ? open : true;
  return (
    <section className="mt-6 overflow-hidden rounded-lg border border-border-strong bg-surface shadow-sm">
      <div className="flex items-center justify-between border-b border-border-strong bg-surface-2 px-5 py-2.5">
        {collapsible ? (
          <button
            type="button"
            onClick={toggle}
            aria-expanded={isOpen}
            className="flex flex-1 items-center gap-2 text-left"
          >
            {isOpen ? (
              <ChevronDown size={12} className="flex-shrink-0 text-ink-3" />
            ) : (
              <ChevronRight size={12} className="flex-shrink-0 text-ink-3" />
            )}
            <span className="text-[12px] font-semibold uppercase tracking-wider text-ink-3">
              {title}
            </span>
          </button>
        ) : (
          <span className="text-[12px] font-semibold uppercase tracking-wider text-ink-3">
            {title}
          </span>
        )}
        {action ?? null}
      </div>
      {isOpen ? children : null}
    </section>
  );
}

/** Compact one-line label/value row used by the slimmed-down Details panel. */
function DetailRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3">
      <span className="w-[120px] flex-shrink-0 text-[10.5px] font-semibold uppercase tracking-wider text-ink-3 leading-[20px]">
        {label}
      </span>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return (
    <div className="px-5 py-8 text-center text-[12.5px] text-ink-3">{children}</div>
  );
}

// ── Awards table (account-scoped) ─────────────────────────────────────────

/**
 * Compact awards list for the AccountDetail page. Mirrors the Awards
 * page columns minus "Funder" (every row is the same account here).
 * Payment progress comes from the linked SF opp's npe01__Payments_Made__c
 * and Amount roll-ups; status from bedrock.award; reports from the
 * server-aggregated report_done / report_total / next_report_date fields
 * that ride along on the award row.
 */
function AwardsForAccountTable({
  awards,
  opps,
}: {
  awards: Award[];
  opps: SfOpportunity[];
}) {
  const oppById = useMemo(() => {
    const m = new Map<string, SfOpportunity>();
    for (const o of opps) m.set(o.Id, o);
    return m;
  }, [opps]);

  const totalAmount = awards.reduce(
    (s, a) => s + (oppById.get(a.opportunity_id)?.Amount ?? 0),
    0,
  );
  const totalPaid = awards.reduce(
    (s, a) => s + (oppById.get(a.opportunity_id)?.npe01__Payments_Made__c ?? 0),
    0,
  );
  const totalPending = Math.max(0, totalAmount - totalPaid);

  return (
    <div>
      <table className="w-full border-collapse text-[12.5px]">
        <thead className="border-b border-border-strong bg-surface-2/60">
          <tr className="text-[10.5px] uppercase tracking-wider text-ink-3">
            <th className="px-5 py-1.5 text-left font-semibold">Award</th>
            <th className="px-3 py-1.5 text-left font-semibold">Status</th>
            <th className="px-3 py-1.5 text-right font-semibold">Total</th>
            <th className="px-3 py-1.5 text-left font-semibold">Progress</th>
            <th className="px-3 py-1.5 text-right font-semibold">Paid</th>
            <th className="px-3 py-1.5 text-right font-semibold">Pending</th>
            <th className="px-3 py-1.5 text-left font-semibold">Reports</th>
            <th className="px-3 py-1.5 text-left font-semibold">Awarded</th>
          </tr>
        </thead>
        <tbody>
          {awards.map((a) => {
            const opp = oppById.get(a.opportunity_id);
            const total = opp?.Amount ?? 0;
            const paid = opp?.npe01__Payments_Made__c ?? 0;
            const pending = Math.max(0, total - paid);
            return (
              <tr
                key={a.id}
                className="border-b border-border-strong last:border-b-0"
              >
                <td className="px-5 py-2">
                  <Link
                    to={`/awards/${a.id}`}
                    className="block min-w-0 text-[13px] font-medium hover:underline"
                  >
                    {opp?.Name ?? a.opportunity_id}
                  </Link>
                  {opp?.RecordType?.Name ? (
                    <span className="text-[11px] text-ink-4">
                      {opp.RecordType.Name}
                    </span>
                  ) : null}
                </td>
                <td className="px-3 py-2">
                  <Tag variant={awardStatusVariant(a.award_status)}>
                    {a.award_status}
                  </Tag>
                </td>
                <td className="mono px-3 py-2 text-right font-medium tabular-nums">
                  {total > 0 ? fmtMoney(total) : <span className="text-ink-4">—</span>}
                </td>
                <td className="px-3 py-2">
                  {total > 0 ? (
                    <PaymentProgressBar paid={paid} total={total} />
                  ) : (
                    <span className="text-[11px] text-ink-4">—</span>
                  )}
                </td>
                <td className="mono px-3 py-2 text-right tabular-nums">
                  {paid > 0 ? (
                    <span className="text-green-700">{fmtMoney(paid)}</span>
                  ) : (
                    <span className="text-ink-4">—</span>
                  )}
                </td>
                <td className="mono px-3 py-2 text-right tabular-nums">
                  {pending > 0 ? (
                    <span className="text-amber-700">{fmtMoney(pending)}</span>
                  ) : (
                    <span className="text-ink-4">—</span>
                  )}
                </td>
                <td className="px-3 py-2">
                  <ReportsCell award={a} />
                </td>
                <td className="mono px-3 py-2 text-[11.5px] text-ink-3">
                  {fmtDate(a.award_date)}
                </td>
              </tr>
            );
          })}
        </tbody>
        <tfoot>
          <tr className="border-t border-border-strong bg-surface-2/60 text-[11.5px] font-semibold uppercase tracking-wider text-ink-3">
            <td className="px-5 py-2">Totals</td>
            <td className="px-3 py-2" />
            <td className="mono px-3 py-2 text-right tabular-nums text-ink">
              {fmtMoney(totalAmount)}
            </td>
            <td className="px-3 py-2" />
            <td className="mono px-3 py-2 text-right tabular-nums text-green-700">
              {fmtMoney(totalPaid)}
            </td>
            <td className="mono px-3 py-2 text-right tabular-nums text-amber-700">
              {fmtMoney(totalPending)}
            </td>
            <td className="px-3 py-2" colSpan={2} />
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

function awardStatusVariant(s: AwardStatus): "green" | "amber" | "default" | "red" {
  if (s === "Active") return "green";
  if (s === "Closing") return "amber";
  if (s === "Did Not Fulfill") return "red";
  return "default";
}

function PaymentProgressBar({ paid, total }: { paid: number; total: number }) {
  const pct = total > 0 ? Math.min(100, (paid / total) * 100) : 0;
  const allPaid = pct >= 99.9;
  return (
    <div className="flex w-full min-w-[120px] items-center gap-1.5">
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

function ReportsCell({ award }: { award: Award }) {
  const total = award.report_total;
  const done = award.report_done;
  const overdue = award.report_overdue > 0;
  const next = award.next_report_date;
  if (total === 0) {
    return <span className="text-[11px] text-ink-4">No schedule</span>;
  }
  const allDone = done === total;
  const dueColor = allDone
    ? "text-green-700"
    : overdue
      ? "text-red"
      : "text-ink-3";
  return (
    <div className="flex min-w-0 items-center gap-1.5 leading-tight">
      {total <= 6 ? (
        <div className="flex flex-shrink-0 items-center gap-0.5">
          {Array.from({ length: total }).map((_, i) => (
            <span
              key={i}
              className={cn(
                "inline-block h-2 w-2 rounded-full",
                i < done
                  ? "bg-green-500"
                  : overdue && i === done
                    ? "bg-red"
                    : "bg-surface-2 ring-1 ring-border-strong",
              )}
            />
          ))}
        </div>
      ) : (
        <span className={cn("mono flex-shrink-0 text-[11px] font-medium", dueColor)}>
          {done}/{total}
        </span>
      )}
      {next ? (
        <span className={cn("mono truncate text-[11px]", dueColor)}>
          {fmtDate(next)}
        </span>
      ) : allDone ? (
        <span className="text-[11px] text-green-700">Complete</span>
      ) : null}
    </div>
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
