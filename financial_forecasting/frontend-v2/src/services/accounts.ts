import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { api } from "@/lib/api";
import type { SfAccount } from "@/types/salesforce";

/**
 * Fetch all SF Accounts via the existing FastAPI endpoint.
 *
 * The backend (main.py:535) returns [] if the SF session isn't connected
 * — we treat that as a non-error empty list, same as the legacy frontend.
 */
async function fetchAccounts(): Promise<SfAccount[]> {
  const { data } = await api.get<SfAccount[]>("/api/salesforce/accounts?fields=light");
  return data;
}

export function useAccounts() {
  return useQuery({
    queryKey: ["accounts"],
    queryFn: fetchAccounts,
    staleTime: 60_000,
  });
}

export interface CreateAccountBody {
  Name: string;
  Type?: string;
  Industry?: string;
  Website?: string;
  BillingCity?: string;
  BillingState?: string;
  OwnerId?: string | null;
}

export function useCreateAccount() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: CreateAccountBody) => {
      const { data } = await api.post<{ id: string; message: string }>(
        "/api/salesforce/accounts",
        body,
      );
      return data;
    },
    onSettled: () => {
      setTimeout(() => qc.invalidateQueries({ queryKey: ["accounts"] }), 1500);
    },
  });
}

/**
 * Patch a Salesforce Account. Backend: PUT /api/salesforce/accounts/{id}
 *
 * Optimistic update flow:
 * 1. `onMutate` cancels in-flight refetches and rewrites the cached
 *    accounts list in-place — so the UI shows the new value immediately
 *    AND it survives if anything else triggers a re-render.
 * 2. `onError` rolls back to the snapshot.
 * 3. `onSettled` waits 2s before invalidating, giving Salesforce time
 *    to propagate the write so the refetched list isn't stale.
 *
 * The `displayPatch` field on the input is merged into the cache as well
 * — used to update visible relationship fields (e.g. when changing
 * OwnerId, set `displayPatch: { Owner: { Name: 'Jane Doe' } }` so the
 * row's owner label updates immediately).
 */
export function useUpdateAccount() {
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
      const { data } = await api.put<SfAccount>(
        `/api/salesforce/accounts/${encodeURIComponent(id)}`,
        { updates: patch, reason: "Updated via Bedrock" },
      );
      return data;
    },
    onMutate: async ({ id, patch, displayPatch }) => {
      await qc.cancelQueries({ queryKey: ["accounts"] });
      const previous = qc.getQueryData<SfAccount[]>(["accounts"]);
      qc.setQueryData<SfAccount[]>(["accounts"], (old) => {
        if (!old) return old;
        const merged = { ...patch, ...(displayPatch ?? {}) };
        return old.map((a) =>
          a.Id === id ? ({ ...a, ...merged } as SfAccount) : a,
        );
      });
      return { previous };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.previous) qc.setQueryData(["accounts"], ctx.previous);
    },
    onSettled: () => {
      // Defer the refetch so SF has time to propagate the write.
      // Without this delay the refetched list often still shows the
      // old value, snapping the cell back.
      setTimeout(
        () => qc.invalidateQueries({ queryKey: ["accounts"] }),
        2000,
      );
    },
  });
}
