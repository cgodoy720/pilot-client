import React, { useState, useEffect, useMemo } from 'react';
import useAuthStore from '../../../stores/authStore';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Users, CalendarCheck, ClipboardList, Star, TrendingUp, UserX } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL;

const KpiTile = ({ label, value, sub, color = 'text-[#1E1E1E]', bg = 'bg-white' }) => (
  <div className={`rounded-lg border border-[#E3E3E3] ${bg} p-4`}>
    <p className="text-xs text-slate-500 font-medium">{label}</p>
    <p className={`text-2xl font-bold mt-1 ${color}`}>{value ?? '—'}</p>
    {sub && <p className="text-[11px] text-slate-400 mt-0.5">{sub}</p>}
  </div>
);

const OverviewTab = ({ selectedCohortId, cohorts }) => {
  const token = useAuthStore((s) => s.token);
  const [cohortStats, setCohortStats] = useState(null);
  const [todayAttendance, setTodayAttendance] = useState(null);
  const [loadingCohort, setLoadingCohort] = useState(false);
  const [loadingAttendance, setLoadingAttendance] = useState(true);

  const selectedCohort = useMemo(
    () => cohorts?.find(c => c.cohort_id === selectedCohortId),
    [cohorts, selectedCohortId]
  );
  const selectedCohortName = selectedCohort?.name || '';

  // Fetch cohort summary
  useEffect(() => {
    if (!token || !selectedCohortId) return;
    setLoadingCohort(true);
    const startDate = '2025-01-01';
    const endDate = new Date().toISOString().split('T')[0];
    fetch(`${API_URL}/api/admin/dashboard/cohort-summary?cohortId=${selectedCohortId}&startDate=${startDate}&endDate=${endDate}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(json => { if (json.success) setCohortStats(json); })
      .catch(console.error)
      .finally(() => setLoadingCohort(false));
  }, [token, selectedCohortId]);

  // Fetch today's attendance
  useEffect(() => {
    if (!token) return;
    fetch(`${API_URL}/api/admin/attendance/dashboard/today`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(json => setTodayAttendance(json))
      .catch(console.error)
      .finally(() => setLoadingAttendance(false));
  }, [token]);

  const todayCohort = todayAttendance?.cohorts?.find(c => c.cohort === selectedCohortName);
  const todayTotal = todayCohort
    ? (todayCohort.present || 0) + (todayCohort.late || 0) + (todayCohort.absent || 0) + (todayCohort.excused || 0)
    : 0;
  const todayPresentPct = todayTotal > 0
    ? Math.round(((todayCohort.present || 0) + (todayCohort.late || 0)) / todayTotal * 100)
    : null;

  const summary = cohortStats?.summary;
  const builders = cohortStats?.builders || [];

  const attendanceRate = builders.length > 0
    ? Math.round(builders.reduce((s, b) => s + (b.attendance_percentage || 0), 0) / builders.length)
    : null;

  const submissionRate = builders.length > 0
    ? Math.round(builders.reduce((s, b) => s + (b.tasks_completed_percentage || 0), 0) / builders.length)
    : null;

  const activeBuilders = summary?.totalBuilders ?? null;

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric',
  });

  const loading = loadingCohort || loadingAttendance;

  return (
    <div className="space-y-6">
      {selectedCohortName && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-[#1E1E1E]">{selectedCohortName}</h3>
            <span className="text-xs text-slate-400">{today}</span>
          </div>

          {/* KPI grid */}
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
            <KpiTile
              label="Active Builders"
              value={loading ? '...' : activeBuilders}
              sub="enrolled"
            />
            <KpiTile
              label="Present Today"
              value={loadingAttendance ? '...' : (todayCohort ? `${(todayCohort.present || 0) + (todayCohort.late || 0)}` : '—')}
              sub={todayPresentPct !== null ? `${todayPresentPct}% of cohort` : undefined}
              color="text-emerald-600"
              bg="bg-emerald-50"
            />
            <KpiTile
              label="Absent Today"
              value={loadingAttendance ? '...' : (todayCohort ? `${todayCohort.absent || 0}` : '—')}
              sub={todayCohort?.excused ? `${todayCohort.excused} excused` : undefined}
              color={(todayCohort?.absent || 0) > 0 ? 'text-red-500' : 'text-[#1E1E1E]'}
              bg={(todayCohort?.absent || 0) > 0 ? 'bg-red-50' : 'bg-white'}
            />
            <KpiTile
              label="Avg Attendance"
              value={loadingCohort ? '...' : (attendanceRate !== null ? `${attendanceRate}%` : '—')}
              color={attendanceRate >= 80 ? 'text-green-600' : attendanceRate >= 60 ? 'text-yellow-600' : 'text-red-500'}
              sub="all-time"
            />
            <KpiTile
              label="Submission Rate"
              value={loadingCohort ? '...' : (submissionRate !== null ? `${submissionRate}%` : '—')}
              color={submissionRate >= 80 ? 'text-green-600' : submissionRate >= 60 ? 'text-yellow-600' : 'text-red-500'}
              sub="avg tasks completed"
            />
            <KpiTile
              label="Late"
              value={loadingAttendance ? '...' : (todayCohort ? `${todayCohort.late || 0}` : '—')}
              sub="today"
              color="text-yellow-600"
              bg="bg-yellow-50"
            />
          </div>
        </div>
      )}

      {/* Builder breakdown */}
      {!loadingCohort && builders.length > 0 && (
        <Card className="bg-white border border-[#E3E3E3]">
          <CardHeader className="pb-3 border-b border-[#E3E3E3]">
            <CardTitle className="text-base font-semibold text-[#1E1E1E]">Builder Snapshot</CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-slate-400 text-xs uppercase tracking-wide border-b border-[#E3E3E3]">
                    <th className="pb-2 pr-4 font-medium">Builder</th>
                    <th className="pb-2 px-3 font-medium text-center">Attendance</th>
                    <th className="pb-2 px-3 font-medium text-center">Tasks</th>
                    <th className="pb-2 pl-3 font-medium text-center">Feedback</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EFEFEF]">
                  {builders.slice(0, 10).map(b => (
                    <tr key={b.user_id} className="hover:bg-[#EFEFEF]/50 transition-colors">
                      <td className="py-2 pr-4">
                        <p className="font-medium text-[#1E1E1E] text-xs">{b.name}</p>
                      </td>
                      <td className="py-2 px-3 text-center">
                        <span className={`text-xs font-semibold ${
                          b.attendance_percentage >= 80 ? 'text-green-600' :
                          b.attendance_percentage >= 60 ? 'text-yellow-600' : 'text-red-500'
                        }`}>{b.attendance_percentage}%</span>
                      </td>
                      <td className="py-2 px-3 text-center text-xs text-slate-600">{b.tasks_completed_percentage}%</td>
                      <td className="py-2 pl-3 text-center text-xs text-slate-600">{b.total_peer_feedback_count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {builders.length > 10 && (
                <p className="text-xs text-slate-400 text-center mt-3 py-2">
                  Showing 10 of {builders.length} — see Roster tab for full list
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {!selectedCohortName && (
        <p className="text-sm text-slate-400 text-center py-12">Select a cohort to view overview.</p>
      )}
    </div>
  );
};

export default OverviewTab;
