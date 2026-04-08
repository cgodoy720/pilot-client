import React, { useState, useEffect, useMemo } from 'react';
import useAuthStore from '../../../stores/authStore';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ResponsiveContainer, Tooltip,
} from 'recharts';
import { Users, CheckCircle, TrendingUp } from 'lucide-react';
import AssessmentGrades from '../../AssessmentGrades/AssessmentGrades';

const API_URL = import.meta.env.VITE_API_URL;

// Map BQ assessment types to display names
const TYPE_LABELS = {
  'knowledge_assessment': 'Self Assessment',
  'project': 'Technical',
  'problem_solution': 'Business',
  'video': 'Professional',
};

const TYPE_ORDER = ['Self Assessment', 'Technical', 'Business', 'Professional'];

const PERIOD_COLORS = {
  'Week 2': '#4242EA',
  'Week 8': '#10B981',
};

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const data = payload[0]?.payload;
  if (!data) return null;
  return (
    <div className="bg-white border border-[#E3E3E3] rounded-lg shadow-md p-3 text-xs">
      <p className="font-semibold text-[#1E1E1E] mb-1">{data.category}</p>
      {payload.map((p, i) => (
        <div key={i} className="flex items-center gap-2 mt-0.5">
          <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: p.color }} />
          <span className="text-slate-500">{p.name}:</span>
          <span className="font-medium text-[#1E1E1E]">{p.value}%</span>
        </div>
      ))}
    </div>
  );
};

