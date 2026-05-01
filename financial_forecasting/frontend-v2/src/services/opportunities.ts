import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { api } from "@/lib/api";
import type { SfOpportunity, SfPayment, SfTask } from "@/types/salesforce";

export interface OpportunityFilters {
  recordType?: "Philanthropy" | "PBC" | string;
  activeOnly?: boolean;
  limit?: number;
}

async function fetchOpportunities(
  filters: OpportunityFilters = {},
): Promise<SfOpportunity[]> {
  const params = new URLSearchParams();
  if (filters.recordType) params.set("record_type", filters.recordType);
  if (filters.activeOnly) params.set("active_only", "true");
  if (filters.limit) params.set("limit", String(filters.limit));
  const qs = params.toString();
  const path = qs
    ? `/api/salesforce/opportunities?${qs}`
    : "/api/salesforce/opportunities";
  const { data } = await api.get<SfOpportunity[]>(path);
  return data;
}

export function useOpportunities(filters: OpportunityFilters = {}) {
  return useQuery({
    queryKey: ["opportunities", filters],
    queryFn: () => fetchOpportunities(filters),
    staleTime: 60_000,
  });
}

async function fetchOpportunityPayments(oppId: string): Promise<SfPayment[]> {
  const { data } = await api.get<SfPayment[]>(
    `/api/salesforce/opportunities/${encodeURIComponent(oppId)}/payments`,
  );
  return data;
}

export function useOpportunityPayments(oppId: string | undefined) {
  return useQuery({
    queryKey: ["opportunity-payments", oppId],
    queryFn: () => fetchOpportunityPayments(oppId!),
    staleTime: 60_000,
    enabled: !!oppId,
  });
}

interface TasksResponse {
  success: boolean;
  data: SfTask[];
}

async function fetchOpportunityTasks(oppId: string): Promise<SfTask[]> {
  const { data } = await api.get<TasksResponse>(
    `/api/salesforce/opportunities/${encodeURIComponent(oppId)}/tasks`,
  );
  return data.data ?? [];
}

export function useOpportunityTasks(oppId: string | undefined) {
  return useQuery({
    queryKey: ["opportunity-tasks", oppId],
    queryFn: () => fetchOpportunityTasks(oppId!),
    staleTime: 60_000,
    enabled: !!oppId,
  });
}

export interface CreateOpportunityBody {
  Name: string;
  StageName: string;
  CloseDate: string;
  AccountId: string;
  Amount?: number | null;
  OwnerId?: string | null;
  Description?: string | null;
}

export function useCreateOpportunity() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: CreateOpportunityBody) => {
      const { data } = await api.post<{ id: string; message: string }>(
        "/api/salesforce/opportunities",
        body,
      );
      return data;
    },
    onSettled: () => {
      setTimeout(() => qc.invalidateQueries({ queryKey: ["opportunities"] }), 1500);
    },
  });
}

/**
 * Generic Opp patch — backend PUT /api/salesforce/opportunities/{id}.
 * Use for fields like NextStep, Description, Amount. For StageName,
 * prefer useUpdateOpportunityStage which goes through validate +
 * award-creation handler.
 */
export function useUpdateOpportunity() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      patch,
    }: {
      id: string;
      patch: Record<string, unknown>;
      displayPatch?: Record<string, unknown>;
    }) => {
      const { data } = await api.put<SfOpportunity>(
        `/api/salesforce/opportunities/${encodeURIComponent(id)}`,
        { updates: patch, reason: "Updated via Bedrock" },
      );
      return data;
    },
    onMutate: async ({ id, patch, displayPatch }) => {
      await qc.cancelQueries({ queryKey: ["opportunities"] });
      const snapshots = qc
        .getQueriesData<SfOpportunity[]>({ queryKey: ["opportunities"] })
        .map(([key, data]) => ({ key, data }));
      const merged = { ...patch, ...(displayPatch ?? {}) };
      qc.setQueriesData<SfOpportunity[]>(
        { queryKey: ["opportunities"] },
        (old) =>
          old?.map((o) =>
            o.Id === id ? ({ ...o, ...merged } as SfOpportunity) : o,
          ),
      );
      return { snapshots };
    },
    onError: (_err, _vars, ctx) => {
      ctx?.snapshots?.forEach(({ key, data }) => qc.setQueryData(key, data));
    },
    onSettled: () => {
      setTimeout(
        () => qc.invalidateQueries({ queryKey: ["opportunities"] }),
        2000,
      );
    },
  });
}

interface TaskCreateBody {
  Subject: string;
  Status?: string;
  Priority?: string;
  ActivityDate?: string | null;
  Description?: string | null;
  OwnerId?: string | null;
  WhoId?: string | null;
}

interface TaskUpdateBody {
  Subject?: string;
  Status?: string;
  Priority?: string;
  ActivityDate?: string | null;
  Description?: string | null;
  OwnerId?: string | null;
  WhoId?: string | null;
}

interface TaskCreateResult {
  success?: boolean;
  data?: { id?: string };
}

