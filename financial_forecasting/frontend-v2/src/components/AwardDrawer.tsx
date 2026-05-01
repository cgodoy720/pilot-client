import { useMemo, useState } from "react";

import { Drawer } from "@/components/ui/Drawer";
import { Tag } from "@/components/ui/Tag";
import { fmtDate, fmtMoney } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useActivities } from "@/services/activities";
import {
  useOpportunityPayments,
  useOpportunityTasks,
} from "@/services/opportunities";
import type { Award } from "@/services/awards";
import type { SfOpportunity, SfPayment, SfTask } from "@/types/salesforce";

export function AwardDrawer({
  award,
  opp,
  onClose,
}: {
  award: Award | null;
  opp: SfOpportunity | undefined;
  onClose: () => void;
}) {
  const open = !!award;
  const oppName = opp?.Name ?? award?.opportunity_id ?? "Award";
  const subtitle = [opp?.Account?.Name, award?.award_status]
    .filter(Boolean)
    .join(" · ") || undefined;

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title={oppName}
      subtitle={subtitle}
      linkTo={award ? `/opportunities/${award.opportunity_id}` : undefined}
      width={680}
    >
      {award ? <AwardDrawerBody award={award} opp={opp} /> : null}
    </Drawer>
  );
}

function AwardDrawerBody({
  award,
  opp,
}: {
  award: Award;
  opp: SfOpportunity | undefined;
}) {
  const oppId = award.opportunity_id;
  const { data: payments = [] } = useOpportunityPayments(oppId);
  const { data: tasks = [] } = useOpportunityTasks(oppId);
  const { data: activities = [] } = useActivities({
    opportunityId: oppId,
    limit: 30,
  });

  // Stats
  const amount = opp?.Amount ?? 0;
  const paid = opp?.npe01__Payments_Made__c ?? 0;
  const outstanding = Math.max(0, amount - paid);

  // Tasks: filter to those created on/after the award date.
  // Pre-award tasks belong to the opp pipeline, not the award.
  const awardDate = award.award_date ? new Date(award.award_date) : null;
  const [showAllTasks, setShowAllTasks] = useState(false);

  const { postAwardTasks, hasPreAwardTasks } = useMemo(() => {
    if (!awardDate || Number.isNaN(awardDate.getTime())) {
      return { postAwardTasks: tasks, hasPreAwardTasks: false };
    }
    const cutoff = awardDate.getTime();
    const post: SfTask[] = [];
    let hasPre = false;
    for (const t of tasks) {
      const created = t.CreatedDate ? new Date(t.CreatedDate).getTime() : null;
      if (created != null && created >= cutoff) {
        post.push(t);
      } else {
        hasPre = true;
      }
    }
    return { postAwardTasks: post, hasPreAwardTasks: hasPre };
  }, [tasks, awardDate]);

  const visibleTasks = showAllTasks ? tasks : postAwardTasks;

  return (
    <div className="flex flex-col gap-5 px-5 py-5">
      {/* Stats */}
      <div className="grid grid-cols-4 gap-2">
        <Stat label="Amount" value={amount > 0 ? fmtMoney(amount) : "—"} />
        <Stat label="Paid" value={paid > 0 ? fmtMoney(paid) : "—"} />
        <Stat
          label="Outstanding"
          value={outstanding > 0 ? fmtMoney(outstanding) : "—"}
        />
        <Stat label="Period ends" value={fmtDate(award.period_end_date)} />
      </div>

      {/* Tasks */}
      <Section
        title={`Tasks (${visibleTasks.length})`}
        action={
          hasPreAwardTasks ? (
            <button
              type="button"
              onClick={() => setShowAllTasks((v) => !v)}
              className="text-[11px] font-medium text-accent-ink hover:underline"
            >
              {showAllTasks ? "Show post-award only" : "Show all opp tasks"}
            </button>
          ) : null
        }
      >
        {visibleTasks.length === 0 ? (
          <Empty>
            {tasks.length === 0
              ? "No tasks on this opportunity."
              : "No tasks since award date."}
          </Empty>
        ) : (
          <ul className="flex flex-col">
            {visibleTasks.map((t) => (
              <TaskRow key={t.Id} t={t} />
            ))}
          </ul>
        )}
      </Section>

      {/* Payments */}
      <Section title={`Payments (${payments.length})`}>
        {payments.length === 0 ? (
          <Empty>No payment schedule.</Empty>
        ) : (
          <ul className="flex flex-col">
            {payments.map((p) => (
              <PaymentRow key={p.Id} p={p} />
            ))}
          </ul>
        )}
      </Section>

      {/* Linked project — TODO: backend endpoint doesn't exist yet.
          routes/projects.py exposes
            GET /projects/{project_id}/opportunities
          but no reverse lookup (opportunity → projects). When that
          lands, replace this with a real query + link out to /projects/X. */}
      <Section title="Linked project">
        <div className="px-4 py-3 text-[12px] text-ink-3">
          <span className="italic">
            TODO: needs an opportunity → projects lookup endpoint
            (`GET /api/opportunities/&#123;id&#125;/projects` or equivalent).
            Once available, render a link to /projects/&#123;X&#125; for any
            project_opportunity rows referencing this opp.
          </span>
        </div>
      </Section>

      {/* Activity timeline */}
      <Section title={`Activity (${activities.length})`}>
        {activities.length === 0 ? (
          <Empty>No activities logged.</Empty>
        ) : (
          <ul className="flex flex-col">
            {activities.slice(0, 20).map((a) => (
              <li
                key={a.id}
                className="flex items-start gap-2 border-b border-border-strong px-4 py-2 last:border-b-0"
              >
                <Tag>{a.type}</Tag>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[13px]">
                    {a.subject ?? "(no subject)"}
                  </div>
                  {a.email_snippet || a.description ? (
                    <div className="line-clamp-1 text-[11.5px] text-ink-3">
                      {a.email_snippet ?? a.description}
                    </div>
                  ) : null}
                </div>
                <div className="mono flex-shrink-0 text-[10.5px] text-ink-3">
                  {fmtDate(a.occurred_at ?? a.created_at)}
                </div>
              </li>
            ))}
          </ul>
        )}
      </Section>
    </div>
  );
}

