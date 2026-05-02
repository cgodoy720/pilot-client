import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export interface SfPayment {
  Id: string;
  npe01__Payment_Amount__c: number | null;
  npe01__Scheduled_Date__c: string | null;
  npe01__Payment_Date__c: string | null;
  npe01__Paid__c: boolean;
  npe01__Written_Off__c?: boolean;
  npe01__Payment_Method__c?: string | null;
  npe01__Opportunity__r?: {
    Name?: string;
    Account?: { Name?: string };
  };
}

async function fetchPayments(): Promise<SfPayment[]> {
  const { data } = await api.get<SfPayment[]>("/api/salesforce/payments?limit=2000");
  return data;
}

export function usePayments() {
  return useQuery({
    queryKey: ["payments"],
    queryFn: fetchPayments,
    staleTime: 60_000,
  });
}

export function useOpportunityPayments(opportunityId: string | null) {
  return useQuery({
    queryKey: ["opp-payments", opportunityId],
    queryFn: async () => {
      const { data } = await api.get<SfPayment[]>(
        `/api/salesforce/opportunities/${opportunityId}/payments`,
      );
      return data;
    },
    enabled: !!opportunityId,
    staleTime: 60_000,
  });
}
