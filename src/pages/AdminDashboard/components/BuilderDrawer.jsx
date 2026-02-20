import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { X, BookOpen, MessageSquare, Send, Video, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';

const LEGACY_API = 'https://ai-pilot-admin-dashboard-866060457933.us-central1.run.app/api';
const API_URL = import.meta.env.VITE_API_URL;

const GRADE_COLORS = {
  'A+': 'bg-green-100 text-green-700', A: 'bg-green-100 text-green-700', 'A-': 'bg-green-50 text-green-600',
  'B+': 'bg-blue-100 text-blue-700', B: 'bg-blue-100 text-blue-600', 'B-': 'bg-blue-50 text-blue-500',
  'C+': 'bg-yellow-100 text-yellow-700', C: 'bg-yellow-100 text-yellow-700',
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

const Section = ({ icon: Icon, title, count, children, defaultOpen = true }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-[#E3E3E3] rounded-lg bg-white overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-[#FAFAFA] transition-colors"
      >
        <div className="flex items-center gap-2">
          <Icon size={14} className="text-[#4242EA]" />
          <span className="text-sm font-semibold text-[#1E1E1E]">{title}</span>
          {count !== undefined && (
            <Badge className="bg-[#EFEFEF] text-slate-500 text-[10px]">{count}</Badge>
          )}
        </div>
        {open ? <ChevronUp size={14} className="text-slate-400" /> : <ChevronDown size={14} className="text-slate-400" />}
      </button>
      {open && <div className="border-t border-[#E3E3E3]">{children}</div>}
    </div>
  );
};

const resolveDate = (d) => {
  if (!d) return '—';
  if (typeof d === 'object' && d.value) return d.value;
  return String(d);
};

const resolveStr = (v) => {
  if (!v) return '';
  if (typeof v === 'object' && v.value) return v.value;
  if (typeof v === 'object') return JSON.stringify(v);
  return String(v);
};

/** Parse the analysis JSON from legacy API and extract grade + feedback */
function parseWorkProductItem(item) {
  let grade = resolveStr(item.grade || item.letterGrade);
  let feedback = resolveStr(item.feedback);
  let score = null;

  // Parse analysis JSON if present (legacy API returns raw JSON string)
  if (item.analysis && !grade) {
    try {
      const a = typeof item.analysis === 'string' ? JSON.parse(item.analysis) : item.analysis;
      score = a.completion_score ?? null;
      if (score != null) grade = letterGrade(score);
      feedback = feedback || a.feedback || a.submission_summary || '';
    } catch { /* ignore */ }
  }

  const dateStr = resolveDate(item.date || item.curriculum_date);
  const formattedDate = dateStr !== '—'
    ? (() => { try { return new Date(dateStr + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' }); } catch { return dateStr; } })()
    : '—';

  return {
    taskTitle: resolveStr(item.taskTitle || item.task_title),
    date: formattedDate,
    rawDate: dateStr,
    grade,
    score,
    feedback,
  };
}

const TaskRow = ({ item }) => {
  const [expanded, setExpanded] = useState(false);
  const parsed = parseWorkProductItem(item);
  const gradeClass = parsed.grade ? (GRADE_COLORS[parsed.grade] || 'bg-slate-100 text-slate-600') : '';

  return (
    <>
      <tr
        className="hover:bg-[#FAFAFA] transition-colors cursor-pointer border-b border-[#EFEFEF]"
        onClick={() => setExpanded(!expanded)}
      >
        <td className="py-2 px-3 text-xs font-medium text-[#1E1E1E] max-w-[200px]">
          <span className="line-clamp-1">{parsed.taskTitle}</span>
        </td>
        <td className="py-2 px-3 text-xs text-slate-500 whitespace-nowrap">{parsed.date}</td>
        {parsed.grade ? (
          <td className="py-2 px-3">
            <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${gradeClass}`}>{parsed.grade}</span>
            {parsed.score != null && (
              <span className="text-[9px] text-slate-400 ml-1">{parsed.score}%</span>
            )}
          </td>
        ) : <td className="py-2 px-3 text-xs text-slate-400">—</td>}
        <td className="py-2 px-3 text-xs text-slate-400">
          <span className="line-clamp-1">{parsed.feedback ? parsed.feedback.substring(0, 80) + '...' : '—'}</span>
        </td>
      </tr>
      {expanded && parsed.feedback && (
        <tr>
          <td colSpan={4} className="bg-[#FAFAFA] px-4 py-3 border-b border-[#E3E3E3]">
            <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-wrap">{parsed.feedback}</p>
          </td>
        </tr>
      )}
    </>
  );
};

const VideoItem = ({ v }) => {
  const [expanded, setExpanded] = useState(false);
  const scoreColor = (s) => s >= 4 ? 'text-green-600' : s >= 3 ? 'text-yellow-600' : 'text-red-500';
  const dateStr = resolveDate(v.submission_date);
  const formattedDate = dateStr !== '—' ? (() => { try { return new Date(dateStr + (dateStr.length <= 10 ? 'T12:00:00' : '')).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }); } catch { return dateStr; } })() : '—';
  const hasScores = v.average_score != null;
  const hasRationale = v.technical_rationale || v.business_rationale || v.professional_rationale;

  const getRationaleText = (rationale) => {
    if (!rationale) return null;
    if (typeof rationale === 'string') return rationale;
    return rationale.overall_explanation || rationale.explanation || JSON.stringify(rationale);
  };

  return (
    <div className="px-3 py-3 space-y-2">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-[#1E1E1E]">{resolveStr(v.task_title)}</p>
          <p className="text-[10px] text-slate-400">{formattedDate}</p>
        </div>
        <div className="flex items-center gap-2">
          {hasScores && (
            <span className={`text-sm font-bold ${scoreColor(v.average_score)}`}>
              {v.average_score}/5
            </span>
          )}
          {v.loom_url && (
            <a
              href={v.loom_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-[10px] text-[#4242EA] hover:underline"
              onClick={(e) => e.stopPropagation()}
            >
              <ExternalLink size={10} />
              Watch
            </a>
          )}
        </div>
      </div>
      {hasScores && (
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: 'Technical', score: v.technical_score, rationale: v.technical_rationale },
            { label: 'Business', score: v.business_score, rationale: v.business_rationale },
            { label: 'Professional', score: v.professional_skills_score, rationale: v.professional_rationale },
          ].map(({ label, score, rationale }) => (
            <div
              key={label}
              className={`bg-[#FAFAFA] rounded p-1.5 text-center ${hasRationale ? 'cursor-pointer hover:bg-[#F0F0F0]' : ''}`}
              onClick={() => hasRationale && setExpanded(!expanded)}
            >
              <p className={`text-sm font-bold ${scoreColor(score)}`}>{score}/5</p>
              <p className="text-[9px] text-slate-400">{label}</p>
            </div>
          ))}
        </div>
      )}
      {expanded && hasRationale && (
        <div className="bg-[#FAFAFA] rounded-md p-3 space-y-2">
          {[
            { label: 'Technical', rationale: v.technical_rationale },
            { label: 'Business', rationale: v.business_rationale },
            { label: 'Professional', rationale: v.professional_rationale },
          ].map(({ label, rationale }) => {
            const text = getRationaleText(rationale);
            if (!text) return null;
            return (
              <div key={label}>
                <p className="text-[10px] font-semibold text-[#4242EA] mb-0.5">{label}</p>
                <p className="text-[11px] text-slate-600 leading-relaxed">{text}</p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

const BuilderDrawer = ({ builder, startDate, endDate, selectedLevel, cohortId, onClose }) => {
  const { token } = useAuth();
  const [workProduct, setWorkProduct] = useState(null);
  const [peerFeedback, setPeerFeedback] = useState(null);
  const [prompts, setPrompts] = useState(null);
  const [videos, setVideos] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!builder?.user_id) return;
    setLoading(true);

    const fetchType = (type) =>
      fetch(`${LEGACY_API}/builders/${builder.user_id}/details?type=${type}&startDate=${startDate}&endDate=${endDate}`)
        .then(r => r.ok ? r.json() : null)
        .catch(() => null);

    // Try legacy API for video analyses first, fall back to native PG endpoint
    const fetchVideos = async () => {
      // Try legacy BQ-based video analyses
      try {
        const legacyRes = await fetch(`${LEGACY_API}/video-analyses?level=${encodeURIComponent(selectedLevel || builder.level || '')}&startDate=${startDate}&endDate=${endDate}`);
        if (legacyRes.ok) {
          const all = await legacyRes.json();
          const userVids = Array.isArray(all) ? all.filter(v => String(v.user_id) === String(builder.user_id)) : [];
          if (userVids.length > 0) return userVids;
        }
      } catch { /* fall through */ }

      // Fallback: native PG video submissions
      if (cohortId && token) {
        try {
          const res = await fetch(`${API_URL}/api/admin/dashboard/builder-videos?userId=${builder.user_id}&cohortId=${cohortId}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (res.ok) {
            const data = await res.json();
            return (data.data || []).map(v => ({
              video_id: v.submission_id,
              task_title: v.task_title,
              loom_url: v.loom_url,
              submission_date: v.day_date || v.submission_date,
              average_score: v.average_score ?? null,
              technical_score: v.technical_score ?? null,
              business_score: v.business_score ?? null,
              professional_skills_score: v.professional_skills_score ?? null,
              technical_rationale: v.technical_rationale,
              business_rationale: v.business_rationale,
              professional_rationale: v.professional_rationale,
            }));
          }
        } catch { /* ignore */ }
      }
      return [];
    };

    Promise.all([
      fetchType('workProduct'),
      fetchType('peer_feedback'),
      fetchType('prompts'),
      fetchVideos(),
    ]).then(([wp, pf, pr, vids]) => {
      setWorkProduct(wp);
      setPeerFeedback(pf);
      setPrompts(pr);
      setVideos(vids);
    }).finally(() => setLoading(false));
  }, [builder?.user_id, startDate, endDate, cohortId, token]);

  if (!builder) return null;

  const wpItems = workProduct?.details || workProduct || [];
  const pfItems = peerFeedback?.details || peerFeedback || [];
  const promptItems = prompts?.details || prompts || [];
  const videoItems = Array.isArray(videos) ? videos : [];

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/20 z-40" onClick={onClose} />

      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-full max-w-[640px] bg-white shadow-2xl z-50 flex flex-col animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="flex items-start justify-between px-5 py-4 border-b border-[#E3E3E3] bg-white flex-shrink-0">
          <div>
            <h2 className="text-lg font-bold text-[#1E1E1E]">{builder.name}</h2>
            <p className="text-xs text-slate-400 mt-0.5">{builder.email ?? builder.level}</p>
            <div className="flex gap-3 mt-2">
              <div className="text-center">
                <p className={`text-sm font-bold ${builder.attendance_percentage >= 80 ? 'text-green-600' : builder.attendance_percentage >= 60 ? 'text-yellow-600' : 'text-red-500'}`}>
                  {builder.attendance_percentage}%
                </p>
                <p className="text-[9px] text-slate-400 uppercase">Attendance</p>
              </div>
              <div className="text-center">
                <p className="text-sm font-bold text-[#1E1E1E]">{builder.tasks_completed_percentage}%</p>
                <p className="text-[9px] text-slate-400 uppercase">Tasks</p>
              </div>
              <div className="text-center">
                <p className="text-sm font-bold text-[#1E1E1E]">{builder.total_peer_feedback_count}</p>
                <p className="text-[9px] text-slate-400 uppercase">Feedback</p>
              </div>
              <div className="text-center">
                <p className="text-sm font-bold text-[#1E1E1E]">{builder.total_graded_tasks}</p>
                <p className="text-[9px] text-slate-400 uppercase">Graded</p>
              </div>
              <div className="text-center">
                <p className="text-sm font-bold text-[#1E1E1E]">{builder.video_tasks_completed}</p>
                <p className="text-[9px] text-slate-400 uppercase">Videos</p>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-md hover:bg-[#EFEFEF] transition-colors">
            <X size={18} className="text-slate-400" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => <div key={i} className="h-24 bg-[#EFEFEF] rounded-lg animate-pulse" />)}
            </div>
          ) : (
            <>
              {/* Work Product */}
              <Section icon={BookOpen} title="Work Product" count={Array.isArray(wpItems) ? wpItems.length : 0}>
                {Array.isArray(wpItems) && wpItems.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-left text-slate-400 text-[10px] uppercase tracking-wide border-b border-[#E3E3E3]">
                          <th className="py-2 px-3 font-medium">Task</th>
                          <th className="py-2 px-3 font-medium">Date</th>
                          <th className="py-2 px-3 font-medium">Grade</th>
                          <th className="py-2 px-3 font-medium">Feedback</th>
                        </tr>
                      </thead>
                      <tbody>
                        {wpItems.map((item, i) => <TaskRow key={i} item={item} />)}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 text-center py-4">No work product data.</p>
                )}
              </Section>

              {/* Peer Feedback */}
              <Section icon={MessageSquare} title="Peer Feedback" count={Array.isArray(pfItems) ? pfItems.length : 0} defaultOpen={false}>
                {Array.isArray(pfItems) && pfItems.length > 0 ? (
                  <div className="divide-y divide-[#EFEFEF]">
                    {pfItems.map((item, i) => (
                      <div key={i} className="px-3 py-2.5">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-medium text-[#1E1E1E]">{item.reviewer_name || item.reviewerName}</span>
                          <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full ${sentimentColor(item.sentiment_category || item.sentiment)}`}>
                            {item.sentiment_category || item.sentiment}
                          </span>
                          <span className="text-[10px] text-slate-400 ml-auto">
                            {resolveDate(item.date || item.created_at)}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600">{resolveStr(item.feedback_text || item.feedback || item.summary)}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 text-center py-4">No peer feedback data.</p>
                )}
              </Section>

              {/* Video Submissions */}
              <Section icon={Video} title="Video Submissions" count={videoItems.length} defaultOpen={videoItems.length > 0}>
                {videoItems.length > 0 ? (
                  <div className="divide-y divide-[#EFEFEF]">
                    {videoItems.map((v, i) => <VideoItem key={v.video_id || i} v={v} />)}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 text-center py-4">No video submissions.</p>
                )}
              </Section>

              {/* Prompts Sent */}
              <Section icon={Send} title="Prompts Sent" count={Array.isArray(promptItems) ? promptItems.length : 0} defaultOpen={false}>
                {Array.isArray(promptItems) && promptItems.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-left text-slate-400 text-[10px] uppercase tracking-wide border-b border-[#E3E3E3]">
                          <th className="py-2 px-3 font-medium">Date</th>
                          <th className="py-2 px-3 font-medium">Prompts Sent</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#EFEFEF]">
                        {promptItems.map((item, i) => (
                          <tr key={i}>
                            <td className="py-1.5 px-3 text-xs text-slate-500">{resolveDate(item.date)}</td>
                            <td className="py-1.5 px-3 text-xs font-medium text-[#1E1E1E]">{resolveStr(item.prompts_sent || item.count)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 text-center py-4">No prompt data.</p>
                )}
              </Section>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default BuilderDrawer;
