import React from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';

// ── Grade colors (bar chart style) ──────────────────────────────────────────
export const GRADE_COLORS = {
  'A+': '#15803d', A: '#16a34a', 'A-': '#22c55e',
  'B+': '#4242EA', B: '#6366f1', 'B-': '#818cf8',
  'C+': '#f59e0b', C: '#d97706',
};

// ── Enrollment badge styles ─────────────────────────────────────────────────
export const ENROLLMENT_BADGE = {
  in_progress: 'bg-blue-100 text-blue-700',
  completed: 'bg-green-100 text-green-700',
  withdrawn: 'bg-red-100 text-red-600',
  deferred: 'bg-amber-100 text-amber-700',
};

export const ENROLLMENT_LABELS = {
  in_progress: 'In Progress',
  completed: 'Completed',
  withdrawn: 'Withdrawn',
  deferred: 'Deferred',
};

// ── Helper functions ────────────────────────────────────────────────────────
export const letterGrade = (score) => {
  if (score >= 93) return 'A+';
  if (score >= 87) return 'A';
  if (score >= 83) return 'A-';
  if (score >= 77) return 'B+';
  if (score >= 73) return 'B';
  if (score >= 70) return 'B-';
  if (score >= 67) return 'C+';
  return 'C';
};

export const sentimentColor = (s) => {
  if (!s) return 'bg-slate-100 text-slate-600';
  const l = s.toLowerCase();
  if (l.includes('very positive')) return 'bg-green-100 text-green-700';
  if (l.includes('positive')) return 'bg-green-50 text-green-600';
  if (l.includes('negative')) return 'bg-red-100 text-red-600';
  return 'bg-slate-100 text-slate-600';
};

export const scoreColor = (s) =>
  s >= 4 ? 'text-green-600 bg-green-50' : s >= 3 ? 'text-yellow-600 bg-yellow-50' : 'text-red-500 bg-red-50';

// ── GradeBar ────────────────────────────────────────────────────────────────
// Accepts { task } where task has grade_aplus_count … grade_c_count fields
export const GradeBar = ({ task }) => {
  if (!task) return <span className="text-xs text-slate-400">—</span>;
  const grades = [
    { key: 'A+', count: task.grade_aplus_count || 0 },
    { key: 'A', count: task.grade_a_count || 0 },
    { key: 'A-', count: task.grade_aminus_count || 0 },
    { key: 'B+', count: task.grade_bplus_count || 0 },
    { key: 'B', count: task.grade_b_count || 0 },
    { key: 'B-', count: task.grade_bminus_count || 0 },
    { key: 'C+', count: task.grade_cplus_count || 0 },
    { key: 'C', count: task.grade_c_count || 0 },
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

// ── SortHeader ──────────────────────────────────────────────────────────────
export const SortHeader = ({ label, sortKey, sort, onSort, className = '' }) => (
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

// ── Pagination ──────────────────────────────────────────────────────────────
import { ChevronLeft, ChevronRight } from 'lucide-react';

export const Pagination = ({ page, total, pageSize, onPage }) => {
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