function TaskRow({ t }: { t: SfTask }) {
  return (
    <li className="flex items-center gap-3 border-b border-border-strong px-4 py-2 last:border-b-0">
      <span
        className={cn(
          "inline-flex items-center rounded px-1.5 py-px text-[11px] font-medium",
          t.IsClosed ? "bg-surface-2 text-ink-3" : "bg-amber-soft text-amber",
        )}
      >
        {t.Status ?? "Open"}
      </span>
      <span className="min-w-0 flex-1 truncate text-[13px]">
        {t.Subject ?? "(no subject)"}
      </span>
      <span className="mono w-24 flex-shrink-0 text-right text-[11px] text-ink-3">
        {fmtDate(t.ActivityDate)}
      </span>
    </li>
  );
}

function PaymentRow({ p }: { p: SfPayment }) {
  const status = paymentStatus(p);
  return (
    <li className="flex items-center gap-3 border-b border-border-strong px-4 py-2 last:border-b-0">
      <span className="mono w-24 flex-shrink-0 text-[11.5px] text-ink-3">
        {fmtDate(p.npe01__Scheduled_Date__c)}
      </span>
      <span className="mono flex-1 text-right text-[13px] font-medium tabular-nums">
        {p.npe01__Payment_Amount__c
          ? fmtMoney(p.npe01__Payment_Amount__c)
          : "—"}
      </span>
      <Tag variant={status.variant}>{status.label}</Tag>
      <span className="mono w-24 flex-shrink-0 text-right text-[11px] text-ink-3">
        {p.npe01__Paid__c ? fmtDate(p.npe01__Payment_Date__c) : "—"}
      </span>
    </li>
  );
}

function paymentStatus(p: SfPayment): {
  label: string;
  variant: "green" | "amber" | "red" | "default";
} {
  if (p.npe01__Paid__c) return { label: "Paid", variant: "green" };
  if (p.npe01__Written_Off__c) return { label: "Written off", variant: "default" };
  if (p.Delinquent__c) return { label: "Overdue", variant: "red" };
  if (p.Payment_Status__c) return { label: p.Payment_Status__c, variant: "amber" };
  return { label: "Scheduled", variant: "amber" };
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-border-strong bg-surface-2 px-3 py-2">
      <div className="text-[10.5px] font-semibold uppercase tracking-wider text-ink-3">
        {label}
      </div>
      <div className="mono mt-0.5 text-[14px] font-semibold tabular-nums">
        {value}
      </div>
    </div>
  );
}

function Section({
  title,
  action,
  children,
}: {
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-lg border border-border-strong bg-surface">
      <div className="flex items-center justify-between gap-2 border-b border-border-strong bg-surface-2 px-4 py-2">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-ink-3">
          {title}
        </span>
        {action}
      </div>
      {children}
    </section>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return (
    <div className="px-4 py-5 text-center text-[12px] text-ink-3">{children}</div>
  );
}