/**
 * Create a Salesforce task linked to an opportunity. The backend stamps
 * WhatId from the URL path; we only ship body fields.
 */
export function useCreateTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      opportunityId,
      body,
    }: {
      opportunityId: string;
      body: TaskCreateBody;
    }) => {
      const { data } = await api.post<TaskCreateResult>(
        `/api/salesforce/opportunities/${encodeURIComponent(opportunityId)}/tasks`,
        body,
      );
      return data;
    },
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({
        queryKey: ["opportunity-tasks", vars.opportunityId],
      });
    },
  });
}

/** Cache-key prefixes that may hold a task list — used by useUpdateTask
 *  to broadcast optimistic edits across every list that contains the row. */
const TASK_LIST_PREFIXES = ["opportunity-tasks", "account-tasks"] as const;

function applyTaskPatch(t: SfTask, patch: TaskUpdateBody): SfTask {
  // IsClosed is SF-computed. When Status is patched, derive locally so
  // the checkbox flips immediately on both complete *and* reopen.
  const next = { ...t, ...patch } as SfTask;
  if (patch.Status !== undefined) {
    next.IsClosed = patch.Status === "Completed";
  }
  return next;
}

/**
 * Update one of a task's fields. The mutation finds every cached task
 * list that contains this task (across opp + account scopes) and
 * rewrites it optimistically, so an edit on the Account page reflects
 * instantly even if the Opportunity page has the same task cached.
 */
export function useUpdateTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      patch,
    }: {
      id: string;
      patch: TaskUpdateBody;
    }) => {
      const { data } = await api.put<SfTask>(
        `/api/salesforce/tasks/${encodeURIComponent(id)}`,
        patch,
      );
      return data;
    },
    onMutate: async ({ id, patch }) => {
      const matches = qc.getQueryCache().findAll({
        predicate: (q) => {
          const k = q.queryKey;
          if (!Array.isArray(k) || typeof k[0] !== "string") return false;
          if (!TASK_LIST_PREFIXES.includes(k[0] as (typeof TASK_LIST_PREFIXES)[number])) {
            return false;
          }
          const data = q.state.data as SfTask[] | undefined;
          return Array.isArray(data) && data.some((t) => t.Id === id);
        },
      });

      const snapshots: { key: readonly unknown[]; data: SfTask[] }[] = [];
      for (const m of matches) {
        const prev = qc.getQueryData<SfTask[]>(m.queryKey);
        if (!prev) continue;
        snapshots.push({ key: m.queryKey, data: prev });
        await qc.cancelQueries({ queryKey: m.queryKey });
        qc.setQueryData<SfTask[]>(m.queryKey, (old) =>
          old?.map((t) => (t.Id === id ? applyTaskPatch(t, patch) : t)),
        );
      }
      return { snapshots };
    },
    onError: (_err, _vars, ctx) => {
      ctx?.snapshots?.forEach(({ key, data }) => qc.setQueryData(key, data));
    },
    onSettled: () => {
      // Invalidate all task lists 2s later so the server's truth wins.
      setTimeout(() => {
        TASK_LIST_PREFIXES.forEach((prefix) =>
          qc.invalidateQueries({ queryKey: [prefix] }),
        );
      }, 2000);
    },
  });
}

/* ────────────────────────────────────────────────────────────────────
 * Account-scoped task hooks. WhatId can point to Account directly or
 * to any of the account's opps; the backend unions both.
 * ──────────────────────────────────────────────────────────────────── */

async function fetchAccountTasks(accountId: string): Promise<SfTask[]> {
  const { data } = await api.get<TasksResponse>(
    `/api/salesforce/accounts/${encodeURIComponent(accountId)}/tasks`,
  );
  return data.data ?? [];
}

export function useAccountTasks(accountId: string | undefined) {
  return useQuery({
    queryKey: ["account-tasks", accountId],
    queryFn: () => fetchAccountTasks(accountId!),
    staleTime: 60_000,
    enabled: !!accountId,
  });
}

/**
 * Create a task tied directly to an Account (WhatId = account_id). For
 * tasks tied to a specific opportunity, use useCreateTask instead.
 */
export function useCreateAccountTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      accountId,
      body,
    }: {
      accountId: string;
      body: TaskCreateBody;
    }) => {
      const { data } = await api.post<TaskCreateResult>(
        `/api/salesforce/accounts/${encodeURIComponent(accountId)}/tasks`,
        body,
      );
      return data;
    },
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ["account-tasks", vars.accountId] });
    },
  });
}

/**
 * Stage transition — uses POST /api/opportunities/update-stage so the
 * server-side validation runs and the awards auto-create handler fires
 * on closed-won transitions.
 */
export function useUpdateOpportunityStage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      newStage,
    }: {
      id: string;
      newStage: string;
    }) => {
      const { data } = await api.post(`/api/opportunities/update-stage`, {
        opportunity_id: id,
        new_stage: newStage,
      });
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["opportunities"] });
      qc.invalidateQueries({ queryKey: ["awards"] });
    },
  });
}
