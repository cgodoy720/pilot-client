import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../../../components/ui/card';
import { ResponsiveBar } from '@nivo/bar';
import { Loader2 } from 'lucide-react';
import { useUsageByTaskType, useUsageByModel, useTokenBreakdown } from '../hooks/usePlatformAnalytics';
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

const UsageBreakdownTab = ({ token, startDate, endDate }) => {
  const { data: taskTypeData, isLoading: taskTypeLoading } = useUsageByTaskType(token, startDate, endDate);
  const { data: modelData, isLoading: modelLoading } = useUsageByModel(token, startDate, endDate);
  const { data: breakdownData, isLoading: breakdownLoading } = useTokenBreakdown(token, startDate, endDate);

  const taskTypeChartData = (taskTypeData || []).map(d => ({
    task_type: d.task_type,
    prompt: parseInt(d.prompt_tokens, 10) || 0,
    completion: parseInt(d.completion_tokens, 10) || 0,
  }));

  const modelChartData = (modelData || []).map(d => ({
    model: shortenModel(d.model),
    total: parseInt(d.total_tokens, 10) || 0,
  }));

  const tokenBreakdownChartData = (breakdownData || []).map(d => ({
    date: formatChartDate(d.date),
    context: parseInt(d.context_tokens, 10) || 0,
    conversation: parseInt(d.conversation_tokens, 10) || 0,
  }));

  return (
    <div className="space-y-4">
      {/* Task Type + Model — side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="bg-white border border-[#E3E3E3]">
          <CardHeader>
            <CardTitle className="text-sm font-semibold text-[#1E1E1E]">Token Usage by Task Type</CardTitle>
          </CardHeader>
          <CardContent>
            {taskTypeLoading ? <LoadingState /> : taskTypeChartData.length === 0 ? <EmptyState /> : (
              <div style={{ height: 220 }}>
                <ResponsiveBar
                  data={taskTypeChartData}
                  keys={['prompt', 'completion']}
                  indexBy="task_type"
                  layout="horizontal"
                  theme={nivoTheme}
                  colors={['#4242EA', '#10b981']}
                  margin={{ top: 10, right: 16, bottom: 46, left: 90 }}
                  padding={0.3}
                  valueScale={{ type: 'linear' }}
                  indexScale={{ type: 'band', round: true }}
                  axisBottom={{
                    format: formatNumber,
                    tickSize: 5,
                    tickPadding: 5,
                  }}
                  axisLeft={{
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

        <Card className="bg-white border border-[#E3E3E3]">
          <CardHeader>
            <CardTitle className="text-sm font-semibold text-[#1E1E1E]">Token Usage by Model</CardTitle>
          </CardHeader>
          <CardContent>
            {modelLoading ? <LoadingState /> : modelChartData.length === 0 ? <EmptyState /> : (
              <div style={{ height: 220 }}>
                <ResponsiveBar
                  data={modelChartData}
                  keys={['total']}
                  indexBy="model"
                  layout="horizontal"
                  theme={nivoTheme}
                  colors={['#4242EA']}
                  margin={{ top: 10, right: 16, bottom: 36, left: 130 }}
                  padding={0.3}
                  valueScale={{ type: 'linear' }}
                  indexScale={{ type: 'band', round: true }}
                  borderRadius={4}
                  axisBottom={{
                    format: formatNumber,
                    tickSize: 5,
                    tickPadding: 5,
                  }}
                  axisLeft={{
                    tickSize: 5,
                    tickPadding: 5,
                  }}
                  enableLabel={false}
                  tooltip={({ id, value, color, indexValue }) => (
                    <div style={{
                      background: 'white',
                      borderRadius: 8,
                      border: '1px solid #e2e8f0',
                      padding: '8px 12px',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                      fontSize: 12,
                    }}>
                      <strong>{indexValue}</strong>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
                        <span style={{ width: 10, height: 10, borderRadius: '50%', background: color, display: 'inline-block' }} />
                        Total Tokens: {formatNumber(value)}
                      </div>
                    </div>
                  )}
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
    </div>
  );
};

export default UsageBreakdownTab;
