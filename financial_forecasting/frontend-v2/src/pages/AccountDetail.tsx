import { useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, ExternalLink, Mail, Phone } from "lucide-react";

import { AccountTasksSection } from "@/components/AccountTasksSection";
import { ActivityTimeline } from "@/components/ActivityTimeline";
import { StageChip } from "@/components/ui/StageChip";
import { Tag } from "@/components/ui/Tag";
import { fmtDate, fmtMoney, initials } from "@/lib/format";
import { bucketForStage, OPEN_BUCKETS } from "@/lib/stages";
import { cn } from "@/lib/utils";
import { useAccounts } from "@/services/accounts";
import { useActivities } from "@/services/activities";
import { useContacts } from "@/services/contacts";
import { useOpportunities } from "@/services/opportunities";
import type { SfOpportunity } from "@/types/salesforce";

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
  const { data: activities = [] } = useActivities({ accountId: id, limit: 30 });

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

  const lifetime =
    account.npo02__TotalOppAmount__c ??
    account.Total_Revenue_Generated__c ??
    0;
  const closedCount = account.npo02__NumberOfClosedOpps__c ?? 0;
  const lastActivity = account.Last_Activity_Date__c ?? account.LastActivityDate ?? null;

  const openOpps = opps.filter((o) => OPEN_BUCKETS.includes(bucketForStage(o.StageName)));
  const wonOpps = opps.filter((o) => bucketForStage(o.StageName) === "won");

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
        <div className="flex-1">
          <h1 className="text-[24px] font-bold leading-tight tracking-tight">
            {account.Name}
          </h1>
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
        <Stat label="Lifetime" value={lifetime > 0 ? fmtMoney(lifetime) : "—"} />
        <Stat label="Closed opps" value={closedCount > 0 ? String(closedCount) : "—"} />
        <Stat label="Open opps" value={String(openOpps.length)} />
        <Stat label="Last activity" value={fmtDate(lastActivity)} />
      </div>

      {/* Description */}
      {account.Description ? (
        <SectionCard title="About">
          <div className="whitespace-pre-wrap px-5 py-4 text-[13px] leading-relaxed text-ink-2">
            {account.Description}
          </div>
        </SectionCard>
      ) : null}

      {/* Open opportunities */}
      {openOpps.length > 0 ? (
        <SectionCard title={`Open opportunities (${openOpps.length})`}>
          <OppTable opps={openOpps} />
        </SectionCard>
      ) : null}

      {/* Tasks for this account — both account-level (WhatId = account_id)
          and opp-tied (WhatId in account's opps). Single SOQL on the
          backend, single section here. Opp-tied rows show "→ Opp Name". */}
      <AccountTasksSection accountId={account.Id} />

      {/* Closed-won opportunities */}
      {wonOpps.length > 0 ? (
        <SectionCard title={`Awarded / closed-won (${wonOpps.length})`}>
          <OppTable opps={wonOpps} />
        </SectionCard>
      ) : null}

      {/* Contacts */}
      <SectionCard title={`Contacts (${contacts.length})`}>
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
      <ActivityTimeline activities={activities} />

      <div className="h-3" />
      <p className="mt-2 text-[11px] text-ink-4">
        SF Id: <span className="mono">{account.Id}</span>
      </p>
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
  return (
    <div className="px-5 py-8 text-center text-[12.5px] text-ink-3">{children}</div>
  );
}

function OppTable({ opps }: { opps: SfOpportunity[] }) {
  return (
    <table className="w-full border-collapse">
      <tbody>
        {opps.map((o) => (
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
              <StageChip stage={o.StageName} />
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
        ))}
      </tbody>
    </table>
  );
}
