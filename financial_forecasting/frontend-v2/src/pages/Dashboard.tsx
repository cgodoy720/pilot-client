import { useMemo } from "react";
import { Link } from "react-router-dom";

import { PageHeader } from "@/components/PageHeader";
import { StageChip } from "@/components/ui/StageChip";
import { fmtDate, fmtMoney } from "@/lib/format";
import { bucketForStage, OPEN_BUCKETS } from "@/lib/stages";
import { useAccounts } from "@/services/accounts";
import { useAwards } from "@/services/awards";
import { useCurrentUser } from "@/services/auth";
import { useOpportunities } from "@/services/opportunities";

export function DashboardPage() {
  const { data: user } = useCurrentUser();
  const { data: accounts = [] } = useAccounts();
  const { data: opps = [] } = useOpportunities();
  const { data: awards = [] } = useAwards();

  const openOpps = useMemo(
    () => opps.filter((o) => OPEN_BUCKETS.includes(bucketForStage(o.StageName))),
    [opps],
  );
  const wonOpps = useMemo(
    () => opps.filter((o) => bucketForStage(o.StageName) === "won"),
    [opps],
  );

  const openValue = openOpps.reduce((s, o) => s + (o.Amount ?? 0), 0);
  const weightedValue = openOpps.reduce(
    (s, o) => s + ((o.Amount ?? 0) * (o.Probability ?? 0)) / 100,
    0,
  );

  // Closed-this-year (won, by CloseDate)
  const thisYear = new Date().getUTCFullYear();
  const wonThisYear = wonOpps.filter((o) => {
    if (!o.CloseDate) return false;
    return new Date(o.CloseDate).getUTCFullYear() === thisYear;
  });
  const wonThisYearTotal = wonThisYear.reduce((s, o) => s + (o.Amount ?? 0), 0);

  // Closing soon (next 30 days)
  const now = Date.now();
  const closingSoon = openOpps
    .filter((o) => {
      if (!o.CloseDate) return false;
      const t = new Date(o.CloseDate).getTime();
      return t > now && t < now + 30 * 24 * 3600 * 1000;
    })
    .sort(
      (a, b) =>
        new Date(a.CloseDate!).getTime() - new Date(b.CloseDate!).getTime(),
    )
    .slice(0, 8);

  // Recent awards
  const recentAwards = awards
    .filter((a) => a.award_date)
    .sort(
      (a, b) =>
        new Date(b.award_date!).getTime() - new Date(a.award_date!).getTime(),
    )
    .slice(0, 6);

  return (
    <div className="mx-auto max-w-[1320px] px-7 py-6 pb-20">
      <PageHeader
        title={user ? `Welcome, ${user.name?.split(" ")[0] ?? ""}` : "Dashboard"}
        subtitle={`${accounts.length.toLocaleString()} accounts · ${opps.length.toLocaleString()} opportunities · ${awards.length.toLocaleString()} awards`}
      />

      {/* Stat row */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Stat label="Open pipeline" value={fmtMoney(openValue)} sub={`${openOpps.length} opps`} />
        <Stat label="Weighted" value={fmtMoney(weightedValue)} sub="× probability" />
        <Stat label={`Closed-won ${thisYear}`} value={fmtMoney(wonThisYearTotal)} sub={`${wonThisYear.length} opps`} />
        <Stat label="Active awards" value={String(awards.filter((a) => a.award_status === "Active").length)} sub={`of ${awards.length}`} />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* Closing soon */}
        <Card title={`Closing in 30 days (${closingSoon.length})`}>
          {closingSoon.length === 0 ? (
            <Empty>Nothing scheduled to close in the next 30 days.</Empty>
          ) : (
            <ul className="flex flex-col">
              {closingSoon.map((o) => (
                <li
                  key={o.Id}
                  className="flex items-center gap-3 border-b border-border-strong px-5 py-2.5 last:border-b-0"
                >
                  <StageChip stage={o.StageName} />
                  <div className="min-w-0 flex-1">
                    <Link
                      to={`/opportunities/${o.Id}`}
                      className="block truncate text-[13px] font-medium hover:underline"
                    >
                      {o.Name}
                    </Link>
                    <div className="truncate text-[11.5px] text-ink-3">
                      {o.Account?.Name ?? "—"}
                    </div>
                  </div>
                  <div className="mono flex-shrink-0 text-right">
                    <div className="text-[13px] font-medium tabular-nums">
                      {o.Amount ? fmtMoney(o.Amount) : "—"}
                    </div>
                    <div className="text-[11px] text-ink-3">{fmtDate(o.CloseDate)}</div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>

        {/* Recent awards */}
        <Card title={`Recent awards (${recentAwards.length})`}>
          {recentAwards.length === 0 ? (
            <Empty>No awards yet — run the backfill script to populate from SF.</Empty>
          ) : (
            <ul className="flex flex-col">
              {recentAwards.map((a) => {
                const opp = opps.find((o) => o.Id === a.opportunity_id);
                return (
                  <li
                    key={a.id}
                    className="flex items-center gap-3 border-b border-border-strong px-5 py-2.5 last:border-b-0"
                  >
                    <span
                      className={
                        a.award_status === "Active"
                          ? "inline-flex items-center rounded bg-green-soft px-1.5 py-px text-[11px] font-medium text-green"
                          : "inline-flex items-center rounded bg-surface-2 px-1.5 py-px text-[11px] font-medium text-ink-2"
                      }
                    >
                      {a.award_status}
                    </span>
                    <div className="min-w-0 flex-1">
                      <Link
                        to={`/opportunities/${a.opportunity_id}`}
                        className="block truncate text-[13px] font-medium hover:underline"
                      >
                        {opp?.Name ?? a.opportunity_id}
                      </Link>
                      <div className="truncate text-[11.5px] text-ink-3">
                        {opp?.Account?.Name ?? "—"}
                      </div>
                    </div>
                    <div className="mono flex-shrink-0 text-right">
                      <div className="text-[13px] font-medium tabular-nums">
                        {opp?.Amount ? fmtMoney(opp.Amount) : "—"}
                      </div>
                      <div className="text-[11px] text-ink-3">{fmtDate(a.award_date)}</div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="rounded-md border border-border-strong bg-surface px-4 py-3 shadow-sm">
      <div className="text-[10.5px] font-semibold uppercase tracking-wider text-ink-3">
        {label}
      </div>
      <div className="mono mt-1 text-[20px] font-semibold tabular-nums">{value}</div>
      {sub ? <div className="mt-0.5 text-[11px] text-ink-3">{sub}</div> : null}
    </div>
  );
}

function Card({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-lg border border-border-strong bg-surface shadow-sm">
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
