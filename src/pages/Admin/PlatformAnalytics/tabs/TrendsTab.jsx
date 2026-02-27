import React, { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../../../components/ui/card';
import { ResponsiveLine } from '@nivo/line';
import { Loader2, User } from 'lucide-react';
import { Badge } from '../../../../components/ui/badge';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '../../../../components/ui/table';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '../../../../components/ui/dialog';
import { useUserTrends, useUsageHeatmap, useTaskTypeTrends, useUserDrilldown, useTopUsers } from '../hooks/usePlatformAnalytics';
import { formatChartDate } from '../../../../utils/dateHelpers';

const USER_COLORS = ['#4242EA', '#FF33FF', '#10B981', '#F59E0B', '#EF4444', '#6366F1', '#06B6D4', '#EC4899'];
const TASK_TYPE_COLORS = {
  conversation: '#4242EA',
  assessment: '#7c3aed',
  json: '#10b981',
  document: '#f59e0b',
  summarize: '#06b6d4',
  feedback: '#ef4444',
  title_generation: '#8b5cf6',
  unknown: '#94a3b8',
};
const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const formatNumber = (num) => {
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
  return num?.toLocaleString() || '0';
};

const formatCost = (cost) => {
  if (!cost) return '$0.00';
  const val = parseFloat(cost);
  return val < 0.01 ? `$${val.toFixed(4)}` : `$${val.toFixed(2)}`;
};

const shortenModel = (model) => {
  if (!model) return 'Unknown';
  return model.replace(/^(anthropic|openai|google|deepseek|x-ai|moonshotai|minimax)\//, '');
};

const LoadingState = () => (
  <div className="flex items-center justify-center py-12">
    <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
  </div>
);

const EmptyState = ({ message }) => (
  <div className="text-center py-12 text-slate-400">{message || 'No data for this period'}</div>
);

const nivoTheme = {
  grid: { line: { stroke: '#f0f0f0' } },
  axis: {
    ticks: { text: { fontSize: 11, fill: '#94a3b8' } },
    legend: { text: { fontSize: 11, fill: '#94a3b8' } },
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

const SliceTooltip = ({ slice }) => (
  <div style={{
    background: 'white',
    borderRadius: 8,
    border: '1px solid #e2e8f0',
    padding: '8px 12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
  }}>
    <strong style={{ fontSize: 12 }}>{slice.points[0]?.data.xFormatted}</strong>
    {slice.points.map(point => (
      <div key={point.id} style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4, fontSize: 12 }}>
        <span style={{ width: 10, height: 10, borderRadius: '50%', background: point.serieColor, display: 'inline-block' }} />
        {point.serieId}: {formatNumber(point.data.y)}
      </div>
    ))}
  </div>
);

// ============================================================================
// USER DRILL-DOWN DIALOG
// ============================================================================
const UserDrilldownDialog = ({ token, userId, userName, startDate, endDate, onClose }) => {
  const { data, isLoading } = useUserDrilldown(token, userId, startDate, endDate);

  const dailyLineData = useMemo(() => {
    const rows = data?.dailyUsage || [];
    if (rows.length === 0) return [];
    return [
      {
        id: 'Tokens',
        color: '#4242EA',
        data: rows.map(d => ({
          x: formatChartDate(d.date),
          y: parseInt(d.total_tokens, 10) || 0,
        })),
      },
    ];
  }, [data]);

  return (
    <Dialog open={!!userId} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            {userName || `User #${userId}`}
          </DialogTitle>
        </DialogHeader>

        {isLoading ? <LoadingState /> : !data ? <EmptyState message="No data" /> : (
          <div className="space-y-6">
            {/* Summary stats */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-slate-50 p-3 rounded-lg text-center">
                <p className="text-xs text-slate-500">Total Tokens</p>
                <p className="text-lg font-bold text-[#1E1E1E]">{formatNumber(parseInt(data.summary?.total_tokens, 10))}</p>
              </div>
              <div className="bg-slate-50 p-3 rounded-lg text-center">
                <p className="text-xs text-slate-500">Requests</p>
                <p className="text-lg font-bold text-[#1E1E1E]">{parseInt(data.summary?.request_count, 10)?.toLocaleString()}</p>
              </div>
              <div className="bg-slate-50 p-3 rounded-lg text-center">
                <p className="text-xs text-slate-500">Est. Cost</p>
                <p className="text-lg font-bold text-[#1E1E1E]">{formatCost(data.summary?.estimated_cost)}</p>
              </div>
            </div>

            {/* Daily activity chart */}
            {dailyLineData.length > 0 && dailyLineData[0].data.length > 0 && (
              <div>
                <p className="text-sm font-medium text-slate-600 mb-2">Daily Activity</p>
                <div style={{ height: 180 }}>
                  <ResponsiveLine
                    data={dailyLineData}
                    theme={nivoTheme}
                    colors={['#4242EA']}
                    margin={{ top: 10, right: 16, bottom: 30, left: 50 }}
                    xScale={{ type: 'point' }}
                    yScale={{ type: 'linear', min: 0, max: 'auto' }}
                    axisBottom={{ tickRotation: dailyLineData[0].data.length > 10 ? -45 : 0, tickSize: 5, tickPadding: 5 }}
                    axisLeft={{ format: formatNumber, tickSize: 5, tickPadding: 5 }}
                    pointSize={0}
                    useMesh
                    enableArea
                    areaOpacity={0.15}
                    curve="monotoneX"
                    enableSlices="x"
                    sliceTooltip={SliceTooltip}
                  />
                </div>
              </div>
            )}

            {/* Model preferences */}
            {data.byModel?.length > 0 && (
              <div>
                <p className="text-sm font-medium text-slate-600 mb-2">Model Preferences</p>
                <div className="space-y-1.5">
                  {data.byModel.map((m, i) => {
                    const maxTokens = parseInt(data.byModel[0].total_tokens, 10);
                    const pct = maxTokens ? (parseInt(m.total_tokens, 10) / maxTokens * 100) : 0;
                    return (
                      <div key={i} className="flex items-center gap-3">
                        <span className="text-xs text-slate-500 w-32 truncate">{shortenModel(m.model)}</span>
                        <div className="flex-1 bg-slate-100 rounded-full h-5 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-[#4242EA] flex items-center justify-end pr-2"
                            style={{ width: `${Math.max(pct, 8)}%` }}
                          >
                            <span className="text-[10px] text-white font-medium">{formatNumber(parseInt(m.total_tokens, 10))}</span>
                          </div>
                        </div>
                        <span className="text-xs text-slate-400 w-12 text-right">{parseInt(m.request_count, 10)}x</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Task type breakdown */}
            {data.byTaskType?.length > 0 && (
              <div>
                <p className="text-sm font-medium text-slate-600 mb-2">Task Types</p>
                <div className="flex flex-wrap gap-2">
                  {data.byTaskType.map((t, i) => (
                    <Badge key={i} variant="outline" className="text-xs py-1 px-2">
                      {t.task_type}: {formatNumber(parseInt(t.total_tokens, 10))} ({parseInt(t.request_count, 10)} reqs)
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

// ============================================================================
// HEATMAP COMPONENT
// ============================================================================
const UsageHeatmap = ({ data }) => {
  const grid = useMemo(() => {
    const cells = {};
    let maxCount = 1;
    (data || []).forEach(d => {
      const key = `${d.day_of_week}-${d.hour}`;
      const count = parseInt(d.request_count, 10) || 0;
      cells[key] = count;
      if (count > maxCount) maxCount = count;
    });
    return { cells, maxCount };
  }, [data]);

  const hours = Array.from({ length: 24 }, (_, i) => i);

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[600px]">
        {/* Hour labels */}
        <div className="flex ml-10 mb-1">
          {hours.map(h => (
            <div key={h} className="flex-1 text-center text-[9px] text-slate-400">
              {h % 3 === 0 ? `${h}:00` : ''}
            </div>
          ))}
        </div>
        {/* Rows */}
        {DAY_NAMES.map((day, di) => (
          <div key={di} className="flex items-center mb-0.5">
            <span className="w-10 text-xs text-slate-500 text-right pr-2">{day}</span>
            <div className="flex flex-1 gap-0.5">
              {hours.map(h => {
                const count = grid.cells[`${di}-${h}`] || 0;
                const intensity = count / grid.maxCount;
                const bg = count === 0
                  ? 'bg-slate-100'
                  : intensity > 0.75 ? 'bg-[#4242EA]'
                  : intensity > 0.5 ? 'bg-[#6b6bf0]'
                  : intensity > 0.25 ? 'bg-[#9e9ef5]'
                  : 'bg-[#c5c5fa]';
                return (
                  <div
                    key={h}
                    className={`flex-1 h-5 rounded-sm ${bg} cursor-default`}
                    title={`${day} ${h}:00 — ${count} requests`}
                  />
                );
              })}
            </div>
          </div>
        ))}
        {/* Legend */}
        <div className="flex items-center justify-end gap-1 mt-2 mr-1">
          <span className="text-[10px] text-slate-400">Less</span>
          {['bg-slate-100', 'bg-[#c5c5fa]', 'bg-[#9e9ef5]', 'bg-[#6b6bf0]', 'bg-[#4242EA]'].map((c, i) => (
            <div key={i} className={`w-3 h-3 rounded-sm ${c}`} />
          ))}
          <span className="text-[10px] text-slate-400">More</span>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// MAIN TRENDS TAB
// ============================================================================
const TrendsTab = ({ token, startDate, endDate }) => {
  const [selectedUser, setSelectedUser] = useState(null);

  const { data: userTrendsData, isLoading: trendsLoading } = useUserTrends(token, startDate, endDate, 5);
  const { data: heatmapData, isLoading: heatmapLoading } = useUsageHeatmap(token, startDate, endDate);
  const { data: taskTrendsData, isLoading: taskTrendsLoading } = useTaskTypeTrends(token, startDate, endDate);
  const { data: topUsers, isLoading: usersLoading } = useTopUsers(token, startDate, endDate, 10);

  // Transform user trends into Nivo multi-series format
  const userLineData = useMemo(() => {
    if (!userTrendsData || userTrendsData.length === 0) return [];

    const userMap = {};
    const userDates = {};

    userTrendsData.forEach(row => {
      const name = row.first_name && row.last_name
        ? `${row.first_name} ${row.last_name.charAt(0)}.`
        : `User #${row.user_id}`;

      if (!userMap[row.user_id]) {
        userMap[row.user_id] = name;
        userDates[row.user_id] = [];
      }
      userDates[row.user_id].push({
        x: formatChartDate(row.date),
        y: parseInt(row.total_tokens, 10) || 0,
      });
    });

    return Object.entries(userMap).map(([uid, name], i) => ({
      id: name,
      color: USER_COLORS[i % USER_COLORS.length],
      data: userDates[uid],
    }));
  }, [userTrendsData]);

  // Transform task type trends into Nivo stacked area format
  const taskLineData = useMemo(() => {
    if (!taskTrendsData || taskTrendsData.length === 0) return { series: [], taskTypes: [] };

    const taskTypes = new Set();
    const taskDates = {};

    taskTrendsData.forEach(row => {
      taskTypes.add(row.task_type);
      if (!taskDates[row.task_type]) taskDates[row.task_type] = [];
      taskDates[row.task_type].push({
        x: formatChartDate(row.date),
        y: parseInt(row.total_tokens, 10) || 0,
      });
    });

    const taskTypeArr = Array.from(taskTypes);
    const series = taskTypeArr.map((type, i) => ({
      id: type,
      color: TASK_TYPE_COLORS[type] || USER_COLORS[i % USER_COLORS.length],
      data: taskDates[type],
    }));

    return { series, taskTypes: taskTypeArr };
  }, [taskTrendsData]);

  return (
    <div className="space-y-4">
      {/* User Drill-down Dialog */}
      {selectedUser && (
        <UserDrilldownDialog
          token={token}
          userId={selectedUser.user_id}
          userName={selectedUser.name}
          startDate={startDate}
          endDate={endDate}
          onClose={() => setSelectedUser(null)}
        />
      )}

      {/* Row 1: User Usage Over Time + Heatmap — side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <Card className="bg-white border border-[#E3E3E3] lg:col-span-3">
          <CardHeader>
            <CardTitle className="text-sm font-semibold text-[#1E1E1E]">Top User Token Usage Over Time</CardTitle>
            <CardDescription className="text-xs">Daily consumption for top 5 users</CardDescription>
          </CardHeader>
          <CardContent>
            {trendsLoading ? <LoadingState /> : userLineData.length === 0 ? <EmptyState /> : (
              <div style={{ height: 300 }}>
                <ResponsiveLine
                  data={userLineData}
                  theme={nivoTheme}
                  colors={userLineData.map(s => s.color)}
                  margin={{ top: 10, right: 16, bottom: 46, left: 50 }}
                  xScale={{ type: 'point' }}
                  yScale={{ type: 'linear', min: 0, max: 'auto' }}
                  axisBottom={{
                    tickRotation: (userLineData[0]?.data.length || 0) > 14 ? -45 : 0,
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
                  sliceTooltip={SliceTooltip}
                  legends={[
                    {
                      anchor: 'bottom',
                      direction: 'row',
                      translateY: 42,
                      itemWidth: 100,
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
            <CardTitle className="text-sm font-semibold text-[#1E1E1E]">Usage Heatmap</CardTitle>
            <CardDescription className="text-xs">Requests by day & hour (UTC)</CardDescription>
          </CardHeader>
          <CardContent className="max-h-[360px] overflow-y-auto">
            {heatmapLoading ? <LoadingState /> : !heatmapData || heatmapData.length === 0 ? <EmptyState /> : (
              <UsageHeatmap data={heatmapData} />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Row 2: Task Type Trends + Users Table — side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <Card className="bg-white border border-[#E3E3E3] lg:col-span-3">
          <CardHeader>
            <CardTitle className="text-sm font-semibold text-[#1E1E1E]">Task Type Trends</CardTitle>
            <CardDescription className="text-xs">Daily token usage by task type</CardDescription>
          </CardHeader>
          <CardContent>
            {taskTrendsLoading ? <LoadingState /> : taskLineData.series.length === 0 ? <EmptyState /> : (
              <div style={{ height: 300 }}>
                <ResponsiveLine
                  data={taskLineData.series}
                  theme={nivoTheme}
                  colors={taskLineData.series.map(s => s.color)}
                  margin={{ top: 10, right: 16, bottom: 46, left: 50 }}
                  xScale={{ type: 'point' }}
                  yScale={{ type: 'linear', min: 0, max: 'auto', stacked: true }}
                  axisBottom={{
                    tickRotation: (taskLineData.series[0]?.data.length || 0) > 14 ? -45 : 0,
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
                  enableArea
                  areaOpacity={0.6}
                  curve="monotoneX"
                  enableSlices="x"
                  sliceTooltip={SliceTooltip}
                  legends={[
                    {
                      anchor: 'bottom',
                      direction: 'row',
                      translateY: 42,
                      itemWidth: 100,
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
            <CardTitle className="text-sm font-semibold text-[#1E1E1E]">All Users</CardTitle>
            <CardDescription className="text-xs">Click any user to drill down</CardDescription>
          </CardHeader>
          <CardContent className="max-h-[360px] overflow-y-auto">
            {usersLoading ? <LoadingState /> : !topUsers || topUsers.length === 0 ? <EmptyState message="No user data yet" /> : (
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
                  {topUsers.map((user, i) => {
                    const name = user.first_name && user.last_name
                      ? `${user.first_name} ${user.last_name}`
                      : `User #${user.user_id}`;
                    return (
                      <TableRow
                        key={user.user_id || i}
                        className="cursor-pointer hover:bg-slate-50 transition-colors"
                        onClick={() => setSelectedUser({ user_id: user.user_id, name })}
                      >
                        <TableCell className="font-medium text-[#4242EA]">{name}</TableCell>
                        <TableCell className="text-right">{formatNumber(parseInt(user.total_tokens, 10))}</TableCell>
                        <TableCell className="text-right">{parseInt(user.request_count, 10).toLocaleString()}</TableCell>
                        <TableCell className="text-right">{formatCost(user.estimated_cost)}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TrendsTab;
