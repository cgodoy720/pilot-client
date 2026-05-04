import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { api } from "@/lib/api";
import type { SfContact } from "@/types/salesforce";

export interface CreateContactBody {
  AccountId: string;
  FirstName?: string;
  LastName: string;
  Email?: string;
  Phone?: string;
  Title?: string;
  // Optional — set the new contact as the account's philanthropic
  // primary in the same round-trip.
  Philanthropic_Contact__c?: boolean;
}

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

export function useCreateContact() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: CreateContactBody) => {
      const { data } = await api.post<{ id: string; message: string }>(
        "/api/salesforce/contacts",
        body,
      );
      return data;
    },
    onSettled: (_data, _err, vars) => {
      setTimeout(() => {
        void qc.invalidateQueries({ queryKey: ["contacts", vars.AccountId] });
        void qc.invalidateQueries({ queryKey: ["contacts", "all"] });
      }, 1500);
    },
  });
}

/**
 * Delete a Salesforce Contact. Backend invalidates contact + task caches
 * (Who.Name joins). We optimistically drop the row from every cached
 * contacts list (global + per-account) and rollback on error.
 */
export function useDeleteContact() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/api/salesforce/contacts/${encodeURIComponent(id)}`);
      return id;
    },
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: ["contacts"] });
      const snapshots = qc
        .getQueriesData<SfContact[]>({ queryKey: ["contacts"] })
        .map(([key, data]) => ({ key, data }));
      qc.setQueriesData<SfContact[]>({ queryKey: ["contacts"] }, (old) =>
        old ? old.filter((c) => c.Id !== id) : old,
      );
      return { snapshots };
    },
    onError: (_err, _id, ctx) => {
      ctx?.snapshots?.forEach(({ key, data }) => qc.setQueryData(key, data));
    },
    onSettled: () => {
      setTimeout(() => qc.invalidateQueries({ queryKey: ["contacts"] }), 2000);
    },
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
