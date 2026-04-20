import React, { useState, useEffect, useMemo } from 'react';
import { cachedAdminApi } from '../../../services/cachedAdminApi';
import useAuthStore from '../../../stores/authStore';
import { Card, CardContent } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Progress } from '../../../components/ui/progress';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '../../../components/ui/sheet';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '../../../components/ui/table';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '../../../components/ui/select';
import CohortDailyBreakdown from '../../../components/CohortPerformanceDashboard/CohortDailyBreakdown';
import DayBuilderStatusModal from '../../../components/CohortPerformanceDashboard/DayBuilderStatusModal';
import AttendanceManagement from '../../../components/AttendanceManagement/AttendanceManagement';
import { CheckCircle, Clock, Users, AlertTriangle, CalendarDays, User } from 'lucide-react';

const PERIOD_OPTIONS = [
  { value: 'last-30-days', label: 'Last 30 Days' },
  { value: 'this-week', label: 'This Week' },
  { value: 'last-week', label: 'Last Week' },
  { value: 'this-month', label: 'This Month' },
  { value: 'last-month', label: 'Last Month' },
];

const getRequirement = (cohortName) => {
  if (!cohortName) return 85;
  if (cohortName.includes('June 2025') || cohortName.includes('March 2025')) return 85;
  return 80;
};

