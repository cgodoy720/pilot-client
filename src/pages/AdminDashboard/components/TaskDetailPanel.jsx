import React from 'react';
import { Badge } from '../../../components/ui/badge';
import { FileText, Users, TrendingUp, Award } from 'lucide-react';

const GRADE_COLORS = {
  'A+': '#15803d', A: '#16a34a', 'A-': '#22c55e',
  'B+': '#4242EA', B: '#6366f1', 'B-': '#818cf8',
  'C+': '#f59e0b', C: '#d97706',
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

const TaskDetailPanel = ({ task }) => {
  if (!task) return null;

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
  const totalGraded = grades.reduce((s, g) => s + g.count, 0);
  const avgGrade = task.avg_score ? letterGrade(task.avg_score) : null;

  // Parse feedback — native endpoint returns array, legacy returned pipe-separated string
  const rawFeedback = task.all_feedback || [];
  const feedbackParts = Array.isArray(rawFeedback)
    ? rawFeedback.filter(Boolean)
    : String(rawFeedback).split('|').map(s => s.trim()).filter(Boolean);

  return (
    <div className="bg-[#FAFAFA] border-t border-[#E3E3E3] px-4 py-4 space-y-4 animate-in slide-in-from-top-1 duration-200">
      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { icon: FileText, label: 'Total Submissions', value: task.analysis_results_count ?? 0, color: 'text-[#4242EA]' },
          { icon: Users, label: 'Submission Rate', value: `${task.submission_rate ?? 0}%`, color: task.submission_rate >= 50 ? 'text-green-600' : 'text-yellow-600' },
          { icon: TrendingUp, label: 'Average Score', value: task.avg_score ? task.avg_score.toFixed(1) : '—', color: 'text-[#1E1E1E]' },
          { icon: Award, label: 'Average Grade', value: avgGrade ?? '—', color: avgGrade?.startsWith('A') ? 'text-green-600' : avgGrade?.startsWith('B') ? 'text-[#4242EA]' : 'text-yellow-600' },
        ].map(({ icon: Icon, label, value, color }) => (
          <div key={label} className="bg-white rounded-lg border border-[#E3E3E3] p-3">
            <div className="flex items-center gap-2 mb-1">
              <Icon size={13} className="text-slate-400" />
              <span className="text-[10px] text-slate-400 uppercase tracking-wide font-medium">{label}</span>
            </div>
            <p className={`text-lg font-bold ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Grade distribution */}
      {totalGraded > 0 && (
        <div className="bg-white rounded-lg border border-[#E3E3E3] p-3">
          <p className="text-[10px] text-slate-400 uppercase tracking-wide font-medium mb-2">Grade Distribution</p>
          <div className="flex gap-1.5 flex-wrap">
            {grades.filter(g => g.count > 0).map(g => (
              <div key={g.key} className="flex items-center gap-1">
                <span
                  className="w-4 h-4 rounded text-[9px] font-bold flex items-center justify-center text-white"
                  style={{ background: GRADE_COLORS[g.key] || '#94a3b8' }}
                >
                  {g.key}
                </span>
                <span className="text-xs text-slate-600">{g.count}</span>
                <span className="text-[10px] text-slate-400">({Math.round((g.count / totalGraded) * 100)}%)</span>
              </div>
            ))}
            <span className="text-xs text-slate-400 ml-2">Total: {totalGraded}</span>
          </div>
        </div>
      )}

      {/* AI Feedback */}
      {feedbackParts.length > 0 && (
        <div className="bg-white rounded-lg border border-[#E3E3E3] p-3">
          <p className="text-[10px] text-slate-400 uppercase tracking-wide font-medium mb-2">AI Analysis Feedback</p>
          <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
            {feedbackParts.map((part, i) => (
              <div key={i} className="text-xs text-slate-600 leading-relaxed bg-[#FAFAFA] rounded p-2.5 border-l-2 border-[#4242EA]">
                <span className="text-[10px] font-semibold text-slate-400 block mb-1">Submission {i + 1}</span>
                {part}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskDetailPanel;
