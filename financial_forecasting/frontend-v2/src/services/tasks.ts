import { useQuery } from "@tanstack/react-query";

import { api } from "@/lib/api";

/**
 * Salesforce Task as returned by `GET /api/salesforce/my-tasks`
 * (financial_forecasting/main.py:1335). Mirrors the formatter at
 * main.py:1446 — keys are PascalCase.
 *
 * Returns the current SF user's open tasks. The endpoint accepts
 * optional `start` / `end` ISO dates to widen the ActivityDate window;
 * by default it returns open tasks regardless of date.
 */
export interface SfMyTask {
  Id: string;
  Subject?: string | null;
  Status?: string | null;
  Priority?: string | null;
  ActivityDate?: string | null;
  Description?: string | null;
  OwnerId?: string | null;
  OwnerName?: string | null;
  WhatId?: string | null;
  WhatName?: string | null;
  WhoId?: string | null;
  WhoName?: string | null;
  Type?: string | null;
  CreatedDate?: string | null;
  IsClosed?: boolean | null;
}

async function fetchMyTasks(
  start?: string,
  end?: string,
): Promise<SfMyTask[]> {
  try {
    const params = new URLSearchParams();
    if (start) params.set("start", start);
    if (end) params.set("end", end);
    const qs = params.toString();
    const { data } = await api.get<SfMyTask[]>(
      qs ? `/api/salesforce/my-tasks?${qs}` : "/api/salesforce/my-tasks",
    );
    return data ?? [];
  } catch {
    // SF not connected, no my-tasks, or backend error — fall back to
    // an empty list so the unified Tasks page still renders project
    // tasks instead of a hard error.
    return [];
  }
}

export function useMyTasks(start?: string, end?: string) {
  return useQuery({
    queryKey: ["my-tasks", start, end],
    queryFn: () => fetchMyTasks(start, end),
    staleTime: 60_000,
    retry: false,
  });
}
