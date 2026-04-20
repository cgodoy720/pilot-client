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

// Map BQ assessment types to display names (covers L1 + L3 + fallback)
const TYPE_LABELS = {
  'knowledge_assessment': 'Self Assessment',
  'project': 'Technical',
  'problem_solution': 'Business',
  'video': 'Professional',
  'l3_technical_open_source': 'Technical',
  'l3_business_contribution_brief': 'Business',
  'l3_professional_ceo_plasticlabs': 'Professional',
};

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
  const [completion, setCompletion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    setFetchError(null);
    const cohortParam = selectedCohortName ? `?cohort=${encodeURIComponent(selectedCohortName)}` : '';
    Promise.all([
      fetch(`${API_URL}/api/admin/assessment-grades${cohortParam}`, {
        headers: { Authorization: `Bearer ${token}` },
      }).then(r => { if (!r.ok) throw new Error(`Server error (${r.status})`); return r.json(); }),
      selectedCohortId ? fetch(`${API_URL}/api/admin/dashboard/assessment-completion?cohortId=${selectedCohortId}`, {
        headers: { Authorization: `Bearer ${token}` },
      }).then(r => r.json()).catch(() => null) : Promise.resolve(null),
    ])
      .then(([gradesData, completionData]) => {
        setGrades(gradesData);
        if (completionData?.success) setCompletion(completionData);
      })
      .catch(err => {
        console.error('Assessment grades fetch error:', err);
        setFetchError(err.message);
      })
      .finally(() => setLoading(false));
  }, [token, selectedCohortId, selectedCohortName]);

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

    const periods = Object.keys(byPeriod).sort((a, b) => {
      const wa = parseInt(a.replace(/\D/g, '')) || 0;
      const wb = parseInt(b.replace(/\D/g, '')) || 0;
      return wa - wb;
    });

    // Discover categories from actual data instead of a hard-coded list
    const allCategories = new Set();
    Object.values(categoryScores).forEach(cs => allCategories.add(cs.category));
    const preferredOrder = ['Self Assessment', 'Technical', 'Business', 'Professional'];
    const categories = [...allCategories].sort((a, b) => {
      const ia = preferredOrder.indexOf(a);
      const ib = preferredOrder.indexOf(b);
      if (ia !== -1 && ib !== -1) return ia - ib;
      if (ia !== -1) return -1;
      if (ib !== -1) return 1;
      return a.localeCompare(b);
    });

    const radarData = categories.map(category => {
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
          {/* Completion rates + radar chart side by side */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Left: Completion rates per period */}
            <div className="space-y-3">
              {completion?.data && Object.entries(completion.data).map(([period, data]) => (
                <Card key={period} className="bg-white border border-[#E3E3E3]">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ background: PERIOD_COLORS[period] || '#94a3b8' }} />
                        <span className="text-sm font-semibold text-[#1E1E1E]">{period}</span>
                      </div>
                      <span className={`text-2xl font-bold ${data.pct >= 80 ? 'text-green-600' : data.pct >= 60 ? 'text-yellow-600' : 'text-red-500'}`}>
                        {data.pct}%
                      </span>
                    </div>
                    <div className="flex h-2 rounded-full overflow-hidden bg-[#EFEFEF] mb-2">
                      <div className="bg-green-500 h-full" style={{ width: `${data.pct}%` }} />
                    </div>
                    <p className="text-xs text-slate-500">
                      <span className="font-medium text-[#1E1E1E]">{data.completedAll}</span> of {data.total} builders submitted all assessments
                    </p>
                  </CardContent>
                </Card>
              ))}
              {(!completion?.data || Object.keys(completion.data).length === 0) && (
                <Card className="bg-white border border-[#E3E3E3]">
                  <CardContent className="p-4 text-center">
                    <p className="text-xs text-slate-400">No assessment submission data yet.</p>
                  </CardContent>
                </Card>
              )}
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
