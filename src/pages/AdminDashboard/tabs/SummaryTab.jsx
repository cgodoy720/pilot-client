import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import {
  Users, BookOpen, TrendingUp, ChevronUp, ChevronDown,
  ChevronLeft, ChevronRight, Eye, MessageSquare, ThumbsDown, Filter,
} from 'lucide-react';
import TaskDetailPanel from '../components/TaskDetailPanel';
import BuilderDrawer from '../components/BuilderDrawer';
import { fetchPursuitBuilderCohorts, toLegacyFormat } from '../utils/cohortUtils';
import { useAuth } from '../../../context/AuthContext';

const API_URL = import.meta.env.VITE_API_URL;
const PAGE_SIZE_TASKS = 10;
const PAGE_SIZE_BUILDERS = 10;
const PAGE_SIZE_FEEDBACK = 10;

const GRADE_COLORS = {
  'A+': '#15803d', A: '#16a34a', 'A-': '#22c55e',
  'B+': '#4242EA', B: '#6366f1', 'B-': '#818cf8',
  'C+': '#f59e0b', C: '#d97706',
};

const GradeBar = ({ task }) => {
  const grades = [
    { key: 'A+', count: task.grade_aplus_count },
    { key: 'A', count: task.grade_a_count },
    { key: 'A-', count: task.grade_aminus_count },
    { key: 'B+', count: task.grade_bplus_count },
    { key: 'B', count: task.grade_b_count },
    { key: 'B-', count: task.grade_bminus_count },
    { key: 'C+', count: task.grade_cplus_count },
    { key: 'C', count: task.grade_c_count },
  ];
  const total = grades.reduce((s, g) => s + g.count, 0);
  if (total === 0) return <span className="text-xs text-slate-400">—</span>;
  return (
    <div className="flex items-center gap-1">
      <div className="flex h-3 flex-1 rounded-sm overflow-hidden">
        {grades.filter(g => g.count > 0).map(g => (
          <div
            key={g.key}
            style={{ width: `${(g.count / total) * 100}%`, background: GRADE_COLORS[g.key] || '#94a3b8' }}
            title={`${g.key}: ${g.count} (${Math.round((g.count / total) * 100)}%)`}
          />
        ))}
      </div>
      <span className="text-[10px] text-slate-400 w-6 text-right">{total}</span>
    </div>
  );
};

const letterGrade = (score) => {
  if (score >= 93) return 'A+';
  if (score >= 87) return 'A';
  if (score >= 83) return 'A-';
  if (score >= 77) return 'B+';
  if (score >= 73) return 'B';
  if (score >= 70) return 'B-';
  if (score >= 67) return 'C+';
  return 'C';
};

const sentimentColor = (s) => {
  if (!s) return 'bg-slate-100 text-slate-600';
  const l = s.toLowerCase();
  if (l.includes('very positive')) return 'bg-green-100 text-green-700';
  if (l.includes('positive')) return 'bg-green-50 text-green-600';
  if (l.includes('negative')) return 'bg-red-100 text-red-600';
  return 'bg-slate-100 text-slate-600';
};

const SortHeader = ({ label, sortKey, sort, onSort, className = '' }) => (
  <th
    className={`pb-2 font-medium cursor-pointer hover:text-[#4242EA] transition-colors select-none ${className}`}
    onClick={() => onSort(sortKey)}
  >
    <span className="inline-flex items-center gap-0.5">
      {label}
      {sort.key === sortKey ? (
        sort.dir === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />
      ) : (
        <span className="text-slate-300 text-[10px]">⇅</span>
      )}
    </span>
  </th>
);

