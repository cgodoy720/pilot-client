import React, { useState, useEffect, useCallback } from 'react';
import useAuthStore from '../../../stores/authStore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { AlertTriangle } from 'lucide-react';
import { getCohortPerformance, getCohortDailyBreakdown } from '../../../services/adminApi';

const API_URL = import.meta.env.VITE_API_URL;

const PERIOD_OPTIONS = [
  { value: 'last-30-days', label: 'Last 30 days' },
  { value: 'this-week',    label: 'This week' },
  { value: 'last-week',    label: 'Last week' },
  { value: 'this-month',   label: 'This month' },
];

const COHORT_COLORS = ['#4242EA', '#FF33FF', '#10B981', '#F59E0B', '#EF4444', '#6366F1'];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-[#E3E3E3] rounded-lg shadow-md p-3 text-xs">
      <p className="font-semibold text-[#1E1E1E] mb-1">
        {new Date(label).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
      </p>
      {payload.map((p) => (
        <div key={p.dataKey} className="flex items-center gap-2 mt-0.5">
          <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: p.color }} />
          <span className="text-slate-500 truncate max-w-[120px]">{p.name}:</span>
          <span className="font-medium text-[#1E1E1E]">{p.value}%</span>
        </div>
      ))}
    </div>
  );
};

