import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../../../components/ui/card';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import { Loader2 } from 'lucide-react';
import { useUsageByTaskType, useUsageByModel, useTokenBreakdown } from '../hooks/usePlatformAnalytics';

const formatNumber = (num) => {
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
  return num?.toLocaleString() || '0';
};

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const TASK_TYPE_COLORS = {
  conversation: '#4242EA',
  assessment: '#7c3aed',
  json: '#10b981',
  document: '#f59e0b',
  summarize: '#06b6d4',
  feedback: '#ef4444',
  title_generation: '#8b5cf6',
  embedding: '#64748b',
  unknown: '#94a3b8',
};

const MODEL_COLORS = ['#4242EA', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899', '#64748b'];

const shortenModel = (model) => {
  if (!model) return 'Unknown';
  // Remove provider prefix for display
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

const UsageBreakdownTab = ({ token, startDate, endDate }) => {
  const { data: taskTypeData, isLoading: taskTypeLoading } = useUsageByTaskType(token, startDate, endDate);
  const { data: modelData, isLoading: modelLoading } = useUsageByModel(token, startDate, endDate);
  const { data: breakdownData, isLoading: breakdownLoading } = useTokenBreakdown(token, startDate, endDate);

  const taskTypeChartData = (taskTypeData || []).map(d => ({
    task_type: d.task_type,
    total: parseInt(d.total_tokens, 10) || 0,
    prompt: parseInt(d.prompt_tokens, 10) || 0,
    completion: parseInt(d.completion_tokens, 10) || 0,
    requests: parseInt(d.request_count, 10) || 0,
  }));

  const modelChartData = (modelData || []).map(d => ({
    model: shortenModel(d.model),
    total: parseInt(d.total_tokens, 10) || 0,
    cost: parseFloat(d.estimated_cost) || 0,
    requests: parseInt(d.request_count, 10) || 0,
  }));

  const tokenBreakdownChartData = (breakdownData || []).map(d => ({
    date: formatDate(d.date),
    context: parseInt(d.context_tokens, 10) || 0,
    conversation: parseInt(d.conversation_tokens, 10) || 0,
  }));

  return (
    <div className="space-y-6">
      {/* By Task Type */}
      <Card className="bg-white border border-[#E3E3E3]">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-[#1E1E1E]">Token Usage by Task Type</CardTitle>
        </CardHeader>
        <CardContent>
          {taskTypeLoading ? <LoadingState /> : taskTypeChartData.length === 0 ? <EmptyState /> : (
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={taskTypeChartData} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis type="number" tickFormatter={formatNumber} tick={{ fontSize: 12 }} stroke="#94a3b8" />
                <YAxis type="category" dataKey="task_type" tick={{ fontSize: 12 }} stroke="#94a3b8" width={100} />
                <Tooltip
                  formatter={(value) => [formatNumber(value), '']}
                  contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0' }}
                />
                <Legend />
                <Bar dataKey="prompt" name="Prompt Tokens" stackId="a" fill="#4242EA" />
                <Bar dataKey="completion" name="Completion Tokens" stackId="a" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Context vs Conversation Tokens */}
      <Card className="bg-white border border-[#E3E3E3]">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-[#1E1E1E]">Context vs Conversation Tokens</CardTitle>
        </CardHeader>
        <CardContent>
          {breakdownLoading ? <LoadingState /> : tokenBreakdownChartData.length === 0 ? <EmptyState /> : (
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={tokenBreakdownChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                <YAxis tickFormatter={formatNumber} tick={{ fontSize: 12 }} stroke="#94a3b8" />
                <Tooltip
                  formatter={(value) => [formatNumber(value), '']}
                  contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0' }}
                />
                <Legend />
                <Bar dataKey="context" name="System/Context" stackId="a" fill="#f59e0b" />
                <Bar dataKey="conversation" name="User/Assistant" stackId="a" fill="#4242EA" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* By Model */}
      <Card className="bg-white border border-[#E3E3E3]">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-[#1E1E1E]">Token Usage by Model</CardTitle>
        </CardHeader>
        <CardContent>
          {modelLoading ? <LoadingState /> : modelChartData.length === 0 ? <EmptyState /> : (
            <ResponsiveContainer width="100%" height={Math.max(200, modelChartData.length * 50)}>
              <BarChart data={modelChartData} layout="vertical" margin={{ left: 30 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis type="number" tickFormatter={formatNumber} tick={{ fontSize: 12 }} stroke="#94a3b8" />
                <YAxis type="category" dataKey="model" tick={{ fontSize: 11 }} stroke="#94a3b8" width={140} />
                <Tooltip
                  formatter={(value, name) => [
                    name === 'cost' ? `$${parseFloat(value).toFixed(4)}` : formatNumber(value),
                    ''
                  ]}
                  contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0' }}
                />
                <Bar dataKey="total" name="Total Tokens" fill="#4242EA" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default UsageBreakdownTab;
