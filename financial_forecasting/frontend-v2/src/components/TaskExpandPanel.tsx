import { useMemo, useState } from "react";
import { Plus } from "lucide-react";

import { InlineDate, InlineSelect } from "@/components/ui/InlineEdit";
import {
  useAccountTasks,
  useCreateAccountTask,
  useCreateTask,
  useOpportunityTasks,
  useUpdateTask,
} from "@/services/opportunities";
import { useActiveUsers } from "@/services/users";
import { cn } from "@/lib/utils";
import type { SfTask } from "@/types/salesforce";

export const TASK_PANEL_HEIGHT = 280; // px — must match style={{ height: TASK_PANEL_HEIGHT }}

const STATUS_OPTIONS = [
  { value: "Not Started", label: "Not Started" },
  { value: "In Progress", label: "In Progress" },
  { value: "Waiting on someone else", label: "Waiting" },
  { value: "Deferred", label: "Deferred" },
  { value: "Completed", label: "Completed" },
];

const PRIORITY_OPTIONS = [
  { value: "Low", label: "Low" },
  { value: "Normal", label: "Normal" },
  { value: "High", label: "High" },
];

function isTaskClosed(t: SfTask): boolean {
  if (t.IsClosed != null) return !!t.IsClosed;
  return t.Status === "Completed";
}

type Scope =
  | { type: "account"; accountId: string }
  | { type: "opportunity"; opportunityId: string };

/**
 * Compact task panel that drops in below a table row when the row is
 * expanded. Shows only open tasks — completed tasks live in the detail
 * drawer. Fixed height so the virtualizer can pre-allocate space.
 */
export function TaskExpandPanel({ scope }: { scope: Scope }) {
  if (scope.type === "account") {
    return <AccountTaskPanel accountId={scope.accountId} />;
  }
  return <OppTaskPanel opportunityId={scope.opportunityId} />;
}

// ── Account variant ──────────────────────────────────────────────────────────

function AccountTaskPanel({ accountId }: { accountId: string }) {
  const { data: tasks = [], isLoading } = useAccountTasks(accountId);
  const updateTask = useUpdateTask();
  const createTask = useCreateAccountTask();
  const usersQ = useActiveUsers();

  const ownerOptions = useMemo(
    () => (usersQ.data ?? []).map((u) => ({ value: u.Id, label: u.Name })),
    [usersQ.data],
  );

  const open = tasks.filter((t) => !isTaskClosed(t));

  const saveStatus = (id: string, status: string) =>
    updateTask.mutateAsync({ id, patch: { Status: status } }).then(() => undefined);
  const savePriority = (id: string, priority: string) =>
    updateTask.mutateAsync({ id, patch: { Priority: priority } }).then(() => undefined);
  const saveDate = (id: string, date: string | null) =>
    updateTask.mutateAsync({ id, patch: { ActivityDate: date } }).then(() => undefined);
  const saveOwner = (id: string, ownerId: string) =>
    updateTask.mutateAsync({ id, patch: { OwnerId: ownerId } }).then(() => undefined);
  const toggleComplete = (t: SfTask) =>
    void updateTask.mutateAsync({
      id: t.Id,
      patch: { Status: isTaskClosed(t) ? "Not Started" : "Completed" },
    });

  return (
    <PanelShell
      heading={isLoading ? "Tasks · Open (…)" : `Tasks · Open (${open.length})`}
    >
      {isLoading ? (
        <PanelLoading />
      ) : open.length === 0 ? (
        <PanelEmpty />
      ) : (
        <ul className="flex flex-col overflow-auto" style={{ maxHeight: 196 }}>
          {open.map((t) => {
            // Tasks filed directly on the account have WhatId === accountId.
            // Tasks filed on an opportunity have a different WhatId — show
            // the opp name as a pill so it's clear which record owns the task.
            const oppName =
              t.WhatId && t.WhatId !== accountId ? (t.WhatName ?? null) : null;
            return (
              <TaskRow
                key={t.Id}
                t={t}
                ownerOptions={ownerOptions}
                onToggleComplete={() => toggleComplete(t)}
                onSaveStatus={(s) => saveStatus(t.Id, s)}
                onSavePriority={(p) => savePriority(t.Id, p)}
                onSaveDate={(d) => saveDate(t.Id, d)}
                onSaveOwner={(o) => saveOwner(t.Id, o)}
                contextLabel={oppName}
              />
            );
          })}
        </ul>
      )}
      <NewTaskRow
        placeholder="Add an account-level task — press Enter to create"
        disabled={createTask.isPending}
        onCreate={async (subject) => {
          await createTask.mutateAsync({ accountId, body: { Subject: subject } });
        }}
      />
    </PanelShell>
  );
}

