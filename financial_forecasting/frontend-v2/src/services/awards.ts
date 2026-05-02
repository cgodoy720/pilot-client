import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { api } from "@/lib/api";

export type AwardStatus = "Active" | "Closing" | "Closed" | "Did Not Fulfill";

export interface Award {
  id: string;
  opportunity_id: string;
  award_status: AwardStatus;
  award_date: string | null;
  period_end_date: string | null;
  notes: string;
  reporting_frequency: string | null;
  next_report_due: string | null;
  created_at: string;
  updated_at: string;
}

async function fetchAwards(status?: AwardStatus): Promise<Award[]> {
  const path = status
    ? `/api/awards?status=${encodeURIComponent(status)}`
    : "/api/awards";
  const { data } = await api.get<Award[]>(path);
  return data;
}

export function useAwards(status?: AwardStatus) {
  return useQuery({
    queryKey: ["awards", status ?? "all"],
    queryFn: () => fetchAwards(status),
    staleTime: 60_000,
  });
}

export interface AwardPatch {
  award_status?: AwardStatus;
  period_end_date?: string | null;
  notes?: string;
  reporting_frequency?: string | null;
  next_report_due?: string | null;
}

export function useUpdateAward() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, patch }: { id: string; patch: AwardPatch }) => {
      const { data } = await api.patch<Award>(`/api/awards/${id}`, patch);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["awards"] });
    },
  });
}
