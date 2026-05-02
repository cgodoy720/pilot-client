import { useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

import { ActivityTimeline } from "@/components/ActivityTimeline";
import { OppTasksSection } from "@/components/OppTasksSection";
import { InlineDate, InlineSelect, InlineText } from "@/components/ui/InlineEdit";
import { StageChip } from "@/components/ui/StageChip";
import { Tag } from "@/components/ui/Tag";
import { fmtDate, fmtMoneyFull, initials } from "@/lib/format";
import { SF_STAGE_OPTIONS } from "@/lib/stages";
import { cn } from "@/lib/utils";
import { useActivities } from "@/services/activities";
import {
  useOpportunities,
  useOpportunityPayments,
  useUpdateOpportunity,
  useUpdateOpportunityStage,
} from "@/services/opportunities";
import { useActiveUsers } from "@/services/users";

const LEAD_SOURCE_OPTIONS = [
  { value: "Web", label: "Web" },
  { value: "Phone Inquiry", label: "Phone Inquiry" },
  { value: "Partner Referral", label: "Partner Referral" },
  { value: "Purchased List", label: "Purchased List" },
  { value: "Other", label: "Other" },
  { value: "Word of mouth", label: "Word of mouth" },
  { value: "Event", label: "Event" },
  { value: "Internal", label: "Internal" },
];

export function OpportunityDetailPage() {
  const { id = "" } = useParams<{ id: string }>();

  const { data: opps } = useOpportunities();
  const opp = useMemo(
    () => (opps ?? []).find((o) => o.Id === id),
    [opps, id],
  );

  const { data: payments = [] } = useOpportunityPayments(id);
  const { data: activities = [] } = useActivities({ opportunityId: id, limit: 30 });
  const usersQ = useActiveUsers();
  const updateOpp = useUpdateOpportunity();
  const updateStage = useUpdateOpportunityStage();

  const ownerOptions = useMemo(
    () => (usersQ.data ?? []).map((u) => ({ value: u.Id, label: u.Name })),
    [usersQ.data],
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

  const patch = (field: string, val: unknown) =>
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

  return (
    <div className="mx-auto max-w-[1320px] px-7 py-6 pb-20">
      <BackLink />

      {/* Header */}
      <div className="mt-4 flex items-start gap-4">
        <div className="grid h-12 w-12 flex-shrink-0 place-items-center rounded-md bg-surface-2 text-[14px] font-semibold text-ink-2">
          {initials(opp.Account?.Name ?? opp.Name)}
        </div>
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
              onSave={(v) => updateStage.mutateAsync({ id: opp.Id, newStage: v }).then(() => undefined)}
              renderValue={() => <StageChip stage={opp.StageName} />}
            />
            {opp.RecordType?.Name ? <Tag>{opp.RecordType.Name}</Tag> : null}
            {opp.AccountId ? (
              <Link
                to={`/accounts/${opp.AccountId}`}
                className="underline-offset-4 hover:underline"
              >
                · {opp.Account?.Name ?? opp.AccountId}
              </Link>
            ) : null}
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
        <Stat label="Amount" value={opp.Amount ? fmtMoneyFull(opp.Amount) : "—"} />
        <Stat label="Paid" value={fmtMoneyFull(totalPaid)} />
        <Stat label="Scheduled" value={fmtMoneyFull(totalScheduled)} />
        <Stat label="Close" value={fmtDate(opp.CloseDate)} />
      </div>

      {/* Editable details grid */}
      <SectionCard title="Details">
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
          <EditField label="Amount">
            <InlineText
              value={opp.Amount != null ? String(opp.Amount) : ""}
              onSave={(v) => patch("Amount", v ? Number(v.replace(/[^0-9.]/g, "")) : null)}
              placeholder="—"
            />
          </EditField>
          <EditField label="Close date">
            <InlineDate
              value={opp.CloseDate}
              onSave={(v) => patch("CloseDate", v)}
            />
          </EditField>
          <EditField label="Probability">
            <InlineText
              value={opp.Probability != null ? String(opp.Probability) : ""}
              onSave={(v) => patch("Probability", v ? Number(v) : null)}
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
          <EditField label="1st payment">
            <InlineDate
              value={opp.PaymentDate__c}
              onSave={(v) => patch("PaymentDate__c", v)}
            />
          </EditField>
          <EditField label="Primary contact">
            <span className="px-1.5 py-1 text-[13px] text-ink-2">
              {opp.npsp__Primary_Contact__r?.Name ?? <span className="italic text-ink-4">—</span>}
            </span>
          </EditField>
          <EditField label="Type">
            <span className="px-1.5 py-1 text-[13px] text-ink-2">
              {opp.RecordType?.Name ?? <span className="italic text-ink-4">—</span>}
            </span>
          </EditField>
        </div>
      </SectionCard>

      {/* Next step + description */}
      <SectionCard title="Notes">
        <div className="px-5 py-3 space-y-2">
          <div>
            <div className="mb-1 text-[10.5px] font-semibold uppercase tracking-wider text-ink-3">
              Next step
            </div>
            <InlineText
              value={opp.NextStep}
              onSave={(v) => patch("NextStep", v)}
              placeholder="Add a next step…"
            />
          </div>
          <div>
            <div className="mb-1 text-[10.5px] font-semibold uppercase tracking-wider text-ink-3">
              Description
            </div>
            <InlineText
              value={opp.Description}
              onSave={(v) => patch("Description", v)}
              placeholder="Add a description…"
              multiline
            />
          </div>
        </div>
      </SectionCard>

      <OppTasksSection opportunityId={opp.Id} />

      {/* Payments */}
      <SectionCard title={`Payments (${payments.length})`}>
        {payments.length === 0 ? (
          <Empty>No payment schedule.</Empty>
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
              {payments.map((p) => {
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
                      {p.npe01__Payment_Amount__c ? fmtMoneyFull(p.npe01__Payment_Amount__c, true) : "—"}
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

      <ActivityTimeline activities={activities} />

      <p className="mt-6 text-[11px] text-ink-4">
        SF Id: <span className="mono">{opp.Id}</span>
      </p>
    </div>
  );
}

function paymentStatus(p: {
  npe01__Paid__c?: boolean | null;
  npe01__Written_Off__c?: boolean | null;
  Delinquent__c?: boolean | null;
  Payment_Status__c?: string | null;
}): { label: string; variant: "green" | "amber" | "red" | "default" } {
  if (p.npe01__Paid__c) return { label: "Paid", variant: "green" };
  if (p.npe01__Written_Off__c) return { label: "Written off", variant: "default" };
  if (p.Delinquent__c) return { label: "Overdue", variant: "red" };
  if (p.Payment_Status__c) return { label: p.Payment_Status__c, variant: "amber" };
  return { label: "Scheduled", variant: "amber" };
}

function BackLink() {
  return (
    <Link
      to="/pipeline"
      className="inline-flex items-center gap-1 text-[12.5px] text-ink-3 hover:text-ink"
    >
      <ArrowLeft size={14} /> Pipeline
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

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-6 overflow-hidden rounded-lg border border-border-strong bg-surface shadow-sm">
      <div className="border-b border-border-strong bg-surface-2 px-5 py-2.5 text-[12px] font-semibold uppercase tracking-wider text-ink-3">
        {title}
      </div>
      {children}
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
  return <div className="px-5 py-8 text-center text-[12.5px] text-ink-3">{children}</div>;
}
