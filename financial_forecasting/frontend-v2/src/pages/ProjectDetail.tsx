import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, ChevronDown, ChevronRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

import { Tag } from "@/components/ui/Tag";
import { api } from "@/lib/api";
import { fmtDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useOpportunities } from "@/services/opportunities";
import {
  useProjectDetail,
  type ProjectMilestone,
  type ProjectTask,
  type ProjectWorkstream,
} from "@/services/projects";

// ── Types ─────────────────────────────────────────────────────────────────────

interface ProjectOpportunityLink {
  id: string;
  opportunity_id: string;
  role: string | null;
  created_at: string | null;
}

interface ProjectOpportunityResponse {
  success: boolean;
  data: ProjectOpportunityLink[];
}

// ── Hooks ─────────────────────────────────────────────────────────────────────

function useProjectOpportunities(projectId: string | undefined) {
  return useQuery({
    queryKey: ["project-opportunities", projectId],
    queryFn: async () => {
      const { data } = await api.get<ProjectOpportunityResponse>(
        `/api/projects/${projectId}/opportunities`,
      );
      return data.data ?? [];
    },
    enabled: !!projectId,
    staleTime: 60_000,
  });
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const DONE_STATUSES = new Set([
  "done",
  "complete",
  "completed",
  "cancelled",
  "canceled",
]);

function isClosedStatus(status: string) {
  return DONE_STATUSES.has(status.toLowerCase());
}

function StatusChip({ status }: { status: string }) {
  const s = (status ?? "").toLowerCase();
  return (
    <span
      className={cn(
        "inline-flex items-center rounded px-1.5 py-px text-[11px] font-medium whitespace-nowrap",
        s === "in_progress" || s === "in progress"
          ? "bg-accent/10 text-accent-ink"
          : s === "blocked"
            ? "bg-amber-100 text-amber-700"
            : s === "done" || s === "complete" || s === "completed"
              ? "bg-surface-2 text-ink-4"
              : s === "cancelled" || s === "canceled"
                ? "bg-surface-2 text-ink-4"
                : "bg-surface-2 text-ink-3",
      )}
    >
      {status || "Open"}
    </span>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function BackLink() {
  return (
    <Link
      to="/projects"
      className="inline-flex items-center gap-1 text-[12.5px] text-ink-3 hover:text-ink"
    >
      <ArrowLeft size={14} /> Projects
    </Link>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-border-strong bg-surface px-4 py-3 shadow-sm">
      <div className="text-[10.5px] font-semibold uppercase tracking-wider text-ink-3">
        {label}
      </div>
      <div className="mono mt-1 text-[18px] font-semibold tabular-nums">
        {value}
      </div>
    </div>
  );
}

function SectionCard({
  title,
  children,
  action,
}: {
  title: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <section className="mt-6 overflow-hidden rounded-lg border border-border-strong bg-surface shadow-sm">
      <div className="flex items-center justify-between border-b border-border-strong bg-surface-2 px-5 py-2.5">
        <span className="text-[12px] font-semibold uppercase tracking-wider text-ink-3">
          {title}
        </span>
        {action ?? null}
      </div>
      {children}
    </section>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return (
    <div className="px-5 py-8 text-center text-[12.5px] text-ink-3">
      {children}
    </div>
  );
}

// ── Task row ──────────────────────────────────────────────────────────────────

function TaskRow({ task }: { task: ProjectTask }) {
  const status = (task.status ?? "").toLowerCase();
  const closed = isClosedStatus(status);
  const overdue =
    !closed &&
    task.deadline &&
    !Number.isNaN(new Date(task.deadline).getTime()) &&
    new Date(task.deadline).getTime() < Date.now();

  return (
    <div className="flex items-center gap-3 border-b border-border-strong px-4 py-2 last:border-b-0">
      <StatusChip status={task.status ?? "Open"} />
      <div className="min-w-0 flex-1">
        <span
          className={cn(
            "block truncate text-[13px]",
            closed && "text-ink-3 line-through",
          )}
        >
          {task.title}
        </span>
        {task.owner ? (
          <span className="truncate text-[11px] text-ink-3">{task.owner}</span>
        ) : null}
      </div>
      {task.deadline ? (
        <span
          className={cn(
            "mono flex-shrink-0 text-right text-[11px]",
            overdue ? "font-semibold text-red-600" : "text-ink-3",
          )}
        >
          {fmtDate(task.deadline)}
        </span>
      ) : null}
    </div>
  );
}

// ── Milestone block ───────────────────────────────────────────────────────────

function MilestoneBlock({ milestone }: { milestone: ProjectMilestone }) {
  return (
    <div className="border-b border-border-strong last:border-b-0">
      {/* Milestone header */}
      <div className="flex items-center gap-2 bg-surface-2/50 px-4 py-2">
        <span className="min-w-0 flex-1 truncate text-[12px] font-semibold text-ink-2">
          {milestone.title}
        </span>
        {milestone.status ? (
          <StatusChip status={milestone.status} />
        ) : null}
        {milestone.priority && milestone.priority !== "none" ? (
          <Tag>{milestone.priority}</Tag>
        ) : null}
        <span className="mono flex-shrink-0 text-[11px] text-ink-4">
          {milestone.tasks.length} task{milestone.tasks.length === 1 ? "" : "s"}
        </span>
      </div>
      {/* Tasks */}
      {milestone.tasks.length > 0 ? (
        <div className="pl-3">
          {milestone.tasks.map((t) => (
            <TaskRow key={t.id} task={t} />
          ))}
        </div>
      ) : (
        <div className="px-8 py-3 text-[12px] text-ink-4">No tasks.</div>
      )}
    </div>
  );
}

// ── Workstream card (collapsible) ─────────────────────────────────────────────

function WorkstreamCard({ ws }: { ws: ProjectWorkstream }) {
  const [open, setOpen] = useState(true);

  const milestoneCount = ws.milestones.length;
  const taskCount = ws.milestones.reduce((s, ms) => s + ms.tasks.length, 0);

  return (
    <div className="mt-4 overflow-hidden rounded-lg border border-border-strong bg-surface shadow-sm">
      {/* Header — clickable to collapse */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-2 border-b border-border-strong bg-surface-2 px-4 py-2.5 text-left hover:bg-surface-2/80"
      >
        {open ? (
          <ChevronDown size={14} className="flex-shrink-0 text-ink-3" />
        ) : (
          <ChevronRight size={14} className="flex-shrink-0 text-ink-3" />
        )}
        <span className="min-w-0 flex-1 truncate text-[13px] font-semibold text-ink">
          {ws.name}
        </span>
        {ws.description ? (
          <span className="hidden truncate text-[11.5px] text-ink-3 sm:block max-w-xs">
            {ws.description}
          </span>
        ) : null}
        <span className="mono flex-shrink-0 text-[11px] text-ink-3">
          {milestoneCount} milestone{milestoneCount === 1 ? "" : "s"} ·{" "}
          {taskCount} task{taskCount === 1 ? "" : "s"}
        </span>
      </button>

      {open ? (
        milestoneCount === 0 ? (
          <div className="px-5 py-6 text-center text-[12.5px] text-ink-3">
            No milestones.
          </div>
        ) : (
          <div>
            {ws.milestones.map((ms) => (
              <MilestoneBlock key={ms.id} milestone={ms} />
            ))}
          </div>
        )
      ) : null}
    </div>
  );
}

// ── Linked opportunities section ──────────────────────────────────────────────

function LinkedOpportunitiesSection({ projectId }: { projectId: string }) {
  const linkedQ = useProjectOpportunities(projectId);
  const { data: opps = [] } = useOpportunities();

  const linkedOpps = useMemo(() => {
    const links = linkedQ.data ?? [];
    const byId = new Map(opps.map((o) => [o.Id, o]));
    return links.map((link) => ({ link, opp: byId.get(link.opportunity_id) }));
  }, [linkedQ.data, opps]);

  return (
    <SectionCard title={`Linked opportunities (${linkedQ.isLoading ? "…" : linkedOpps.length})`}>
      {linkedQ.isLoading ? (
        <Empty>Loading…</Empty>
      ) : linkedOpps.length === 0 ? (
        <Empty>No opportunities linked to this project.</Empty>
      ) : (
        <ul className="flex flex-col">
          {linkedOpps.map(({ link, opp }) => (
            <li
              key={link.id}
              className="flex items-center gap-3 border-b border-border-strong px-5 py-2.5 last:border-b-0"
            >
              {link.role ? <Tag>{link.role}</Tag> : null}
              <div className="min-w-0 flex-1">
                <Link
                  to={`/opportunities/${link.opportunity_id}`}
                  className="block truncate text-[13px] font-medium hover:underline"
                >
                  {opp?.Name ?? link.opportunity_id}
                </Link>
                {opp?.Account?.Name ? (
                  <Link
                    to={`/accounts/${opp.AccountId ?? ""}`}
                    className="block truncate text-[11.5px] text-ink-3 hover:underline"
                  >
                    {opp.Account.Name}
                  </Link>
                ) : null}
              </div>
              {opp?.StageName ? (
                <span className="flex-shrink-0 rounded bg-surface-2 px-2 py-0.5 text-[11px] text-ink-3">
                  {opp.StageName}
                </span>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </SectionCard>
  );
}

// ── Linked accounts section ───────────────────────────────────────────────────

function LinkedAccountsSection({ projectId }: { projectId: string }) {
  const linkedQ = useProjectOpportunities(projectId);
  const { data: opps = [] } = useOpportunities();

  const linkedAccounts = useMemo(() => {
    const links = linkedQ.data ?? [];
    const byId = new Map(opps.map((o) => [o.Id, o]));
    const seen = new Set<string>();
    const result: { id: string; name: string; type?: string | null }[] = [];

    for (const link of links) {
      const opp = byId.get(link.opportunity_id);
      if (!opp?.AccountId) continue;
      if (seen.has(opp.AccountId)) continue;
      seen.add(opp.AccountId);
      result.push({
        id: opp.AccountId,
        name: opp.Account?.Name ?? opp.AccountId,
        type: null, // type not available on SfOpportunity.Account (SfReference)
      });
    }

    return result;
  }, [linkedQ.data, opps]);

  if (!linkedQ.isLoading && linkedAccounts.length === 0) return null;

  return (
    <SectionCard title={`Linked accounts (${linkedQ.isLoading ? "…" : linkedAccounts.length})`}>
      {linkedQ.isLoading ? (
        <Empty>Loading…</Empty>
      ) : (
        <ul className="flex flex-col">
          {linkedAccounts.map((acct) => (
            <li
              key={acct.id}
              className="flex items-center gap-3 border-b border-border-strong px-5 py-2.5 last:border-b-0"
            >
              <Link
                to={`/accounts/${acct.id}`}
                className="text-[13px] font-medium hover:underline"
              >
                {acct.name}
              </Link>
              {acct.type ? (
                <Tag>{acct.type}</Tag>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </SectionCard>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export function ProjectDetailPage() {
  const { id = "" } = useParams<{ id: string }>();
  const detailQ = useProjectDetail(id);
  const detail = detailQ.data;

  const workstreams: ProjectWorkstream[] = detail?.workstreams ?? [];

  const totalMilestones = useMemo(
    () => workstreams.reduce((sum, ws) => sum + ws.milestones.length, 0),
    [workstreams],
  );

  const openTaskCount = useMemo(() => {
    let count = 0;
    for (const ws of workstreams) {
      for (const ms of ws.milestones) {
        for (const t of ms.tasks) {
          if (!isClosedStatus(t.status ?? "")) count++;
        }
      }
    }
    return count;
  }, [workstreams]);

  if (detailQ.isLoading) {
    return (
      <div className="mx-auto max-w-[1320px] px-7 py-6">
        <BackLink />
        <div className="mt-6 rounded-lg border border-border-strong bg-surface p-10 text-center text-[13px] text-ink-3 shadow-sm">
          Loading project…
        </div>
      </div>
    );
  }

  if (detailQ.isError || !detail) {
    return (
      <div className="mx-auto max-w-[1320px] px-7 py-6">
        <BackLink />
        <div className="mt-6 rounded-lg border border-border-strong bg-surface p-10 text-center text-[13px] text-red-600 shadow-sm">
          Failed to load project.
        </div>
      </div>
    );
  }

  const subtitle = [
    detail.owner_email ?? null,
    detail.created_at ? `Created ${fmtDate(detail.created_at)}` : null,
    detail.updated_at ? `Updated ${fmtDate(detail.updated_at)}` : null,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <div className="mx-auto max-w-[1320px] px-7 py-6 pb-20">
      <BackLink />

      {/* Header */}
      <div className="mt-4">
        <h1 className="text-[26px] font-bold leading-tight tracking-tight text-ink">
          {detail.name}
        </h1>
        {subtitle ? (
          <p className="mt-1 text-[12.5px] text-ink-3">{subtitle}</p>
        ) : null}
        {detail.description ? (
          <p className="mt-2 max-w-2xl whitespace-pre-wrap text-[13px] text-ink-2">
            {detail.description}
          </p>
        ) : null}
      </div>

      {/* Stat strip */}
      <div className="mt-6 grid grid-cols-3 gap-3">
        <Stat label="Workstreams" value={String(workstreams.length)} />
        <Stat label="Milestones" value={String(totalMilestones)} />
        <Stat label="Open tasks" value={String(openTaskCount)} />
      </div>

      {/* Linked opportunities */}
      <LinkedOpportunitiesSection projectId={id} />

      {/* Linked accounts (derived from opps) */}
      <LinkedAccountsSection projectId={id} />

      {/* Workstreams */}
      <section className="mt-6">
        <div className="flex items-center gap-2">
          <span className="text-[12px] font-semibold uppercase tracking-wider text-ink-3">
            Workstreams ({workstreams.length})
          </span>
        </div>
        {detailQ.isLoading ? (
          <div className="mt-4 rounded-lg border border-border-strong bg-surface p-8 text-center text-[12.5px] text-ink-3 shadow-sm">
            Loading…
          </div>
        ) : workstreams.length === 0 ? (
          <div className="mt-4 rounded-lg border border-border-strong bg-surface p-8 text-center text-[12.5px] text-ink-3 shadow-sm">
            No workstreams on this project.
          </div>
        ) : (
          workstreams.map((ws) => <WorkstreamCard key={ws.id} ws={ws} />)
        )}
      </section>
    </div>
  );
}