const AssessmentsTab = ({ selectedCohortId, cohorts = [] }) => {
  const token = useAuthStore((s) => s.token);
  const selectedCohortName = useMemo(
    () => cohorts.find((c) => c.cohort_id === selectedCohortId)?.name || '',
    [cohorts, selectedCohortId]
  );
  const [grades, setGrades] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    setFetchError(null);
    fetch(`${API_URL}/api/admin/assessment-grades`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => {
        if (!r.ok) throw new Error(`Server error (${r.status})`);
        return r.json();
      })
      .then(json => setGrades(json))
      .catch(err => {
        console.error('Assessment grades fetch error:', err);
        setFetchError(err.message);
      })
      .finally(() => setLoading(false));
  }, [token]);

  const summary = useMemo(() => {
    if (!grades || !selectedCohortName) return null;
    const rows = (grades.data ?? []).filter(r => r.cohort === selectedCohortName);
    if (!rows.length) return null;

    const uniqueBuilders = new Set(rows.map(r => r.user_id)).size;
    const graded = rows.filter(r => r.average_score != null);
    const avgScore = graded.length
      ? Math.round((graded.reduce((a, r) => a + (r.average_score ?? 0), 0) / graded.length) * 100)
      : null;

    // Build per-category, per-period scores for radar chart
    const byPeriod = {};
    const categoryScores = {};

    rows.forEach(r => {
      const period = r.assessment_period ?? 'Unknown';
      if (!byPeriod[period]) byPeriod[period] = { builderIds: new Set(), overallScores: [] };
      byPeriod[period].builderIds.add(r.user_id);
      byPeriod[period].overallScores.push(r.average_score ?? 0);

      try {
        const included = typeof r.included_assessments === 'string' ? JSON.parse(r.included_assessments) : r.included_assessments;
        if (Array.isArray(included)) {
          included.forEach(a => {
            const label = TYPE_LABELS[a.assessment_type] || a.assessment_name;
            const key = `${period}::${label}`;
            if (!categoryScores[key]) categoryScores[key] = { period, category: label, scores: [] };
            categoryScores[key].scores.push(a.overall_score ?? 0);
          });
        }
      } catch {}
    });

    // Build radar data: one entry per category, with a value per period
    const periods = Object.keys(byPeriod).sort((a, b) => {
      const wa = parseInt(a.replace(/\D/g, '')) || 0;
      const wb = parseInt(b.replace(/\D/g, '')) || 0;
      return wa - wb;
    });

    const radarData = TYPE_ORDER.map(category => {
      const entry = { category };
      periods.forEach(period => {
        const key = `${period}::${category}`;
        const data = categoryScores[key];
        entry[period] = data
          ? Math.round((data.scores.reduce((a, b) => a + b, 0) / data.scores.length) * 100)
          : null;
      });
      return entry;
    });

    // Period summary for the text below
    const periodSummary = periods.map(p => ({
      name: p,
      builders: byPeriod[p].builderIds.size,
      avg: Math.round((byPeriod[p].overallScores.reduce((a, b) => a + b, 0) / byPeriod[p].overallScores.length) * 100),
    }));

    return { uniqueBuilders, total: rows.length, graded: graded.length, avgScore, radarData, periods, periodSummary };
  }, [grades, selectedCohortName]);

  if (!selectedCohortName) {
    return <p className="text-sm text-slate-400 text-center py-8">Select a cohort to view assessments.</p>;
  }

  return (
    <div className="space-y-6">
      {fetchError && (
        <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-600">
          Assessment grades unavailable: {fetchError}
        </div>
      )}
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => <div key={i} className="h-24 bg-[#EFEFEF] rounded-lg animate-pulse" />)}
        </div>
      ) : summary ? (
        <>
          {/* Summary cards + radar chart side by side */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Left: KPI cards */}
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-3">
                <Card className="bg-white border border-[#E3E3E3]">
                  <CardContent className="p-4">
                    <p className="text-[10px] text-slate-500 font-medium uppercase">Builders</p>
                    <p className="text-2xl font-bold text-[#1E1E1E] mt-1">{summary.uniqueBuilders}</p>
                    <p className="text-[10px] text-slate-400">{summary.total} submissions</p>
                  </CardContent>
                </Card>
                <Card className="bg-white border border-[#E3E3E3]">
                  <CardContent className="p-4">
                    <p className="text-[10px] text-slate-500 font-medium uppercase">Graded</p>
                    <p className="text-2xl font-bold text-green-600 mt-1">{summary.graded}</p>
                    <p className="text-[10px] text-slate-400">{summary.total > 0 ? Math.round((summary.graded / summary.total) * 100) : 0}% complete</p>
                  </CardContent>
                </Card>
                <Card className="bg-white border border-[#E3E3E3]">
                  <CardContent className="p-4">
                    <p className="text-[10px] text-slate-500 font-medium uppercase">Avg Score</p>
                    <p className={`text-2xl font-bold mt-1 ${
                      summary.avgScore >= 80 ? 'text-green-600' :
                      summary.avgScore >= 60 ? 'text-yellow-600' : 'text-red-500'
                    }`}>{summary.avgScore !== null ? `${summary.avgScore}%` : '—'}</p>
                  </CardContent>
                </Card>
              </div>
              {/* Period breakdown */}
              <Card className="bg-white border border-[#E3E3E3]">
                <CardContent className="p-4">
                  <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-2">By Period</p>
                  <div className="space-y-2">
                    {summary.periodSummary.map(p => (
                      <div key={p.name} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full" style={{ background: PERIOD_COLORS[p.name] || '#94a3b8' }} />
                          <span className="text-xs font-medium text-[#1E1E1E]">{p.name}</span>
                        </div>
                        <div className="flex items-center gap-3 text-xs">
                          <span className="text-slate-500">{p.builders} builders</span>
                          <span className={`font-semibold ${p.avg >= 80 ? 'text-green-600' : p.avg >= 60 ? 'text-yellow-600' : 'text-red-500'}`}>{p.avg}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right: Radar chart */}
            {summary.radarData.length > 0 && (
              <Card className="bg-white border border-[#E3E3E3]">
                <CardContent className="p-4">
                  <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-1">Score by Category</p>
                  <ResponsiveContainer width="100%" height={240}>
                    <RadarChart data={summary.radarData} cx="50%" cy="50%" outerRadius="75%">
                      <PolarGrid stroke="#E3E3E3" />
                      <PolarAngleAxis dataKey="category" tick={{ fontSize: 11, fill: '#1E1E1E' }} />
                      <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 9, fill: '#94a3b8' }} />
                      <Tooltip content={<CustomTooltip />} />
                      {summary.periods.map((period, i) => (
                        <Radar
                          key={period}
                          name={period}
                          dataKey={period}
                          stroke={PERIOD_COLORS[period] || ['#4242EA', '#10B981', '#F59E0B', '#EF4444'][i % 4]}
                          fill={PERIOD_COLORS[period] || ['#4242EA', '#10B981', '#F59E0B', '#EF4444'][i % 4]}
                          fillOpacity={0.15}
                          strokeWidth={2}
                        />
                      ))}
                    </RadarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}
          </div>
        </>
      ) : null}

      <AssessmentGrades initialCohort={selectedCohortName} embedded hideStatusBar />
    </div>
  );
};

export default AssessmentsTab;
