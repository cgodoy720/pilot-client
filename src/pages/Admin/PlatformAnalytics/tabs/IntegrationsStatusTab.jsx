import React from 'react';
import { Card, CardContent } from '../../../../components/ui/card';
import { Badge } from '../../../../components/ui/badge';
import { Loader2, Server, Database, BarChart3, Bot, RefreshCw } from 'lucide-react';
import { useMcpServerStatus, useMcpPgStatus, useMcpBqStatus } from '../hooks/useMcpStatus';
import { useExternalUsage } from '../hooks/usePlatformAnalytics';

const formatNumber = (num) => {
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
  return num?.toLocaleString() || '0';
};

const StatusDot = ({ status }) => {
  const color =
    status === 'ok' || status === 'connected'
      ? 'bg-emerald-400'
      : status === 'loading'
        ? 'bg-amber-400 animate-pulse'
        : 'bg-red-400';

  return <span className={`inline-block h-2.5 w-2.5 rounded-full ${color}`} />;
};

const StatusBadge = ({ status }) => {
  if (status === 'ok' || status === 'connected') {
    return <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200">Live</Badge>;
  }

  if (status === 'loading') {
    return <Badge className="bg-amber-50 text-amber-700 border-amber-200">Checking</Badge>;
  }

  return <Badge className="bg-red-50 text-red-700 border-red-200">Down</Badge>;
};

const LatencyTag = ({ ms }) => {
  if (ms == null) return null;

  const color =
    ms < 300 ? 'text-emerald-600' : ms < 1000 ? 'text-amber-600' : 'text-red-600';

  return <span className={`text-xs font-mono ${color}`}>{ms}ms</span>;
};

const IntegrationCard = ({ icon: Icon, iconBg, title, subtitle, status, latencyMs, extra, isLoading, onRefresh }) => (
  <Card className="bg-white border border-[#E3E3E3] relative overflow-hidden">
    {status === 'error' && (
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-red-400" />
    )}
    {(status === 'ok' || status === 'connected') && (
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-emerald-400" />
    )}
    <CardContent className="pt-5 pb-4">
      <div className="flex items-start gap-4">
        <div className={`p-2.5 rounded-lg shrink-0 ${iconBg}`}>
          <Icon className="h-5 w-5 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <h3 className="text-sm font-semibold text-[#1E1E1E] truncate">{title}</h3>
            <StatusDot status={isLoading ? 'loading' : status} />
          </div>
          <p className="text-xs text-slate-400 mb-2">{subtitle}</p>
          <div className="flex items-center gap-3 flex-wrap">
            <StatusBadge status={isLoading ? 'loading' : status} />
            <LatencyTag ms={latencyMs} />
            {extra}
          </div>
        </div>
        {onRefresh && (
          <button
            onClick={onRefresh}
            className="p-1.5 rounded-md hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
            title="Refresh"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        )}
      </div>
    </CardContent>
  </Card>
);

const IntegrationsStatusTab = ({ token, startDate, endDate }) => {
  const { data: serverData, isLoading: serverLoading, isError: serverError, refetch: refetchServer } = useMcpServerStatus();
  const { data: pgData, isLoading: pgLoading, isError: pgError, refetch: refetchPg } = useMcpPgStatus();
  const { data: bqData, isLoading: bqLoading, isError: bqError, refetch: refetchBq } = useMcpBqStatus();
  const { data: externalData, isLoading: extLoading } = useExternalUsage(token, startDate, endDate);

  const anthropicData = externalData?.anthropic?.usage?.data;

  const anthropicTotals = React.useMemo(() => {
    if (!anthropicData) return null;
    let input = 0, output = 0, cache = 0;
    anthropicData.forEach(bucket => {
      (bucket.results || []).forEach(r => {
        input += r.uncached_input_tokens || 0;
        output += r.output_tokens || 0;
        cache += r.cache_read_input_tokens || 0;
      });
    });
    if (input + output === 0) return null;
    return { input, output, cache, total: input + output + cache };
  }, [anthropicData]);

  const serverStatus = serverError ? 'error' : serverData?.status || 'loading';
  const pgStatus = pgError ? 'error' : pgData?.status || 'loading';
  const bqStatus = bqError ? 'error' : bqData?.status || 'loading';

  const allConnected =
    serverStatus === 'ok' &&
    pgStatus === 'connected' &&
    bqStatus === 'connected';

  return (
    <div className="space-y-4">
      {/* Summary banner */}
      <div className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium ${
        allConnected
          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
          : 'bg-amber-50 text-amber-700 border border-amber-200'
      }`}>
        <StatusDot status={allConnected ? 'ok' : (serverLoading || pgLoading || bqLoading) ? 'loading' : 'error'} />
        {allConnected
          ? 'All integrations operational'
          : (serverLoading || pgLoading || bqLoading)
            ? 'Checking integration status...'
            : 'One or more integrations are down'}
      </div>

      {/* Status cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <IntegrationCard
          icon={Server}
          iconBg="bg-[#4242EA]"
          title="MCP Server"
          subtitle="pursuit-db-mcp · Cloud Run"
          status={serverStatus}
          latencyMs={serverData?.latencyMs}
          isLoading={serverLoading}
          onRefresh={refetchServer}
          extra={
            serverData?.authMode && (
              <span className="text-xs text-slate-500">
                Auth: <span className="font-medium">{serverData.authMode}</span>
              </span>
            )
          }
        />

        <IntegrationCard
          icon={Database}
          iconBg="bg-indigo-500"
          title="Cloud SQL (Postgres)"
          subtitle="segundo-db · us-central1"
          status={pgStatus}
          latencyMs={pgData?.latencyMs}
          isLoading={pgLoading}
          onRefresh={refetchPg}
          extra={
            pgData?.status === 'error' && pgData?.message && (
              <span className="text-xs text-red-500 truncate max-w-[160px]" title={pgData.message}>
                {pgData.message}
              </span>
            )
          }
        />

        <IntegrationCard
          icon={BarChart3}
          iconBg="bg-violet-500"
          title="BigQuery"
          subtitle="pursuit-ops · pilot_agent_public"
          status={bqStatus}
          latencyMs={bqData?.latencyMs}
          isLoading={bqLoading}
          onRefresh={refetchBq}
          extra={
            bqData?.status === 'error' && bqData?.message && (
              <span className="text-xs text-red-500 truncate max-w-[160px]" title={bqData.message}>
                {bqData.message}
              </span>
            )
          }
        />

        <IntegrationCard
          icon={Bot}
          iconBg="bg-orange-500"
          title="Claude Teams (Anthropic)"
          subtitle="Token usage via Anthropic API"
          status={extLoading ? 'loading' : anthropicTotals ? 'ok' : 'error'}
          isLoading={extLoading}
          extra={
            anthropicTotals ? (
              <span className="text-xs text-slate-500">
                {formatNumber(anthropicTotals.total)} tokens
                <span className="text-slate-300 mx-1">·</span>
                In: {formatNumber(anthropicTotals.input)}
                <span className="text-slate-300 mx-1">·</span>
                Out: {formatNumber(anthropicTotals.output)}
              </span>
            ) : !extLoading ? (
              <span className="text-xs text-slate-400">No usage data</span>
            ) : null
          }
        />
      </div>
    </div>
  );
};

export default IntegrationsStatusTab;
