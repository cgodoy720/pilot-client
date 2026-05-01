import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { api } from "@/lib/api";
import type { SfContact } from "@/types/salesforce";

async function fetchContacts(accountId?: string): Promise<SfContact[]> {
  const path = accountId
    ? `/api/salesforce/contacts?account_id=${encodeURIComponent(accountId)}`
    : "/api/salesforce/contacts";
  const { data } = await api.get<SfContact[]>(path);
  return data;
}

export function useContacts(accountId?: string) {
  return useQuery({
    queryKey: ["contacts", accountId ?? "all"],
    queryFn: () => fetchContacts(accountId),
    staleTime: 60_000,
  });
}

export function useUpdateContact() {
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
      const { data } = await api.put<SfContact>(
        `/api/salesforce/contacts/${encodeURIComponent(id)}`,
        { updates: patch, reason: "Updated via Bedrock" },
      );
      return data;
    },
    onMutate: async ({ id, patch, displayPatch }) => {
      // Apply optimistic update across all contacts query keys
      // (the global ["contacts"] list and per-account scoped lists).
      await qc.cancelQueries({ queryKey: ["contacts"] });
      const snapshots = qc
        .getQueriesData<SfContact[]>({ queryKey: ["contacts"] })
        .map(([key, data]) => ({ key, data }));
      const merged = { ...patch, ...(displayPatch ?? {}) };
      qc.setQueriesData<SfContact[]>({ queryKey: ["contacts"] }, (old) =>
        old?.map((c) => (c.Id === id ? ({ ...c, ...merged } as SfContact) : c)),
      );
      return { snapshots };
    },
    onError: (_err, _vars, ctx) => {
      ctx?.snapshots?.forEach(({ key, data }) => qc.setQueryData(key, data));
    },
    onSettled: () => {
      setTimeout(() => qc.invalidateQueries({ queryKey: ["contacts"] }), 2000);
    },
  });
}
