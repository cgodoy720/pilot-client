import React, { useState, useEffect, useMemo } from 'react';
import useAuthStore from '../../../stores/authStore';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Users, CheckCircle, TrendingUp } from 'lucide-react';
import AssessmentGrades from '../../AssessmentGrades/AssessmentGrades';

const API_URL = import.meta.env.VITE_API_URL;

const ASSESSMENT_COLORS = {
  'Multiple Choice': '#4242EA',
  'Project': '#10B981',
  'Problem-Solution': '#F59E0B',
};

// Shorten long assessment names for chart display
const shortName = (name) => {
  if (!name) return 'Unknown';
  if (name.includes('Multiple Choice')) return 'Multiple Choice';
  if (name.includes('Project')) return 'Project';
  if (name.includes('Problem-Solution') || name.includes('Problem')) return 'Problem-Solution';
  return name.length > 20 ? name.substring(0, 18) + '...' : name;
};

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  // Find builders count from the first payload item's original data
  const builders = payload[0]?.payload?.builders;
  return (
    <div className="bg-white border border-[#E3E3E3] rounded-lg shadow-md p-3 text-xs">
      <p className="font-semibold text-[#1E1E1E] mb-1">{label}</p>
      {builders != null && (
        <p className="text-slate-500 mb-1">{builders} builders</p>
      )}
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

    // Collect all distinct assessment names and build per-period data
    const assessmentNames = new Set();
    const byPeriod = {};

    rows.forEach(r => {
      const period = r.assessment_period ?? 'Unknown';
      if (!byPeriod[period]) byPeriod[period] = { builderIds: new Set(), overallScores: [], assessmentScores: {} };
      byPeriod[period].builderIds.add(r.user_id);
      byPeriod[period].overallScores.push(r.average_score ?? 0);

      // Parse per-assessment scores
      try {
        const included = typeof r.included_assessments === 'string' ? JSON.parse(r.included_assessments) : r.included_assessments;
        if (Array.isArray(included)) {
          included.forEach(a => {
            const name = shortName(a.assessment_name);
            assessmentNames.add(name);
            if (!byPeriod[period].assessmentScores[name]) byPeriod[period].assessmentScores[name] = [];
            byPeriod[period].assessmentScores[name].push(a.overall_score ?? 0);
          });
        }
      } catch {}
    });

    const sortedNames = [...assessmentNames].sort();

    const chartData = Object.entries(byPeriod)
      .map(([name, data]) => {
        const entry = {
          name,
          builders: data.builderIds.size,
          avg: Math.round((data.overallScores.reduce((a, b) => a + b, 0) / data.overallScores.length) * 100),
        };
        // Add per-assessment averages
        sortedNames.forEach(aName => {
          const scores = data.assessmentScores[aName] || [];
          entry[aName] = scores.length > 0
            ? Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 100)
            : null;
        });
        return entry;
      })
      .sort((a, b) => {
        const wa = parseInt(a.name.replace(/\D/g, '')) || 0;
        const wb = parseInt(b.name.replace(/\D/g, '')) || 0;
        return wa - wb;
      });

    return { uniqueBuilders, total: rows.length, graded: graded.length, avgScore, chartData, assessmentNames: sortedNames };
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
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            <Card className="bg-white border border-[#E3E3E3]">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-slate-500 font-medium">Builders Submitted</p>
                    <p className="text-3xl font-bold mt-1 text-[#1E1E1E]">{summary.uniqueBuilders}</p>
                    <p className="text-xs text-slate-400 mt-1">{summary.total} total submissions</p>
                  </div>
                  <div className="p-2 rounded-lg bg-[#EFEFEF]"><Users size={20} className="text-[#4242EA]" /></div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white border border-[#E3E3E3]">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-slate-500 font-medium">Graded</p>
                    <p className="text-3xl font-bold mt-1 text-green-600">{summary.graded}</p>
                    <p className="text-xs text-slate-400 mt-1">
                      {summary.total > 0 ? Math.round((summary.graded / summary.total) * 100) : 0}% complete
                    </p>
                  </div>
                  <div className="p-2 rounded-lg bg-green-50"><CheckCircle size={20} className="text-green-500" /></div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white border border-[#E3E3E3] col-span-2 lg:col-span-1">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-slate-500 font-medium">Avg Score</p>
                    <p className={`text-3xl font-bold mt-1 ${
                      summary.avgScore >= 80 ? 'text-green-600' :
                      summary.avgScore >= 60 ? 'text-yellow-600' : 'text-red-500'
                    }`}>
                      {summary.avgScore !== null ? `${summary.avgScore}%` : '—'}
                    </p>
                  </div>
                  <div className="p-2 rounded-lg bg-[#EFEFEF]"><TrendingUp size={20} className="text-[#4242EA]" /></div>
                </div>
              </CardContent>
            </Card>
          </div>

          {summary.chartData.length > 0 && (
            <Card className="bg-white border border-[#E3E3E3]">
              <CardHeader className="pb-2 border-b border-[#E3E3E3]">
                <CardTitle className="text-sm font-semibold text-[#1E1E1E]">Scores by Assessment Period</CardTitle>
              </CardHeader>
              <CardContent className="pt-3">
                <ResponsiveContainer width="100%" height={160}>
                  <BarChart data={summary.chartData} margin={{ top: 4, right: 16, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E3E3E3" />
                    <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#94a3b8' }} />
                    <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} domain={[0, 100]} unit="%" />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '10px', paddingTop: '4px' }} />
                    {summary.assessmentNames.map(aName => (
                      <Bar
                        key={aName}
                        dataKey={aName}
                        name={aName}
                        fill={ASSESSMENT_COLORS[aName] || '#94a3b8'}
                        radius={[3, 3, 0, 0]}
                      />
                    ))}
                  </BarChart>
                </ResponsiveContainer>
                <div className="flex gap-4 mt-2 text-[11px] text-slate-500">
                  {summary.chartData.map(d => (
                    <span key={d.name}>{d.name}: <strong>{d.builders}</strong> builders, avg <strong>{d.avg}%</strong></span>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      ) : null}

      <AssessmentGrades initialCohort={selectedCohortName} embedded hideStatusBar />
    </div>
  );
};

export default AssessmentsTab;
