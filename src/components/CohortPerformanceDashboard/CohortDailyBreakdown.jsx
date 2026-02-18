import React, { useEffect, useMemo, useState } from 'react';
import { Calendar, ChevronLeft, ChevronRight, TrendingUp, TrendingDown } from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';

const CohortDailyBreakdown = ({ 
  dailyBreakdown, 
  cohort, 
  requirement, 
  onDayClick,
  loading = false 
}) => {
  const formatDateKey = (dateValue) => {
    if (!dateValue) return '';
    if (typeof dateValue === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateValue)) {
      return dateValue;
    }
    const parsed = dateValue instanceof Date ? dateValue : new Date(dateValue);
    if (Number.isNaN(parsed.getTime())) return '';
    return parsed.toISOString().split('T')[0];
  };

  const getTodayEasternDateKey = () => {
    const formatter = new Intl.DateTimeFormat('en-CA', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      timeZone: 'America/New_York'
    });
    return formatter.format(new Date());
  };

  const [currentMonthDate, setCurrentMonthDate] = useState(new Date());

  useEffect(() => {
    // Reset to the current month whenever cohort selection changes.
    // This avoids jumping to the first historical month in the dataset.
    setCurrentMonthDate(new Date());
  }, [cohort]);

  const attendanceByDate = useMemo(() => {
    const map = new Map();
    dailyBreakdown.forEach((day) => {
      const dateKey = formatDateKey(day.date);
      if (dateKey) map.set(dateKey, day);
    });
    return map;
  }, [dailyBreakdown]);

  const calendarDays = useMemo(() => {
    const todayEasternKey = getTodayEasternDateKey();
    const firstOfMonth = new Date(currentMonthDate.getFullYear(), currentMonthDate.getMonth(), 1);
    const lastOfMonth = new Date(currentMonthDate.getFullYear(), currentMonthDate.getMonth() + 1, 0);

    const start = new Date(firstOfMonth);
    start.setDate(start.getDate() - start.getDay());
    const end = new Date(lastOfMonth);
    end.setDate(end.getDate() + (6 - end.getDay()));

    const days = [];
    const cursor = new Date(start);

    while (cursor <= end) {
      const dateString = formatDateKey(cursor);
      days.push({
        date: new Date(cursor),
        dateString,
        record: attendanceByDate.get(dateString) || null,
        isCurrentMonth: cursor.getMonth() === currentMonthDate.getMonth(),
        isToday: todayEasternKey === dateString,
        isFuture: dateString > todayEasternKey
      });
      cursor.setDate(cursor.getDate() + 1);
    }

    return days;
  }, [attendanceByDate, currentMonthDate]);

  if (loading) {
    return (
      <Card className="bg-white border border-slate-200 shadow-sm">
        <CardContent className="p-6">
          <div className="flex items-center justify-center py-12">
            <div className="text-slate-600">Loading daily breakdown...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!dailyBreakdown || dailyBreakdown.length === 0) {
    return (
      <Card className="bg-white border border-slate-200 shadow-sm">
        <CardContent className="p-6">
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Calendar className="h-12 w-12 text-slate-300 mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              No Data Available
            </h3>
            <p className="text-slate-600 max-w-md">
              No attendance data found for the selected timeframe. This may be because there are no curriculum days in this period.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white border border-slate-200 shadow-sm">
      <CardContent className="p-6">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-slate-900">
            Daily Attendance - {cohort}
          </h3>
          <p className="text-sm text-slate-600 mt-1">
            Click on any day to see individual builder status
          </p>
        </div>

        <div className="rounded-lg border border-slate-200">
          <div className="flex items-center gap-2 border-b border-slate-200 bg-slate-50 p-3">
            <button
              type="button"
              onClick={() => {
                const prev = new Date(currentMonthDate);
                prev.setMonth(prev.getMonth() - 1);
                setCurrentMonthDate(prev);
              }}
              className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-slate-300 bg-white text-slate-600 hover:bg-slate-100"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <p className="flex-1 text-center text-sm font-semibold text-slate-900">
              {currentMonthDate.toLocaleDateString([], { month: 'long', year: 'numeric' })}
            </p>
            <button
              type="button"
              onClick={() => {
                const next = new Date(currentMonthDate);
                next.setMonth(next.getMonth() + 1);
                setCurrentMonthDate(next);
              }}
              className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-slate-300 bg-white text-slate-600 hover:bg-slate-100"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((dayLabel) => (
              <div key={dayLabel} className="px-2 py-2 text-center text-xs font-semibold text-slate-600">
                {dayLabel}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7">
            {calendarDays.map((dayCell) => {
              const record = dayCell.record;
              const hasData = !!record;
              const isMeetingRequirement = hasData ? record.attendanceRate >= requirement : false;
              const presentCount = hasData ? record.present + (record.late || 0) : 0;
              const clickable = hasData && dayCell.isCurrentMonth;
              const hideBadge = dayCell.isToday || dayCell.isFuture;
              const showNoStats = dayCell.isFuture;
              const showTodayStats = dayCell.isToday;
              const showPastStats = !dayCell.isToday && !dayCell.isFuture;

              return (
                <button
                  key={dayCell.dateString}
                  type="button"
                  disabled={!clickable}
                  onClick={() => clickable && onDayClick(record)}
                  className={`min-h-[130px] border-b border-r border-slate-200 p-2 text-left transition-colors ${
                    dayCell.isCurrentMonth ? 'bg-white' : 'bg-slate-100 text-slate-400'
                  } ${clickable ? 'hover:bg-slate-50' : 'cursor-default'} ${dayCell.isToday ? 'ring-2 ring-inset ring-[#4242EA]' : ''}`}
                >
                  <div className="flex items-start justify-between">
                    <span className="text-xs font-semibold">{dayCell.date.getDate()}</span>
                    {hasData && !hideBadge && (
                      <Badge
                        className={`text-[10px] ${
                          isMeetingRequirement
                            ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
                            : 'bg-amber-100 text-amber-700 border-amber-200'
                        }`}
                      >
                        {isMeetingRequirement ? 'On Track' : 'Below'}
                      </Badge>
                    )}
                  </div>

                  {hasData && !showNoStats && (
                    <div className="mt-2 space-y-1">
                      <div className="flex items-center justify-between text-[11px] text-slate-600">
                        <span>Day #{record.dayNumber}</span>
                        <div className="flex items-center gap-1 font-semibold">
                          {isMeetingRequirement ? (
                            <TrendingUp className="h-3 w-3 text-emerald-500" />
                          ) : (
                            <TrendingDown className="h-3 w-3 text-red-500" />
                          )}
                          <span className={isMeetingRequirement ? 'text-emerald-600' : 'text-red-600'}>
                            {record.attendanceRate}%
                          </span>
                        </div>
                      </div>
                      {showPastStats && (
                        <div className="grid grid-cols-3 gap-1 text-[11px]">
                          <div className="rounded bg-emerald-50 px-1.5 py-1 text-center text-emerald-700">
                            P {presentCount}
                          </div>
                          <div className="rounded bg-red-50 px-1.5 py-1 text-center text-red-700">
                            A {record.absent}
                          </div>
                          <div className="rounded bg-blue-50 px-1.5 py-1 text-center text-blue-700">
                            E {record.excused}
                          </div>
                        </div>
                      )}
                      {showTodayStats && (
                        <div className="grid grid-cols-2 gap-1 text-[11px]">
                          <div className="rounded bg-emerald-50 px-1.5 py-1 text-center text-emerald-700">
                            P {presentCount}
                          </div>
                          <div className="rounded bg-blue-50 px-1.5 py-1 text-center text-blue-700">
                            E {record.excused}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between text-sm text-slate-600">
          <div className="flex items-center gap-4">
            <span>Total Days: <strong>{dailyBreakdown.length}</strong></span>
            <span className="text-slate-400">|</span>
            <span>
              Target: <strong className="text-slate-900">{requirement}%</strong>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">
              Days meeting target: {dailyBreakdown.filter(d => d.attendanceRate >= requirement).length} / {dailyBreakdown.length}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CohortDailyBreakdown;

