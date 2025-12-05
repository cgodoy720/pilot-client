import React, { useMemo } from 'react';
import { ChevronLeft, ChevronRight, Flame, Ghost } from 'lucide-react';
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
  programInfo,
  onMonthChange, 
  onYearChange 
}) => {
  // Generate calendar weeks with Saturday-Friday structure and program week numbers
  const calendarWeeks = useMemo(() => {
    const programStartDate = programInfo?.programStartDate ? new Date(programInfo.programStartDate) : null;
    return generateCalendarWeeks(month, year, attendanceData, programStartDate);
  }, [month, year, attendanceData, programInfo]);

  // Calculate attendance statistics based on actual attendance data
  const attendanceStats = useMemo(() => {
    const today = new Date();
    today.setHours(23, 59, 59, 999); // End of today
    
    // Filter to only include days up to and including today (exclude future days)
    const classAttendance = attendanceData.filter(record => {
      const recordDate = new Date(record.date);
      const recordMonth = recordDate.getMonth();
      const recordYear = recordDate.getFullYear();
      return recordMonth === month && recordYear === year && recordDate <= today;
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
    // Purple (#4242EA) for present/late, Pink for absent
    const colors = {
      'present': 'bg-[#4242EA]',
      'late': 'bg-[#4242EA]', 
      'excused': 'bg-[#4242EA]',
      'absent': 'bg-[var(--color-mastery-pink)]' // Mastery Pink
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
    <div className="flex flex-col h-full pb-7">
      {/* Title */}
      <h2 className="text-2xl font-bold text-[#1F2937] mb-3" style={{ fontFamily: 'var(--font-family-bold)' }}>Persistence</h2>
      
      {/* Attendance Summary - Figma style */}
      <div className="flex items-center justify-between gap-4 mb-3 bg-white rounded-full py-1.5 px-3 border border-[#E5E7EB]">
        {/* Left side: Circular Progress with Percentage */}
        <div className="flex items-center gap-2">
          <div className="flex-shrink-0">
            {/* Attendance Badge - Circle */}
            <div className="relative w-12 h-12">
              {/* Circle Background */}
              <div className="absolute inset-0 rounded-full bg-[#4242EA]"></div>
              {/* Conditional Icon */}
              {attendanceStats.attendanceRate >= 80 ? (
                <Flame className="absolute inset-0 w-full h-full p-2.5" color="white" strokeWidth={2.5} />
              ) : (
                <Ghost className="absolute inset-0 w-full h-full p-2.5" color="white" strokeWidth={2.5} />
              )}
            </div>
          </div>
          <div className="text-4xl font-bold text-[#1E1E1E]" style={{ fontFamily: 'var(--font-family-bold)' }}>
            {attendanceStats.attendanceRate}%
          </div>
        </div>
        
        {/* Right side: You've attended text */}
        <div className="text-left">
          <p className="text-[var(--color-carbon-black)] text-base leading-tight">You've attended</p>
          <p className="text-lg text-[var(--color-carbon-black)] leading-tight" style={{ fontFamily: 'var(--font-family-bold)' }}>
            {attendanceStats.attended} / {attendanceStats.totalClassDays} <span className="font-normal text-sm">Days</span>
          </p>
        </div>
      </div>

      {/* Month and Year Header */}
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-bold text-[var(--color-carbon-black)]" style={{ fontFamily: 'var(--font-family-bold)' }}>
          {MONTH_NAMES[month]}
        </h3>
        <div className="text-lg font-semibold text-[var(--color-carbon-black)]">
          {year}
        </div>
      </div>

      {/* Week Days Header */}
      <div className="grid grid-cols-[30px_repeat(7,1fr)] gap-1 mb-1">
        <div></div> {/* Narrow space - week labels are absolutely positioned */}
        {WEEKDAY_NAMES.map(day => (
          <div key={day} className="text-center text-xs font-bold text-[#6B7280] py-2 uppercase tracking-wider">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid with Week Labels */}
      <div className="flex flex-col gap-1 relative">
        {/* Week Labels - Positioned absolutely at far left edge (left-0) */}
        <div className="absolute left-0 top-0 flex flex-col gap-1 pointer-events-none">
          {calendarWeeks.map((week, weekIdx) => (
            <div 
              key={weekIdx} 
              className="flex items-center justify-center h-[95px]"
            >
              {week.programWeek !== null && (
                <div className="bg-white rounded-full border border-[#E5E7EB] h-[95px] flex items-center justify-center px-1">
                  <span 
                    className="text-xs font-bold text-[var(--color-carbon-black)]"
                    style={{
                      writingMode: 'vertical-rl',
                      textOrientation: 'mixed',
                      transform: 'rotate(180deg)',
                      fontFamily: 'var(--font-family-bold)'
                    }}
                  >
                    WEEK {String(week.programWeek).padStart(2, '0')}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Calendar Rows */}
        {calendarWeeks.map((week, weekIdx) => (
          <div key={weekIdx} className="grid grid-cols-[30px_repeat(7,1fr)] gap-1 h-[95px]">
            {/* Narrow space - week labels overlay this */}
            <div className="flex items-center justify-center">
              {/* Week label is absolutely positioned at left-0, this is just minimal spacing */}
            </div>
            
            {/* Week Days */}
            {week.days.map((day, dayIdx) => (
              <div
                key={dayIdx}
                className={`
                  rounded-[20px] flex flex-col relative h-[95px] p-[5px_8px_8px_11px] transition-all overflow-hidden
                  ${day.isCurrentMonth ? 'bg-[#E3E3E3]' : 'bg-[#E3E3E3] opacity-50'}
                  ${!day.isClassDay && day.isCurrentMonth ? 'bg-[#E3E3E3]' : ''}
                `}
              >
                {/* Date and Status Dot - Overlay on top of photo */}
                <div className="flex items-center gap-1 z-20 relative">
                  <span className={`text-sm font-bold ${
                    day.isClassDay && day.attendanceStatus && ['present', 'late', 'excused'].includes(day.attendanceStatus) 
                      ? 'text-black' 
                      : 'text-black'
                  }`}>
                    {String(day.dayOfMonth).padStart(2, '0')}
                  </span>
                  {day.isClassDay && day.attendanceStatus && (
                    getStatusDot(day.attendanceStatus)
                  )}
                </div>
                
                {/* Daily Photo Background for Attended Days - Uses check-in photo from that day */}
                {day.isClassDay && day.attendanceStatus && ['present', 'late', 'excused'].includes(day.attendanceStatus) && (day.attendanceRecord?.photoUrl || userPhoto) && (
                  <div 
                    className="absolute bottom-0 left-0 right-0 rounded-b-[20px] bg-cover bg-no-repeat"
                    style={{
                      backgroundImage: `url(${day.attendanceRecord?.photoUrl || userPhoto})`,
                      backgroundSize: '120%',
                      backgroundPosition: 'top center',
                      height: '75%'
                    }}
                  />
                )}
                
                {/* Fallback for attended days without any photo - Bottom 75% */}
                {day.isClassDay && day.attendanceStatus && ['present', 'late', 'excused'].includes(day.attendanceStatus) && !day.attendanceRecord?.photoUrl && !userPhoto && (
                  <div className="absolute bottom-0 left-0 right-0 rounded-b-[20px] bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center" style={{ height: '75%' }}>
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

      {/* Navigation Buttons - Inline with Month/Year */}
      <div className="flex items-center justify-between mt-4">
        {/* Previous Month Button - Aligned with Month name */}
        <div className="flex items-center gap-2">
          <ArrowButton
            onClick={handlePrevMonth}
            rotation={180}
            borderColor="#4242EA"
            backgroundColor="#EFEFEF"
            arrowColor="#4242EA"
            hoverBackgroundColor="#4242EA"
            hoverArrowColor="#FFFFFF"
            size="md"
            className="!w-[32px] !h-[32px] !rounded-[8px]"
            useChevron={true}
            strokeWidth={0.8}
          />
          <span className="text-sm font-bold text-[var(--color-carbon-black)]" style={{ fontFamily: 'var(--font-family-bold)' }}>
            {MONTH_NAMES[month === 0 ? 11 : month - 1]}
          </span>
        </div>
        
        {/* Next Month Button - Aligned with Year */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-[var(--color-carbon-black)]" style={{ fontFamily: 'var(--font-family-bold)' }}>
            {MONTH_NAMES[month === 11 ? 0 : month + 1]}
          </span>
          <ArrowButton
            onClick={handleNextMonth}
            borderColor="#4242EA"
            backgroundColor="#EFEFEF"
            arrowColor="#4242EA"
            hoverBackgroundColor="#4242EA"
            hoverArrowColor="#FFFFFF"
            size="md"
            className="!w-[32px] !h-[32px] !rounded-[8px]"
            useChevron={true}
            strokeWidth={0.8}
          />
        </div>
      </div>
    </div>
  );
};

export default AttendanceCalendar;
