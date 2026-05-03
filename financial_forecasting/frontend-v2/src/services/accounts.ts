import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { api } from "@/lib/api";
import type { SfAccount } from "@/types/salesforce";

export interface AccountEnrichment {
  sf_account_id: string;
  company_id: number;
  name: string | null;
  domain: string | null;
  logo_url: string | null;
  industry: string | null;
  size_bucket: string | null;
  enrichment_source: string | null;
  enriched_at: string | null;
  confidence: string | null;
  matched_by: string | null;
}

/** Single-account enrichment lookup. Returns null if no match yet. */
export function useAccountEnrichment(sfAccountId: string | null | undefined) {
  return useQuery({
    queryKey: ["account-enrichment", sfAccountId],
    queryFn: async (): Promise<AccountEnrichment | null> => {
      if (!sfAccountId) return null;
      const { data } = await api.get<AccountEnrichment | null>(
        `/api/accounts/${encodeURIComponent(sfAccountId)}/enrichment`,
      );
      return data;
    },
    enabled: !!sfAccountId,
    staleTime: 5 * 60_000,
  });
}

/** Batch enrichment lookup. Returns `{sf_account_id: enrichment | null}`
 *  for every requested id. Chunks into 200-id GETs (URL gets too long
 *  past ~400 ids; Pursuit has 20k+ SF Accounts) and merges. Stable
 *  cache key via sorted ids so two callers with the same set share. */
const ENRICH_CHUNK = 200;

export function useAccountsEnrichment(sfAccountIds: string[]) {
  const stableKey = useMemo(() => [...sfAccountIds].sort(), [sfAccountIds]);
  return useQuery({
    queryKey: ["accounts-enrichment", stableKey],
    queryFn: async (): Promise<Record<string, AccountEnrichment | null>> => {
      if (stableKey.length === 0) return {};
      const chunks: string[][] = [];
      for (let i = 0; i < stableKey.length; i += ENRICH_CHUNK) {
        chunks.push(stableKey.slice(i, i + ENRICH_CHUNK));
      }
      const results = await Promise.all(
        chunks.map((c) =>
          api
            .get<Record<string, AccountEnrichment | null>>(
              `/api/accounts/enrichment?ids=${c.join(",")}`,
            )
            .then((r) => r.data),
        ),
      );
      return Object.assign({}, ...results);
    },
    enabled: stableKey.length > 0,
    staleTime: 5 * 60_000,
  });
}

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
    onSuccess: (_data, { id, patch, displayPatch }) => {
      const merged = { ...patch, ...(displayPatch ?? {}) };
      qc.setQueryData<SfAccount[]>(["accounts"], (old) => {
        if (!old) return old;
        return old.map((a) =>
          a.Id === id ? ({ ...a, ...merged } as SfAccount) : a,
        );
      });
    },
    onSettled: () => {
      setTimeout(
        () => qc.invalidateQueries({ queryKey: ["accounts"] }),
        2000,
      );
    },
  });
}
