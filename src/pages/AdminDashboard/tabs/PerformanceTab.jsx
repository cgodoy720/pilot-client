import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import {
  ChevronUp, ChevronDown, ChevronLeft, ChevronRight,
  MessageSquare, ThumbsDown, Video, ExternalLink, TrendingUp,
} from 'lucide-react';
import TaskDetailPanel from '../components/TaskDetailPanel';
import useAuthStore from '../../../stores/authStore';

const API_URL = import.meta.env.VITE_API_URL;
const LEGACY_API = 'https://ai-pilot-admin-dashboard-866060457933.us-central1.run.app/api';
const PAGE_SIZE_TASKS = 10;
const PAGE_SIZE_FEEDBACK = 10;
const PAGE_SIZE_VIDEOS = 15;

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

const scoreColor = (s) => s >= 4 ? 'text-green-600 bg-green-50' : s >= 3 ? 'text-yellow-600 bg-yellow-50' : 'text-red-500 bg-red-50';

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
        <button disabled={page === 0} onClick={() => onPage(page - 1)} className="p-1 rounded disabled:opacity-30 hover:bg-[#EFEFEF]">
          <ChevronLeft size={14} />
        </button>
        <button disabled={page >= totalPages - 1} onClick={() => onPage(page + 1)} className="p-1 rounded disabled:opacity-30 hover:bg-[#EFEFEF]">
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
};

