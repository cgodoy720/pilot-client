/**
 * Custom hook that encapsulates all Opportunities data fetching,
 * mutations, and derived state (maps, metrics, filtered lists).
 */
import { useState, useRef, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import toast from 'react-hot-toast';
import { apiService } from '../../services/api';
import {
  OPEN_STAGES,
  COLLECTING_STAGES,
  CLOSED_STAGES,
} from '../../types/salesforce';
import type { Opportunity } from './helpers';

export type ViewMode = 'open' | 'collecting' | 'closed';

export function useOpportunityData(
  viewMode: ViewMode,
  philanthropyOnly: boolean,
  pbcOnly: boolean,
) {
  const queryClient = useQueryClient();

  // Track recently-changed rows so they stay visible briefly after stage change
  const [recentlyChangedIds, setRecentlyChangedIds] = useState<Record<string, boolean>>({});
  const recentlyChangedRef = useRef<Set<string>>(new Set());

  // ---------- Queries ----------

  const stagesForView = viewMode === 'open' ? OPEN_STAGES
    : viewMode === 'collecting' ? COLLECTING_STAGES : CLOSED_STAGES;

  // Share cache with Priorities/Dashboard when no filters: use key 'opportunities' + no params
  const useSharedCache = !philanthropyOnly && !pbcOnly && viewMode === 'open';
  const queryKey = useSharedCache ? 'opportunities' : ['opportunities', philanthropyOnly, pbcOnly, viewMode];

  const { data: opportunitiesData, isLoading, error } = useQuery(
    queryKey,
    async () => {
      if (useSharedCache) {
        const response = await apiService.getOpportunities();
        return response.data;
      }
      const params: any = { stages: stagesForView };
      if (philanthropyOnly) {
        params.record_type = 'Philanthropy';
        params.active_only = true;
      }
      if (pbcOnly) {
        params.opp_type = 'PBC';
        params.active_only = true;
      }
      const response = await apiService.getOpportunities(params);
      return response.data;
    },
  );

  const rawOpportunities = useMemo(() => {
    if (Array.isArray(opportunitiesData)) return opportunitiesData;
    return (opportunitiesData as any)?.opportunities
      ?? (opportunitiesData as any)?.data
      ?? [];
  }, [opportunitiesData]);

  // When using shared cache, filter client-side by stagesForView
  const opportunities: Opportunity[] = useMemo(() => {
    if (useSharedCache) {
      return rawOpportunities.filter((opp: Opportunity) =>
        (stagesForView as readonly string[]).includes(opp.StageName),
      );
    }
    return rawOpportunities;
  }, [rawOpportunities, useSharedCache, stagesForView]);

  const { data: usersData } = useQuery(
    'users',
    async () => {
      const response = await apiService.getUsers({ limit: 1000 });
      return response.data;
    },
    { staleTime: 300000 },
  );

  const { data: accountsData } = useQuery(
    'accounts',
    async () => {
      const response = await apiService.getAccounts();
      return response.data;
    },
    { staleTime: 300000 },
  );

  // ---------- Derived lookups ----------

  const users = useMemo(
    () => (Array.isArray(usersData) ? usersData : (usersData as any)?.users ?? []),
    [usersData],
  );

  const accounts = useMemo(
    () => (Array.isArray(accountsData) ? accountsData : (accountsData as any)?.accounts ?? []),
    [accountsData],
  );

  const accountMap = useMemo(() => {
    const map = new Map<string, any>();
    accounts.forEach((a: any) => map.set(a.Id, a));
    return map;
  }, [accounts]);

  const userMap = useMemo(() => {
    const map = new Map<string, any>();
    users.forEach((u: any) => map.set(u.Id, u));
    return map;
  }, [users]);

  // ---------- Stage-based sub-lists ----------

  const openOnlyOpps = useMemo(
    () => opportunities.filter((opp) => (OPEN_STAGES as readonly string[]).includes(opp.StageName)),
    [opportunities],
  );

  const paymentOpps = useMemo(
    () => opportunities.filter((opp) => {
      const s = opp.StageName || '';
      return s.includes('Collecting') || s.includes('In Effect');
    }),
    [opportunities],
  );

  // ---------- Mutations ----------

  const updateMutation = useMutation(
    async ({ oppId, updates }: { oppId: string; updates: any }) => {
      return await apiService.updateOpportunity(oppId, updates);
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('opportunities');
        toast.success('Opportunity updated successfully!');
      },
      onError: (error: any) => {
        toast.error(`Failed to update: ${error.message}`);
      },
    },
  );

  const bulkUpdateMutation = useMutation(
    async ({ oppIds, updates }: { oppIds: string[]; updates: any }) => {
      const response = await apiService.bulkUpdateOpportunities(oppIds, updates);
      return response.data;
    },
    {
      onSuccess: (data) => {
        queryClient.invalidateQueries('opportunities');
        if (data.failed_count > 0) {
          toast(`Updated ${data.success_count} of ${data.total} opportunities. ${data.failed_count} failed.`, {
            icon: '\u26A0\uFE0F',
            duration: 5000,
          });
        } else {
          toast.success(`Successfully updated ${data.success_count} opportunities!`);
        }
      },
      onError: (error: any) => {
        toast.error(`Failed to update: ${error.message}`);
      },
    },
  );

  // ---------- Recently-changed helpers ----------

  const markRecentlyChanged = (id: string) => {
    recentlyChangedRef.current.add(id);
    setRecentlyChangedIds((prev) => ({ ...prev, [id]: true }));

    setTimeout(() => {
      recentlyChangedRef.current.delete(id);
      setRecentlyChangedIds((prev) => {
        const { [id]: _, ...rest } = prev;
        return rest;
      });
    }, 5000);
  };

  const clearRecentlyChanged = (id: string) => {
    setRecentlyChangedIds((prev) => {
      const { [id]: _, ...rest } = prev;
      return rest;
    });
  };

  // ---------- Opportunity Locks ----------

  const { data: locksData } = useQuery('opportunity-locks', async () => {
    const res = await apiService.getOpportunityLocks();
    return res.data?.data || [];
  }, { staleTime: 30_000 });

  const lockMap = useMemo(() => {
    const map = new Map<string, { locked_by: string; locked_at: string }>();
    for (const lock of (locksData || [])) {
      map.set(lock.sf_opportunity_id, { locked_by: lock.locked_by, locked_at: lock.locked_at });
    }
    return map;
  }, [locksData]);

  const lockMutation = useMutation(
    async ({ oppId, ownerId }: { oppId: string; ownerId: string }) => apiService.lockOpportunity(oppId, ownerId),
    {
      onSuccess: () => { queryClient.invalidateQueries('opportunity-locks'); toast.success('Opportunity locked'); },
      onError: (err: any) => { toast.error(err.response?.data?.detail || 'Failed to lock'); },
    }
  );

  const unlockMutation = useMutation(
    async (oppId: string) => apiService.unlockOpportunity(oppId),
    {
      onSuccess: () => { queryClient.invalidateQueries('opportunity-locks'); toast.success('Opportunity unlocked'); },
      onError: (err: any) => { toast.error(err.response?.data?.detail || 'Failed to unlock'); },
    }
  );

  return {
    // raw
    opportunities,
    users,
    accounts,
    accountMap,
    userMap,
    openOnlyOpps,
    paymentOpps,
    isLoading,
    error,
    // mutations
    updateMutation,
    bulkUpdateMutation,
    queryClient,
    // recently-changed tracking
    recentlyChangedIds,
    recentlyChangedRef,
    markRecentlyChanged,
    clearRecentlyChanged,
    // locks
    lockMap,
    lockMutation,
    unlockMutation,
  };
}
