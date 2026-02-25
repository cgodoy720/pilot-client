import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Users, Building2, UserCheck, Clock, UserX, BookOpen } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL;

const StatCard = ({ icon: Icon, label, value, sub, accent }) => (
  <Card className="bg-white border border-[#E3E3E3]">
    <CardContent className="p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-500 font-medium">{label}</p>
          <p className={`text-3xl font-bold mt-1 ${accent || 'text-[#1E1E1E]'}`}>{value ?? '—'}</p>
          {sub && <p className="text-xs text-slate-400 mt-1">{sub}</p>}
        </div>
        <div className="p-2 rounded-lg bg-[#EFEFEF]">
          <Icon size={20} className="text-[#4242EA]" />
        </div>
      </div>
    </CardContent>
  </Card>
);

const AttendanceBar = ({ label, count, total, color }) => {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span className="text-slate-600 font-medium">{label}</span>
        <span className="text-slate-500">{count} <span className="text-slate-400">({pct}%)</span></span>
      </div>
      <div className="h-2 bg-[#EFEFEF] rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
};

const OverviewTab = () => {
  const { token } = useAuth();
  const [quickStats, setQuickStats] = useState(null);
  const [todayAttendance, setTodayAttendance] = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingAttendance, setLoadingAttendance] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!token) return;

    const fetchQuickStats = async () => {
      try {
        const res = await fetch(`${API_URL}/api/admin/dashboard/quick-stats`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error(`${res.status}`);
        const json = await res.json();
        setQuickStats(json.data);
      } catch (e) {
        console.error('Quick stats error:', e);
      } finally {
        setLoadingStats(false);
      }
    };

    const fetchTodayAttendance = async () => {
      try {
        const res = await fetch(`${API_URL}/api/admin/attendance/dashboard/today`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error(`${res.status}`);
        const json = await res.json();
        setTodayAttendance(json);
      } catch (e) {
        console.error('Today attendance error:', e);
        setError('Could not load attendance data.');
      } finally {
        setLoadingAttendance(false);
      }
    };

    fetchQuickStats();
    fetchTodayAttendance();
  }, [token]);

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric',
  });

  // Aggregate totals across all cohorts
  const totals = todayAttendance?.cohorts?.reduce(
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
      {/* Top KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Users}
          label="Active Builders"
          value={loadingStats ? '...' : quickStats?.activeBuilders}
          sub="enrolled & active"
        />
        <StatCard
          icon={Building2}
          label="Active Cohorts"
          value={loadingStats ? '...' : quickStats?.activeCohorts}
          sub="in active programs"
        />
        <StatCard
          icon={UserCheck}
          label="Present Today"
          value={loadingAttendance ? '...' : totals?.present}
          sub={totals ? `of ${totals.total} total` : undefined}
          accent="text-green-600"
        />
        <StatCard
          icon={UserX}
          label="Absent Today"
          value={loadingAttendance ? '...' : totals?.absent}
          sub={totals ? `${totals.excused} excused` : undefined}
          accent={totals?.absent > 0 ? 'text-red-500' : 'text-[#1E1E1E]'}
        />
      </div>

      {/* Today's Attendance Detail */}
      <Card className="bg-white border border-[#E3E3E3]">
        <CardHeader className="pb-3 border-b border-[#E3E3E3]">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base font-semibold text-[#1E1E1E]">
                Today's Attendance
              </CardTitle>
              <CardDescription className="text-slate-400 text-sm mt-0.5">{today}</CardDescription>
            </div>
            {totals && (
              <Badge
                className={
                  totals.total > 0 && totals.present / totals.total >= 0.8
                    ? 'bg-green-100 text-green-700 border-green-200'
                    : 'bg-yellow-100 text-yellow-700 border-yellow-200'
                }
              >
                {totals.total > 0 ? Math.round((totals.present / totals.total) * 100) : 0}% present
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          {loadingAttendance ? (
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-8 bg-[#EFEFEF] rounded animate-pulse" />
              ))}
            </div>
          ) : error ? (
            <p className="text-sm text-red-500">{error}</p>
          ) : totals ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
                {[
                  { label: 'Present', count: totals.present, color: 'text-green-600', bg: 'bg-green-50 border-green-100' },
                  { label: 'Late', count: totals.late, color: 'text-yellow-600', bg: 'bg-yellow-50 border-yellow-100' },
                  { label: 'Absent', count: totals.absent, color: 'text-red-500', bg: 'bg-red-50 border-red-100' },
                  { label: 'Excused', count: totals.excused, color: 'text-blue-600', bg: 'bg-blue-50 border-blue-100' },
                ].map(({ label, count, color, bg }) => (
                  <div key={label} className={`rounded-lg border p-3 ${bg}`}>
                    <p className={`text-2xl font-bold ${color}`}>{count}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{label}</p>
                  </div>
                ))}
              </div>

              <AttendanceBar label="Present" count={totals.present} total={totals.total} color="bg-green-500" />
              <AttendanceBar label="Late" count={totals.late} total={totals.total} color="bg-yellow-400" />
              <AttendanceBar label="Absent" count={totals.absent} total={totals.total} color="bg-red-400" />
              <AttendanceBar label="Excused" count={totals.excused} total={totals.total} color="bg-blue-400" />
            </div>
          ) : (
            <p className="text-sm text-slate-400">No attendance data available.</p>
          )}
        </CardContent>
      </Card>

      {/* Per-cohort breakdown */}
      {todayAttendance?.cohorts?.length > 0 && (
        <Card className="bg-white border border-[#E3E3E3]">
          <CardHeader className="pb-3 border-b border-[#E3E3E3]">
            <CardTitle className="text-base font-semibold text-[#1E1E1E]">By Cohort</CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
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
                    const rate = total > 0 ? Math.round(((cohort.present || 0) / total) * 100) : 0;
                    return (
                      <tr key={cohort.cohort} className="hover:bg-[#EFEFEF]/50 transition-colors">
                        <td className="py-2.5 pr-4 font-medium text-[#1E1E1E] truncate max-w-[200px]">
                          {cohort.cohort}
                        </td>
                        <td className="py-2.5 px-3 text-center text-green-600 font-semibold">{cohort.present || 0}</td>
                        <td className="py-2.5 px-3 text-center text-yellow-600 font-semibold">{cohort.late || 0}</td>
                        <td className="py-2.5 px-3 text-center text-red-500 font-semibold">{cohort.absent || 0}</td>
                        <td className="py-2.5 px-3 text-center text-blue-500 font-semibold">{cohort.excused || 0}</td>
                        <td className="py-2.5 pl-3 text-right">
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                            rate >= 80 ? 'bg-green-100 text-green-700' :
                            rate >= 60 ? 'bg-yellow-100 text-yellow-700' :
                            'bg-red-100 text-red-600'
                          }`}>
                            {rate}%
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default OverviewTab;