const PerformanceTab = ({ selectedCohortId, cohorts }) => {
  const token = useAuthStore((s) => s.token);
  const [startDate, setStartDate] = useState('2025-03-01');
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(true);
  const [summaryData, setSummaryData] = useState(null);

  const [taskSort, setTaskSort] = useState({ key: 'assigned_date', dir: 'desc' });
  const [taskPage, setTaskPage] = useState(0);
  const [feedbackPage, setFeedbackPage] = useState(0);
  const [showNegativeOnly, setShowNegativeOnly] = useState(false);
  const [expandedTaskId, setExpandedTaskId] = useState(null);

  // Video state
  const [videos, setVideos] = useState([]);
  const [videoLoading, setVideoLoading] = useState(true);
  const [videoSort, setVideoSort] = useState({ key: 'submission_date', dir: 'desc' });
  const [videoPage, setVideoPage] = useState(0);
  const [expandedVideo, setExpandedVideo] = useState(null);

  const selectedCohort = useMemo(
    () => cohorts.find(c => c.cohort_id === selectedCohortId),
    [cohorts, selectedCohortId]
  );

  useEffect(() => {
    if (!selectedCohortId || !token) return;
    setLoading(true);
    setTaskPage(0);
    setFeedbackPage(0);

    fetch(`${API_URL}/api/admin/dashboard/cohort-summary?cohortId=${selectedCohortId}&startDate=${startDate}&endDate=${endDate}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(data => setSummaryData(data.success ? data : null))
      .catch(() => setSummaryData(null))
      .finally(() => setLoading(false));
  }, [selectedCohortId, startDate, endDate, token]);

  useEffect(() => {
    if (!selectedCohortId) return;
    setVideoLoading(true);
    setVideoPage(0);
    setExpandedVideo(null);

    const selectedLevel = selectedCohort?.legacyName || '';
    const videoStartDate = '2025-03-01';
    const videoEndDate = new Date().toISOString().split('T')[0];

    const fetchNative = selectedCohortId && token
      ? fetch(`${API_URL}/api/admin/dashboard/cohort-videos?cohortId=${selectedCohortId}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
          .then(r => r.ok ? r.json() : null)
          .then(d => d?.success ? d.data : null)
          .catch(() => null)
      : Promise.resolve(null);

    fetchNative.then(nativeData => {
      if (nativeData && nativeData.length > 0) {
        setVideos(nativeData);
        setVideoLoading(false);
      } else if (selectedLevel) {
        fetch(`${LEGACY_API}/video-analyses?level=${encodeURIComponent(selectedLevel)}&startDate=${videoStartDate}&endDate=${videoEndDate}`)
          .then(r => r.json())
          .then(data => setVideos(Array.isArray(data) ? data : []))
          .catch(() => setVideos([]))
          .finally(() => setVideoLoading(false));
      } else {
        setVideos([]);
        setVideoLoading(false);
      }
    });
  }, [selectedCohortId, selectedCohort, token]);

  const tasks = summaryData?.taskDetails ?? [];
  const allFeedback = summaryData?.allFeedbackDetails ?? [];

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

  const feedback = useMemo(() => {
    if (!showNegativeOnly) return allFeedback;
    return allFeedback.filter(f => f.sentiment_category?.toLowerCase().includes('negative'));
  }, [allFeedback, showNegativeOnly]);

  const resolveDate = (d) => {
    if (!d) return '';
    if (typeof d === 'object' && d.value) return d.value;
    return String(d);
  };

  const sortedVideos = useMemo(() => {
    return [...videos].sort((a, b) => {
      let av, bv;
      if (videoSort.key === 'submission_date') {
        av = resolveDate(a.submission_date);
        bv = resolveDate(b.submission_date);
      } else if (videoSort.key === 'user_name') {
        av = a.user_name || '';
        bv = b.user_name || '';
      } else {
        av = a[videoSort.key] ?? 0;
        bv = b[videoSort.key] ?? 0;
      }
      if (typeof av === 'string') return videoSort.dir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av);
      return videoSort.dir === 'asc' ? av - bv : bv - av;
    });
  }, [videos, videoSort]);

  const toggleTaskSort = (key) => {
    setTaskSort(prev => ({ key, dir: prev.key === key && prev.dir === 'desc' ? 'asc' : 'desc' }));
  };
  const toggleVideoSort = (key) => {
    setVideoSort(prev => ({ key, dir: prev.key === key && prev.dir === 'desc' ? 'asc' : 'desc' }));
  };

  const parseRationale = (jsonStr) => {
    try { return JSON.parse(jsonStr); } catch { return null; }
  };

  return (
    <div className="space-y-6">
      {/* Date filters */}
      <div className="flex flex-wrap items-end gap-3">
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
                      <SortHeader label="Task" sortKey="task_title" sort={taskSort} onSort={toggleTaskSort} className="pr-3" />
                      <SortHeader label="Date" sortKey="assigned_date" sort={taskSort} onSort={toggleTaskSort} className="px-2" />
                      <SortHeader label="Sub. Rate" sortKey="submission_rate" sort={taskSort} onSort={toggleTaskSort} className="px-2 text-center" />
                      <SortHeader label="Avg Score" sortKey="avg_score" sort={taskSort} onSort={toggleTaskSort} className="px-2 text-center" />
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

      {/* Video Submissions */}
      <Card className="bg-white border border-[#E3E3E3]">
        <CardHeader className="pb-3 border-b border-[#E3E3E3]">
          <div className="flex items-center gap-2">
            <Video size={16} className="text-[#4242EA]" />
            <CardTitle className="text-base font-semibold text-[#1E1E1E]">Video Submissions</CardTitle>
            <Badge className="bg-[#EFEFEF] text-slate-600 text-xs">{videos.length} videos</Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-3">
          {videoLoading ? (
            <div className="space-y-2">{[1,2,3,4,5].map(i => <div key={i} className="h-10 bg-[#EFEFEF] rounded animate-pulse" />)}</div>
          ) : videos.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-8">No video submissions for this cohort.</p>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-slate-400 text-xs uppercase tracking-wide border-b border-[#E3E3E3]">
                      <SortHeader label="Builder" sortKey="user_name" sort={videoSort} onSort={toggleVideoSort} className="pr-3" />
                      <th className="pb-2 px-2 font-medium">Video</th>
                      <SortHeader label="Score" sortKey="average_score" sort={videoSort} onSort={toggleVideoSort} className="px-2 text-center" />
                      <SortHeader label="Technical" sortKey="technical_score" sort={videoSort} onSort={toggleVideoSort} className="px-2 text-center" />
                      <SortHeader label="Business" sortKey="business_score" sort={videoSort} onSort={toggleVideoSort} className="px-2 text-center" />
                      <SortHeader label="Professional" sortKey="professional_skills_score" sort={videoSort} onSort={toggleVideoSort} className="px-2 text-center" />
                      <SortHeader label="Date" sortKey="submission_date" sort={videoSort} onSort={toggleVideoSort} className="px-2" />
                      <th className="pb-2 pl-2 font-medium">Details</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedVideos.slice(videoPage * PAGE_SIZE_VIDEOS, (videoPage + 1) * PAGE_SIZE_VIDEOS).map((v, i) => {
                      const dateRaw = resolveDate(v.submission_date);
                      const dateStr = dateRaw ? new Date(dateRaw).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—';
                      const isExpanded = expandedVideo === v.video_id;
                      return (
                        <React.Fragment key={`${v.video_id}-${i}`}>
                          <tr className={`hover:bg-[#EFEFEF]/50 transition-colors border-b border-[#EFEFEF] ${isExpanded ? 'bg-[#EFEFEF]/30' : ''}`}>
                            <td className="py-2 pr-3 text-xs font-medium text-[#1E1E1E]">{v.user_name}</td>
                            <td className="py-2 px-2">
                              {v.loom_url ? (
                                <a href={v.loom_url} target="_blank" rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 text-[10px] text-[#4242EA] hover:underline">
                                  <ExternalLink size={10} /> Watch
                                </a>
                              ) : <span className="text-xs text-slate-400">—</span>}
                            </td>
                            <td className="py-2 px-2 text-center">
                              {v.average_score != null ? (
                                <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${scoreColor(v.average_score)}`}>{v.average_score}/5</span>
                              ) : <span className="text-xs text-slate-300">—</span>}
                            </td>
                            <td className="py-2 px-2 text-center">
                              {v.technical_score != null ? (
                                <span className={`text-xs font-semibold ${v.technical_score >= 4 ? 'text-green-600' : v.technical_score >= 3 ? 'text-yellow-600' : 'text-red-500'}`}>{v.technical_score}</span>
                              ) : <span className="text-xs text-slate-300">—</span>}
                            </td>
                            <td className="py-2 px-2 text-center">
                              {v.business_score != null ? (
                                <span className={`text-xs font-semibold ${v.business_score >= 4 ? 'text-green-600' : v.business_score >= 3 ? 'text-yellow-600' : 'text-red-500'}`}>{v.business_score}</span>
                              ) : <span className="text-xs text-slate-300">—</span>}
                            </td>
                            <td className="py-2 px-2 text-center">
                              {v.professional_skills_score != null ? (
                                <span className={`text-xs font-semibold ${v.professional_skills_score >= 4 ? 'text-green-600' : v.professional_skills_score >= 3 ? 'text-yellow-600' : 'text-red-500'}`}>{v.professional_skills_score}</span>
                              ) : <span className="text-xs text-slate-300">—</span>}
                            </td>
                            <td className="py-2 px-2 text-xs text-slate-500 whitespace-nowrap">{dateStr}</td>
                            <td className="py-2 pl-2">
                              <button
                                onClick={() => setExpandedVideo(isExpanded ? null : v.video_id)}
                                className="text-[10px] text-[#4242EA] hover:underline font-medium"
                              >
                                {isExpanded ? 'Hide' : 'View'}
                              </button>
                            </td>
                          </tr>
                          {isExpanded && (
                            <tr>
                              <td colSpan={8} className="bg-[#FAFAFA] border-b border-[#E3E3E3] p-4">
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                                  {[
                                    { label: 'Technical', score: v.technical_score, rationale: v.technical_score_rationale },
                                    { label: 'Business', score: v.business_score, rationale: v.business_score_rationale },
                                    { label: 'Professional', score: v.professional_skills_score, rationale: v.professional_skills_score_rationale },
                                  ].map(({ label, score, rationale }) => {
                                    const parsed = parseRationale(rationale);
                                    return (
                                      <div key={label} className="bg-white rounded-lg border border-[#E3E3E3] p-3">
                                        <div className="flex items-center justify-between mb-2">
                                          <span className="text-xs font-semibold text-[#1E1E1E]">{label}</span>
                                          <span className={`text-sm font-bold ${score >= 4 ? 'text-green-600' : score >= 3 ? 'text-yellow-600' : 'text-red-500'}`}>{score}/5</span>
                                        </div>
                                        {parsed?.overall_explanation && (
                                          <p className="text-[11px] text-slate-600 leading-relaxed mb-2">{parsed.overall_explanation}</p>
                                        )}
                                        {parsed?.sub_criteria && (
                                          <div className="space-y-1.5 mt-2">
                                            {Object.entries(parsed.sub_criteria).map(([key, sub]) => (
                                              <div key={key} className="bg-[#FAFAFA] rounded p-1.5">
                                                <div className="flex items-center justify-between">
                                                  <span className="text-[10px] font-medium text-slate-500">{key}</span>
                                                  <span className={`text-[10px] font-bold ${sub.score >= 4 ? 'text-green-600' : sub.score >= 3 ? 'text-yellow-600' : 'text-red-500'}`}>{sub.score}/5</span>
                                                </div>
                                                <p className="text-[10px] text-slate-400 mt-0.5 leading-relaxed">{sub.explanation}</p>
                                              </div>
                                            ))}
                                          </div>
                                        )}
                                      </div>
                                    );
                                  })}
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              {Math.ceil(sortedVideos.length / PAGE_SIZE_VIDEOS) > 1 && (
                <div className="flex items-center justify-between pt-3 border-t border-[#E3E3E3]">
                  <span className="text-xs text-slate-400">{videoPage * PAGE_SIZE_VIDEOS + 1}–{Math.min((videoPage + 1) * PAGE_SIZE_VIDEOS, sortedVideos.length)} of {sortedVideos.length}</span>
                  <div className="flex gap-1">
                    <button disabled={videoPage === 0} onClick={() => setVideoPage(videoPage - 1)} className="p-1 rounded disabled:opacity-30 hover:bg-[#EFEFEF]"><ChevronLeft size={14} /></button>
                    <button disabled={videoPage >= Math.ceil(sortedVideos.length / PAGE_SIZE_VIDEOS) - 1} onClick={() => setVideoPage(videoPage + 1)} className="p-1 rounded disabled:opacity-30 hover:bg-[#EFEFEF]"><ChevronRight size={14} /></button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PerformanceTab;
