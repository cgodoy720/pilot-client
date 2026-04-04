import React, { useState, useMemo } from 'react';
import { Badge } from '../../../components/ui/badge';
import DateNavigator from '../components/DateNavigator';
import AttendanceSection from '../components/AttendanceSection';
import FacilitatorTodos from '../components/FacilitatorTodos';
import CurriculumScheduleView from '../components/CurriculumScheduleView';

const TodayTab = ({ selectedCohortId, cohorts = [] }) => {
  const [selectedDate, setSelectedDate] = useState(
    () => sessionStorage.getItem('pursuit_today_date') || new Date().toISOString().split('T')[0]
  );
  const [dayInfo, setDayInfo] = useState(null);

  const selectedCohort = useMemo(
    () => cohorts.find(c => c.cohort_id === selectedCohortId),
    [cohorts, selectedCohortId]
  );
  const cohortName = selectedCohort?.name || '';
  const todayStr = new Date().toISOString().split('T')[0];
  const isToday = selectedDate === todayStr;
  const dateObj = new Date(selectedDate + 'T12:00:00');
  const dateStr = dateObj.toLocaleDateString('en-US', { weekday: 'short', month: 'numeric', day: 'numeric' }).toUpperCase();

  const handleDateChange = (date) => {
    setSelectedDate(date);
    sessionStorage.setItem('pursuit_today_date', date);
    setDayInfo(null); // Reset until new data loads
  };

  if (!cohortName) {
    return <p className="text-sm text-slate-400 text-center py-8">Select a cohort to view today.</p>;
  }

  return (
    <div className="space-y-6">
      <DateNavigator selectedDate={selectedDate} onDateChange={handleDateChange} />

      {/* Day header — compact, single row */}
      {dayInfo && (
        <div className="bg-[#4242EA] text-white rounded-lg px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-white/60 uppercase">{isToday ? 'Today' : dateStr}</span>
            <span className="text-sm font-bold">Day {dayInfo.day_number || '—'}</span>
            {dayInfo.week_number && <span className="text-xs text-white/50">W{dayInfo.week_number}</span>}
          </div>
          {dayInfo.daily_goal && (
            <p className="text-sm text-white/90 mt-1">{dayInfo.daily_goal}</p>
          )}
        </div>
      )}

      <AttendanceSection
        selectedDate={selectedDate}
        cohortName={cohortName}
        selectedCohortId={selectedCohortId}
      />
      <FacilitatorTodos
        selectedDate={selectedDate}
        selectedCohortId={selectedCohortId}
        cohortName={cohortName}
      />
      <CurriculumScheduleView
        selectedDate={selectedDate}
        cohortName={cohortName}
        selectedCohortId={selectedCohortId}
        onDayLoaded={setDayInfo}
        hideHeader
      />
    </div>
  );
};

export default TodayTab;
