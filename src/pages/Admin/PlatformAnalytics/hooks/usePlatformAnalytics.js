import { useQuery } from '@tanstack/react-query';

const API_URL = import.meta.env.VITE_API_URL;
const BASE = `${API_URL}/api/admin/platform-analytics`;

const fetchWithAuth = async (url, token) => {
  const res = await fetch(url, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!res.ok) throw new Error(`Failed to fetch: ${res.statusText}`);
  const json = await res.json();
  return json.data;
};

export const useUsageSummary = (token) => {
  return useQuery({
    queryKey: ['platform-analytics', 'summary'],
    queryFn: () => fetchWithAuth(BASE, token),
    enabled: !!token,
    staleTime: 60000,
  });
};

export const useDailyUsage = (token, startDate, endDate) => {
  return useQuery({
    queryKey: ['platform-analytics', 'daily-usage', startDate, endDate],
    queryFn: () => fetchWithAuth(`${BASE}/daily-usage?start=${startDate}&end=${endDate}`, token),
    enabled: !!token && !!startDate && !!endDate,
    staleTime: 60000,
  });
};

export const useUsageByTaskType = (token, startDate, endDate) => {
  return useQuery({
    queryKey: ['platform-analytics', 'by-task-type', startDate, endDate],
    queryFn: () => fetchWithAuth(`${BASE}/by-task-type?start=${startDate}&end=${endDate}`, token),
    enabled: !!token && !!startDate && !!endDate,
    staleTime: 60000,
  });
};

export const useUsageByModel = (token, startDate, endDate) => {
  return useQuery({
    queryKey: ['platform-analytics', 'by-model', startDate, endDate],
    queryFn: () => fetchWithAuth(`${BASE}/by-model?start=${startDate}&end=${endDate}`, token),
    enabled: !!token && !!startDate && !!endDate,
    staleTime: 60000,
  });
};

export const useTokenBreakdown = (token, startDate, endDate) => {
  return useQuery({
    queryKey: ['platform-analytics', 'token-breakdown', startDate, endDate],
    queryFn: () => fetchWithAuth(`${BASE}/token-breakdown?start=${startDate}&end=${endDate}`, token),
    enabled: !!token && !!startDate && !!endDate,
    staleTime: 60000,
  });
};

export const useTopUsers = (token, startDate, endDate, limit = 10) => {
  return useQuery({
    queryKey: ['platform-analytics', 'top-users', startDate, endDate, limit],
    queryFn: () => fetchWithAuth(`${BASE}/top-users?start=${startDate}&end=${endDate}&limit=${limit}`, token),
    enabled: !!token && !!startDate && !!endDate,
    staleTime: 60000,
  });
};

export const useUserTrends = (token, startDate, endDate, limit = 5) => {
  return useQuery({
    queryKey: ['platform-analytics', 'user-trends', startDate, endDate, limit],
    queryFn: () => fetchWithAuth(`${BASE}/user-trends?start=${startDate}&end=${endDate}&limit=${limit}`, token),
    enabled: !!token && !!startDate && !!endDate,
    staleTime: 60000,
  });
};

export const useUsageHeatmap = (token, startDate, endDate) => {
  return useQuery({
    queryKey: ['platform-analytics', 'heatmap', startDate, endDate],
    queryFn: () => fetchWithAuth(`${BASE}/heatmap?start=${startDate}&end=${endDate}`, token),
    enabled: !!token && !!startDate && !!endDate,
    staleTime: 60000,
  });
};

export const useTaskTypeTrends = (token, startDate, endDate) => {
  return useQuery({
    queryKey: ['platform-analytics', 'task-type-trends', startDate, endDate],
    queryFn: () => fetchWithAuth(`${BASE}/task-type-trends?start=${startDate}&end=${endDate}`, token),
    enabled: !!token && !!startDate && !!endDate,
    staleTime: 60000,
  });
};

export const useUserDrilldown = (token, userId, startDate, endDate) => {
  return useQuery({
    queryKey: ['platform-analytics', 'user-drilldown', userId, startDate, endDate],
    queryFn: () => fetchWithAuth(`${BASE}/user/${userId}?start=${startDate}&end=${endDate}`, token),
    enabled: !!token && !!userId && !!startDate && !!endDate,
    staleTime: 60000,
  });
};

export const useExternalUsage = (token, startDate, endDate) => {
  return useQuery({
    queryKey: ['platform-analytics', 'external-usage', startDate, endDate],
    queryFn: () => {
      const params = new URLSearchParams();
      if (startDate) params.append('start', startDate);
      if (endDate) params.append('end', endDate);
      return fetchWithAuth(`${BASE}/external-usage?${params}`, token);
    },
    enabled: !!token,
    staleTime: 120000, // 2 min - external APIs are slow
  });
};
