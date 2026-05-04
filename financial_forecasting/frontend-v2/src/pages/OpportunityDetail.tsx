import { useMemo, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { ExternalLink, Plus } from "lucide-react";

import { AccountAvatar } from "@/components/AccountAvatar";
import { ActivityTimeline } from "@/components/ActivityTimeline";
import { OppTasksSection } from "@/components/OppTasksSection";
import { PaymentScheduleBuilder } from "@/components/PaymentScheduleBuilder";
import {
  BackLink as SharedBackLink,
  DetailRow,
  EditField,
  Empty,
  SectionCard,
  Stat,
} from "@/components/detail";
import { AccountPicker } from "@/components/ui/AccountPicker";
import { InlineDate, InlineSelect, InlineText } from "@/components/ui/InlineEdit";
import { StageChip } from "@/components/ui/StageChip";
import { Tag } from "@/components/ui/Tag";
import { fmtDate, fmtMoneyFull } from "@/lib/format";
import { SF_STAGE_OPTIONS, isOpen, stageStatus } from "@/lib/stages";
import { cn } from "@/lib/utils";
import { useAccountEnrichment, useAccounts } from "@/services/accounts";
import { useActivities } from "@/services/activities";
import { useAwards } from "@/services/awards";
import { useContacts } from "@/services/contacts";
import {
  useOpportunities,
  useOpportunityPayments,
  useUpdateOpportunity,
  useUpdateOpportunityStage,
} from "@/services/opportunities";
import { useActiveUsers } from "@/services/users";
import type { SfOpportunity } from "@/types/salesforce";

const LEAD_SOURCE_OPTIONS: { value: string; label: string }[] = [
  { value: "Web", label: "Web" },
  { value: "Phone Inquiry", label: "Phone Inquiry" },
  { value: "Partner Referral", label: "Partner Referral" },
  { value: "Purchased List", label: "Purchased List" },
  { value: "Other", label: "Other" },
  { value: "Word of mouth", label: "Word of mouth" },
  { value: "Event", label: "Event" },
  { value: "Internal", label: "Internal" },
];

/** Filter values for the Payments section pill toggle. */
type PaymentFilter = "all" | "open" | "paid";

export function OpportunityDetailPage() {
  const { id = "" } = useParams<{ id: string }>();
  const location = useLocation();

  const { data: opps } = useOpportunities();
  const opp = useMemo(
    () => (opps ?? []).find((o) => o.Id === id),
    [opps, id],
  );

  const { data: payments = [] } = useOpportunityPayments(id);
  const { data: activities = [] } = useActivities({ opportunityId: id, limit: 30 });
  const { data: awards = [] } = useAwards();
  const enrichment = useAccountEnrichment(opp?.AccountId ?? null);
  // Pull contacts on the parent account so the primary-contact picker
  // only suggests people who actually belong to this account.
  const { data: accountContacts = [] } = useContacts(opp?.AccountId ?? undefined);
  // Full account list — feeds the inline Account picker (search-based,
  // since the org has 20K accounts and a `<select>` would jank).
  const { data: accountsData = [] } = useAccounts();
  const usersQ = useActiveUsers();

  const updateOpp = useUpdateOpportunity();
  const updateStage = useUpdateOpportunityStage();

  const ownerOptions = useMemo(
    () => (usersQ.data ?? []).map((u) => ({ value: u.Id, label: u.Name })),
    [usersQ.data],
  );

  const accountOptions = useMemo(
    () =>
      accountsData
        .map((a) => ({ value: a.Id, label: a.Name }))
        .sort((a, b) => a.label.localeCompare(b.label)),
    [accountsData],
  );

  // Whether to show the payment-schedule modal — controlled at the
  // page level so the action button on the Payments section can open
  // it and the modal can dismiss back to the page cleanly.
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);

  const award = useMemo(
    () => awards.find((a) => a.opportunity_id === id) ?? null,
    [awards, id],
  );

  if (!opp) {
    return (
      <div className="mx-auto max-w-[1320px] px-7 py-6">
        <BackLink />
        <div className="mt-6 rounded-lg border border-border-strong bg-surface p-10 text-center text-[13px] text-ink-3 shadow-sm">
          Loading opportunity…
        </div>
      </div>
    );
  }

  const patch = (field: string, val: unknown): Promise<void> =>
    updateOpp.mutateAsync({ id: opp.Id, patch: { [field]: val } }).then(() => undefined);

  const saveOwner = async (ownerId: string) => {
    const ownerName = (usersQ.data ?? []).find((u) => u.Id === ownerId)?.Name ?? null;
    await updateOpp.mutateAsync({
      id: opp.Id,
      patch: { OwnerId: ownerId },
      displayPatch: { Owner: { Name: ownerName } },
    });
  };

  const totalPaid = payments
    .filter((p) => p.npe01__Paid__c)
    .reduce((s, p) => s + (p.npe01__Payment_Amount__c ?? 0), 0);
  const totalScheduled = payments
    .filter((p) => !p.npe01__Paid__c && !p.npe01__Written_Off__c)
    .reduce((s, p) => s + (p.npe01__Payment_Amount__c ?? 0), 0);

  // 5th stat — Probability when open, Days-to-close when closed.
  const isOpenOpp = isOpen(opp);
  const days = opp.CloseDate
    ? Math.round((new Date(opp.CloseDate).getTime() - Date.now()) / 86400_000)
    : null;
  const fifthStat = isOpenOpp
    ? {
        label: "Probability",
        value: opp.Probability != null ? `${opp.Probability}%` : "—",
        tone: "default" as const,
      }
    : {
        label: "Days to close",
        value: days != null ? `${Math.abs(days)}` : "—",
        tone: "default" as const,
      };

  // Referrer for cross-detail jumps (account, contact, award) — when
  // the user clicks one of those, the BackLink there should return
  // here, not to /accounts. {@link DetailReferrer}.
  const referrer = {
    from: { pathname: location.pathname, label: opp.Name ?? "Opportunity" },
  };

  return (
    <div className="mx-auto max-w-[1320px] px-7 py-6 pb-20">
      <BackLink />

      {/* Header */}
      <div className="mt-4 flex items-start gap-4">
        <AccountAvatar
          name={opp.Account?.Name ?? opp.Name}
          logoUrl={enrichment.data?.logo_url ?? null}
          website={null}
          size={48}
        />
        <div className="flex-1 min-w-0">
          <InlineText
            value={opp.Name}
            onSave={(v) => patch("Name", v)}
            className="text-[24px] font-bold leading-tight tracking-tight text-ink py-0"
          />
          <div className="mt-1 flex flex-wrap items-center gap-2 text-[12.5px] text-ink-3">
            <InlineSelect
              value={opp.StageName}
              options={SF_STAGE_OPTIONS}
              onSave={(v) =>
                updateStage.mutateAsync({ id: opp.Id, newStage: v }).then(() => undefined)
              }
              renderValue={() => <StageChip stage={opp.StageName} status={stageStatus(opp)} />}
            />
            {opp.RecordType?.Name ? <Tag>{opp.RecordType.Name}</Tag> : null}
            {opp.AccountId ? (
              <Link
                to={`/accounts/${opp.AccountId}`}
                state={referrer}
                className="underline-offset-4 hover:underline"
              >
                · {opp.Account?.Name ?? opp.AccountId}
              </Link>
            ) : null}
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-5">
        <Stat label="Amount" value={opp.Amount ? fmtMoneyFull(opp.Amount) : "—"} />
        <Stat label="Paid" value={fmtMoneyFull(totalPaid)} tone={totalPaid > 0 ? "green" : "default"} />
        <Stat label="Scheduled" value={fmtMoneyFull(totalScheduled)} />
        <Stat label="Close" value={fmtDate(opp.CloseDate)} />
        <Stat label={fifthStat.label} value={fifthStat.value} tone={fifthStat.tone} />
      </div>

      {/* Details — always-on canonical fields */}
      <SectionCard title="Details" collapsible={false} storageScope="opportunity">
        <div className="grid grid-cols-2 gap-x-8 gap-y-3 px-5 py-4 md:grid-cols-3">
          <EditField label="Owner">
            <InlineSelect
              value={opp.OwnerId ?? null}
              options={ownerOptions}
              onSave={saveOwner}
              renderValue={() => (
                <span className="text-[13px] text-ink-2">
                  {opp.Owner?.Name ?? ownerOptions.find((o) => o.value === opp.OwnerId)?.label ?? "—"}
                </span>
              )}
            />
          </EditField>
          <EditField label="Account">
            <AccountPicker
              value={opp.AccountId ?? null}
              currentLabel={opp.Account?.Name ?? null}
              options={accountOptions}
              onSave={(accountId) =>
                updateOpp
                  .mutateAsync({
                    id: opp.Id,
                    patch: { AccountId: accountId },
                    displayPatch: {
                      Account: {
                        Name: accountOptions.find((o) => o.value === accountId)?.label ?? "",
                      },
                    } as Record<string, unknown>,
                  })
                  .then(() => undefined)
              }
            />
          </EditField>
          <EditField label="Stage">
            <InlineSelect
              value={opp.StageName}
              options={SF_STAGE_OPTIONS}
              onSave={(v) =>
                updateStage.mutateAsync({ id: opp.Id, newStage: v }).then(() => undefined)
              }
              renderValue={() => <StageChip stage={opp.StageName} status={stageStatus(opp)} />}
            />
          </EditField>
          <EditField label="Primary contact">
            <PrimaryContactPicker
              opp={opp}
              accountContacts={accountContacts}
              onSave={(contactId) => patch("npsp__Primary_Contact__c", contactId)}
              referrer={referrer}
            />
          </EditField>
          <EditField label="Probability">
            <InlineText
              value={opp.Probability != null ? String(opp.Probability) : ""}
              onSave={(v) => patch("Probability", v ? Number(v) : null)}
              placeholder="—"
            />
          </EditField>
          <EditField label="Close date">
            <InlineDate
              value={opp.CloseDate}
              onSave={(v) => patch("CloseDate", v)}
            />
          </EditField>
          <EditField label="1st payment">
            <InlineDate
              value={opp.PaymentDate__c}
              onSave={(v) => patch("PaymentDate__c", v)}
            />
          </EditField>
          <EditField label="Ask amount">
            <InlineText
              value={
                opp.Ask_Amount_if_different_from_actual__c != null
                  ? String(opp.Ask_Amount_if_different_from_actual__c)
                  : ""
              }
              onSave={(v) =>
                patch(
                  "Ask_Amount_if_different_from_actual__c",
                  v ? Number(v.replace(/[^0-9.]/g, "")) : null,
                )
              }
              placeholder="—"
            />
          </EditField>
          <EditField label="Amount">
            <InlineText
              value={opp.Amount != null ? String(opp.Amount) : ""}
              onSave={(v) => patch("Amount", v ? Number(v.replace(/[^0-9.]/g, "")) : null)}
              placeholder="—"
            />
          </EditField>
          <EditField label="Forecast category">
            <InlineText
              value={opp.ForecastCategory}
              onSave={(v) => patch("ForecastCategory", v)}
              placeholder="—"
            />
          </EditField>
          <EditField label="Lead source">
            <InlineSelect
              value={opp.LeadSource ?? null}
              options={LEAD_SOURCE_OPTIONS}
              onSave={(v) => patch("LeadSource", v)}
              emptyLabel="—"
            />
          </EditField>
          <EditField label="Type">
            <span className="px-1.5 py-1 text-[13px] text-ink-2">
              {opp.RecordType?.Name ?? <span className="italic text-ink-4">—</span>}
            </span>
          </EditField>
        </div>
      </SectionCard>

      {/* Notes — Next step + Description */}
      <SectionCard title="Notes" storageScope="opportunity">
        <div className="space-y-3 px-5 py-3">
          <DetailRow label="Next step">
            <InlineText
              value={opp.NextStep}
              onSave={(v) => patch("NextStep", v)}
              placeholder="Add a next step…"
            />
          </DetailRow>
          <DetailRow label="Description">
            <InlineText
              value={opp.Description}
              onSave={(v) => patch("Description", v)}
              placeholder="Add a description…"
              multiline
            />
          </DetailRow>
        </div>
      </SectionCard>

      {/* Tasks */}
      <OppTasksSection opportunityId={opp.Id} />

      {/* Payments — pill-toggle filter (All / Open / Paid). Default-open
          when there's an unpaid balance, default-closed once everything
          is paid (no action needed). The "Schedule" action opens the
          builder modal — replaces existing payments by default. */}
      <PaymentsSection
        payments={payments}
        defaultOpen={totalScheduled > 0 || payments.length === 0}
        onSchedule={() => setScheduleModalOpen(true)}
      />

      {scheduleModalOpen ? (
        <PaymentScheduleBuilder
          opportunityId={opp.Id}
          oppAmount={opp.Amount ?? null}
          existingCount={payments.length}
          initialFirstDate={opp.PaymentDate__c ?? null}
          onClose={() => setScheduleModalOpen(false)}
        />
      ) : null}

      {/* Award — only when this opp produced an award. */}
      {award ? (
        <SectionCard
          title="Award"
          storageScope="opportunity"
          action={
            <Link
              to={`/awards/${award.id}`}
              state={referrer}
              className="inline-flex items-center gap-1 rounded border border-border-strong bg-surface px-2 py-0.5 text-[11px] font-medium text-ink-2 hover:bg-surface-2"
            >
              <ExternalLink size={11} aria-hidden="true" /> Open
            </Link>
          }
        >
          <div className="grid grid-cols-2 gap-x-8 gap-y-3 px-5 py-4 md:grid-cols-4">
            <EditField label="Status">
              <Tag
                variant={
                  award.award_status === "Active"
                    ? "green"
                    : award.award_status === "Closing"
                      ? "amber"
                      : award.award_status === "Did Not Fulfill"
                        ? "red"
                        : "default"
                }
              >
                {award.award_status}
              </Tag>
            </EditField>
            <EditField label="Awarded">
              <span className="px-1.5 py-1 text-[13px] text-ink-2">{fmtDate(award.award_date)}</span>
            </EditField>
            <EditField label="Period end">
              <span className="px-1.5 py-1 text-[13px] text-ink-2">{fmtDate(award.period_end_date)}</span>
            </EditField>
            <EditField label="Reports">
              <span className="px-1.5 py-1 text-[13px] text-ink-2">
                {award.report_done}/{award.report_total}
                {award.report_overdue > 0 ? (
                  <span className="ml-1 text-red"> · {award.report_overdue} overdue</span>
                ) : null}
              </span>
            </EditField>
          </div>
        </SectionCard>
      ) : null}

      {/* Activity timeline — scoped so search/filter state is per-entity. */}
      <ActivityTimeline activities={activities} scopeKey={`opportunity:${opp.Id}`} />

      <p className="mt-6 text-[11px] text-ink-4">
        SF Id: <span className="mono">{opp.Id}</span>
      </p>
    </div>
  );
}

