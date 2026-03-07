import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import {
  ChevronUp, ChevronDown, ChevronLeft, ChevronRight, FileText, Plus, Eye,
} from 'lucide-react';
import BuilderDrawer from '../components/BuilderDrawer';
import BuilderLogModal from '../components/BuilderLogModal';
import useAuthStore from '../../../stores/authStore';

const API_URL = import.meta.env.VITE_API_URL;
const PAGE_SIZE_BUILDERS = 10;

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

const BuildersTab = ({ selectedCohortId, cohorts }) => {
  const token = useAuthStore((s) => s.token);
  const [startDate] = useState('2025-03-01');
  const [endDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(true);
  const [builders, setBuilders] = useState([]);
  const [builderSort, setBuilderSort] = useState({ key: 'attendance_percentage', dir: 'desc' });
  const [builderPage, setBuilderPage] = useState(0);
  const [selectedBuilder, setSelectedBuilder] = useState(null);
  const [logModalBuilder, setLogModalBuilder] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const selectedCohort = useMemo(
    () => cohorts.find(c => c.cohort_id === selectedCohortId),
    [cohorts, selectedCohortId]
  );

  useEffect(() => {
    if (!selectedCohortId || !token) return;
    setLoading(true);
    setBuilderPage(0);

    const url = `${API_URL}/api/admin/dashboard/cohort-summary?cohortId=${selectedCohortId}&startDate=${startDate}&endDate=${endDate}`;
    fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(data => {
        if (data.success) {
          setBuilders(data.builders || []);
        } else {
          setBuilders([]);
        }
      })
      .catch(() => setBuilders([]))
      .finally(() => setLoading(false));
  }, [selectedCohortId, startDate, endDate, token, refreshKey]);

  const sortedBuilders = useMemo(() => {
    return [...builders].sort((a, b) => {
      const av = a[builderSort.key] ?? 0, bv = b[builderSort.key] ?? 0;
      if (typeof av === 'string') return builderSort.dir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av);
      return builderSort.dir === 'asc' ? (av - bv) : (bv - av);
    });
  }, [builders, builderSort]);

  const toggleSort = (key) => {
    setBuilderSort(prev => ({
      key,
      dir: prev.key === key && prev.dir === 'desc' ? 'asc' : 'desc',
    }));
  };

  return (
    <div className="space-y-6">
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
                      <SortHeader label="Builder" sortKey="name" sort={builderSort} onSort={toggleSort} className="pr-3" />
                      <SortHeader label="Attendance" sortKey="attendance_percentage" sort={builderSort} onSort={toggleSort} className="px-2 text-center" />
                      <SortHeader label="Tasks" sortKey="tasks_completed_percentage" sort={builderSort} onSort={toggleSort} className="px-2 text-center" />
                      <SortHeader label="Feedback" sortKey="total_peer_feedback_count" sort={builderSort} onSort={toggleSort} className="px-2 text-center" />
                      <SortHeader label="Logs" sortKey="log_count" sort={builderSort} onSort={toggleSort} className="px-2 text-center" />
                      <th className="pb-2 px-2 font-medium text-slate-400 text-xs uppercase tracking-wide">Grade Dist.</th>
                      <SortHeader label="Videos" sortKey="video_tasks_completed" sort={builderSort} onSort={toggleSort} className="px-2 text-center" />
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

      <BuilderLogModal
        open={!!logModalBuilder}
        onOpenChange={(open) => { if (!open) setLogModalBuilder(null); }}
        builder={logModalBuilder}
        cohortId={selectedCohortId}
        onSaved={() => setRefreshKey(k => k + 1)}
      />
    </div>
  );
};

export default BuildersTab;
