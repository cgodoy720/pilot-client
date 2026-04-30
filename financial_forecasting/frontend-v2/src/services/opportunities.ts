import { useQuery } from "@tanstack/react-query";

import { api } from "@/lib/api";
import type { SfOpportunity } from "@/types/salesforce";

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
