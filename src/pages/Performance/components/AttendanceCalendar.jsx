import React, { useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '../../../components/ui/avatar';
import { Badge } from '../../../components/ui/badge';
import { Card, CardContent } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Progress } from '../../../components/ui/progress';
import ArrowButton from '../../../components/ArrowButton/ArrowButton';
import { generateCalendarWeeks, getAttendanceStatistics } from '../../../utils/attendanceService';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const WEEKDAY_NAMES = ['SAT', 'SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI'];

const AttendanceCalendar = ({ 
  userId, 
  month, 
  year, 
  userPhoto, 
  attendanceData, 
  onMonthChange, 
  onYearChange 
}) => {
  // Generate calendar weeks with Saturday-Friday structure
  const calendarWeeks = useMemo(() => {
    return generateCalendarWeeks(month, year, attendanceData);
  }, [month, year, attendanceData]);

  // Calculate attendance statistics based on actual attendance data
  const attendanceStats = useMemo(() => {
    // Use the attendance data directly since it's already filtered by curriculum
    const classAttendance = attendanceData.filter(record => {
      const recordDate = new Date(record.date);
      const recordMonth = recordDate.getMonth();
      const recordYear = recordDate.getFullYear();
      return recordMonth === month && recordYear === year;
    });
    
    const present = classAttendance.filter(r => r.status === 'present').length;
    const late = classAttendance.filter(r => r.status === 'late').length;
    const excused = classAttendance.filter(r => r.status === 'excused').length;
    const absent = classAttendance.filter(r => r.status === 'absent').length;
    const attended = present + late + excused;
    
    // Total class days is the length of attendance data (curriculum-based)
    const totalClassDays = classAttendance.length;
    
    const attendanceRate = totalClassDays > 0 ? Math.round((attended / totalClassDays) * 100) : 0;
    
    return {
      attended,
      totalClassDays,
      attendanceRate,
      present,
      late,
      excused,
      absent
    };
  }, [attendanceData, month, year]);

  const handlePrevMonth = () => {
    if (month === 0) {
      onMonthChange(11);
      onYearChange(year - 1);
    } else {
      onMonthChange(month - 1);
    }
  };

  const handleNextMonth = () => {
    if (month === 11) {
      onMonthChange(0);
      onYearChange(year + 1);
    } else {
      onMonthChange(month + 1);
    }
  };

  const getStatusDot = (status) => {
    const colors = {
      'present': 'bg-blue-500',
      'late': 'bg-orange-500', 
      'excused': 'bg-purple-500',
      'absent': 'bg-gray-400'
    };
    
    return (
      <div className={`w-2 h-2 rounded-full ${colors[status] || 'bg-gray-200'}`} />
    );
  };

  const formatUserInitials = (name) => {
    if (!name) return 'U';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return parts[0][0].toUpperCase();
  };

  return (
    <div className="flex flex-col h-full">
      {/* Title */}
      <h2 className="text-3xl font-bold text-[#1F2937] mb-4" style={{ fontFamily: 'var(--font-family-bold)' }}>Persistence</h2>
      
      {/* Attendance Summary */}
      <div className="flex items-center gap-6 mb-4">
        <div className="flex-shrink-0">
          <div className="relative w-20 h-20 flex items-center justify-center">
            {/* Circular Progress Background */}
            <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 80 80">
              <circle
                cx="40"
                cy="40"
                r="30"
                stroke="#E5E7EB"
                strokeWidth="6"
                fill="none"
              />
              <circle
                cx="40"
                cy="40"
                r="30"
                stroke="#4242EA"
                strokeWidth="6"
                fill="none"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 30}`}
                strokeDashoffset={`${2 * Math.PI * 30 * (1 - attendanceStats.attendanceRate / 100)}`}
                className="transition-all duration-500"
              />
            </svg>
            {/* Percentage Text */}
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-2xl font-bold text-[#4242EA]">
                {attendanceStats.attendanceRate}%
              </span>
            </div>
          </div>
        </div>
        <div className="flex-1">
          <p className="text-[#6B7280] text-sm mb-1">You've attended</p>
          <p className="text-[#1F2937] text-lg font-medium">
            <span className="font-bold">{attendanceStats.attended} / {attendanceStats.totalClassDays}</span> Days
          </p>
        </div>
      </div>

      {/* Month and Year Header */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-2xl font-bold text-[#1F2937]">
          {MONTH_NAMES[month]}
        </h3>
        <div className="text-lg font-semibold text-[#6B7280]">
          {year}
        </div>
      </div>

      {/* Week Days Header */}
      <div className="grid grid-cols-[30px_repeat(7,1fr)] gap-[2px] mb-1">
        <div></div> {/* Narrow space - week labels are absolutely positioned */}
        {WEEKDAY_NAMES.map(day => (
          <div key={day} className="text-center text-xs font-bold text-[#6B7280] py-2 uppercase tracking-wider">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid with Week Labels */}
      <div className="flex-1 flex flex-col gap-[2px] min-h-0 relative">
        {/* Week Labels - Positioned absolutely at far left edge (left-0) */}
        <div className="absolute left-0 top-0 flex flex-col pointer-events-none">
          {calendarWeeks.map((week, weekIdx) => (
            <div 
              key={weekIdx} 
              className="flex items-center justify-start pl-1"
              style={{ 
                height: weekIdx === calendarWeeks.length - 1 ? '85px' : 'calc(85px + 2px)'
              }}
            >
              <span 
                className="text-xs font-bold text-[#6B7280]"
                style={{
                  writingMode: 'vertical-rl',
                  textOrientation: 'mixed',
                  transform: 'rotate(180deg)'
                }}
              >
                WEEK {String(weekIdx + 1).padStart(2, '0')}
              </span>
            </div>
          ))}
        </div>

        {/* Calendar Rows */}
        {calendarWeeks.map((week, weekIdx) => (
          <div key={weekIdx} className="grid grid-cols-[30px_repeat(7,1fr)] gap-[2px] h-[85px]">
            {/* Narrow space - week labels overlay this */}
            <div className="flex items-center justify-center">
              {/* Week label is absolutely positioned at left-0, this is just minimal spacing */}
            </div>
            
            {/* Week Days */}
            {week.days.map((day, dayIdx) => (
              <div
                key={dayIdx}
                className={`
                  rounded-[20px] flex flex-col relative h-[85px] p-[11px_8px_8px_11px] transition-all overflow-hidden
                  ${day.isCurrentMonth ? 'bg-[#F3F4F6]' : 'bg-[#F9FAFB] opacity-50'}
                  ${!day.isClassDay && day.isCurrentMonth ? 'bg-[#F9FAFB]' : ''}
                `}
              >
                {/* Date and Status Dot - Overlay on top of photo */}
                <div className="flex items-center gap-1 z-20 relative">
                  <span className={`text-sm font-bold drop-shadow-lg ${
                    day.isClassDay && day.attendanceStatus && ['present', 'late', 'excused'].includes(day.attendanceStatus) 
                      ? 'text-white' 
                      : 'text-black'
                  }`}>
                    {String(day.dayOfMonth).padStart(2, '0')}
                  </span>
                  {day.isClassDay && day.attendanceStatus && (
                    getStatusDot(day.attendanceStatus)
                  )}
                </div>
                
                {/* User Photo Background for Attended Days */}
                {day.isClassDay && day.attendanceStatus && ['present', 'late', 'excused'].includes(day.attendanceStatus) && userPhoto && (
                  <div 
                    className="absolute inset-0 rounded-[20px] bg-cover bg-center bg-no-repeat"
                    style={{
                      backgroundImage: `url(${userPhoto})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center'
                    }}
                  />
                )}
                
                {/* Fallback for attended days without photo */}
                {day.isClassDay && day.attendanceStatus && ['present', 'late', 'excused'].includes(day.attendanceStatus) && !userPhoto && (
                  <div className="absolute inset-0 rounded-[20px] bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
                    <span className="text-white text-2xl font-bold">
                      {formatUserInitials('User')}
                    </span>
                  </div>
                )}
                
                {/* No Class Text */}
                {!day.isClassDay && day.isCurrentMonth && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xs text-[#9CA3AF] text-center leading-tight">
                      No Class
                    </span>
                  </div>
                )}
                
                {/* Absent Days - Show empty space with just the dot */}
                {day.isClassDay && (!day.attendanceStatus || day.attendanceStatus === 'absent') && (
                  <div className="flex-1"></div>
                )}
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-center gap-4 mt-6">
        <ArrowButton
          onClick={handlePrevMonth}
          rotation={180}
          borderColor="#E5E7EB"
          backgroundColor="transparent"
          arrowColor="#6B7280"
          hoverBackgroundColor="#F3F4F6"
          hoverArrowColor="#4242EA"
          size="md"
        />
        <span className="text-sm font-medium text-[#6B7280] px-4">
          {MONTH_NAMES[month]}
        </span>
        <ArrowButton
          onClick={handleNextMonth}
          borderColor="#E5E7EB"
          backgroundColor="transparent"
          arrowColor="#6B7280"
          hoverBackgroundColor="#F3F4F6"
          hoverArrowColor="#4242EA"
          size="md"
        />
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 mt-4">
        <div className="flex items-center gap-2 text-sm text-[#6B7280]">
          <div className="w-3 h-3 rounded-full bg-blue-500" />
          <span>Present</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-[#6B7280]">
          <div className="w-3 h-3 rounded-full bg-orange-500" />
          <span>Late</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-[#6B7280]">
          <div className="w-3 h-3 rounded-full bg-purple-500" />
          <span>Excused</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-[#6B7280]">
          <div className="w-3 h-3 rounded-full bg-gray-400" />
          <span>Absent</span>
        </div>
      </div>
    </div>
  );
};

export default AttendanceCalendar;