const CohortAnalyticsTab = () => {
  const token = useAuthStore((s) => s.token);
  const [period, setPeriod] = useState('last-30-days');
  const [performance, setPerformance] = useState(null);
  const [trendData, setTrendData] = useState([]);
  const [loadingPerf, setLoadingPerf] = useState(true);
  const [loadingTrend, setLoadingTrend] = useState(false);
  const [todayAttendance, setTodayAttendance] = useState(null);
  const [loadingToday, setLoadingToday] = useState(true);

  // Fetch cohort performance (also contains riskAssessment)
  useEffect(() => {
    if (!token) return;
    setLoadingPerf(true);
    getCohortPerformance(token, { period })
      .then((data) => {
        setPerformance(data);
        // Fetch daily breakdown for each cohort to build trend chart
        const cohorts = data?.cohorts ?? [];
        if (cohorts.length > 0) {
          setLoadingTrend(true);
          Promise.all(
            cohorts.map((c) =>
              getCohortDailyBreakdown(c.cohort, token, { period })
                .then((r) => ({ cohort: c.cohort, days: r.dailyBreakdown ?? [] }))
                .catch(() => ({ cohort: c.cohort, days: [] }))
            )
          ).then((results) => {
            // Merge into a single array keyed by date
            const dateMap = {};
            results.forEach(({ cohort, days }) => {
              days.forEach((d) => {
                if (!dateMap[d.date]) dateMap[d.date] = { date: d.date };
                dateMap[d.date][cohort] = d.attendanceRate ?? 0;
              });
            });
            setTrendData(
              Object.values(dateMap)
                .sort((a, b) => a.date.localeCompare(b.date))
                .slice(-14)
            );
          }).finally(() => setLoadingTrend(false));
        }
      })
      .catch(console.error)
      .finally(() => setLoadingPerf(false));
  }, [token, period]);

  // Fetch today's attendance for cross-cohort breakdown
  useEffect(() => {
    if (!token) return;
    fetch(`${API_URL}/api/admin/attendance/dashboard/today`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(json => setTodayAttendance(json))
      .catch(console.error)
      .finally(() => setLoadingToday(false));
  }, [token]);

  const cohorts = performance?.cohorts ?? [];
  const riskBuilders = Array.isArray(performance?.riskAssessment)
    ? performance.riskAssessment
    : [];
  const cohortNames = cohorts.map((c) => c.cohort);

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  const todayTotals = todayAttendance?.cohorts?.reduce(
    (acc, c) => {
      acc.present += c.present || 0;
      acc.late += c.late || 0;
      acc.absent += c.absent || 0;
      acc.excused += c.excused || 0;
      acc.total += (c.present || 0) + (c.late || 0) + (c.absent || 0) + (c.excused || 0);
      return acc;
    },
    { present: 0, late: 0, absent: 0, excused: 0, total: 0 }
  ) ?? null;

  return (
    <div className="space-y-6">

      {/* Today's cross-cohort attendance */}
      <Card className="bg-white border border-[#E3E3E3]">
        <CardHeader className="pb-3 border-b border-[#E3E3E3]">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold text-[#1E1E1E]">Today's Attendance</CardTitle>
            <span className="text-xs text-slate-400">{today}</span>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          {loadingToday ? (
            <div className="space-y-2">{[1,2,3].map(i => <div key={i} className="h-8 bg-[#EFEFEF] rounded animate-pulse" />)}</div>
          ) : !todayAttendance?.cohorts?.length ? (
            <p className="text-sm text-slate-400 text-center py-4">No attendance data for today.</p>
          ) : (
            <>
              {/* Summary tiles */}
              {todayTotals && (
                <div className="grid grid-cols-4 gap-3 mb-4">
                  {[
                    { label: 'Present', count: todayTotals.present, color: 'text-green-600', bg: 'bg-green-50 border-green-100' },
                    { label: 'Late', count: todayTotals.late, color: 'text-yellow-600', bg: 'bg-yellow-50 border-yellow-100' },
                    { label: 'Absent', count: todayTotals.absent, color: 'text-red-500', bg: 'bg-red-50 border-red-100' },
                    { label: 'Excused', count: todayTotals.excused, color: 'text-blue-600', bg: 'bg-blue-50 border-blue-100' },
                  ].map(({ label, count, color, bg }) => (
                    <div key={label} className={`rounded-lg border p-3 ${bg}`}>
                      <p className={`text-2xl font-bold ${color}`}>{count}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{label}</p>
                    </div>
                  ))}
                </div>
              )}
              {/* Per-cohort breakdown */}
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-slate-400 text-xs uppercase tracking-wide border-b border-[#E3E3E3]">
                      <th className="pb-2 pr-4 font-medium">Cohort</th>
                      <th className="pb-2 px-3 font-medium text-center">Present</th>
                      <th className="pb-2 px-3 font-medium text-center">Late</th>
                      <th className="pb-2 px-3 font-medium text-center">Absent</th>
                      <th className="pb-2 px-3 font-medium text-center">Excused</th>
                      <th className="pb-2 pl-3 font-medium text-right">Rate</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EFEFEF]">
                    {todayAttendance.cohorts.map((cohort) => {
                      const total = (cohort.present || 0) + (cohort.late || 0) + (cohort.absent || 0) + (cohort.excused || 0);
                      const rate = total > 0 ? Math.round(((cohort.present || 0) + (cohort.late || 0)) / total * 100) : 0;
                      return (
                        <tr key={cohort.cohort} className="hover:bg-[#EFEFEF]/50 transition-colors">
                          <td className="py-2.5 pr-4 font-medium text-[#1E1E1E] truncate max-w-[200px]">{cohort.cohort}</td>
                          <td className="py-2.5 px-3 text-center text-green-600 font-semibold">{cohort.present || 0}</td>
                          <td className="py-2.5 px-3 text-center text-yellow-600 font-semibold">{cohort.late || 0}</td>
                          <td className="py-2.5 px-3 text-center text-red-500 font-semibold">{cohort.absent || 0}</td>
                          <td className="py-2.5 px-3 text-center text-blue-500 font-semibold">{cohort.excused || 0}</td>
                          <td className="py-2.5 pl-3 text-right">
                            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                              rate >= 80 ? 'bg-green-100 text-green-700' :
                              rate >= 60 ? 'bg-yellow-100 text-yellow-700' :
                              'bg-red-100 text-red-600'
                            }`}>{rate}%</span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Period selector */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-slate-500 font-medium">Period:</span>
        <div className="flex gap-1 flex-wrap">
          {PERIOD_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setPeriod(opt.value)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                period === opt.value
                  ? 'bg-[#4242EA] text-white'
                  : 'bg-white border border-[#E3E3E3] text-slate-600 hover:border-[#4242EA] hover:text-[#4242EA]'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Cohort summary cards */}
      {loadingPerf ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 bg-[#EFEFEF] rounded-lg animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {cohorts.map((cohort, idx) => {
            const rate = cohort.attendanceRate ?? 0;
            const meets = cohort.isMeetingRequirement;
            return (
              <Card key={cohort.cohort} className="bg-white border border-[#E3E3E3]">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <p className="text-xs text-slate-500 font-medium leading-tight pr-2 line-clamp-2">
                      {cohort.cohort}
                    </p>
                    <span
                      className="w-2.5 h-2.5 rounded-full flex-shrink-0 mt-0.5"
                      style={{ background: COHORT_COLORS[idx % COHORT_COLORS.length] }}
                    />
                  </div>
                  <p className={`text-2xl font-bold ${
                    rate >= 80 ? 'text-green-600' :
                    rate >= 60 ? 'text-yellow-600' :
                    'text-red-500'
                  }`}>
                    {rate}%
                  </p>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs text-slate-400">{cohort.totalBuilders} builders</span>
                    <span className={`text-xs font-medium px-1.5 py-0.5 rounded-full ${
                      meets
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-600'
                    }`}>
                      {meets ? `≥${cohort.requirement}%` : `<${cohort.requirement}%`}
                    </span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Attendance trend chart */}
      <Card className="bg-white border border-[#E3E3E3]">
        <CardHeader className="pb-3 border-b border-[#E3E3E3]">
          <CardTitle className="text-base font-semibold text-[#1E1E1E]">Attendance Rate Trends</CardTitle>
          <CardDescription className="text-slate-400 text-sm">
            Daily attendance % per cohort (last 14 days of period)
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          {loadingPerf || loadingTrend ? (
            <div className="h-56 bg-[#EFEFEF] rounded animate-pulse" />
          ) : trendData.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-10">
              No daily data available for this period.
            </p>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={trendData} margin={{ top: 4, right: 16, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E3E3E3" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11, fill: '#94a3b8' }}
                  tickFormatter={(d) => {
                    const dt = new Date(d + 'T12:00:00');
                    return `${dt.getMonth() + 1}/${dt.getDate()}`;
                  }}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: '#94a3b8' }}
                  domain={[0, 100]}
                  unit="%"
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  iconType="circle"
                  iconSize={8}
                  wrapperStyle={{ fontSize: '11px', paddingTop: '12px' }}
                  formatter={(value) => (
                    <span className="text-slate-600 text-xs">{value}</span>
                  )}
                />
                {cohortNames.map((name, idx) => (
                  <Line
                    key={name}
                    type="monotone"
                    dataKey={name}
                    name={name}
                    stroke={COHORT_COLORS[idx % COHORT_COLORS.length]}
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4 }}
                    connectNulls
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* At-risk builders */}
      <Card className="bg-white border border-[#E3E3E3]">
        <CardHeader className="pb-3 border-b border-[#E3E3E3]">
          <div className="flex items-center gap-2">
            <AlertTriangle size={16} className="text-yellow-500" />
            <CardTitle className="text-base font-semibold text-[#1E1E1E]">At-Risk Builders</CardTitle>
            {!loadingPerf && (
              <Badge className={`text-xs ml-auto ${
                riskBuilders.length > 0
                  ? 'bg-red-100 text-red-600 border-red-200'
                  : 'bg-green-100 text-green-700 border-green-200'
              }`}>
                {riskBuilders.length} flagged
              </Badge>
            )}
          </div>
          <CardDescription className="text-slate-400 text-sm">
            Builders not meeting their cohort attendance requirement
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          {loadingPerf ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-10 bg-[#EFEFEF] rounded animate-pulse" />
              ))}
            </div>
          ) : riskBuilders.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-6">No at-risk builders — great work! 🎉</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-slate-400 text-xs uppercase tracking-wide border-b border-[#E3E3E3]">
                    <th className="pb-2 pr-4 font-medium">Builder</th>
                    <th className="pb-2 px-3 font-medium">Cohort</th>
                    <th className="pb-2 px-3 font-medium text-center">Attendance</th>
                    <th className="pb-2 pl-3 font-medium">Recommendation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EFEFEF]">
                  {riskBuilders.slice(0, 20).map((builder, i) => {
                    const rate = builder.attendanceRate ?? 0;
                    return (
                      <tr key={`${builder.email}-${i}`} className="hover:bg-[#EFEFEF]/50 transition-colors">
                        <td className="py-2.5 pr-4">
                          <p className="font-medium text-[#1E1E1E]">
                            {builder.firstName} {builder.lastName}
                          </p>
                          <p className="text-xs text-slate-400">{builder.email}</p>
                        </td>
                        <td className="py-2.5 px-3 text-slate-500 text-xs max-w-[140px]">
                          <span className="truncate block">{builder.cohort}</span>
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                            rate >= 60
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-red-100 text-red-600'
                          }`}>
                            {rate}%
                          </span>
                        </td>
                        <td className="py-2.5 pl-3 text-xs text-slate-500">
                          {builder.recommendation ?? '—'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {riskBuilders.length > 20 && (
                <p className="text-xs text-slate-400 text-center mt-3">
                  Showing 20 of {riskBuilders.length}. See Attendance Dashboard for the full list.
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CohortAnalyticsTab;
