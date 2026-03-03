import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../../../components/ui/card';
import { ResponsiveBar } from '@nivo/bar';
import { Loader2 } from 'lucide-react';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '../../../../components/ui/table';
import { useUsageByTaskType, useUsageByModel, useTokenBreakdown, useTopTasksByUsage } from '../hooks/usePlatformAnalytics';
import { formatChartDate } from '../../../../utils/dateHelpers';

const formatNumber = (num) => {
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
  return num?.toLocaleString() || '0';
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

const nivoTheme = {
  grid: { line: { stroke: '#f0f0f0' } },
  axis: {
    ticks: { text: { fontSize: 12, fill: '#94a3b8' } },
    legend: { text: { fontSize: 12, fill: '#94a3b8' } },
  },
  tooltip: {
    container: {
      borderRadius: 8,
      border: '1px solid #e2e8f0',
      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    },
  },
  labels: { text: { fontSize: 11 } },
};

const BarTooltip = ({ id, value, color }) => (
  <div style={{
    background: 'white',
    borderRadius: 8,
    border: '1px solid #e2e8f0',
    padding: '8px 12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    fontSize: 12,
    display: 'flex',
    alignItems: 'center',
    gap: 6,
  }}>
    <span style={{ width: 10, height: 10, borderRadius: '50%', background: color, display: 'inline-block' }} />
    {id}: {formatNumber(value)}
  </div>
);

const humanizeLabel = (str) => {
  if (!str) return 'Unknown';
  return str
    .replace(/_/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase());
};

const HIDDEN_TASK_TYPES = new Set(['title_generation']);

const UsageBreakdownTab = ({ token, startDate, endDate }) => {
  const { data: taskTypeData, isLoading: taskTypeLoading } = useUsageByTaskType(token, startDate, endDate);
  const { data: modelData, isLoading: modelLoading } = useUsageByModel(token, startDate, endDate);
  const { data: breakdownData, isLoading: breakdownLoading } = useTokenBreakdown(token, startDate, endDate);
  const { data: topTasksData, isLoading: topTasksLoading } = useTopTasksByUsage(token, startDate, endDate, 15);

  const taskTypeChartData = (taskTypeData || [])
    .filter(d => !HIDDEN_TASK_TYPES.has(d.task_type))
    .map(d => ({
      task_type: humanizeLabel(d.task_type),
      prompt: parseInt(d.prompt_tokens, 10) || 0,
      completion: parseInt(d.completion_tokens, 10) || 0,
    }));

  const modelChartData = (modelData || []).map(d => ({
    model: shortenModel(d.model),
    prompt: parseInt(d.prompt_tokens, 10) || 0,
    completion: parseInt(d.completion_tokens, 10) || 0,
  }));

  const tokenBreakdownChartData = (breakdownData || []).map(d => ({
    date: formatChartDate(d.date),
    context: parseInt(d.context_tokens, 10) || 0,
    conversation: parseInt(d.conversation_tokens, 10) || 0,
  }));

  return (
    <div className="space-y-4">
      {/* Task Type + Model — side by side 3/5 + 2/5 */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <Card className="bg-white border border-[#E3E3E3] lg:col-span-3">
          <CardHeader>
            <CardTitle className="text-sm font-semibold text-[#1E1E1E]">Prompt vs Completion by Task Type</CardTitle>
          </CardHeader>
          <CardContent>
            {taskTypeLoading ? <LoadingState /> : taskTypeChartData.length === 0 ? <EmptyState /> : (
              <div style={{ height: Math.max(220, taskTypeChartData.length * 48 + 56) }}>
                <ResponsiveBar
                  data={taskTypeChartData}
                  keys={['prompt', 'completion']}
                  indexBy="task_type"
                  layout="horizontal"
                  theme={nivoTheme}
                  colors={['#4242EA', '#10b981']}
                  margin={{ top: 10, right: 16, bottom: 46, left: 100 }}
                  padding={0.25}
                  valueScale={{ type: 'linear' }}
                  indexScale={{ type: 'band', round: true }}
                  borderRadius={3}
                  axisBottom={{
                    format: formatNumber,
                    tickSize: 5,
                    tickPadding: 5,
                  }}
                  axisLeft={{
                    tickSize: 0,
                    tickPadding: 8,
                  }}
                  enableLabel
                  label={d => formatNumber(d.value)}
                  labelSkipWidth={36}
                  labelTextColor="#fff"
                  tooltip={BarTooltip}
                  legends={[
                    {
                      dataFrom: 'keys',
                      anchor: 'bottom',
                      direction: 'row',
                      translateY: 42,
                      itemWidth: 140,
                      itemHeight: 20,
                      symbolSize: 10,
                      symbolShape: 'circle',
                      data: [
                        { id: 'prompt', label: 'Prompt Tokens', color: '#4242EA' },
                        { id: 'completion', label: 'Completion Tokens', color: '#10b981' },
                      ],
                    },
                  ]}
                />
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-white border border-[#E3E3E3] lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-sm font-semibold text-[#1E1E1E]">Token Usage by Model</CardTitle>
          </CardHeader>
          <CardContent>
            {modelLoading ? <LoadingState /> : modelChartData.length === 0 ? <EmptyState /> : (
              <div style={{ height: Math.max(220, modelChartData.length * 48 + 56) }}>
                <ResponsiveBar
                  data={modelChartData}
                  keys={['prompt', 'completion']}
                  indexBy="model"
                  layout="horizontal"
                  theme={nivoTheme}
                  colors={['#4242EA', '#10b981']}
                  margin={{ top: 10, right: 16, bottom: 46, left: 130 }}
                  padding={0.25}
                  valueScale={{ type: 'linear' }}
                  indexScale={{ type: 'band', round: true }}
                  borderRadius={3}
                  axisBottom={{
                    format: formatNumber,
                    tickSize: 5,
                    tickPadding: 5,
                  }}
                  axisLeft={{
                    tickSize: 0,
                    tickPadding: 8,
                  }}
                  enableLabel
                  label={d => formatNumber(d.value)}
                  labelSkipWidth={36}
                  labelTextColor="#fff"
                  tooltip={BarTooltip}
                  legends={[
                    {
                      dataFrom: 'keys',
                      anchor: 'bottom',
                      direction: 'row',
                      translateY: 42,
                      itemWidth: 130,
                      itemHeight: 20,
                      symbolSize: 10,
                      symbolShape: 'circle',
                      data: [
                        { id: 'prompt', label: 'Prompt', color: '#4242EA' },
                        { id: 'completion', label: 'Completion', color: '#10b981' },
                      ],
                    },
                  ]}
                />
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Context vs Conversation — full width, shorter */}
      <Card className="bg-white border border-[#E3E3E3]">
        <CardHeader>
          <CardTitle className="text-sm font-semibold text-[#1E1E1E]">Context vs Conversation Tokens</CardTitle>
        </CardHeader>
        <CardContent>
          {breakdownLoading ? <LoadingState /> : tokenBreakdownChartData.length === 0 ? <EmptyState /> : (
            <div style={{ height: 180 }}>
              <ResponsiveBar
                data={tokenBreakdownChartData}
                keys={['context', 'conversation']}
                indexBy="date"
                theme={nivoTheme}
                colors={['#f59e0b', '#4242EA']}
                margin={{ top: 10, right: 16, bottom: 46, left: 50 }}
                padding={0.3}
                valueScale={{ type: 'linear' }}
                indexScale={{ type: 'band', round: true }}
                axisBottom={{
                  tickRotation: tokenBreakdownChartData.length > 14 ? -45 : 0,
                  tickSize: 5,
                  tickPadding: 5,
                }}
                axisLeft={{
                  format: formatNumber,
                  tickSize: 5,
                  tickPadding: 5,
                }}
                enableLabel={false}
                tooltip={BarTooltip}
                legends={[
                  {
                    dataFrom: 'keys',
                    anchor: 'bottom',
                    direction: 'row',
                    translateY: 42,
                    itemWidth: 140,
                    itemHeight: 20,
                    symbolSize: 10,
                    symbolShape: 'circle',
                    data: [
                      { id: 'context', label: 'System/Context', color: '#f59e0b' },
                      { id: 'conversation', label: 'User/Assistant', color: '#4242EA' },
                    ],
                  },
                ]}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Top Curriculum Tasks by Token Usage — full width */}
      <Card className="bg-white border border-[#E3E3E3]">
        <CardHeader>
          <CardTitle className="text-sm font-semibold text-[#1E1E1E]">Top Curriculum Tasks by Token Usage</CardTitle>
          <p className="text-xs text-slate-400">Which specific tasks consume the most tokens</p>
        </CardHeader>
        <CardContent>
          {topTasksLoading ? <LoadingState /> : !topTasksData || topTasksData.length === 0 ? (
            <EmptyState message="No task-linked usage data for this period" />
          ) : (
            <div className="max-h-[480px] overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50/80">
                    <TableHead className="text-[10px] font-semibold uppercase tracking-wide">Task</TableHead>
                    <TableHead className="text-[10px] font-semibold uppercase tracking-wide text-right">Day</TableHead>
                    <TableHead className="text-[10px] font-semibold uppercase tracking-wide text-right">Tokens</TableHead>
                    <TableHead className="text-[10px] font-semibold uppercase tracking-wide text-right">Reqs</TableHead>
                    <TableHead className="text-[10px] font-semibold uppercase tracking-wide text-right">Users</TableHead>
                    <TableHead className="text-[10px] font-semibold uppercase tracking-wide w-[200px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(() => {
                    const maxTokens = Math.max(...topTasksData.map(t => parseInt(t.total_tokens, 10) || 0));
                    return topTasksData.map((task, i) => {
                      const tokens = parseInt(task.total_tokens, 10) || 0;
                      const pct = maxTokens > 0 ? (tokens / maxTokens) * 100 : 0;
                      return (
                        <TableRow key={task.task_id || i}>
                          <TableCell className="font-medium text-sm max-w-[280px] truncate" title={task.task_title}>
                            {task.task_title}
                          </TableCell>
                          <TableCell className="text-right text-sm text-slate-500">
                            {task.day_number ? `D${task.day_number}` : '—'}
                          </TableCell>
                          <TableCell className="text-right text-sm font-semibold">{formatNumber(tokens)}</TableCell>
                          <TableCell className="text-right text-sm text-slate-500">{parseInt(task.request_count, 10).toLocaleString()}</TableCell>
                          <TableCell className="text-right text-sm text-slate-500">{task.unique_users}</TableCell>
                          <TableCell>
                            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                              <div
                                className="h-full rounded-full bg-[#4242EA] transition-all"
                                style={{ width: `${Math.max(pct, 3)}%` }}
                              />
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    });
                  })()}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default UsageBreakdownTab;
