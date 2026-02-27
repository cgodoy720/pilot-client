import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../../../components/ui/card';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '../../../../components/ui/table';
import { ResponsiveLine } from '@nivo/line';
import { Zap, TrendingUp, Calendar, Loader2, Globe, Cpu } from 'lucide-react';
import { useUsageSummary, useDailyUsage, useTopUsers, useExternalUsage } from '../hooks/usePlatformAnalytics';
import { formatChartDate } from '../../../../utils/dateHelpers';

const formatNumber = (num) => {
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
  return num?.toLocaleString() || '0';
};

const formatCost = (cost) => {
  if (!cost) return '$0.00';
  return `$${parseFloat(cost).toFixed(2)}`;
};

const KpiCard = ({ title, value, subtitle, icon: Icon, color }) => (
  <Card className="bg-white border border-[#E3E3E3]">
    <CardContent className="pt-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="text-2xl font-bold text-[#1E1E1E] mt-1">{value}</p>
          {subtitle && <p className="text-xs text-slate-400 mt-1">{subtitle}</p>}
        </div>
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="h-5 w-5 text-white" />
        </div>
      </div>
    </CardContent>
  </Card>
);

const nivoTheme = {
  grid: { line: { stroke: '#f0f0f0' } },
  axis: {
    ticks: { text: { fontSize: 12, fill: '#94a3b8' } },
    legend: { text: { fontSize: 12, fill: '#94a3b8' } },
  },
  crosshair: { line: { stroke: '#4242EA', strokeDasharray: '6 4' } },
  tooltip: {
    container: {
      borderRadius: 8,
      border: '1px solid #e2e8f0',
      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    },
  },
};

const OverviewTab = ({ token, startDate, endDate }) => {
  const { data: summary, isLoading: summaryLoading } = useUsageSummary(token);
  const { data: dailyUsage, isLoading: dailyLoading } = useDailyUsage(token, startDate, endDate);
  const { data: topUsers, isLoading: usersLoading } = useTopUsers(token, startDate, endDate, 5);
  const { data: externalData } = useExternalUsage(token, startDate, endDate);

  const orCredits = externalData?.openRouter?.credits;
  const anthropicData = externalData?.anthropic?.usage?.data;

  // Sum Anthropic tokens for the period
  const anthropicTotals = React.useMemo(() => {
    if (!anthropicData) return null;
    let input = 0, output = 0, cache = 0;
    anthropicData.forEach(bucket => {
      (bucket.results || []).forEach(r => {
        input += (r.uncached_input_tokens || 0);
        output += (r.output_tokens || 0);
        cache += (r.cache_read_input_tokens || 0);
      });
    });
    if (input + output === 0) return null;
    return { input, output, cache, total: input + output + cache };
  }, [anthropicData]);

  if (summaryLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-[#4242EA]" />
      </div>
    );
  }

  const lineData = (() => {
    const rows = dailyUsage || [];
    return [
      {
        id: 'Prompt Tokens',
        color: '#4242EA',
        data: rows.map(d => ({
          x: formatChartDate(d.date),
          y: parseInt(d.prompt_tokens, 10) || 0,
        })),
      },
      {
        id: 'Completion Tokens',
        color: '#10b981',
        data: rows.map(d => ({
          x: formatChartDate(d.date),
          y: parseInt(d.completion_tokens, 10) || 0,
        })),
      },
    ];
  })();

  const hasChartData = lineData[0].data.length > 0;

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <KpiCard
          title="Today's Tokens"
          value={formatNumber(summary?.today?.tokens)}
          subtitle={`${summary?.today?.requests || 0} requests`}
          icon={Zap}
          color="bg-[#4242EA]"
        />
        <KpiCard
          title="This Week"
          value={formatNumber(summary?.thisWeek?.tokens)}
          subtitle={`${summary?.thisWeek?.requests || 0} requests`}
          icon={TrendingUp}
          color="bg-emerald-500"
        />
        <KpiCard
          title="This Month"
          value={formatNumber(summary?.thisMonth?.tokens)}
          subtitle={`${summary?.thisMonth?.requests || 0} requests`}
          icon={Calendar}
          color="bg-amber-500"
        />
        <KpiCard
          title="OpenRouter Monthly"
          value={orCredits ? formatCost(orCredits.usage_monthly) : '—'}
          subtitle={orCredits ? `Today: ${formatCost(orCredits.usage_daily)} · Week: ${formatCost(orCredits.usage_weekly)}` : 'Loading...'}
          icon={Globe}
          color="bg-violet-500"
        />
        <KpiCard
          title="Anthropic Direct"
          value={anthropicTotals ? formatNumber(anthropicTotals.total) + ' tokens' : '—'}
          subtitle={anthropicTotals ? `In: ${formatNumber(anthropicTotals.input)} · Out: ${formatNumber(anthropicTotals.output)}` : 'Loading...'}
          icon={Cpu}
          color="bg-orange-500"
        />
      </div>

      {/* Daily Usage Chart + Top Users — side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <Card className="bg-white border border-[#E3E3E3] lg:col-span-3">
          <CardHeader>
            <CardTitle className="text-sm font-semibold text-[#1E1E1E]">Daily Token Usage</CardTitle>
          </CardHeader>
          <CardContent>
            {dailyLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
              </div>
            ) : !hasChartData ? (
              <div className="text-center py-12 text-slate-400">
                No usage data for this period
              </div>
            ) : (
              <div style={{ height: 300 }}>
                <ResponsiveLine
                  data={lineData}
                  theme={nivoTheme}
                  colors={['#4242EA', '#10b981']}
                  margin={{ top: 10, right: 16, bottom: 46, left: 50 }}
                  xScale={{ type: 'point' }}
                  yScale={{ type: 'linear', min: 0, max: 'auto' }}
                  axisBottom={{
                    tickRotation: lineData[0].data.length > 14 ? -45 : 0,
                    tickSize: 5,
                    tickPadding: 5,
                  }}
                  axisLeft={{
                    format: formatNumber,
                    tickSize: 5,
                    tickPadding: 5,
                  }}
                  pointSize={0}
                  useMesh
                  enableCrosshair
                  curve="monotoneX"
                  enableSlices="x"
                  sliceTooltip={({ slice }) => (
                    <div style={{
                      background: 'white',
                      borderRadius: 8,
                      border: '1px solid #e2e8f0',
                      padding: '10px 14px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                      minWidth: 160,
                    }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: '#1E1E1E', marginBottom: 6 }}>
                        {slice.points[0]?.data.xFormatted}
                      </div>
                      {slice.points.map(point => (
                        <div key={point.id} style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4, fontSize: 12 }}>
                          <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: point.serieColor, flexShrink: 0 }} />
                          <span style={{ color: '#64748b', flex: 1 }}>{point.serieId}</span>
                          <span style={{ fontWeight: 600, color: '#1E1E1E' }}>{formatNumber(point.data.y)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  legends={[
                    {
                      anchor: 'bottom',
                      direction: 'row',
                      translateY: 42,
                      itemWidth: 140,
                      itemHeight: 20,
                      symbolSize: 10,
                      symbolShape: 'circle',
                    },
                  ]}
                />
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-white border border-[#E3E3E3] lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-sm font-semibold text-[#1E1E1E]">Top Users</CardTitle>
          </CardHeader>
          <CardContent>
            {usersLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
              </div>
            ) : !topUsers || topUsers.length === 0 ? (
              <div className="text-center py-8 text-slate-400">No user data yet</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead className="text-right">Tokens</TableHead>
                    <TableHead className="text-right">Reqs</TableHead>
                    <TableHead className="text-right">Cost</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topUsers.map((user, i) => (
                    <TableRow key={user.user_id || i}>
                      <TableCell className="font-medium">
                        {user.first_name && user.last_name
                          ? `${user.first_name} ${user.last_name}`
                          : `User #${user.user_id}`}
                      </TableCell>
                      <TableCell className="text-right">{formatNumber(parseInt(user.total_tokens, 10))}</TableCell>
                      <TableCell className="text-right">{parseInt(user.request_count, 10).toLocaleString()}</TableCell>
                      <TableCell className="text-right">{formatCost(user.estimated_cost)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default OverviewTab;
