import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../../../components/ui/card';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '../../../../components/ui/table';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Zap, TrendingUp, Calendar, DollarSign, Loader2 } from 'lucide-react';
import { useUsageSummary, useDailyUsage, useTopUsers } from '../hooks/usePlatformAnalytics';

const formatNumber = (num) => {
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
  return num?.toLocaleString() || '0';
};

const formatCost = (cost) => {
  if (!cost) return '$0.00';
  return `$${parseFloat(cost).toFixed(2)}`;
};

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
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

const OverviewTab = ({ token, startDate, endDate }) => {
  const { data: summary, isLoading: summaryLoading } = useUsageSummary(token);
  const { data: dailyUsage, isLoading: dailyLoading } = useDailyUsage(token, startDate, endDate);
  const { data: topUsers, isLoading: usersLoading } = useTopUsers(token, startDate, endDate, 5);

  if (summaryLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-[#4242EA]" />
      </div>
    );
  }

  const chartData = (dailyUsage || []).map(d => ({
    date: formatDate(d.date),
    prompt: parseInt(d.prompt_tokens, 10) || 0,
    completion: parseInt(d.completion_tokens, 10) || 0,
    total: parseInt(d.total_tokens, 10) || 0,
  }));

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
          title="Est. Monthly Cost"
          value={formatCost(summary?.thisMonth?.cost)}
          subtitle={`All-time: ${formatCost(summary?.allTime?.cost)}`}
          icon={DollarSign}
          color="bg-rose-500"
        />
      </div>

      {/* Daily Usage Chart */}
      <Card className="bg-white border border-[#E3E3E3]">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-[#1E1E1E]">Daily Token Usage</CardTitle>
        </CardHeader>
        <CardContent>
          {dailyLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
            </div>
          ) : chartData.length === 0 ? (
            <div className="text-center py-16 text-slate-400">
              No usage data for this period
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={320}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                <YAxis tickFormatter={formatNumber} tick={{ fontSize: 12 }} stroke="#94a3b8" />
                <Tooltip
                  formatter={(value) => [formatNumber(value), '']}
                  labelStyle={{ fontWeight: 600 }}
                  contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0' }}
                />
                <Legend />
                <Line type="monotone" dataKey="prompt" stroke="#4242EA" name="Prompt Tokens" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="completion" stroke="#10b981" name="Completion Tokens" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Top Users Table */}
      <Card className="bg-white border border-[#E3E3E3]">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-[#1E1E1E]">Top 5 Users by Token Usage</CardTitle>
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
                  <TableHead className="text-right">Total Tokens</TableHead>
                  <TableHead className="text-right">Requests</TableHead>
                  <TableHead className="text-right">Est. Cost</TableHead>
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
  );
};

export default OverviewTab;