// ── Payments ─────────────────────────────────────────────────────────────

interface PaymentLite {
  Id: string;
  npe01__Paid__c?: boolean | null;
  npe01__Written_Off__c?: boolean | null;
  Delinquent__c?: boolean | null;
  Payment_Status__c?: string | null;
  npe01__Payment_Amount__c?: number | null;
  npe01__Payment_Method__c?: string | null;
  npe01__Scheduled_Date__c?: string | null;
  npe01__Payment_Date__c?: string | null;
}

function PaymentsSection({
  payments,
  defaultOpen,
  onSchedule,
}: {
  payments: PaymentLite[];
  defaultOpen: boolean;
  onSchedule: () => void;
}) {
  const [filter, setFilter] = useState<PaymentFilter>("all");

  const counts = useMemo(() => {
    let open = 0;
    let paid = 0;
    for (const p of payments) {
      if (p.npe01__Paid__c) paid += 1;
      else if (!p.npe01__Written_Off__c) open += 1;
    }
    return { all: payments.length, open, paid };
  }, [payments]);

  const filtered = useMemo(() => {
    if (filter === "all") return payments;
    if (filter === "open") {
      return payments.filter((p) => !p.npe01__Paid__c && !p.npe01__Written_Off__c);
    }
    return payments.filter((p) => p.npe01__Paid__c);
  }, [payments, filter]);

  return (
    <SectionCard
      title={`Payments (${payments.length})`}
      storageScope="opportunity"
      defaultOpen={defaultOpen}
      action={
        <div className="flex items-center gap-2">
          <PaymentFilterPill
            counts={counts}
            value={filter}
            onChange={setFilter}
          />
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onSchedule();
            }}
            className="inline-flex items-center gap-1 rounded border border-border-strong bg-surface px-2 py-0.5 text-[11px] font-medium text-ink-2 hover:bg-surface-2"
            title={
              payments.length > 0
                ? `Replace the existing ${payments.length} payment${payments.length === 1 ? "" : "s"}`
                : "Generate a payment schedule"
            }
          >
            <Plus size={11} aria-hidden="true" />
            {payments.length > 0 ? "Replace schedule" : "Schedule"}
          </button>
        </div>
      }
    >
      {filtered.length === 0 ? (
        <Empty>
          {payments.length === 0 ? "No payment schedule." : `No ${filter} payments.`}
        </Empty>
      ) : (
        <table className="w-full border-collapse">
          <thead>
            <tr>
              {["Scheduled", "Amount", "Status", "Method", "Received", "Notes"].map(
                (h, i) => (
                  <th
                    key={h}
                    className={cn(
                      "border-b border-border-strong bg-surface-2 px-5 py-2 text-[11px] font-semibold uppercase tracking-wider text-ink-3",
                      i === 1 ? "text-right" : "text-left",
                    )}
                  >
                    {h}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => {
              const status = paymentStatus(p);
              return (
                <tr
                  key={p.Id}
                  className="border-b border-border-strong last:border-b-0"
                >
                  <td className="mono px-5 py-2.5 text-[12.5px] text-ink-2">
                    {fmtDate(p.npe01__Scheduled_Date__c)}
                  </td>
                  <td className="mono px-5 py-2.5 text-right text-[13px] font-medium tabular-nums">
                    {p.npe01__Payment_Amount__c
                      ? fmtMoneyFull(p.npe01__Payment_Amount__c, true)
                      : "—"}
                  </td>
                  <td className="px-5 py-2.5">
                    <Tag variant={status.variant}>{status.label}</Tag>
                  </td>
                  <td className="px-5 py-2.5 text-[12px] text-ink-2">
                    {p.npe01__Payment_Method__c ?? "—"}
                  </td>
                  <td className="mono px-5 py-2.5 text-[11.5px] text-ink-3">
                    {fmtDate(p.npe01__Payment_Date__c)}
                  </td>
                  <td className="px-5 py-2.5 text-[12px] text-ink-3">
                    {p.npe01__Written_Off__c ? "Written off" : null}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </SectionCard>
  );
}

function PaymentFilterPill({
  counts,
  value,
  onChange,
}: {
  counts: { all: number; open: number; paid: number };
  value: PaymentFilter;
  onChange: (v: PaymentFilter) => void;
}) {
  const opts: { value: PaymentFilter; label: string; count: number }[] = [
    { value: "open", label: "Open", count: counts.open },
    { value: "paid", label: "Paid", count: counts.paid },
    { value: "all", label: "All", count: counts.all },
  ];
  return (
    <div
      className="inline-flex items-center rounded-md border border-border-strong bg-surface p-0.5"
      role="tablist"
      aria-label="Filter payments"
    >
      {opts.map((o) => (
        <button
          key={o.value}
          type="button"
          role="tab"
          aria-selected={value === o.value}
          onClick={(e) => {
            e.stopPropagation();
            onChange(o.value);
          }}
          className={cn(
            "rounded px-2 py-0.5 text-[11px] font-medium transition-colors",
            value === o.value
              ? "bg-ink text-surface"
              : "text-ink-3 hover:text-ink",
          )}
        >
          {o.label} <span className="opacity-60">{o.count}</span>
        </button>
      ))}
    </div>
  );
}

// ── Primary contact picker ───────────────────────────────────────────────

import type { SfContact } from "@/types/salesforce";
import type { DetailReferrerState } from "@/components/detail";

/**
 * Inline picker for the opportunity's primary contact. Suggests
 * contacts from the parent account (which is the SF convention) —
 * if the desired person isn't on the account, the user should add
 * them on the account page first.
 */
function PrimaryContactPicker({
  opp,
  accountContacts,
  onSave,
  referrer,
}: {
  opp: SfOpportunity;
  accountContacts: SfContact[];
  onSave: (contactId: string) => Promise<void>;
  referrer: DetailReferrerState;
}) {
  const primary = opp.npsp__Primary_Contact__r ?? null;
  const primaryId = opp.npsp__Primary_Contact__c ?? null;

  const options = useMemo(
    () =>
      accountContacts.map((c) => {
        const composed = [c.FirstName, c.LastName].filter(Boolean).join(" ").trim();
        return {
          value: c.Id,
          label: c.Name || composed || c.Id,
        };
      }),
    [accountContacts],
  );

  if (!opp.AccountId) {
    return <span className="px-1.5 py-1 text-[13px] italic text-ink-4">No account</span>;
  }

  return (
    <div className="flex min-w-0 items-center gap-2">
      <InlineSelect
        value={primaryId}
        options={options}
        onSave={onSave}
        emptyLabel="—"
        renderValue={() =>
          primary && primaryId ? (
            <Link
              to={`/contacts/${primaryId}`}
              state={referrer}
              className="truncate text-[13px] text-ink-2 hover:underline"
              title={primary.Name ?? ""}
              onClick={(e) => e.stopPropagation()}
            >
              {primary.Name ?? "—"}
            </Link>
          ) : (
            <span className="text-[13px] italic text-ink-4">—</span>
          )
        }
      />
    </div>
  );
}

// ── Helpers ──────────────────────────────────────────────────────────────

function paymentStatus(p: PaymentLite): {
  label: string;
  variant: "green" | "amber" | "red" | "default";
} {
  if (p.npe01__Paid__c) return { label: "Paid", variant: "green" };
  if (p.npe01__Written_Off__c) return { label: "Written off", variant: "default" };
  if (p.Delinquent__c) return { label: "Overdue", variant: "red" };
  if (p.Payment_Status__c) return { label: p.Payment_Status__c, variant: "amber" };
  return { label: "Scheduled", variant: "amber" };
}

function BackLink() {
  return <SharedBackLink defaultTo="/pipeline" defaultLabel="Pipeline" />;
}