// ── Opportunity variant ───────────────────────────────────────────────────────

function OppTaskPanel({ opportunityId }: { opportunityId: string }) {
  const { data: tasks = [], isLoading } = useOpportunityTasks(opportunityId);
  const updateTask = useUpdateTask();
  const createTask = useCreateTask();
  const usersQ = useActiveUsers();

  const ownerOptions = useMemo(
    () => (usersQ.data ?? []).map((u) => ({ value: u.Id, label: u.Name })),
    [usersQ.data],
  );

  const open = tasks.filter((t) => !isTaskClosed(t));

  const saveStatus = (id: string, status: string) =>
    updateTask.mutateAsync({ id, patch: { Status: status } }).then(() => undefined);
  const savePriority = (id: string, priority: string) =>
    updateTask.mutateAsync({ id, patch: { Priority: priority } }).then(() => undefined);
  const saveDate = (id: string, date: string | null) =>
    updateTask.mutateAsync({ id, patch: { ActivityDate: date } }).then(() => undefined);
  const saveOwner = (id: string, ownerId: string) =>
    updateTask.mutateAsync({ id, patch: { OwnerId: ownerId } }).then(() => undefined);
  const toggleComplete = (t: SfTask) =>
    void updateTask.mutateAsync({
      id: t.Id,
      patch: { Status: isTaskClosed(t) ? "Not Started" : "Completed" },
    });

  return (
    <PanelShell
      heading={isLoading ? "Tasks · Open (…)" : `Tasks · Open (${open.length})`}
    >
      {isLoading ? (
        <PanelLoading />
      ) : open.length === 0 ? (
        <PanelEmpty />
      ) : (
        <ul className="flex flex-col overflow-auto" style={{ maxHeight: 196 }}>
          {open.map((t) => (
            <TaskRow
              key={t.Id}
              t={t}
              ownerOptions={ownerOptions}
              onToggleComplete={() => toggleComplete(t)}
              onSaveStatus={(s) => saveStatus(t.Id, s)}
              onSavePriority={(p) => savePriority(t.Id, p)}
              onSaveDate={(d) => saveDate(t.Id, d)}
              onSaveOwner={(o) => saveOwner(t.Id, o)}
            />
          ))}
        </ul>
      )}
      <NewTaskRow
        placeholder="Add a task — press Enter to create"
        disabled={createTask.isPending}
        onCreate={async (subject) => {
          await createTask.mutateAsync({ opportunityId, body: { Subject: subject } });
        }}
      />
    </PanelShell>
  );
}

// ── Shared sub-components ────────────────────────────────────────────────────

function PanelShell({
  heading,
  children,
}: {
  heading: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className="flex flex-col border-t-2 border-accent/20 bg-surface-2/50"
      style={{ height: TASK_PANEL_HEIGHT }}
    >
      {/* Header */}
      <div className="flex-shrink-0 border-b border-border-strong pl-8 pr-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-ink-3">
        {heading}
      </div>
      {/* Scrollable body + footer */}
      <div className="flex min-h-0 flex-1 flex-col">
        {children}
      </div>
    </div>
  );
}

