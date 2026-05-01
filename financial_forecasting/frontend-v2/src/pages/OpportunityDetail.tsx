import { useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

import { ActivityTimeline } from "@/components/ActivityTimeline";
import { OppTasksSection } from "@/components/OppTasksSection";
import { StageChip } from "@/components/ui/StageChip";
import { Tag } from "@/components/ui/Tag";
import { fmtDate, fmtMoney, initials } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useActivities } from "@/services/activities";
import {
  useOpportunities,
  useOpportunityPayments,
} from "@/services/opportunities";

export function OpportunityDetailPage() {
  const { id = "" } = useParams<{ id: string }>();

  const { data: opps } = useOpportunities();
  const opp = useMemo(
    () => (opps ?? []).find((o) => o.Id === id),
    [opps, id],
  );

  const { data: payments = [] } = useOpportunityPayments(id);
  const { data: activities = [] } = useActivities({ opportunityId: id, limit: 30 });

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

  const totalPaid = payments
    .filter((p) => p.npe01__Paid__c)
    .reduce((s, p) => s + (p.npe01__Payment_Amount__c ?? 0), 0);
  const totalScheduled = payments
    .filter((p) => !p.npe01__Paid__c && !p.npe01__Written_Off__c)
    .reduce((s, p) => s + (p.npe01__Payment_Amount__c ?? 0), 0);

  return (
    <div className="mx-auto max-w-[1320px] px-7 py-6 pb-20">
      <BackLink />

      <div className="mt-4 flex items-start gap-4">
        <div className="grid h-12 w-12 flex-shrink-0 place-items-center rounded-md bg-surface-2 text-[14px] font-semibold text-ink-2">
          {initials(opp.Account?.Name ?? opp.Name)}
        </div>
        <div className="flex-1">
          <h1 className="text-[24px] font-bold leading-tight tracking-tight">
            {opp.Name}
          </h1>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-[12.5px] text-ink-3">
            <StageChip stage={opp.StageName} />
            {opp.Probability != null ? <span>{opp.Probability}%</span> : null}
            {opp.RecordType?.Name ? <Tag>{opp.RecordType.Name}</Tag> : null}
            {opp.AccountId ? (
              <Link
                to={`/accounts/${opp.AccountId}`}
                className="underline-offset-4 hover:underline"
              >
                · {opp.Account?.Name ?? opp.AccountId}
              </Link>
            ) : null}
            {opp.Owner?.Name ? <span>· Owner: {opp.Owner.Name}</span> : null}
          </div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
        <Stat label="Amount" value={opp.Amount ? fmtMoney(opp.Amount) : "—"} />
        <Stat label="Paid" value={fmtMoney(totalPaid)} />
        <Stat label="Scheduled" value={fmtMoney(totalScheduled)} />
        <Stat label="Close" value={fmtDate(opp.CloseDate)} />
      </div>

      <SectionCard title="Details">
        <dl className="grid grid-cols-2 gap-x-6 gap-y-2 px-5 py-4 text-[12.5px] md:grid-cols-3">
          <Meta label="Owner" value={opp.Owner?.Name} />
          <Meta
            label="Probability"
            value={opp.Probability != null ? `${opp.Probability}%` : null}
          />
          <Meta label="Forecast" value={opp.ForecastCategory} />
          <Meta label="Lead source" value={opp.LeadSource} />
          <Meta label="Type" value={opp.RecordType?.Name} />
          <Meta
            label="Primary contact"
            value={opp.npsp__Primary_Contact__r?.Name}
          />
          <Meta
            label="1st payment"
            value={opp.PaymentDate__c ? fmtDate(opp.PaymentDate__c) : null}
          />
        </dl>
      </SectionCard>

      {opp.NextStep || opp.Description ? (
        <SectionCard title="About">
          {opp.NextStep ? (
            <div className="border-b border-border-strong px-5 py-3 text-[12.5px]">
              <span className="text-ink-3">Next step:</span>{" "}
              <span className="text-ink-2">{opp.NextStep}</span>
            </div>
          ) : null}
          {opp.Description ? (
            <div className="whitespace-pre-wrap px-5 py-4 text-[13px] leading-relaxed text-ink-2">
              {opp.Description}
            </div>
          ) : null}
        </SectionCard>
      ) : null}

      <OppTasksSection opportunityId={opp.Id} />

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
                      {p.npe01__Payment_Amount__c
                        ? fmtMoney(p.npe01__Payment_Amount__c)
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

function SectionCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-6 overflow-hidden rounded-lg border border-border-strong bg-surface shadow-sm">
      <div className="border-b border-border-strong bg-surface-2 px-5 py-2.5 text-[12px] font-semibold uppercase tracking-wider text-ink-3">
        {title}
      </div>
      {children}
    </section>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return <div className="px-5 py-8 text-center text-[12.5px] text-ink-3">{children}</div>;
}

function Meta({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex flex-col">
      <dt className="text-[10.5px] font-semibold uppercase tracking-wider text-ink-3">
        {label}
      </dt>
      <dd className="text-[13px] text-ink-2">
        {value ? value : <span className="text-ink-4">—</span>}
      </dd>
    </div>
  );
}