const Pagination = ({ page, total, pageSize, onPage }) => {
  const totalPages = Math.ceil(total / pageSize);
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-between pt-3 border-t border-[#E3E3E3]">
      <span className="text-xs text-slate-400">
        {page * pageSize + 1}–{Math.min((page + 1) * pageSize, total)} of {total}
      </span>
      <div className="flex gap-1">
        <button
          disabled={page === 0}
          onClick={() => onPage(page - 1)}
          className="p-1 rounded disabled:opacity-30 hover:bg-[#EFEFEF]"
        >
          <ChevronLeft size={14} />
        </button>
        <button
          disabled={page >= totalPages - 1}
          onClick={() => onPage(page + 1)}
          className="p-1 rounded disabled:opacity-30 hover:bg-[#EFEFEF]"
        >
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
};

const SummaryTab = () => {
  const { token } = useAuth();
  const [cohorts, setCohorts] = useState([]);
  const [selectedCohortId, setSelectedCohortId] = useState('');
  const [startDate, setStartDate] = useState('2025-03-01');
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(true);
  const [summaryData, setSummaryData] = useState(null);
  const [builders, setBuilders] = useState([]);

  // Sort and pagination state
  const [taskSort, setTaskSort] = useState({ key: 'assigned_date', dir: 'desc' });
  const [taskPage, setTaskPage] = useState(0);
  const [builderSort, setBuilderSort] = useState({ key: 'attendance_percentage', dir: 'desc' });
  const [builderPage, setBuilderPage] = useState(0);
  const [feedbackPage, setFeedbackPage] = useState(0);
  const [showNegativeOnly, setShowNegativeOnly] = useState(false);
  const [expandedTaskId, setExpandedTaskId] = useState(null);
  const [selectedBuilder, setSelectedBuilder] = useState(null);

  // Get the selected cohort object (for passing legacyName to BuilderDrawer)
  const selectedCohort = useMemo(
    () => cohorts.find(c => c.cohort_id === selectedCohortId),
    [cohorts, selectedCohortId]
  );

  // Fetch cohorts from org management (Pursuit builder cohorts only)
  useEffect(() => {
    if (!token) return;
    fetchPursuitBuilderCohorts(token)
      .then(data => {
        setCohorts(data);
        if (data.length > 0) setSelectedCohortId(data[0].cohort_id);
      })
      .catch(console.error);
  }, [token]);

  // Fetch cohort summary from native endpoint (replaces both legacy API calls)
  useEffect(() => {
    if (!selectedCohortId || !token) return;
    setLoading(true);
    setTaskPage(0);
    setFeedbackPage(0);
    setBuilderPage(0);

    const url = `${API_URL}/api/admin/dashboard/cohort-summary?cohortId=${selectedCohortId}&startDate=${startDate}&endDate=${endDate}`;
    fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(data => {
        if (data.success) {
          setSummaryData(data);
          setBuilders(data.builders || []);
        } else {
          console.error('Cohort summary error:', data.error);
          setSummaryData(null);
          setBuilders([]);
        }
      })
      .catch(err => {
        console.error('Cohort summary fetch failed:', err);
        setSummaryData(null);
        setBuilders([]);
      })
      .finally(() => setLoading(false));
  }, [selectedCohortId, startDate, endDate, token]);

  const summary = summaryData?.summary;
  const tasks = summaryData?.taskDetails ?? [];
  const allFeedback = summaryData?.allFeedbackDetails ?? [];

  // Sorted tasks
  const sortedTasks = useMemo(() => {
    const sorted = [...tasks].sort((a, b) => {
      let av = a[taskSort.key], bv = b[taskSort.key];
      if (taskSort.key === 'assigned_date') {
        av = av?.value || av || '';
        bv = bv?.value || bv || '';
      }
      if (typeof av === 'string') return taskSort.dir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av);
      return taskSort.dir === 'asc' ? (av || 0) - (bv || 0) : (bv || 0) - (av || 0);
    });
    return sorted;
  }, [tasks, taskSort]);

  // Sorted builders
  const sortedBuilders = useMemo(() => {
    return [...builders].sort((a, b) => {
      const av = a[builderSort.key] ?? 0, bv = b[builderSort.key] ?? 0;
      if (typeof av === 'string') return builderSort.dir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av);
      return builderSort.dir === 'asc' ? (av - bv) : (bv - av);
    });
  }, [builders, builderSort]);

  // Filtered feedback
  const feedback = useMemo(() => {
    if (!showNegativeOnly) return allFeedback;
    return allFeedback.filter(f => f.sentiment_category?.toLowerCase().includes('negative'));
  }, [allFeedback, showNegativeOnly]);

  const toggleSort = (setter) => (key) => {
    setter(prev => ({
      key,
      dir: prev.key === key && prev.dir === 'desc' ? 'asc' : 'desc',
    }));
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-wrap items-end gap-3">
        <div>
          <label className="text-xs text-slate-500 font-medium mb-1 block">Cohort</label>
          <select
            value={selectedCohortId}
            onChange={e => setSelectedCohortId(e.target.value)}
            className="px-3 py-1.5 text-sm border border-[#E3E3E3] rounded-md bg-white text-[#1E1E1E] focus:border-[#4242EA] focus:outline-none"
          >
            {cohorts.map(c => <option key={c.cohort_id} value={c.cohort_id}>{c.name}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs text-slate-500 font-medium mb-1 block">Start Date</label>
          <input
            type="date"
            value={startDate}
            onChange={e => setStartDate(e.target.value)}
            className="px-3 py-1.5 text-sm border border-[#E3E3E3] rounded-md bg-white text-[#1E1E1E] focus:border-[#4242EA] focus:outline-none"
          />
        </div>
        <div>
          <label className="text-xs text-slate-500 font-medium mb-1 block">End Date</label>
          <input
            type="date"
            value={endDate}
            onChange={e => setEndDate(e.target.value)}
            className="px-3 py-1.5 text-sm border border-[#E3E3E3] rounded-md bg-white text-[#1E1E1E] focus:border-[#4242EA] focus:outline-none"
          />
        </div>
      </div>

      {/* KPI cards */}
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {[1,2,3].map(i => <div key={i} className="h-20 bg-[#EFEFEF] rounded-lg animate-pulse" />)}
        </div>
      ) : summary ? (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { icon: Users, label: 'Builders', value: summary.totalBuilders, sub: `${summary.activeBuilders} active` },
            { icon: TrendingUp, label: 'Attendance Rate', value: `${summary.attendanceRate}%`, accent: summary.attendanceRate >= 80 ? 'text-green-600' : summary.attendanceRate >= 60 ? 'text-yellow-600' : 'text-red-500' },
            { icon: BookOpen, label: 'Submission Rate', value: `${Math.round((tasks.filter(t => t.submission_rate > 0).length / Math.max(tasks.length, 1)) * 100)}%` },
          ].map(({ icon: Icon, label, value, sub, accent }) => (
            <Card key={label} className="bg-white border border-[#E3E3E3]">
              <CardContent className="p-4 flex items-start justify-between">
                <div>
                  <p className="text-xs text-slate-500 font-medium">{label}</p>
                  <p className={`text-2xl font-bold mt-0.5 ${accent || 'text-[#1E1E1E]'}`}>{value}</p>
                  {sub && <p className="text-[10px] text-slate-400">{sub}</p>}
                </div>
                <div className="p-1.5 rounded-lg bg-[#EFEFEF]"><Icon size={16} className="text-[#4242EA]" /></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : null}

      {/* Task Analysis Table */}
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
            <p className="text-sm text-slate-400 text-center py-8">No task data for this period.</p>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-slate-400 text-xs uppercase tracking-wide border-b border-[#E3E3E3]">
                      <SortHeader label="Task" sortKey="task_title" sort={taskSort} onSort={toggleSort(setTaskSort)} className="pr-3" />
                      <SortHeader label="Date" sortKey="assigned_date" sort={taskSort} onSort={toggleSort(setTaskSort)} className="px-2" />
                      <SortHeader label="Sub. Rate" sortKey="submission_rate" sort={taskSort} onSort={toggleSort(setTaskSort)} className="px-2 text-center" />
                      <SortHeader label="Avg Score" sortKey="avg_score" sort={taskSort} onSort={toggleSort(setTaskSort)} className="px-2 text-center" />
                      <th className="pb-2 px-2 font-medium text-slate-400 text-xs uppercase tracking-wide">Grade Dist.</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EFEFEF]">
                    {sortedTasks.slice(taskPage * PAGE_SIZE_TASKS, (taskPage + 1) * PAGE_SIZE_TASKS).map(task => {
                      const date = task.assigned_date?.value || task.assigned_date || '';
                      const dateStr = date ? new Date(date + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—';
                      const grade = task.avg_score ? letterGrade(task.avg_score) : '—';
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
                            <td className="py-2 px-2 text-center">
                              <div className="flex items-center gap-1.5 justify-center">
                                <div className="w-12 h-1.5 bg-[#EFEFEF] rounded-full overflow-hidden">
                                  <div className="h-full bg-[#4242EA] rounded-full" style={{ width: `${task.submission_rate}%` }} />
                                </div>
                                <span className="text-xs text-slate-500 w-7">{task.submission_rate}%</span>
                              </div>
                            </td>
                            <td className="py-2 px-2 text-center">
                              {task.avg_score ? (
                                <span className={`text-xs font-semibold px-1.5 py-0.5 rounded ${
                                  grade.startsWith('A') ? 'bg-green-100 text-green-700' :
                                  grade.startsWith('B') ? 'bg-blue-100 text-blue-700' :
                                  'bg-yellow-100 text-yellow-700'}`}>
                                  {grade}
                                </span>
                              ) : <span className="text-xs text-slate-400">—</span>}
                            </td>
                            <td className="py-2 px-2 w-32"><GradeBar task={task} /></td>
                          </tr>
                          {isExpanded && (
                            <tr>
                              <td colSpan={5} className="p-0">
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
              <Pagination page={taskPage} total={sortedTasks.length} pageSize={PAGE_SIZE_TASKS} onPage={setTaskPage} />
            </>
          )}
        </CardContent>
      </Card>

      {/* Builder Performance Table */}
      <Card className="bg-white border border-[#E3E3E3]">
        <CardHeader className="pb-3 border-b border-[#E3E3E3]">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold text-[#1E1E1E]">Builder Performance</CardTitle>
            <Badge className="bg-[#EFEFEF] text-slate-600 text-xs">{builders.length} builders</Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-3">
          {loading ? (
            <div className="space-y-2">{[1,2,3,4,5].map(i => <div key={i} className="h-8 bg-[#EFEFEF] rounded animate-pulse" />)}</div>
          ) : builders.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-8">No builder data.</p>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-slate-400 text-xs uppercase tracking-wide border-b border-[#E3E3E3]">
                      <SortHeader label="Builder" sortKey="name" sort={builderSort} onSort={toggleSort(setBuilderSort)} className="pr-3" />
                      <SortHeader label="Attendance" sortKey="attendance_percentage" sort={builderSort} onSort={toggleSort(setBuilderSort)} className="px-2 text-center" />
                      <SortHeader label="Tasks" sortKey="tasks_completed_percentage" sort={builderSort} onSort={toggleSort(setBuilderSort)} className="px-2 text-center" />
                      <SortHeader label="Feedback" sortKey="total_peer_feedback_count" sort={builderSort} onSort={toggleSort(setBuilderSort)} className="px-2 text-center" />
                      <th className="pb-2 px-2 font-medium text-slate-400 text-xs uppercase tracking-wide">Grade Dist.</th>
                      <SortHeader label="Videos" sortKey="video_tasks_completed" sort={builderSort} onSort={toggleSort(setBuilderSort)} className="px-2 text-center" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EFEFEF]">
                    {sortedBuilders.slice(builderPage * PAGE_SIZE_BUILDERS, (builderPage + 1) * PAGE_SIZE_BUILDERS).map(b => (
                      <tr key={b.user_id} className="hover:bg-[#EFEFEF]/50 transition-colors">
                        <td className="py-2 pr-3">
                          <button
                            onClick={() => setSelectedBuilder(b)}
                            className="font-medium text-[#4242EA] text-xs hover:underline text-left"
                          >
                            {b.name}
                          </button>
                        </td>
                        <td className="py-2 px-2 text-center">
                          <span className={`text-xs font-semibold ${
                            b.attendance_percentage >= 80 ? 'text-green-600' :
                            b.attendance_percentage >= 60 ? 'text-yellow-600' : 'text-red-500'
                          }`}>{b.attendance_percentage}%</span>
                          <p className="text-[10px] text-slate-400">{b.days_attended}/{b.total_curriculum_days}</p>
                        </td>
                        <td className="py-2 px-2 text-center text-xs text-slate-600">{b.tasks_completed_percentage}%</td>
                        <td className="py-2 px-2 text-center text-xs text-slate-600">{b.total_peer_feedback_count}</td>
                        <td className="py-2 px-2 w-28">
                          <GradeBar task={{
                            grade_aplus_count: b.grade_aplus_count, grade_a_count: b.grade_a_count,
                            grade_aminus_count: b.grade_aminus_count, grade_bplus_count: b.grade_bplus_count,
                            grade_b_count: b.grade_b_count, grade_bminus_count: b.grade_bminus_count,
                            grade_cplus_count: b.grade_cplus_count, grade_c_count: b.grade_c_count,
                          }} />
                        </td>
                        <td className="py-2 px-2 text-center">
                          {b.video_tasks_completed > 0 ? (
                            <button
                              onClick={() => setSelectedBuilder(b)}
                              className="text-xs text-[#4242EA] hover:underline font-medium"
                            >
                              {b.video_tasks_completed} {b.avg_video_score ? `(${Math.round(b.avg_video_score)}%)` : ''}
                            </button>
                          ) : <span className="text-xs text-slate-300">—</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Pagination page={builderPage} total={sortedBuilders.length} pageSize={PAGE_SIZE_BUILDERS} onPage={setBuilderPage} />
            </>
          )}
        </CardContent>
      </Card>

      {/* Peer Feedback Table */}
      <Card className="bg-white border border-[#E3E3E3]">
        <CardHeader className="pb-3 border-b border-[#E3E3E3]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageSquare size={16} className="text-[#4242EA]" />
              <CardTitle className="text-base font-semibold text-[#1E1E1E]">Peer Feedback</CardTitle>
              <Badge className="bg-[#EFEFEF] text-slate-600 text-xs">{feedback.length}</Badge>
            </div>
            <button
              onClick={() => { setShowNegativeOnly(!showNegativeOnly); setFeedbackPage(0); }}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                showNegativeOnly
                  ? 'bg-red-100 text-red-600 border border-red-200'
                  : 'bg-white border border-[#E3E3E3] text-slate-500 hover:border-red-300 hover:text-red-500'
              }`}
            >
              <ThumbsDown size={12} />
              Negative only
            </button>
          </div>
        </CardHeader>
        <CardContent className="pt-3">
          {loading ? (
            <div className="space-y-2">{[1,2,3].map(i => <div key={i} className="h-8 bg-[#EFEFEF] rounded animate-pulse" />)}</div>
          ) : feedback.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-8">No feedback entries.</p>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-slate-400 text-xs uppercase tracking-wide border-b border-[#E3E3E3]">
                      <th className="pb-2 pr-2 font-medium">Date</th>
                      <th className="pb-2 px-2 font-medium">Reviewer</th>
                      <th className="pb-2 px-2 font-medium">Recipient</th>
                      <th className="pb-2 px-2 font-medium">Sentiment</th>
                      <th className="pb-2 pl-2 font-medium">Feedback</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EFEFEF]">
                    {feedback.slice(feedbackPage * PAGE_SIZE_FEEDBACK, (feedbackPage + 1) * PAGE_SIZE_FEEDBACK).map((f, i) => {
                      const date = f.created_at?.value || f.created_at || '';
                      const dateStr = date ? new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—';
                      return (
                        <tr key={`${f.reviewer_name}-${i}`} className="hover:bg-[#EFEFEF]/50 transition-colors align-top">
                          <td className="py-2 pr-2 text-xs text-slate-500 whitespace-nowrap">{dateStr}</td>
                          <td className="py-2 px-2 text-xs font-medium text-[#1E1E1E] whitespace-nowrap">{f.reviewer_name}</td>
                          <td className="py-2 px-2 text-xs text-slate-600 whitespace-nowrap">{f.recipient_name}</td>
                          <td className="py-2 px-2">
                            <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${sentimentColor(f.sentiment_category)}`}>
                              {f.sentiment_category || 'N/A'}
                            </span>
                          </td>
                          <td className="py-2 pl-2 text-xs text-slate-600 max-w-[400px]">
                            <p className="line-clamp-2">{f.feedback_text}</p>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <Pagination page={feedbackPage} total={feedback.length} pageSize={PAGE_SIZE_FEEDBACK} onPage={setFeedbackPage} />
            </>
          )}
        </CardContent>
      </Card>

      {/* Builder detail drawer */}
      {selectedBuilder && (
        <BuilderDrawer
          builder={selectedBuilder}
          startDate={startDate}
          endDate={endDate}
          selectedLevel={selectedCohort?.legacyName || ''}
          cohortId={selectedCohortId}
          onClose={() => setSelectedBuilder(null)}
        />
      )}
    </div>
  );
};

export default SummaryTab;
