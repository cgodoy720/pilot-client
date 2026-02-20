import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell,
} from 'recharts';
import { ExternalLink, Award, CheckCircle, TrendingUp } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL;

const ScoreBar = ({ score }) => {
  const pct = Math.round(score * 100);
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-[#EFEFEF] rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full ${pct >= 80 ? 'bg-green-500' : pct >= 60 ? 'bg-yellow-400' : 'bg-red-400'}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className={`text-xs font-semibold w-9 text-right ${
        pct >= 80 ? 'text-green-600' : pct >= 60 ? 'text-yellow-600' : 'text-red-500'
      }`}>{pct}%</span>
    </div>
  );
};

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-[#E3E3E3] rounded-lg shadow-md p-3 text-xs">
      <p className="font-semibold text-[#1E1E1E]">{label}</p>
      <p className="text-slate-500 mt-1">Avg score: <span className="font-medium text-[#4242EA]">{payload[0].value}%</span></p>
    </div>
  );
};

const GradesTab = () => {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [grades, setGrades] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!token) return;
    const fetchGrades = async () => {
      try {
        const res = await fetch(`${API_URL}/api/admin/assessment-grades`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error(`${res.status}`);
        const json = await res.json();
        setGrades(json);
      } catch (e) {
        console.error('Grades fetch error:', e);
        setError('Could not load grades data.');
      } finally {
        setLoading(false);
      }
    };
    fetchGrades();
  }, [token]);

  const summary = React.useMemo(() => {
    if (!grades) return null;
    const rows = grades.data ?? [];
    if (!rows.length) return null;

    const graded = rows.filter((r) => r.average_score !== null && r.average_score !== undefined);
    const avgScore = graded.length
      ? Math.round((graded.reduce((a, r) => a + (r.average_score ?? 0), 0) / graded.length) * 100)
      : null;

    // Group by assessment_period for the bar chart
    const byPeriod = {};
    rows.forEach((r) => {
      const key = r.assessment_period ?? 'Unknown';
      if (!byPeriod[key]) byPeriod[key] = { period: key, scores: [], count: 0 };
      byPeriod[key].scores.push(r.average_score ?? 0);
      byPeriod[key].count++;
    });
    const chartData = Object.values(byPeriod).map((p) => ({
      name: p.period,
      avg: Math.round((p.scores.reduce((a, b) => a + b, 0) / p.scores.length) * 100),
      count: p.count,
    }));

    // Group by cohort
    const byCohort = {};
    rows.forEach((r) => {
      const key = r.cohort ?? 'Unknown';
      if (!byCohort[key]) byCohort[key] = { cohort: key, scores: [], count: 0 };
      byCohort[key].scores.push(r.average_score ?? 0);
      byCohort[key].count++;
    });
    const cohortData = Object.values(byCohort).map((c) => ({
      cohort: c.cohort,
      avgScore: c.scores.reduce((a, b) => a + b, 0) / c.scores.length,
      count: c.count,
    }));

    return {
      total: rows.length,
      graded: graded.length,
      avgScore,
      chartData,
      cohortData,
    };
  }, [grades]);

  return (
    <div className="space-y-6">
      {/* Header + CTA */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">Assessment performance across all cohorts.</p>
        <Button
          variant="outline"
          size="sm"
          className="border-[#4242EA] text-[#4242EA] hover:bg-[#4242EA] hover:text-white text-xs gap-1.5"
          onClick={() => navigate('/admin/assessment-grades')}
        >
          <ExternalLink size={13} />
          Full Grade Dashboard
        </Button>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-[#EFEFEF] rounded-lg animate-pulse" />
          ))}
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-100 rounded-lg p-4 text-sm text-red-500">{error}</div>
      ) : summary ? (
        <>
          {/* KPI cards */}
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            <Card className="bg-white border border-[#E3E3E3]">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-slate-500 font-medium">Total Assessments</p>
                    <p className="text-3xl font-bold mt-1 text-[#1E1E1E]">{summary.total}</p>
                    <p className="text-xs text-slate-400 mt-1">submissions</p>
                  </div>
                  <div className="p-2 rounded-lg bg-[#EFEFEF]">
                    <Award size={20} className="text-[#4242EA]" />
                  </div>
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
                  <div className="p-2 rounded-lg bg-green-50">
                    <CheckCircle size={20} className="text-green-500" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border border-[#E3E3E3] col-span-2 lg:col-span-1">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-slate-500 font-medium">Platform Avg Score</p>
                    <p className={`text-3xl font-bold mt-1 ${
                      summary.avgScore >= 80 ? 'text-green-600' :
                      summary.avgScore >= 60 ? 'text-yellow-600' :
                      'text-red-500'
                    }`}>
                      {summary.avgScore !== null ? `${summary.avgScore}%` : '—'}
                    </p>
                  </div>
                  <div className="p-2 rounded-lg bg-[#EFEFEF]">
                    <TrendingUp size={20} className="text-[#4242EA]" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Score by period chart */}
          <Card className="bg-white border border-[#E3E3E3]">
            <CardHeader className="pb-3 border-b border-[#E3E3E3]">
              <CardTitle className="text-base font-semibold text-[#1E1E1E]">Avg Score by Assessment Period</CardTitle>
              <CardDescription className="text-slate-400 text-sm">
                Platform-wide average score per week/period
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={summary.chartData} margin={{ top: 4, right: 16, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E3E3E3" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} domain={[0, 100]} unit="%" />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="avg" radius={[4, 4, 0, 0]}>
                    {summary.chartData.map((entry) => (
                      <Cell
                        key={entry.name}
                        fill={entry.avg >= 80 ? '#10B981' : entry.avg >= 60 ? '#F59E0B' : '#4242EA'}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* By cohort table */}
          <Card className="bg-white border border-[#E3E3E3]">
            <CardHeader className="pb-3 border-b border-[#E3E3E3]">
              <CardTitle className="text-base font-semibold text-[#1E1E1E]">By Cohort</CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="space-y-3">
                {summary.cohortData.map((c) => (
                  <div key={c.cohort} className="flex items-center gap-4">
                    <p className="text-sm font-medium text-[#1E1E1E] w-40 flex-shrink-0 truncate">{c.cohort}</p>
                    <div className="flex-1">
                      <ScoreBar score={c.avgScore} />
                    </div>
                    <span className="text-xs text-slate-400 w-16 text-right flex-shrink-0">
                      {c.count} submissions
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      ) : (
        <p className="text-sm text-slate-400 text-center py-10">No grades data available.</p>
      )}
    </div>
  );
};

export default GradesTab;
