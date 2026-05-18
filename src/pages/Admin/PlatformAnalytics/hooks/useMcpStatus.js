import { useQuery } from '@tanstack/react-query';

const MCP_URL = import.meta.env.VITE_MCP_SERVER_URL || 'https://pursuit-db-mcp-195631170008.us-central1.run.app';

async function fetchWithTiming(url) {
  const start = Date.now();

  const res = await fetch(url, { cache: 'no-store' });
  const latencyMs = Date.now() - start;

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    return { status: 'error', latencyMs, message: body.message || res.statusText };
  }

  const data = await res.json();
  return { ...data, latencyMs };
}

export const useMcpServerStatus = () => {
  return useQuery({
    queryKey: ['mcp-status', 'server'],
    queryFn: () => fetchWithTiming(`${MCP_URL}/`),
    refetchInterval: 30_000,
    staleTime: 15_000,
    retry: 1,
    meta: { errorMessage: 'MCP server unreachable' },
  });
};

export const useMcpPgStatus = () => {
  return useQuery({
    queryKey: ['mcp-status', 'pg'],
    queryFn: () => fetchWithTiming(`${MCP_URL}/health/pg`),
    refetchInterval: 60_000,
    staleTime: 30_000,
    retry: 1,
  });
};

export const useMcpBqStatus = () => {
  return useQuery({
    queryKey: ['mcp-status', 'bq'],
    queryFn: () => fetchWithTiming(`${MCP_URL}/health/bq`),
    refetchInterval: 60_000,
    staleTime: 30_000,
    retry: 1,
  });
};
