import { useQuery } from "@tanstack/react-query";

import { api } from "@/lib/api";
import type { SfAccount } from "@/types/salesforce";

/**
 * Fetch all SF Accounts via the existing FastAPI endpoint.
 *
 * The backend (main.py:535) returns [] if the SF session isn't connected
 * — we treat that as a non-error empty list, same as the legacy frontend.
 */
async function fetchAccounts(): Promise<SfAccount[]> {
  const { data } = await api.get<SfAccount[]>("/api/salesforce/accounts");
  return data;
}

export function useAccounts() {
  return useQuery({
    queryKey: ["accounts"],
    queryFn: fetchAccounts,
    staleTime: 60_000,
  });
}
