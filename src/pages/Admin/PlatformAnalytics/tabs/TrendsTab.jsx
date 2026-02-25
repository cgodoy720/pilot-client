import React, { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../../../components/ui/card';
import {
  LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import { Loader2, User, X } from 'lucide-react';
import { Badge } from '../../../../components/ui/badge';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '../../../../components/ui/table';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '../../../../components/ui/dialog';
import { useUserTrends, useUsageHeatmap, useTaskTypeTrends, useUserDrilldown, useTopUsers } from '../hooks/usePlatformAnalytics';

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

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const shortenModel = (model) => {
  if (!model) return 'Unknown';
  return model.replace(/^(anthropic|openai|google|deepseek|x-ai|moonshotai|minimax)\//, '');
};

const LoadingState = () => (
  <div className="flex items-center justify-center py-16">
    <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
  </div>
);

const EmptyState = ({ message }) => (
  <div className="text-center py-16 text-slate-400">{message || 'No data for this period'}</div>
);

// ============================================================================
// USER DRILL-DOWN DIALOG
// ============================================================================
const UserDrilldownDialog = ({ token, userId, userName, startDate, endDate, onClose }) => {
  const { data, isLoading } = useUserDrilldown(token, userId, startDate, endDate);

  const dailyChartData = (data?.dailyUsage || []).map(d => ({
    date: formatDate(d.date),
    tokens: parseInt(d.total_tokens, 10) || 0,
  }));

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
            {dailyChartData.length > 0 && (
              <div>
                <p className="text-sm font-medium text-slate-600 mb-2">Daily Activity</p>
                <ResponsiveContainer width="100%" height={180}>
                  <AreaChart data={dailyChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="#94a3b8" />
                    <YAxis tickFormatter={formatNumber} tick={{ fontSize: 10 }} stroke="#94a3b8" />
                    <Tooltip formatter={(v) => [formatNumber(v), 'Tokens']} />
                    <Area type="monotone" dataKey="tokens" fill="#4242EA" fillOpacity={0.15} stroke="#4242EA" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
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
  // Build 7x24 grid
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

  // Transform user trends into chart-friendly format: one row per date, one key per user
  const userChartData = useMemo(() => {
    if (!userTrendsData || userTrendsData.length === 0) return { data: [], users: [] };

    const userMap = {};
    const dateMap = {};

    userTrendsData.forEach(row => {
      const name = row.first_name && row.last_name
        ? `${row.first_name} ${row.last_name.charAt(0)}.`
        : `User #${row.user_id}`;
      userMap[row.user_id] = name;

      const dateKey = formatDate(row.date);
      if (!dateMap[dateKey]) dateMap[dateKey] = { date: dateKey };
      dateMap[dateKey][name] = parseInt(row.total_tokens, 10) || 0;
    });

    const users = Object.values(userMap);
    const data = Object.values(dateMap);

    return { data, users };
  }, [userTrendsData]);

  // Transform task type trends into stacked area format
  const taskAreaData = useMemo(() => {
    if (!taskTrendsData || taskTrendsData.length === 0) return { data: [], taskTypes: [] };

    const taskTypes = new Set();
    const dateMap = {};

    taskTrendsData.forEach(row => {
      taskTypes.add(row.task_type);
      const dateKey = formatDate(row.date);
      if (!dateMap[dateKey]) dateMap[dateKey] = { date: dateKey };
      dateMap[dateKey][row.task_type] = parseInt(row.total_tokens, 10) || 0;
    });

    return { data: Object.values(dateMap), taskTypes: Array.from(taskTypes) };
  }, [taskTrendsData]);

  return (
    <div className="space-y-6">
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

      {/* User Usage Over Time */}
      <Card className="bg-white border border-[#E3E3E3]">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-[#1E1E1E]">Top User Token Usage Over Time</CardTitle>
          <CardDescription>Daily token consumption for the top 5 users</CardDescription>
        </CardHeader>
        <CardContent>
          {trendsLoading ? <LoadingState /> : userChartData.data.length === 0 ? <EmptyState /> : (
            <ResponsiveContainer width="100%" height={320}>
              <LineChart data={userChartData.data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="#94a3b8" />
                <YAxis tickFormatter={formatNumber} tick={{ fontSize: 11 }} stroke="#94a3b8" />
                <Tooltip formatter={(v) => [formatNumber(v), '']} contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0' }} />
                <Legend />
                {userChartData.users.map((name, i) => (
                  <Line
                    key={name}
                    type="monotone"
                    dataKey={name}
                    stroke={USER_COLORS[i % USER_COLORS.length]}
                    strokeWidth={2}
                    dot={false}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Usage Heatmap */}
      <Card className="bg-white border border-[#E3E3E3]">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-[#1E1E1E]">Usage Heatmap</CardTitle>
          <CardDescription>Request volume by day of week and hour (UTC)</CardDescription>
        </CardHeader>
        <CardContent>
          {heatmapLoading ? <LoadingState /> : !heatmapData || heatmapData.length === 0 ? <EmptyState /> : (
            <UsageHeatmap data={heatmapData} />
          )}
        </CardContent>
      </Card>

      {/* Task Type Trends */}
      <Card className="bg-white border border-[#E3E3E3]">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-[#1E1E1E]">Task Type Trends</CardTitle>
          <CardDescription>Daily token usage by task type</CardDescription>
        </CardHeader>
        <CardContent>
          {taskTrendsLoading ? <LoadingState /> : taskAreaData.data.length === 0 ? <EmptyState /> : (
            <ResponsiveContainer width="100%" height={320}>
              <AreaChart data={taskAreaData.data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="#94a3b8" />
                <YAxis tickFormatter={formatNumber} tick={{ fontSize: 11 }} stroke="#94a3b8" />
                <Tooltip formatter={(v) => [formatNumber(v), '']} contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0' }} />
                <Legend />
                {taskAreaData.taskTypes.map((type, i) => (
                  <Area
                    key={type}
                    type="monotone"
                    dataKey={type}
                    stackId="1"
                    fill={TASK_TYPE_COLORS[type] || USER_COLORS[i % USER_COLORS.length]}
                    stroke={TASK_TYPE_COLORS[type] || USER_COLORS[i % USER_COLORS.length]}
                    fillOpacity={0.6}
                  />
                ))}
              </AreaChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Top Users Table (Clickable) */}
      <Card className="bg-white border border-[#E3E3E3]">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-[#1E1E1E]">All Users — Click to Drill Down</CardTitle>
          <CardDescription>Click any user to view their model preferences, task breakdown, and activity timeline</CardDescription>
        </CardHeader>
        <CardContent>
          {usersLoading ? <LoadingState /> : !topUsers || topUsers.length === 0 ? <EmptyState message="No user data yet" /> : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead className="text-right">Total Tokens</TableHead>
                  <TableHead className="text-right">Requests</TableHead>
                  <TableHead className="text-right">Est. Cost</TableHead>
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
  );
};

export default TrendsTab;
