import React, { useState, useEffect } from 'react';
import useAuthStore from '../../../stores/authStore';
import { Card, CardContent } from '../../../components/ui/card';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:7001';

const SCHEDULE = [
  { day: 'Monday',    weekday: 1, time: '6:30 PM ET', format: 'Virtual',   formatColor: 'bg-blue-50 text-blue-700' },
  { day: 'Tuesday',   weekday: 2, time: '6:30 PM ET', format: 'In Person', formatColor: 'bg-green-50 text-green-700' },
  { day: 'Wednesday', weekday: 3, time: '6:30 PM ET', format: 'In Person', formatColor: 'bg-green-50 text-green-700' },
  { day: 'Thursday',  weekday: 4, time: '6:30 PM ET', format: 'Hybrid',    formatColor: 'bg-purple-50 text-purple-700' },
];

// Returns the date of the given weekday (1=Mon…7=Sun) for the current ISO week
const dateForWeekday = (weekday) => {
  const now = new Date();
  const day = now.getDay() || 7; // convert Sun=0 to 7
  const diff = weekday - day;
  const d = new Date(now);
  d.setDate(now.getDate() + diff);
  return d.toISOString().split('T')[0];
};

const ScheduleRow = ({ row, curriculumDay }) => {
  const [open, setOpen] = useState(false);
  const hasContent = curriculumDay?.daily_goal || curriculumDay?.learning_objectives?.length;

  return (
    <div className="divide-y divide-[#E3E3E3]">
      <div className="flex items-center justify-between px-5 py-4">
        <div className="flex-1">
          <div className="text-sm font-semibold text-[#1A1A1A]">{row.day}</div>
          <div className="text-xs text-[#6B7280]">{row.time}</div>
        </div>
        <span className={`text-xs font-medium px-3 py-1 rounded-full ${row.formatColor}`}>
          {row.format}
        </span>
        <button
          onClick={() => setOpen(o => !o)}
          disabled={!hasContent}
          className={`ml-3 p-1 rounded transition-colors ${hasContent ? 'hover:bg-gray-100 text-[#6B7280]' : 'text-[#C8C8C8] cursor-default'}`}
        >
          <svg
            className={`w-4 h-4 transition-transform ${open ? 'rotate-180' : ''}`}
            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {open && hasContent && (
        <div className="px-5 py-3 bg-gray-50 space-y-2">
          {curriculumDay.daily_goal && (
            <p className="text-sm text-[#374151]">{curriculumDay.daily_goal}</p>
          )}
          {curriculumDay.learning_objectives?.length > 0 && (
            <ul className="space-y-1">
              {curriculumDay.learning_objectives.map((obj, i) => (
                <li key={i} className="text-xs text-[#6B7280] flex gap-2">
                  <span className="text-[#4242EA] flex-shrink-0">•</span>
                  <span>{obj}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

const ScheduleTab = ({ cohorts, selectedCohortId }) => {
  const token = useAuthStore((s) => s.token);
  const [curriculum, setCurriculum] = useState([]);

  const cohort = cohorts?.find(c => c.cohort_id === selectedCohortId);
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric', timeZone: 'America/New_York',
  });

  useEffect(() => {
    if (!selectedCohortId || !token) return;
    fetch(`${API_BASE}/api/external-cohorts/${selectedCohortId}/curriculum`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(data => setCurriculum(Array.isArray(data) ? data : []))
      .catch(() => setCurriculum([]));
  }, [selectedCohortId, token]);

  // Map each schedule weekday to its curriculum day for the current week
  const curriculumByWeekday = SCHEDULE.reduce((acc, row) => {
    const date = dateForWeekday(row.weekday);
    acc[row.weekday] = curriculum.find(d => {
      const dd = typeof d.day_date === 'string' ? d.day_date : d.day_date?.toISOString?.().split('T')[0];
      return dd === date;
    }) || null;
    return acc;
  }, {});

  return (
    <div className="space-y-4 max-w-lg">
      <div className="text-sm text-[#6B7280]">{today}</div>

      {cohort && (
        <div className="text-base font-bold text-[#1A1A1A]">{cohort.name}</div>
      )}

      <Card className="bg-white border border-[#C8C8C8]">
        <CardContent className="p-0 divide-y divide-[#E3E3E3]">
          {SCHEDULE.map((row) => (
            <ScheduleRow
              key={row.day}
              row={row}
              curriculumDay={curriculumByWeekday[row.weekday]}
            />
          ))}
        </CardContent>
      </Card>

      <p className="text-xs text-[#6B7280]">
        Times are placeholders — confirm with cohort calendar before each week.
      </p>
    </div>
  );
};

export default ScheduleTab;
