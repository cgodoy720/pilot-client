import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { cachedAdminApi } from '../../../services/cachedAdminApi';
import useAuthStore from '../../../stores/authStore';
import {
  CheckCircle, Clock, Users, AlertTriangle, BookOpen, Edit3, Calendar,
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL;

const TodayTab = ({ selectedCohortId, cohorts = [] }) => {
  const token = useAuthStore((s) => s.token);

  const selectedCohort = useMemo(
    () => cohorts.find(c => c.cohort_id === selectedCohortId),
    [cohorts, selectedCohortId]
  );
  const selectedCohortName = selectedCohort?.name || '';

  // Today's attendance
  const [todayData, setTodayData] = useState(null);
  const [attendanceLoading, setAttendanceLoading] = useState(true);

  // Curriculum day
  const [dayData, setDayData] = useState(null);
  const [dayDetails, setDayDetails] = useState(null);
  const [curriculumLoading, setCurriculumLoading] = useState(true);
  const [curriculumError, setCurriculumError] = useState(null);

  // Fetch today's attendance
  useEffect(() => {
    if (!token) return;
    setAttendanceLoading(true);
    cachedAdminApi.getCachedTodaysAttendance(token)
      .then((res) => setTodayData(res.data))
      .catch(console.error)
      .finally(() => setAttendanceLoading(false));
  }, [token]);

  // Fetch today's curriculum day
  useEffect(() => {
    if (!token || !selectedCohortName) return;
    setCurriculumLoading(true);
    setCurriculumError(null);
    setDayData(null);
    setDayDetails(null);

    const today = new Date().toISOString().split('T')[0];
    fetch(`${API_URL}/api/curriculum/days/date/${today}?cohort=${encodeURIComponent(selectedCohortName)}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => {
        if (r.status === 404) return null;
        if (!r.ok) throw new Error('Failed to fetch day');
        return r.json();
      })
      .then(data => {
        if (!data) {
          setCurriculumLoading(false);
          return;
        }
        setDayData(data);
        // Fetch full details
        const dayId = data.id || data.day_id;
        if (!dayId) { setCurriculumLoading(false); return; }
        return fetch(`${API_URL}/api/curriculum/days/${dayId}/full-details?cohort=${encodeURIComponent(selectedCohortName)}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
          .then(r => r.ok ? r.json() : null)
          .then(details => setDayDetails(details));
      })
      .catch(err => setCurriculumError(err.message))
      .finally(() => setCurriculumLoading(false));
  }, [token, selectedCohortName]);

  const todayCohort = useMemo(() => {
    if (!todayData?.cohorts || !selectedCohortName) return null;
    return todayData.cohorts.find(c => c.cohort === selectedCohortName);
  }, [todayData, selectedCohortName]);

  if (!selectedCohortName) {
    return <p className="text-sm text-slate-400 text-center py-8">Select a cohort to view today.</p>;
  }

  const todayStr = new Date().toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-[#1E1E1E]">Today's View</h3>
          <p className="text-xs text-slate-400 mt-0.5">{todayStr}</p>
        </div>
      </div>

      {/* Today's Attendance Cards */}
      <div>
        <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-3">Attendance</h4>
        {attendanceLoading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => <div key={i} className="h-24 bg-[#EFEFEF] rounded-lg animate-pulse" />)}
          </div>
        ) : todayCohort ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                label: 'Checked In',
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
        ) : (
          <div className="bg-[#FAFAFA] rounded-lg border border-[#E3E3E3] p-6 text-center">
            <p className="text-sm text-slate-400">No attendance data for today.</p>
          </div>
        )}
      </div>

      {/* Curriculum Day View */}
      <div>
        <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-3">Curriculum</h4>
        {curriculumLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => <div key={i} className="h-20 bg-[#EFEFEF] rounded-lg animate-pulse" />)}
          </div>
        ) : !dayData ? (
          <div className="bg-[#FAFAFA] rounded-lg border border-[#E3E3E3] p-8 text-center">
            <Calendar size={28} className="text-slate-300 mx-auto mb-2" />
            <p className="text-sm text-slate-500 font-medium">No curriculum day scheduled for today</p>
            <p className="text-xs text-slate-400 mt-1">This may be a weekend, holiday, or off day.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Day header */}
            <Card className="bg-white border border-[#E3E3E3]">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <BookOpen size={16} className="text-[#4242EA]" />
                    <h3 className="text-sm font-semibold text-[#1E1E1E]">
                      Day {dayData.day_number || dayData.dayNumber || '—'}
                    </h3>
                    {dayData.week_number && (
                      <Badge className="bg-[#EFEFEF] text-slate-600 text-[10px]">Week {dayData.week_number}</Badge>
                    )}
                  </div>
                </div>
                {(dayData.daily_goal || dayDetails?.day?.daily_goal) && (
                  <div className="mb-2">
                    <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">Daily Goal</p>
                    <p className="text-xs text-slate-700 mt-0.5">{dayData.daily_goal || dayDetails?.day?.daily_goal}</p>
                  </div>
                )}
                {(dayData.weekly_goal || dayDetails?.day?.weekly_goal) && (
                  <div>
                    <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">Weekly Goal</p>
                    <p className="text-xs text-slate-700 mt-0.5">{dayData.weekly_goal || dayDetails?.day?.weekly_goal}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Time blocks + tasks */}
            {dayDetails?.blocks && dayDetails.blocks.length > 0 ? (
              dayDetails.blocks.map((block) => (
                <Card key={block.id || block.block_id} className="bg-white border border-[#E3E3E3]">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <div className={`w-2 h-2 rounded-full ${
                        block.block_category === 'instruction' ? 'bg-[#4242EA]' :
                        block.block_category === 'practice' ? 'bg-green-500' :
                        block.block_category === 'break' ? 'bg-yellow-500' :
                        'bg-slate-400'
                      }`} />
                      <span className="text-xs font-semibold text-[#1E1E1E]">{block.title || block.block_title}</span>
                      {block.start_time && block.end_time && (
                        <span className="text-[10px] text-slate-400">
                          {block.start_time} – {block.end_time}
                        </span>
                      )}
                      {block.block_category && (
                        <Badge className="bg-[#EFEFEF] text-slate-500 text-[10px]">{block.block_category}</Badge>
                      )}
                    </div>

                    {block.tasks && block.tasks.length > 0 && (
                      <div className="space-y-2 pl-4 border-l-2 border-[#EFEFEF]">
                        {block.tasks.map((task) => (
                          <div
                            key={task.id || task.task_id}
                            className="bg-[#FAFAFA] rounded-md px-3 py-2"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-medium text-[#1E1E1E]">{task.title || task.task_title}</span>
                                {task.interface_type && (
                                  <Badge className="bg-blue-50 text-blue-600 text-[10px]">{task.interface_type}</Badge>
                                )}
                              </div>
                              {task.start_time && task.end_time && (
                                <span className="text-[10px] text-slate-400">{task.start_time} – {task.end_time}</span>
                              )}
                            </div>
                            {task.description && (
                              <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">{task.description}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            ) : dayDetails?.tasks && dayDetails.tasks.length > 0 ? (
              <Card className="bg-white border border-[#E3E3E3]">
                <CardContent className="p-4">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Tasks</p>
                  <div className="space-y-2">
                    {dayDetails.tasks.map((task) => (
                      <div key={task.id || task.task_id} className="bg-[#FAFAFA] rounded-md px-3 py-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium text-[#1E1E1E]">{task.title || task.task_title}</span>
                          {task.interface_type && (
                            <Badge className="bg-blue-50 text-blue-600 text-[10px]">{task.interface_type}</Badge>
                          )}
                        </div>
                        {task.description && (
                          <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">{task.description}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
};

export default TodayTab;
