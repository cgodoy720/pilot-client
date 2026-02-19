import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight, ExternalLink, Video } from 'lucide-react';
import { fetchPursuitBuilderCohorts } from '../utils/cohortUtils';
import { useAuth } from '../../../context/AuthContext';

const LEGACY_API = 'https://ai-pilot-admin-dashboard-866060457933.us-central1.run.app/api';
const PAGE_SIZE = 15;

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

const VideoSubmissionsTab = () => {
  const { token } = useAuth();
  const [cohorts, setCohorts] = useState([]);
  const [selectedLevel, setSelectedLevel] = useState('');
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState({ key: 'submission_date', dir: 'desc' });
  const [page, setPage] = useState(0);
  const [expanded, setExpanded] = useState(null);
  const startDate = '2025-03-01';
  const endDate = new Date().toISOString().split('T')[0];

  useEffect(() => {
    if (!token) return;
    fetchPursuitBuilderCohorts(token)
      .then(data => {
        setCohorts(data);
        if (data.length > 0) setSelectedLevel(data[0].legacyName);
      })
      .catch(console.error);
  }, [token]);

  useEffect(() => {
    if (!selectedLevel) return;
    setLoading(true);
    setPage(0);
    setExpanded(null);
    fetch(`${LEGACY_API}/video-analyses?level=${encodeURIComponent(selectedLevel)}&startDate=${startDate}&endDate=${endDate}`)
      .then(r => r.json())
      .then(data => setVideos(Array.isArray(data) ? data : []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [selectedLevel]);

  const resolveDate = (d) => {
    if (!d) return '';
    if (typeof d === 'object' && d.value) return d.value;
    return String(d);
  };

  const sorted = useMemo(() => {
    return [...videos].sort((a, b) => {
      let av, bv;
      if (sort.key === 'submission_date') {
        av = resolveDate(a.submission_date);
        bv = resolveDate(b.submission_date);
      } else if (sort.key === 'user_name') {
        av = a.user_name || '';
        bv = b.user_name || '';
      } else {
        av = a[sort.key] ?? 0;
        bv = b[sort.key] ?? 0;
      }
      if (typeof av === 'string') return sort.dir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av);
      return sort.dir === 'asc' ? av - bv : bv - av;
    });
  }, [videos, sort]);

  const toggleSort = (key) => {
    setSort(prev => ({ key, dir: prev.key === key && prev.dir === 'desc' ? 'asc' : 'desc' }));
  };

  const parseRationale = (jsonStr) => {
    try {
      const parsed = JSON.parse(jsonStr);
      return parsed;
    } catch {
      return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex items-end gap-3">
        <div>
          <label className="text-xs text-slate-500 font-medium mb-1 block">Cohort</label>
          <select
            value={selectedLevel}
            onChange={e => setSelectedLevel(e.target.value)}
            className="px-3 py-1.5 text-sm border border-[#E3E3E3] rounded-md bg-white text-[#1E1E1E] focus:border-[#4242EA] focus:outline-none"
          >
            {cohorts.map(c => <option key={c.cohort_id || c.name} value={c.legacyName}>{c.name}</option>)}
          </select>
        </div>
        <Badge className="bg-[#EFEFEF] text-slate-600 text-xs h-fit">{videos.length} videos</Badge>
      </div>

      {/* Table */}
      <Card className="bg-white border border-[#E3E3E3]">
        <CardHeader className="pb-3 border-b border-[#E3E3E3]">
          <div className="flex items-center gap-2">
            <Video size={16} className="text-[#4242EA]" />
            <CardTitle className="text-base font-semibold text-[#1E1E1E]">Video Submissions</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="pt-3">
          {loading ? (
            <div className="space-y-2">{[1,2,3,4,5].map(i => <div key={i} className="h-10 bg-[#EFEFEF] rounded animate-pulse" />)}</div>
          ) : videos.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-8">No video submissions for this cohort.</p>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-slate-400 text-xs uppercase tracking-wide border-b border-[#E3E3E3]">
                      <SortHeader label="Builder" sortKey="user_name" sort={sort} onSort={toggleSort} className="pr-3" />
                      <th className="pb-2 px-2 font-medium">Video</th>
                      <SortHeader label="Score" sortKey="average_score" sort={sort} onSort={toggleSort} className="px-2 text-center" />
                      <SortHeader label="Technical" sortKey="technical_score" sort={sort} onSort={toggleSort} className="px-2 text-center" />
                      <SortHeader label="Business" sortKey="business_score" sort={sort} onSort={toggleSort} className="px-2 text-center" />
                      <SortHeader label="Professional" sortKey="professional_skills_score" sort={sort} onSort={toggleSort} className="px-2 text-center" />
                      <SortHeader label="Date" sortKey="submission_date" sort={sort} onSort={toggleSort} className="px-2" />
                      <th className="pb-2 pl-2 font-medium">Details</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sorted.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE).map((v, i) => {
                      const dateRaw = resolveDate(v.submission_date);
                      const dateStr = dateRaw ? new Date(dateRaw).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—';
                      const isExpanded = expanded === v.video_id;
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
                              <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${scoreColor(v.average_score)}`}>{v.average_score}/5</span>
                            </td>
                            <td className="py-2 px-2 text-center">
                              <span className={`text-xs font-semibold ${v.technical_score >= 4 ? 'text-green-600' : v.technical_score >= 3 ? 'text-yellow-600' : 'text-red-500'}`}>{v.technical_score}</span>
                            </td>
                            <td className="py-2 px-2 text-center">
                              <span className={`text-xs font-semibold ${v.business_score >= 4 ? 'text-green-600' : v.business_score >= 3 ? 'text-yellow-600' : 'text-red-500'}`}>{v.business_score}</span>
                            </td>
                            <td className="py-2 px-2 text-center">
                              <span className={`text-xs font-semibold ${v.professional_skills_score >= 4 ? 'text-green-600' : v.professional_skills_score >= 3 ? 'text-yellow-600' : 'text-red-500'}`}>{v.professional_skills_score}</span>
                            </td>
                            <td className="py-2 px-2 text-xs text-slate-500 whitespace-nowrap">{dateStr}</td>
                            <td className="py-2 pl-2">
                              <button
                                onClick={() => setExpanded(isExpanded ? null : v.video_id)}
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
              {Math.ceil(sorted.length / PAGE_SIZE) > 1 && (
                <div className="flex items-center justify-between pt-3 border-t border-[#E3E3E3]">
                  <span className="text-xs text-slate-400">{page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, sorted.length)} of {sorted.length}</span>
                  <div className="flex gap-1">
                    <button disabled={page === 0} onClick={() => setPage(page - 1)} className="p-1 rounded disabled:opacity-30 hover:bg-[#EFEFEF]"><ChevronLeft size={14} /></button>
                    <button disabled={page >= Math.ceil(sorted.length / PAGE_SIZE) - 1} onClick={() => setPage(page + 1)} className="p-1 rounded disabled:opacity-30 hover:bg-[#EFEFEF]"><ChevronRight size={14} /></button>
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

export default VideoSubmissionsTab;