const AttendanceTab = ({ selectedCohortId, cohorts = [] }) => {
  const token = useAuthStore((s) => s.token);

  const selectedCohortName = useMemo(
    () => cohorts.find((c) => c.cohort_id === selectedCohortId)?.name || '',
    [cohorts, selectedCohortId]
  );

  const [selectedPeriod, setSelectedPeriod] = useState('last-30-days');
  const [todayData, setTodayData] = useState(null);
  const [perfData, setPerfData] = useState(null);
  const [dailyBreakdown, setDailyBreakdown] = useState([]);
  const [loading, setLoading] = useState(false);
  const [manageOpen, setManageOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDay, setSelectedDay] = useState(null);
  const [dayBuilders, setDayBuilders] = useState(null);
  const [dayBuildersLoading, setDayBuildersLoading] = useState(false);

  useEffect(() => {
    if (!token) return;
    cachedAdminApi.getCachedTodaysAttendance(token)
      .then((res) => setTodayData(res.data))
      .catch(console.error);
  }, [token]);

  useEffect(() => {
    if (!token || !selectedCohortName) return;
    setLoading(true);
    cachedAdminApi.getCachedCohortPerformance(token, { period: selectedPeriod })
      .then((res) => setPerfData(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [token, selectedPeriod, selectedCohortName]);

  useEffect(() => {
    if (!selectedCohortName || !token) return;
    cachedAdminApi.getCachedCohortDailyBreakdown(selectedCohortName, token, { period: selectedPeriod })
      .then((res) => setDailyBreakdown(res.data?.dailyBreakdown || []))
      .catch(() => setDailyBreakdown([]));
  }, [selectedCohortName, selectedPeriod, token]);

  const todayCohort = useMemo(() => {
    if (!todayData?.cohorts || !selectedCohortName) return null;
    return todayData.cohorts.find((c) => c.cohort === selectedCohortName);
  }, [todayData, selectedCohortName]);

  const cohortPerfData = useMemo(() => {
    if (!perfData?.cohorts || !selectedCohortName) return null;
    return perfData.cohorts.find((c) => c.cohort === selectedCohortName);
  }, [perfData, selectedCohortName]);

  const atRiskBuilders = useMemo(() => {
    if (!perfData?.riskAssessment || !selectedCohortName) return [];
    return perfData.riskAssessment.filter((b) => b.cohort === selectedCohortName);
  }, [perfData, selectedCohortName]);

  const requirement = getRequirement(selectedCohortName);

  const periodStats = useMemo(() => {
    if (!cohortPerfData || !dailyBreakdown.length) return null;
    const totals = dailyBreakdown.reduce(
      (acc, day) => {
        acc.present += day.present || 0;
        acc.late += day.late || 0;
        acc.excused += day.excused || 0;
        acc.absent += day.absent || 0;
        acc.totalSlots += day.total || cohortPerfData.totalBuilders || 0;
        return acc;
      },
      { present: 0, late: 0, excused: 0, absent: 0, totalSlots: 0 }
    );
    const attended = totals.present + totals.late + totals.excused;
    const attendanceRate =
      totals.totalSlots > 0
        ? Number(((attended / totals.totalSlots) * 100).toFixed(1))
        : 0;
    return { ...totals, attendanceRate, classDays: dailyBreakdown.length };
  }, [dailyBreakdown, cohortPerfData]);

  const handleDayClick = async (day) => {
    if (!selectedCohortName || !day.date) return;
    setSelectedDay(day);
    setIsModalOpen(true);
    setDayBuildersLoading(true);
    try {
      const res = await cachedAdminApi.getCachedDayBuilderStatus(selectedCohortName, day.date, token);
      setDayBuilders(res.data);
    } catch {
      setDayBuilders(null);
    } finally {
      setDayBuildersLoading(false);
    }
  };

  if (!selectedCohortName) {
    return (
      <p className="text-sm text-slate-400 text-center py-8">Select a cohort to view attendance.</p>
    );
  }

  return (
    <div className="space-y-6">
      {/* Controls row */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
          <SelectTrigger className="w-[180px] bg-white border-[#E3E3E3] text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-white">
            {PERIOD_OPTIONS.map((o) => (
              <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <button
          onClick={() => setManageOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-md bg-[#4242EA] text-white hover:bg-[#3535c8] transition-colors"
        >
          <CalendarDays size={14} />
          Manage Attendance
        </button>
      </div>

      {/* Today's cohort metrics */}
      {todayCohort && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              label: "Today — Checked In",
              value: (todayCohort.present || 0) + (todayCohort.late || 0),
              sub: 'Present + Late',
              color: 'text-emerald-600',
              bg: 'bg-emerald-50',
              Icon: CheckCircle,
            },
            {
              label: 'On Time',
              value: todayCohort.present || 0,
              sub: 'Arrived on time',
              color: 'text-green-600',
              bg: 'bg-green-50',
              Icon: Users,
            },
            {
              label: 'Late',
              value: todayCohort.late || 0,
              sub: 'Arrived late',
              color: 'text-amber-600',
              bg: 'bg-amber-50',
              Icon: Clock,
            },
            {
              label: 'Absent',
              value: todayCohort.absent || 0,
              sub: 'Not present today',
              color: 'text-red-600',
              bg: 'bg-red-50',
              Icon: AlertTriangle,
            },
          ].map(({ label, value, sub, color, bg, Icon }) => (
            <Card key={label} className="bg-white border border-[#E3E3E3]">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-medium text-slate-500">{label}</p>
                    <p className={`text-3xl font-bold mt-1 ${color}`}>{value}</p>
                    <p className="text-xs text-slate-400 mt-1">{sub}</p>
                  </div>
                  <div className={`p-2 rounded-lg ${bg}`}>
                    <Icon size={18} className={color} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Period attendance rate */}
      {loading ? (
        <div className="h-24 bg-[#EFEFEF] rounded-lg animate-pulse" />
      ) : periodStats && cohortPerfData ? (
        <Card className="bg-white border border-[#E3E3E3]">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-[#1E1E1E]">Period Attendance Rate</h3>
              <Badge
                className={
                  periodStats.attendanceRate >= requirement
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-red-100 text-red-700'
                }
              >
                Target: {requirement}%
              </Badge>
            </div>
            <div className="mb-4">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-slate-600">Attendance Rate</span>
                <span className="font-semibold text-[#1E1E1E]">{periodStats.attendanceRate}%</span>
              </div>
              <Progress
                value={periodStats.attendanceRate}
                className={`h-2 ${
                  periodStats.attendanceRate >= requirement
                    ? '[&>div]:bg-emerald-500'
                    : '[&>div]:bg-red-500'
                }`}
              />
            </div>
            <div className="grid grid-cols-5 gap-2 text-sm">
              {[
                { label: 'Builders', value: cohortPerfData.totalBuilders, bg: 'bg-slate-50', cls: 'text-slate-900' },
                { label: 'Present+Late', value: periodStats.present + periodStats.late, bg: 'bg-emerald-50', cls: 'text-emerald-700' },
                { label: 'Absent', value: periodStats.absent, bg: 'bg-red-50', cls: 'text-red-700' },
                { label: 'Excused', value: periodStats.excused, bg: 'bg-blue-50', cls: 'text-blue-700' },
                { label: 'Class Days', value: periodStats.classDays, bg: 'bg-violet-50', cls: 'text-violet-700' },
              ].map(({ label, value, bg, cls }) => (
                <div key={label} className={`${bg} rounded p-2 text-center`}>
                  <p className={`font-semibold text-sm ${cls}`}>{value ?? '—'}</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">{label}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : null}

      {/* Daily calendar breakdown */}
      <CohortDailyBreakdown
        dailyBreakdown={dailyBreakdown}
        cohort={selectedCohortName}
        requirement={requirement}
        onDayClick={handleDayClick}
        loading={false}
      />

      {/* At-risk builders */}
      {atRiskBuilders.length > 0 && (
        <Card className="bg-white border border-[#E3E3E3]">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-[#1E1E1E]">At-Risk Builders</h3>
              <Badge className="bg-red-50 text-red-600 text-xs">{atRiskBuilders.length} builders</Badge>
            </div>
            <div className="border border-[#E3E3E3] rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-[#FAFAFA]">
                    <TableHead className="text-xs font-semibold text-slate-500">Builder</TableHead>
                    <TableHead className="text-xs font-semibold text-slate-500 text-right">Attendance Rate</TableHead>
                    <TableHead className="text-xs font-semibold text-slate-500 text-center">Status</TableHead>
                    <TableHead className="text-xs font-semibold text-slate-500 text-center">Recommendation</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {atRiskBuilders.map((builder, i) => {
                    // attendanceRate is null on holiday-only slices
                    const rate = typeof builder.attendanceRate === 'number' ? builder.attendanceRate : null;
                    const isAtRisk = rate != null && rate < requirement;
                    return (
                      <TableRow key={i} className="border-b border-[#E3E3E3]">
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <User size={14} className="text-slate-400 flex-shrink-0" />
                            <div>
                              <p className="text-xs font-medium text-[#1E1E1E]">
                                {builder.firstName} {builder.lastName}
                              </p>
                              <p className="text-[10px] text-slate-400">{builder.email}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell
                          className={`text-right text-xs font-semibold ${
                            isAtRisk ? 'text-red-600' : 'text-slate-900'
                          }`}
                        >
                          {rate != null ? `${rate.toFixed(1)}%` : '—'}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge
                            className={
                              isAtRisk
                                ? 'bg-red-100 text-red-700 text-xs'
                                : 'bg-green-100 text-green-700 text-xs'
                            }
                          >
                            {isAtRisk ? 'At Risk' : 'Safe'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge
                            variant="outline"
                            className={`text-xs ${
                              isAtRisk
                                ? 'border-amber-400 text-amber-700 bg-amber-50'
                                : 'border-slate-300 text-slate-600'
                            }`}
                          >
                            {builder.recommendation || 'Monitor'}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Day detail modal */}
      <DayBuilderStatusModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedDay(null);
          setDayBuilders(null);
        }}
        dayData={dayBuilders}
        loading={dayBuildersLoading}
      />

      {/* Manage Attendance drawer */}
      <Sheet open={manageOpen} onOpenChange={setManageOpen}>
        <SheetContent side="right" className="w-full sm:max-w-3xl overflow-y-auto p-0">
          <SheetHeader className="px-6 pt-6 pb-4 border-b border-[#E3E3E3]">
            <SheetTitle className="text-[#1E1E1E] font-semibold">Manage Attendance</SheetTitle>
          </SheetHeader>
          <div className="px-6 py-4">
            <AttendanceManagement cohortName={selectedCohortName} />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default AttendanceTab;
