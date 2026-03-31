import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { useQuery } from 'react-query';
import { apiService } from '../services/api';
import type { Activity, ActivityType, ActivitySource } from '../types/activity';

// ---------------------------------------------------------------------------
// Hook params
// ---------------------------------------------------------------------------

export interface UseActivitiesParams {
  opportunityId?: string;
  accountId?: string;
  contactId?: string;
  type?: ActivityType;
  source?: ActivitySource;
  startDate?: string;
  endDate?: string;
  search?: string;
  limit?: number;
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

const DEFAULT_LIMIT = 25;

export function useActivities(params: UseActivitiesParams) {
  const {
    opportunityId,
    accountId,
    contactId,
    type,
    source,
    startDate,
    endDate,
    search,
    limit = DEFAULT_LIMIT,
  } = params;

  const [offset, setOffset] = useState(0);
  const [accumulated, setAccumulated] = useState<Activity[]>([]);
  const prevFilterKey = useRef('');

  const hasEntity = !!(opportunityId || accountId || contactId);
  const isSearchMode = !!(search && search.trim().length > 0);

  // Stable filter key to detect when filters change (reset pagination)
  const filterKey = useMemo(
    () => JSON.stringify({ opportunityId, accountId, contactId, type, source, startDate, endDate, search }),
    [opportunityId, accountId, contactId, type, source, startDate, endDate, search],
  );

  // Reset accumulated results and offset when filters change
  useEffect(() => {
    if (filterKey !== prevFilterKey.current) {
      prevFilterKey.current = filterKey;
      setOffset(0);
      setAccumulated([]);
    }
  }, [filterKey]);

  // Query key includes offset so each page is a distinct cache entry
  const queryKey = useMemo(
    () => ['activities', { ...params, offset }],
    [params, offset],
  );

  const { data, isLoading, error, refetch, isFetching } = useQuery(
    queryKey,
    async () => {
      if (isSearchMode) {
        // Search endpoint — returns raw Activity[] (no wrapper, no pagination)
        const res = await apiService.searchActivities({
          q: search!.trim(),
          opportunity_id: opportunityId,
          account_id: accountId,
          contact_id: contactId,
          limit,
        });
        return { activities: res.data as Activity[], total: (res.data as Activity[]).length, isSearch: true };
      }

      // List endpoint — returns ApiResponse { success, data: Activity[], meta: { total, limit, offset } }
      const res = await apiService.getActivities({
        opportunity_id: opportunityId,
        account_id: accountId,
        contact_id: contactId,
        type,
        source,
        start_date: startDate,
        end_date: endDate,
        limit,
        offset,
      });
      const body = res.data;
      return {
        activities: (body.data || []) as Activity[],
        total: body.meta?.total ?? 0,
        isSearch: false,
      };
    },
    {
      enabled: hasEntity,
      keepPreviousData: true,
      staleTime: 30_000, // 30 seconds — entity data changes often
      onSuccess: (result) => {
        if (result.isSearch) {
          // Search mode: replace accumulated with search results
          setAccumulated(result.activities);
        } else if (offset === 0) {
          // First page: replace
          setAccumulated(result.activities);
        } else {
          // Subsequent pages: append (deduplicate by id)
          setAccumulated((prev) => {
            const existingIds = new Set(prev.map((a) => a.id));
            const newItems = result.activities.filter((a) => !existingIds.has(a.id));
            return [...prev, ...newItems];
          });
        }
      },
    },
  );

  const total = data?.total ?? 0;
  const hasMore = !isSearchMode && accumulated.length < total;

  const loadMore = useCallback(() => {
    if (hasMore && !isFetching) {
      setOffset((prev) => prev + limit);
    }
  }, [hasMore, isFetching, limit]);

  return {
    activities: accumulated,
    total,
    isLoading,
    isFetching,
    error,
    refetch,
    loadMore,
    hasMore,
    isSearchMode,
  };
}
