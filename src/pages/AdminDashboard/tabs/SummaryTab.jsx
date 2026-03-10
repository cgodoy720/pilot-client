import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import {
  Users, BookOpen, TrendingUp, ChevronUp, ChevronDown,
  ChevronLeft, ChevronRight, Eye, MessageSquare, ThumbsDown, Filter, FileText, Plus,
  AlertTriangle, MessageSquarePlus, ArrowRight,
} from 'lucide-react';
import TaskDetailPanel from '../components/TaskDetailPanel';
import BuilderDrawer from '../components/BuilderDrawer';
import BuilderLogModal from '../components/BuilderLogModal';
import { fetchPursuitBuilderCohorts, toLegacyFormat } from '../utils/cohortUtils';
import useAuthStore from '../../../stores/authStore';

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
  const token = useAuthStore((s) => s.token);
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
  const [logModalBuilder, setLogModalBuilder] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const [supportTickets, setSupportTickets] = useState([]);
  const [nextStepLogs, setNextStepLogs] = useState([]);
  const [supportLoading, setSupportLoading] = useState(false);
  const [supportFilter, setSupportFilter] = useState('active');
  const [expandedItemId, setExpandedItemId] = useState(null);
  const [ticketNoteInputs, setTicketNoteInputs] = useState({});
  const [ticketNoteSaving, setTicketNoteSaving] = useState({});

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
  }, [selectedCohortId, startDate, endDate, token, refreshKey]);

  const fetchSupportTickets = async () => {
    if (!selectedCohortId || !token) return;
    setSupportLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/admin/dashboard/support-tickets?cohortId=${selectedCohortId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setSupportTickets(data.data.tickets || []);
        setNextStepLogs(data.data.nextStepLogs || []);
      }
    } catch (err) {
      console.error('Support tickets fetch failed:', err);
    }
    setSupportLoading(false);
  };

  useEffect(() => {
    fetchSupportTickets();
  }, [selectedCohortId, token, refreshKey]);

  const filteredTickets = useMemo(() => {
    if (supportFilter === 'all') return supportTickets;
    const activeStatuses = ['open', 'in_progress', 'follow_up'];
    return supportTickets.filter(t => activeStatuses.includes(t.current_status));
  }, [supportTickets, supportFilter]);

  const filteredNextSteps = useMemo(() => {
    if (supportFilter === 'all') return nextStepLogs;
    return nextStepLogs.filter(l => l.status !== 'closed');
  }, [nextStepLogs, supportFilter]);

  const handleNextStepStatusChange = async (logId, newStatus) => {
    try {
      const res = await fetch(`${API_URL}/api/admin/dashboard/builder-logs/${logId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) fetchSupportTickets();
    } catch { /* ignore */ }
  };

  const totalFacilitatorLogs = filteredTickets.length + filteredNextSteps.length;
  const [showFacilitatorLogModal, setShowFacilitatorLogModal] = useState(false);

  const handleTicketStatusChange = async (supportId, newStatus) => {
    try {
      const res = await fetch(`${API_URL}/api/admin/dashboard/support-tickets/${supportId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) fetchSupportTickets();
    } catch { /* ignore */ }
  };

  const handleTicketAddNote = async (supportId) => {
    const note = ticketNoteInputs[supportId]?.trim();
    if (!note) return;
    setTicketNoteSaving(prev => ({ ...prev, [supportId]: true }));
    try {
      const res = await fetch(`${API_URL}/api/admin/dashboard/support-tickets/${supportId}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ notes: note }),
      });
      if (res.ok) {
        setTicketNoteInputs(prev => ({ ...prev, [supportId]: '' }));
        fetchSupportTickets();
      }
    } catch { /* ignore */ }
    setTicketNoteSaving(prev => ({ ...prev, [supportId]: false }));
  };

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
                      <SortHeader label="Logs" sortKey="log_count" sort={builderSort} onSort={toggleSort(setBuilderSort)} className="px-2 text-center" />
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
                        <td className="py-2 px-2 text-center">
                          <button
                            onClick={(e) => { e.stopPropagation(); setLogModalBuilder(b); }}
                            className={`inline-flex items-center gap-0.5 text-xs font-medium px-1.5 py-0.5 rounded transition-colors ${
                              b.log_count > 0
                                ? 'bg-[#4242EA]/10 text-[#4242EA] hover:bg-[#4242EA]/20'
                                : 'text-slate-400 hover:text-[#4242EA] hover:bg-[#EFEFEF]'
                            }`}
                          >
                            {b.log_count > 0 ? (
                              <><FileText size={11} /> {b.log_count}</>
                            ) : (
                              <Plus size={12} />
                            )}
                          </button>
                        </td>
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

      {/* Facilitator Logs: Support Tickets + Next Steps */}
      <Card className="bg-white border border-[#E3E3E3]">
        <CardHeader className="pb-3 border-b border-[#E3E3E3]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText size={16} className="text-[#4242EA]" />
              <CardTitle className="text-base font-semibold text-[#1E1E1E]">Facilitator Logs</CardTitle>
              <Badge className="bg-[#EFEFEF] text-slate-600 text-xs">{totalFacilitatorLogs}</Badge>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowFacilitatorLogModal(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md bg-[#4242EA] text-white hover:bg-[#3535c8] transition-colors"
              >
                <Plus size={12} />
                Add Log
              </button>
              <div className="flex gap-1">
                {['active', 'all'].map(f => (
                  <button
                    key={f}
                    onClick={() => setSupportFilter(f)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                      supportFilter === f
                        ? 'bg-[#4242EA] text-white'
                        : 'bg-white border border-[#E3E3E3] text-slate-500 hover:border-[#4242EA] hover:text-[#4242EA]'
                    }`}
                  >
                    {f === 'active' ? 'Active' : 'All'}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-3">
          {supportLoading ? (
            <div className="space-y-2">{[1,2,3].map(i => <div key={i} className="h-8 bg-[#EFEFEF] rounded animate-pulse" />)}</div>
          ) : totalFacilitatorLogs === 0 ? (
            <p className="text-sm text-slate-400 text-center py-8">
              {supportFilter === 'active' ? 'No active facilitator logs.' : 'No facilitator logs for this cohort.'}
            </p>
          ) : (
            <div className="space-y-4">
              {/* Support Tickets */}
              {filteredTickets.length > 0 && (
                <div>
                  <div className="flex items-center gap-1.5 mb-2">
                    <AlertTriangle size={12} className="text-amber-500" />
                    <span className="text-[10px] font-semibold text-slate-400 uppercase">Support Tickets</span>
                    <Badge className="bg-amber-50 text-amber-600 text-[10px]">{filteredTickets.length}</Badge>
                  </div>
                  <div className="space-y-0 divide-y divide-[#EFEFEF] border border-[#E3E3E3] rounded-md overflow-hidden">
                    {filteredTickets.map(ticket => {
                      const itemKey = `ticket-${ticket.support_id}`;
                      const isExpanded = expandedItemId === itemKey;
                      const statusColors = {
                        open: 'text-blue-600 bg-blue-50',
                        in_progress: 'text-yellow-600 bg-yellow-50',
                        follow_up: 'text-purple-600 bg-purple-50',
                        accepted: 'text-green-600 bg-green-50',
                        denied: 'text-red-600 bg-red-50',
                        closed: 'text-slate-500 bg-slate-50',
                      };
                      const categoryLabels = {
                        '599_extension': '599 Extension',
                        'hra_training': 'HRA Training',
                        'laptop_hardware': 'Laptop/Hardware',
                        'time_off_personal': 'Time Off/Personal',
                        'other': 'Other',
                      };
                      const updatedAt = ticket.updated_at ? new Date(ticket.updated_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—';
                      return (
                        <div key={ticket.support_id}>
                          <button
                            type="button"
                            onClick={() => setExpandedItemId(isExpanded ? null : itemKey)}
                            className="w-full flex items-center gap-3 px-2 py-2.5 text-left hover:bg-[#FAFAFA] transition-colors"
                          >
                            <span className={`transition-transform ${isExpanded ? 'rotate-90' : ''}`}>
                              <ChevronRight size={12} className="text-slate-400" />
                            </span>
                            <span className="text-xs font-medium text-[#1E1E1E] w-36 truncate">{ticket.builder_name}</span>
                            <Badge className="bg-[#EFEFEF] text-slate-600 text-[10px] w-28 justify-center">
                              {categoryLabels[ticket.support_category] || ticket.support_category}
                            </Badge>
                            <select
                              value={ticket.current_status}
                              onClick={(e) => e.stopPropagation()}
                              onChange={(e) => { e.stopPropagation(); handleTicketStatusChange(ticket.support_id, e.target.value); }}
                              className={`text-[10px] px-1.5 py-0.5 rounded border border-[#E3E3E3] bg-white cursor-pointer font-medium ${
                                statusColors[ticket.current_status]?.split(' ')[0] || ''
                              }`}
                            >
                              {['open', 'in_progress', 'follow_up', 'accepted', 'denied', 'closed'].map(s => (
                                <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
                              ))}
                            </select>
                            {ticket.mitigation_available && (
                              <Badge className="bg-green-50 text-green-600 text-[10px]">Mitigation</Badge>
                            )}
                            <span className="text-[10px] text-slate-400 ml-auto">{updatedAt}</span>
                          </button>

                          {isExpanded && (
                            <div className="px-8 pb-3 space-y-2 bg-[#FAFAFA]">
                              <p className="text-xs text-slate-600 line-clamp-3">{ticket.log_notes}</p>

                              {ticket.support_disclosure && (
                                <div className="bg-amber-50 border border-amber-200 rounded px-2 py-1.5">
                                  <p className="text-[10px] font-semibold text-amber-600 uppercase mb-0.5">Sensitive Details</p>
                                  <p className="text-xs text-slate-600">{ticket.support_disclosure}</p>
                                </div>
                              )}

                              <div className="flex items-center gap-1 text-[10px] text-slate-400">
                                <span>Created {new Date(ticket.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                                <span>·</span>
                                <span>by {ticket.created_by_name}</span>
                                <span>·</span>
                                <span className="capitalize">{ticket.log_type} log</span>
                              </div>

                              <div className="flex gap-1.5">
                                <input
                                  type="text"
                                  value={ticketNoteInputs[ticket.support_id] || ''}
                                  onChange={(e) => setTicketNoteInputs(prev => ({ ...prev, [ticket.support_id]: e.target.value }))}
                                  placeholder="Add a note or update..."
                                  className="flex-1 px-2 py-1 text-xs border border-[#E3E3E3] rounded bg-white focus:border-[#4242EA] focus:outline-none"
                                  onClick={(e) => e.stopPropagation()}
                                  onKeyDown={(e) => e.key === 'Enter' && handleTicketAddNote(ticket.support_id)}
                                />
                                <button
                                  type="button"
                                  onClick={(e) => { e.stopPropagation(); handleTicketAddNote(ticket.support_id); }}
                                  disabled={ticketNoteSaving[ticket.support_id] || !ticketNoteInputs[ticket.support_id]?.trim()}
                                  className="px-2 py-1 text-xs bg-[#4242EA] text-white rounded hover:bg-[#3535c8] disabled:opacity-50 flex items-center gap-1"
                                >
                                  <MessageSquarePlus size={11} />
                                  {ticketNoteSaving[ticket.support_id] ? '...' : 'Add'}
                                </button>
                              </div>

                              {ticket.history && ticket.history.length > 0 && (
                                <div className="border-t border-[#EFEFEF] pt-2">
                                  <p className="text-[10px] font-semibold text-slate-400 uppercase mb-1.5">History</p>
                                  <div className="space-y-1.5">
                                    {ticket.history.map((h, i) => (
                                      <div key={i} className="flex items-start gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-[#4242EA] mt-1 flex-shrink-0" />
                                        <div>
                                          <span className={`text-[10px] font-medium px-1 py-0.5 rounded ${statusColors[h.status] || ''}`}>
                                            {h.status.replace(/_/g, ' ')}
                                          </span>
                                          <span className="text-[10px] text-slate-400 ml-1.5">
                                            {new Date(h.changed_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} — {h.changed_by_name}
                                          </span>
                                          {h.notes && <p className="text-[10px] text-slate-500 mt-0.5">{h.notes}</p>}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Next Steps */}
              {filteredNextSteps.length > 0 && (
                <div>
                  <div className="flex items-center gap-1.5 mb-2">
                    <ArrowRight size={12} className="text-[#4242EA]" />
                    <span className="text-[10px] font-semibold text-slate-400 uppercase">Next Steps</span>
                    <Badge className="bg-blue-50 text-blue-600 text-[10px]">{filteredNextSteps.length}</Badge>
                  </div>
                  <div className="space-y-0 divide-y divide-[#EFEFEF] border border-[#E3E3E3] rounded-md overflow-hidden">
                    {filteredNextSteps.map(log => {
                      const itemKey = `nextstep-${log.log_id}`;
                      const isExpanded = expandedItemId === itemKey;
                      const statusColors = {
                        open: 'text-blue-600 bg-blue-50',
                        in_progress: 'text-yellow-600 bg-yellow-50',
                        closed: 'text-slate-500 bg-slate-50',
                      };
                      const updatedAt = log.updated_at ? new Date(log.updated_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—';
                      return (
                        <div key={log.log_id}>
                          <button
                            type="button"
                            onClick={() => setExpandedItemId(isExpanded ? null : itemKey)}
                            className="w-full flex items-center gap-3 px-2 py-2.5 text-left hover:bg-[#FAFAFA] transition-colors"
                          >
                            <span className={`transition-transform ${isExpanded ? 'rotate-90' : ''}`}>
                              <ChevronRight size={12} className="text-slate-400" />
                            </span>
                            <span className="text-xs font-medium text-[#1E1E1E] w-36 truncate">{log.builder_name}</span>
                            <Badge className={`text-[10px] px-1.5 py-0 ${log.log_type === 'behavioral' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}`}>
                              {log.log_type}
                            </Badge>
                            <select
                              value={log.status}
                              onClick={(e) => e.stopPropagation()}
                              onChange={(e) => { e.stopPropagation(); handleNextStepStatusChange(log.log_id, e.target.value); }}
                              className={`text-[10px] px-1.5 py-0.5 rounded border border-[#E3E3E3] bg-white cursor-pointer font-medium ${
                                statusColors[log.status]?.split(' ')[0] || ''
                              }`}
                            >
                              {['open', 'in_progress', 'closed'].map(s => (
                                <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
                              ))}
                            </select>
                            <span className="text-[10px] text-slate-400 ml-auto">{updatedAt}</span>
                          </button>

                          {isExpanded && (
                            <div className="px-8 pb-3 space-y-2 bg-[#FAFAFA]">
                              <div>
                                <p className="text-[10px] font-semibold text-[#4242EA] uppercase mb-0.5">Next Steps</p>
                                <p className="text-xs text-slate-600 whitespace-pre-wrap">{log.next_steps}</p>
                              </div>

                              <div>
                                <p className="text-[10px] font-semibold text-slate-400 uppercase mb-0.5">Notes</p>
                                <p className="text-xs text-slate-600 line-clamp-3">{log.notes}</p>
                              </div>

                              {log.tags && log.tags.length > 0 && (
                                <div className="flex flex-wrap gap-1">
                                  {log.tags.map((tag, i) => (
                                    <Badge key={i} className="bg-slate-100 text-slate-600 text-[10px]">{tag}</Badge>
                                  ))}
                                </div>
                              )}

                              <div className="flex items-center gap-1 text-[10px] text-slate-400">
                                <span>Created {new Date(log.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                                <span>·</span>
                                <span>by {log.created_by_name}</span>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
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
          onLogSaved={() => setRefreshKey(k => k + 1)}
        />
      )}

      {/* Builder log modal (from builder table) */}
      <BuilderLogModal
        open={!!logModalBuilder}
        onOpenChange={(open) => { if (!open) setLogModalBuilder(null); }}
        builder={logModalBuilder}
        cohortId={selectedCohortId}
        onSaved={() => { setRefreshKey(k => k + 1); fetchSupportTickets(); }}
      />

      {/* Facilitator log modal (from facilitator logs card) */}
      {showFacilitatorLogModal && (
        <BuilderLogModal
          open={true}
          onOpenChange={(open) => { if (!open) setShowFacilitatorLogModal(false); }}
          builder={null}
          cohortId={selectedCohortId}
          onSaved={() => { setRefreshKey(k => k + 1); fetchSupportTickets(); }}
        />
      )}
    </div>
  );
};

export default SummaryTab;
