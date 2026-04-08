import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { ChevronRight } from 'lucide-react';
import TaskDetailPanel from './TaskDetailPanel';
import useAuthStore from '../../../stores/authStore';
import { GradeBar, SortHeader, Pagination, letterGrade } from '../utils/sharedComponents';

const API_URL = import.meta.env.VITE_API_URL;
const PAGE_SIZE = 10;

const TaskAnalysisSection = ({ selectedCohortId, cohorts = [] }) => {
  const token = useAuthStore((s) => s.token);
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState([]);
  const [taskSort, setTaskSort] = useState({ key: 'assigned_date', dir: 'desc' });
  const [taskPage, setTaskPage] = useState(0);
  const [expandedTaskId, setExpandedTaskId] = useState(null);

  useEffect(() => {
    if (!selectedCohortId || !token) return;
    setLoading(true);
    setTaskPage(0);
    const endDate = new Date().toISOString().split('T')[0];
    const cohortObj = cohorts.find(c => c.cohort_id === selectedCohortId);
    const startDate = cohortObj?.start_date
      ? new Date(cohortObj.start_date).toISOString().split('T')[0]
      : '2024-01-01';
    fetch(`${API_URL}/api/admin/dashboard/cohort-summary?cohortId=${selectedCohortId}&startDate=${startDate}&endDate=${endDate}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(data => setTasks(data.success ? (data.taskDetails || []) : []))
      .catch(() => setTasks([]))
      .finally(() => setLoading(false));
  }, [selectedCohortId, token, cohorts]);

  const sortedTasks = useMemo(() => {
    return [...tasks].sort((a, b) => {
      let av = a[taskSort.key], bv = b[taskSort.key];
      if (taskSort.key === 'assigned_date') {
        av = av?.value || av || '';
        bv = bv?.value || bv || '';
      }
      if (typeof av === 'string') return taskSort.dir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av);
      return taskSort.dir === 'asc' ? (av || 0) - (bv || 0) : (bv || 0) - (av || 0);
    });
  }, [tasks, taskSort]);

  const toggleTaskSort = (key) => {
    setTaskSort(prev => ({ key, dir: prev.key === key && prev.dir === 'desc' ? 'asc' : 'desc' }));
  };

  return (
    <Card className="bg-white border border-[#E3E3E3]">
      <CardHeader className="pb-3 border-b border-[#E3E3E3]">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold text-[#1E1E1E]">Task Analysis</CardTitle>
          <Badge className="bg-[#EFEFEF] text-slate-600 text-xs">{tasks.length} tasks</Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-3">
        {loading ? (
          <div className="space-y-2">{[1,2,3,4,5].map(i => <div key={i} className="h-8 bg-[#EFEFEF] rounded animate-pulse" />)}</div>
        ) : tasks.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-8">No task data.</p>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-slate-400 text-xs uppercase tracking-wide border-b border-[#E3E3E3]">
                    <SortHeader label="Task" sortKey="task_title" sort={taskSort} onSort={toggleTaskSort} className="pr-3" />
                    <SortHeader label="Date" sortKey="assigned_date" sort={taskSort} onSort={toggleTaskSort} className="px-2" />
                    <SortHeader label="Completion" sortKey="submission_rate" sort={taskSort} onSort={toggleTaskSort} className="px-2" />
                    <th className="pb-2 px-2 font-medium text-slate-400 text-xs uppercase tracking-wide">Grade Dist.</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EFEFEF]">
                  {sortedTasks.slice(taskPage * PAGE_SIZE, (taskPage + 1) * PAGE_SIZE).map(task => {
                    const date = task.assigned_date?.value || task.assigned_date || '';
                    const dateStr = date ? new Date(date + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—';
                    const isExpanded = expandedTaskId === task.task_id;
                    return (
                      <React.Fragment key={task.task_id}>
                        <tr
                          className={`hover:bg-[#EFEFEF]/50 transition-colors cursor-pointer ${isExpanded ? 'bg-[#EFEFEF]/30' : ''}`}
                          onClick={() => setExpandedTaskId(isExpanded ? null : task.task_id)}
                        >
                          <td className="py-2 pr-3 font-medium text-[#1E1E1E] max-w-[250px]">
                            <div className="flex items-center gap-1.5">
                              <span className={`transition-transform ${isExpanded ? 'rotate-90' : ''}`}>
                                <ChevronRight size={12} className="text-slate-400" />
                              </span>
                              <span className="line-clamp-2 text-xs">{task.task_title}</span>
                            </div>
                          </td>
                          <td className="py-2 px-2 text-xs text-slate-500 whitespace-nowrap">{dateStr}</td>
                          <td className="py-2 px-2">
                            <div className="flex items-center gap-2">
                              <div className="flex-1 h-2 bg-[#EFEFEF] rounded-full overflow-hidden">
                                <div className={`h-full rounded-full ${
                                  task.submission_rate >= 80 ? 'bg-green-500' :
                                  task.submission_rate >= 50 ? 'bg-yellow-400' : 'bg-red-400'
                                }`} style={{ width: `${task.submission_rate}%` }} />
                              </div>
                              <span className={`text-xs font-semibold w-8 text-right ${
                                task.submission_rate >= 80 ? 'text-green-600' :
                                task.submission_rate >= 50 ? 'text-yellow-600' : 'text-red-500'
                              }`}>{task.submission_rate}%</span>
                            </div>
                          </td>
                          <td className="py-2 px-2 w-28"><GradeBar task={task} /></td>
                        </tr>
                        {isExpanded && (
                          <tr>
                            <td colSpan={4} className="p-0">
                              <TaskDetailPanel task={task} />
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <Pagination page={taskPage} total={sortedTasks.length} pageSize={PAGE_SIZE} onPage={setTaskPage} />
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default TaskAnalysisSection;
