import React, { useState, useEffect, useMemo } from 'react';
import useAuthStore from '../../../stores/authStore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../../components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Award, CheckCircle, TrendingUp } from 'lucide-react';
import AssessmentGrades from '../../AssessmentGrades/AssessmentGrades';

const API_URL = import.meta.env.VITE_API_URL;

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-[#E3E3E3] rounded-lg shadow-md p-3 text-xs">
      <p className="font-semibold text-[#1E1E1E]">{label}</p>
      <p className="text-slate-500 mt-1">Avg score: <span className="font-medium text-[#4242EA]">{payload[0].value}%</span></p>
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

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    fetch(`${API_URL}/api/admin/assessment-grades`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(json => setGrades(json))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [token]);

  const summary = useMemo(() => {
    if (!grades || !selectedCohortName) return null;
    const rows = (grades.data ?? []).filter(r => r.cohort === selectedCohortName);
    if (!rows.length) return null;

    const graded = rows.filter(r => r.average_score != null);
    const avgScore = graded.length
      ? Math.round((graded.reduce((a, r) => a + (r.average_score ?? 0), 0) / graded.length) * 100)
      : null;

    const byPeriod = {};
    rows.forEach(r => {
      const key = r.assessment_period ?? 'Unknown';
      if (!byPeriod[key]) byPeriod[key] = { scores: [] };
      byPeriod[key].scores.push(r.average_score ?? 0);
    });
    const chartData = Object.entries(byPeriod).map(([name, { scores }]) => ({
      name,
      avg: Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 100),
    }));

    return { total: rows.length, graded: graded.length, avgScore, chartData };
  }, [grades, selectedCohortName]);

  if (!selectedCohortName) {
    return <p className="text-sm text-slate-400 text-center py-8">Select a cohort to view assessments.</p>;
  }

  return (
    <div className="space-y-6">
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
                    <p className="text-sm text-slate-500 font-medium">Total Assessments</p>
                    <p className="text-3xl font-bold mt-1 text-[#1E1E1E]">{summary.total}</p>
                    <p className="text-xs text-slate-400 mt-1">submissions</p>
                  </div>
                  <div className="p-2 rounded-lg bg-[#EFEFEF]"><Award size={20} className="text-[#4242EA]" /></div>
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
              <CardHeader className="pb-3 border-b border-[#E3E3E3]">
                <CardTitle className="text-base font-semibold text-[#1E1E1E]">Avg Score by Assessment Period</CardTitle>
                <CardDescription className="text-slate-400 text-sm">Score trend across weeks</CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={summary.chartData} margin={{ top: 4, right: 16, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E3E3E3" />
                    <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                    <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} domain={[0, 100]} unit="%" />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="avg" radius={[4, 4, 0, 0]}>
                      {summary.chartData.map(entry => (
                        <Cell key={entry.name} fill={entry.avg >= 80 ? '#10B981' : entry.avg >= 60 ? '#F59E0B' : '#4242EA'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}
        </>
      ) : null}

      <AssessmentGrades initialCohort={selectedCohortName} embedded />
    </div>
  );
};

export default AssessmentsTab;
