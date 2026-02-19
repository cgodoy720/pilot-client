import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Download } from 'lucide-react';
import BuilderDrawer from '../components/BuilderDrawer';
import { fetchPursuitBuilderCohorts } from '../utils/cohortUtils';
import { useAuth } from '../../../context/AuthContext';

const LEGACY_API = 'https://ai-pilot-admin-dashboard-866060457933.us-central1.run.app/api';
const PAGE_SIZE = 15;

const GRADE_COLORS = {
  'A+': '#15803d', A: '#16a34a', 'A-': '#22c55e',
  'B+': '#4242EA', B: '#6366f1', 'B-': '#818cf8',
  'C+': '#f59e0b', C: '#d97706',
};

const GradeBar = ({ builder }) => {
  const grades = [
    { key: 'A+', count: builder.grade_aplus_count || 0 },
    { key: 'A', count: builder.grade_a_count || 0 },
    { key: 'A-', count: builder.grade_aminus_count || 0 },
    { key: 'B+', count: builder.grade_bplus_count || 0 },
    { key: 'B', count: builder.grade_b_count || 0 },
    { key: 'B-', count: builder.grade_bminus_count || 0 },
    { key: 'C+', count: builder.grade_cplus_count || 0 },
    { key: 'C', count: builder.grade_c_count || 0 },
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

const L2SelectionsTab = () => {
  const { token } = useAuth();
  const [cohorts, setCohorts] = useState([]);
  const [selectedLevel, setSelectedLevel] = useState('');
  const [builders, setBuilders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState({ key: 'attendance_percentage', dir: 'desc' });
  const [page, setPage] = useState(0);
  const [selectedBuilder, setSelectedBuilder] = useState(null);
  const startDate = '2025-03-01';
  const endDate = new Date().toISOString().split('T')[0];

  useEffect(() => {
    if (!token) return;
    fetchPursuitBuilderCohorts(token)
      .then(data => {
        setCohorts(data);
        const l1 = data.find(c => c.name.includes('L1')) || data[0];
        if (l1) setSelectedLevel(l1.legacyName);
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (!selectedLevel) return;
    setLoading(true);
    setPage(0);
    fetch(`${LEGACY_API}/builders?startDate=${startDate}&endDate=${endDate}&level=${encodeURIComponent(selectedLevel)}`)
      .then(r => r.json())
      .then(data => setBuilders(Array.isArray(data) ? data : []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [selectedLevel]);

  const sorted = useMemo(() => {
    return [...builders].sort((a, b) => {
      const av = a[sort.key] ?? 0, bv = b[sort.key] ?? 0;
      if (typeof av === 'string') return sort.dir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av);
      return sort.dir === 'asc' ? av - bv : bv - av;
    });
  }, [builders, sort]);

  const toggleSort = (key) => {
    setSort(prev => ({ key, dir: prev.key === key && prev.dir === 'desc' ? 'asc' : 'desc' }));
  };

  const exportCSV = () => {
    const headers = ['Name', 'Email', 'Attendance %', 'Days Attended', 'Total Days', 'Tasks %', 'Peer Feedback', 'Total Graded', 'Video Tasks', 'Avg Video Score'];
    const rows = sorted.map(b => [
      b.name, b.email, b.attendance_percentage, b.days_attended, b.total_curriculum_days,
      b.tasks_completed_percentage, b.total_peer_feedback_count, b.total_graded_tasks,
      b.video_tasks_completed, b.avg_video_score || '',
    ]);
    const csv = [headers, ...rows].map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `l2-selections-${selectedLevel.replace(/\s+/g, '-')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-3">
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
          <Badge className="bg-[#EFEFEF] text-slate-600 text-xs h-fit">{builders.length} builders</Badge>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={exportCSV}
          disabled={builders.length === 0}
          className="border-[#4242EA] text-[#4242EA] hover:bg-[#4242EA] hover:text-white text-xs gap-1.5"
        >
          <Download size={13} />
          Export CSV
        </Button>
      </div>

      {/* Table */}
      <Card className="bg-white border border-[#E3E3E3]">
        <CardHeader className="pb-3 border-b border-[#E3E3E3]">
          <CardTitle className="text-base font-semibold text-[#1E1E1E]">L2 Builder Performance Overview</CardTitle>
        </CardHeader>
        <CardContent className="pt-3">
          {loading ? (
            <div className="space-y-2">{[1,2,3,4,5].map(i => <div key={i} className="h-10 bg-[#EFEFEF] rounded animate-pulse" />)}</div>
          ) : builders.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-8">No builders for this cohort.</p>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-slate-400 text-xs uppercase tracking-wide border-b border-[#E3E3E3]">
                      <SortHeader label="Builder" sortKey="name" sort={sort} onSort={toggleSort} className="pr-3" />
                      <SortHeader label="Attendance" sortKey="attendance_percentage" sort={sort} onSort={toggleSort} className="px-2 text-center" />
                      <SortHeader label="Tasks" sortKey="tasks_completed_percentage" sort={sort} onSort={toggleSort} className="px-2 text-center" />
                      <SortHeader label="Feedback" sortKey="total_peer_feedback_count" sort={sort} onSort={toggleSort} className="px-2 text-center" />
                      <th className="pb-2 px-2 font-medium text-slate-400 text-xs uppercase tracking-wide">Grade Dist.</th>
                      <SortHeader label="Videos" sortKey="video_tasks_completed" sort={sort} onSort={toggleSort} className="px-2 text-center" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EFEFEF]">
                    {sorted.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE).map(b => (
                      <tr key={b.user_id} className="hover:bg-[#EFEFEF]/50 transition-colors">
                        <td className="py-2 pr-3">
                          <button onClick={() => setSelectedBuilder(b)} className="font-medium text-[#4242EA] text-xs hover:underline text-left">
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
                        <td className="py-2 px-2 w-28"><GradeBar builder={b} /></td>
                        <td className="py-2 px-2 text-center">
                          {b.video_tasks_completed > 0 ? (
                            <button onClick={() => setSelectedBuilder(b)} className="text-xs text-[#4242EA] hover:underline font-medium">
                              {b.video_tasks_completed}
                            </button>
                          ) : <span className="text-xs text-slate-300">—</span>}
                        </td>
                      </tr>
                    ))}
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

      {selectedBuilder && (
        <BuilderDrawer
          builder={selectedBuilder}
          startDate={startDate}
          endDate={endDate}
          selectedLevel={selectedLevel}
          onClose={() => setSelectedBuilder(null)}
        />
      )}
    </div>
  );
};

export default L2SelectionsTab;
