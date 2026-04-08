import React, { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../../../components/ui/card';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '../../../../components/ui/table';
import { Badge } from '../../../../components/ui/badge';
import { Loader2, ChevronUp, ChevronDown, TrendingUp, AlertTriangle } from 'lucide-react';
import { useTaskInsights } from '../hooks/usePlatformAnalytics';

const formatNumber = (num) => {
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
  return num?.toLocaleString() || '0';
};

const LoadingState = () => (
  <div className="flex items-center justify-center py-16">
    <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
  </div>
);

const EmptyState = ({ message }) => (
  <div className="text-center py-16 text-slate-400">{message || 'No data for this period'}</div>
);

const SORTABLE_FIELDS = {
  task_title: (a, b) => (a.task_title || '').localeCompare(b.task_title || ''),
  day_number: (a, b) => (parseInt(a.day_number) || 0) - (parseInt(b.day_number) || 0),
  participation: (a, b) => parseInt(a.participation) - parseInt(b.participation),
  completion_rate: (a, b) => parseFloat(a.completion_rate) - parseFloat(b.completion_rate),
  avg_messages: (a, b) => parseFloat(a.avg_messages) - parseFloat(b.avg_messages),
  total_tokens: (a, b) => parseInt(a.total_tokens) - parseInt(b.total_tokens),
};

const SortHeader = ({ field, label, sort, onSort, align }) => {
  const active = sort.field === field;
  return (
    <TableHead
      className={`text-[10px] font-semibold uppercase tracking-wide cursor-pointer hover:text-[#4242EA] select-none ${align === 'right' ? 'text-right' : ''}`}
      onClick={() => onSort(field)}
    >
      <span className="inline-flex items-center gap-0.5">
        {label}
        {active && (sort.dir === 'asc'
          ? <ChevronUp className="h-3 w-3" />
          : <ChevronDown className="h-3 w-3" />
        )}
      </span>
    </TableHead>
  );
};

const InsightsTable = ({ data, sort, onSort, barColor, emptyMessage }) => {
  const sorted = useMemo(() => {
    if (!data || data.length === 0) return [];
    const compareFn = SORTABLE_FIELDS[sort.field] || SORTABLE_FIELDS.completion_rate;
    const sorted = [...data].sort(compareFn);
    return sort.dir === 'desc' ? sorted.reverse() : sorted;
  }, [data, sort]);

  if (!sorted || sorted.length === 0) {
    return <EmptyState message={emptyMessage} />;
  }

  return (
    <div className="max-h-[480px] overflow-y-auto">
      <Table>
        <TableHeader>
          <TableRow className="bg-slate-50/80">
            <SortHeader field="task_title" label="Task" sort={sort} onSort={onSort} />
            <SortHeader field="day_number" label="Day" sort={sort} onSort={onSort} align="right" />
            <SortHeader field="completion_rate" label="Completion" sort={sort} onSort={onSort} align="right" />
            <SortHeader field="participation" label="Completed" sort={sort} onSort={onSort} align="right" />
            <SortHeader field="avg_messages" label="Avg Msgs" sort={sort} onSort={onSort} align="right" />
            <SortHeader field="total_tokens" label="Tokens" sort={sort} onSort={onSort} align="right" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {sorted.map((task, i) => {
            const rate = parseFloat(task.completion_rate) || 0;
            const completed = parseInt(task.completed_users) || 0;
            const cohortSize = parseInt(task.cohort_size) || 0;
            return (
              <TableRow key={task.task_id || i}>
                <TableCell className="font-medium text-sm max-w-[220px] truncate" title={task.task_title}>
                  {task.task_title}
                </TableCell>
                <TableCell className="text-right text-sm text-slate-500">
                  {task.day_number ? `D${task.day_number}` : '—'}
                </TableCell>
                <TableCell className="text-right text-sm">
                  <div className="flex items-center justify-end gap-2">
                    <span className="font-semibold">{rate}%</span>
                    <div className="w-16 bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${barColor}`}
                        style={{ width: `${Math.max(rate, 3)}%` }}
                      />
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-right text-sm text-slate-500">
                  <span className="font-medium text-[#1E1E1E]">{completed}</span>
                  {cohortSize > 0 && <span className="text-slate-400">/{cohortSize}</span>}
                </TableCell>
                <TableCell className="text-right text-sm text-slate-500">
                  {parseFloat(task.avg_messages || 0).toFixed(1)}
                </TableCell>
                <TableCell className="text-right text-sm">{formatNumber(parseInt(task.total_tokens) || 0)}</TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};

const TaskInsightsTab = ({ token, startDate, endDate }) => {
  const { data: allTasks, isLoading } = useTaskInsights(token, startDate, endDate);

  const [topSort, setTopSort] = useState({ field: 'completion_rate', dir: 'desc' });
  const [attentionSort, setAttentionSort] = useState({ field: 'completion_rate', dir: 'asc' });

  const handleSort = (setter, current) => (field) => {
    setter(prev => ({
      field,
      dir: prev.field === field && prev.dir === 'asc' ? 'desc' : 'asc',
    }));
  };

  const topPerforming = useMemo(() => {
    if (!allTasks || allTasks.length === 0) return [];
    // Already sorted by completion_rate DESC from API
    return allTasks.slice(0, 10);
  }, [allTasks]);

  const needsAttention = useMemo(() => {
    if (!allTasks || allTasks.length === 0) return [];
    return [...allTasks]
      .sort((a, b) => {
        const rateDiff = parseFloat(a.completion_rate) - parseFloat(b.completion_rate);
        if (rateDiff !== 0) return rateDiff;
        return parseInt(a.participation) - parseInt(b.participation);
      })
      .slice(0, 10);
  }, [allTasks]);

  if (isLoading) return <LoadingState />;

  if (!allTasks || allTasks.length === 0) {
    return <EmptyState message="No task activity data for this period" />;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <Card className="bg-white border border-[#E3E3E3]">
        <CardHeader>
          <CardTitle className="text-sm font-semibold text-[#1E1E1E] flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-emerald-500" />
            Top Performing
          </CardTitle>
          <CardDescription className="text-xs">Highest completion rate with participation</CardDescription>
        </CardHeader>
        <CardContent>
          <InsightsTable
            data={topPerforming}
            sort={topSort}
            onSort={handleSort(setTopSort, topSort)}
            barColor="bg-emerald-500"
            emptyMessage="No completed tasks"
          />
        </CardContent>
      </Card>

      <Card className="bg-white border border-[#E3E3E3]">
        <CardHeader>
          <CardTitle className="text-sm font-semibold text-[#1E1E1E] flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            Needs Attention
          </CardTitle>
          <CardDescription className="text-xs">Lowest completion rate — potential curriculum gaps</CardDescription>
        </CardHeader>
        <CardContent>
          <InsightsTable
            data={needsAttention}
            sort={attentionSort}
            onSort={handleSort(setAttentionSort, attentionSort)}
            barColor="bg-amber-500"
            emptyMessage="No underperforming tasks"
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default TaskInsightsTab;