function TaskRow({
  t,
  ownerOptions,
  onToggleComplete,
  onSaveStatus,
  onSavePriority,
  onSaveDate,
  onSaveOwner,
  contextLabel,
}: {
  t: SfTask;
  ownerOptions: { value: string; label: string }[];
  onToggleComplete: () => void;
  onSaveStatus: (next: string) => Promise<void>;
  onSavePriority: (next: string) => Promise<void>;
  onSaveDate: (next: string | null) => Promise<void>;
  onSaveOwner: (next: string) => Promise<void>;
  contextLabel?: string | null;
}) {
  return (
    <li
      className={cn(
        "flex items-center gap-2 border-b border-border-strong pl-8 pr-3 py-1.5 last:border-b-0",
        isTaskClosed(t) && "text-ink-3",
      )}
    >
      <input
        type="checkbox"
        checked={isTaskClosed(t)}
        onChange={onToggleComplete}
        className="h-3.5 w-3.5 flex-shrink-0 cursor-pointer"
        aria-label={isTaskClosed(t) ? "Reopen task" : "Mark complete"}
      />
      <span
        className={cn(
          "min-w-0 flex-1 truncate text-[12.5px]",
          isTaskClosed(t) && "line-through",
        )}
        title={t.Subject ?? ""}
      >
        {t.Subject ?? "(no subject)"}
      </span>
      {contextLabel && (
        <span
          className="flex-shrink-0 max-w-[120px] truncate rounded bg-accent/10 px-1.5 py-px text-[10.5px] font-medium text-accent-ink"
          title={contextLabel}
        >
          {contextLabel}
        </span>
      )}
      <div className="w-[130px] flex-shrink-0">
        <InlineSelect
          value={t.Status ?? null}
          options={STATUS_OPTIONS}
          onSave={onSaveStatus}
        />
      </div>
      <div className="w-[80px] flex-shrink-0">
        <InlineSelect
          value={t.Priority ?? null}
          options={PRIORITY_OPTIONS}
          onSave={onSavePriority}
        />
      </div>
      <div className="w-[130px] flex-shrink-0">
        <InlineSelect
          value={t.OwnerId ?? null}
          options={ownerOptions}
          onSave={onSaveOwner}
          renderValue={() => (
            <span className="truncate text-[12px] text-ink-2">
              {t.OwnerName ??
                ownerOptions.find((o) => o.value === t.OwnerId)?.label ??
                "—"}
            </span>
          )}
        />
      </div>
      <div className="w-[100px] flex-shrink-0">
        <InlineDate
          value={t.ActivityDate}
          onSave={onSaveDate}
          align="right"
          placeholder="—"
        />
      </div>
    </li>
  );
}

function NewTaskRow({
  onCreate,
  placeholder,
  disabled,
}: {
  onCreate: (subject: string) => Promise<void>;
  placeholder: string;
  disabled?: boolean;
}) {
  const [subject, setSubject] = useState("");

  const submit = async () => {
    const trimmed = subject.trim();
    if (!trimmed || disabled) return;
    await onCreate(trimmed);
    setSubject("");
  };

  return (
    <div className="flex flex-shrink-0 items-center gap-2 border-t border-border-strong bg-surface-2/40 pl-8 pr-3 py-1.5">
      <Plus size={13} className="flex-shrink-0 text-ink-3" />
      <input
        value={subject}
        onChange={(e) => setSubject(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            void submit();
          }
        }}
        placeholder={placeholder}
        disabled={disabled}
        className="min-w-0 flex-1 border-0 bg-transparent text-[12.5px] text-ink outline-none placeholder:text-ink-4 disabled:opacity-50"
      />
      {subject.trim() ? (
        <button
          type="button"
          onClick={submit}
          disabled={disabled}
          className="rounded border border-ink bg-ink px-2 py-0.5 text-[11px] font-medium text-surface hover:opacity-90 disabled:opacity-50"
        >
          Create
        </button>
      ) : null}
    </div>
  );
}

function PanelLoading() {
  return (
    <div className="flex-1 px-5 py-4 text-center text-[12px] text-ink-3">
      Loading tasks…
    </div>
  );
}

function PanelEmpty() {
  return (
    <div className="flex-1 px-5 py-4 text-center text-[12px] text-ink-3">
      No open tasks.
    </div>
  );
}
