import { useQuery } from '@tanstack/react-query';

/**
 * Custom hook to fetch aggregated overview statistics
 * @param {string} cohortId - The cohort ID to filter by (optional)
 * @param {string} deliberationFilter - Deliberation filter: 'yes', 'no', 'maybe', 'null', or empty
 * @param {string} token - Authentication token
 * @returns {object} React Query result with data, isLoading, error, refetch
 */
export const useOverviewStats = (cohortId, deliberationFilter, token) => {
  return useQuery({
    queryKey: ['overview-stats', cohortId, deliberationFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (cohortId) params.append('cohort_id', cohortId);
      if (deliberationFilter) params.append('deliberation', deliberationFilter);
      
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/admissions/dashboard/overview/stats?${params}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch overview stats');
      }
      
      return response.json();
    },
    enabled: !!token, // Only run query if token exists
    staleTime: 30000, // 30 seconds
    refetchInterval: 30000, // Poll every 30 seconds
  });
};

/**
 * Custom hook to fetch aggregated demographics by stage
 * @param {string} cohortId - The cohort ID to filter by (optional)
 * @param {string} stage - The pipeline stage: 'applied', 'info', 'workshops', 'offers', 'marketing'
 * @param {string} deliberationFilter - Deliberation filter
 * @param {string} token - Authentication token
 * @returns {object} React Query result with data, isLoading, error, refetch
 */
export const useOverviewDemographics = (cohortId, stage, deliberationFilter, token) => {
  return useQuery({
    queryKey: ['overview-demographics', cohortId, stage, deliberationFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (cohortId) params.append('cohort_id', cohortId);
      if (stage) params.append('stage', stage);
      if (deliberationFilter) params.append('deliberation', deliberationFilter);
      
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/admissions/dashboard/overview/demographics?${params}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch demographics');
      }
      
      return response.json();
    },
    enabled: !!token, // Only run query if token exists
    staleTime: 30000, // 30 seconds
    refetchInterval: 30000, // Poll every 30 seconds
  });
};

/**
 * Custom hook to fetch comparison statistics for a cohort
 * @param {string} cohortId - The cohort ID to fetch stats for
 * @param {boolean} enabled - Whether to enable this query
 * @param {string} token - Authentication token
 * @returns {object} React Query result with data, isLoading, error, refetch
 */
export const useComparisonStats = (cohortId, enabled, token) => {
  return useQuery({
    queryKey: ['comparison-stats', cohortId],
    queryFn: async () => {
      if (!cohortId) return null;
      
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/admissions/dashboard/overview/comparison?cohort_id=${cohortId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch comparison stats');
      }
      
      return response.json();
    },
    enabled: enabled && !!token && !!cohortId, // Only run when comparison is enabled and we have a cohort ID
    staleTime: 30000, // 30 seconds
    refetchInterval: enabled ? 30000 : false, // Only poll when enabled
  });
};

