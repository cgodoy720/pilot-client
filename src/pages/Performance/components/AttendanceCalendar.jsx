import React, { useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '../../../components/ui/avatar';
import { Badge } from '../../../components/ui/badge';
import { Card, CardContent } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Progress } from '../../../components/ui/progress';
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

  // Calculate attendance statistics
  const attendanceStats = useMemo(() => {
    const startDate = new Date(year, month, 1).toISOString().split('T')[0];
    const endDate = new Date(year, month + 1, 0).toISOString().split('T')[0];
    
    // For now, calculate from the provided attendance data
    const classAttendance = attendanceData.filter(record => {
      const recordDate = new Date(record.date);
      const recordMonth = recordDate.getMonth();
      const recordYear = recordDate.getFullYear();
      return recordMonth === month && recordYear === year;
    });
    
    const present = classAttendance.filter(r => r.status === 'present').length;
    const late = classAttendance.filter(r => r.status === 'late').length;
    const excused = classAttendance.filter(r => r.status === 'excused').length;
    const attended = present + late + excused;
    
    // Count total class days in the month
    const totalClassDays = calendarWeeks
      .flatMap(week => week.days)
      .filter(day => day.isCurrentMonth && day.isClassDay).length;
    
    const attendanceRate = totalClassDays > 0 ? Math.round((attended / totalClassDays) * 100) : 0;
    
    return {
      attended,
      totalClassDays,
      attendanceRate,
      present,
      late,
      excused,
      absent: totalClassDays - attended
    };
  }, [attendanceData, month, year, calendarWeeks]);

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

  const getStatusColor = (status) => {
    switch (status) {
      case 'present': return 'bg-blue-500';
      case 'late': return 'bg-orange-500';
      case 'excused': return 'bg-purple-500';
      case 'absent': return 'bg-gray-400';
      default: return 'bg-gray-200';
    }
  };

  const getStatusDot = (status) => {
    return (
      <div 
        className={`w-3 h-3 rounded-full ${getStatusColor(status)} absolute -top-1 -right-1 border-2 border-white`}
      />
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
    <div className="flex flex-col h-full gap-6">
      {/* Attendance Summary */}
      <div className="flex items-center gap-6 p-4 bg-muted/10 rounded-xl border border-border">
        <div className="flex-shrink-0">
          <div className="relative w-20 h-20 flex items-center justify-center">
            {/* Circular Progress Background */}
            <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 80 80">
              <circle
                cx="40"
                cy="40"
                r="30"
                stroke="hsl(var(--muted))"
                strokeWidth="6"
                fill="none"
              />
              <circle
                cx="40"
                cy="40"
                r="30"
                stroke="hsl(var(--primary))"
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
              <span className="text-2xl font-bold text-primary">
                {attendanceStats.attendanceRate}%
              </span>
            </div>
          </div>
        </div>
        <div className="flex-1">
          <p className="text-muted-foreground text-sm mb-1">You've attended</p>
          <p className="text-foreground text-lg font-medium">
            <span className="font-bold">{attendanceStats.attended} / {attendanceStats.totalClassDays}</span> Days
          </p>
        </div>
      </div>

      {/* Month Header */}
      <div className="flex items-center justify-between px-2">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handlePrevMonth}
          className="p-2 hover:bg-muted rounded-md"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        
        <h2 className="text-xl font-semibold text-foreground">
          {MONTH_NAMES[month]} {year}
        </h2>
        
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handleNextMonth}
          className="p-2 hover:bg-muted rounded-md"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Week Days Header */}
      <div className="grid grid-cols-7 gap-0.5 pb-2 border-b border-border">
        {WEEKDAY_NAMES.map(day => (
          <div key={day} className="text-center text-xs font-semibold text-muted-foreground py-2 uppercase tracking-wider">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="flex-1 flex flex-col gap-0.5 min-h-0">
        {calendarWeeks.map((week, weekIdx) => (
          <div key={weekIdx} className="grid grid-cols-7 gap-0.5 flex-1">
            {week.days.map((day, dayIdx) => (
              <div
                key={dayIdx}
                className={`
                  bg-card border border-border rounded-lg flex flex-col relative min-h-[60px] transition-all hover:bg-muted/50
                  ${day.isCurrentMonth ? '' : 'opacity-40 bg-muted/30'}
                  ${!day.isClassDay ? 'bg-muted/20' : ''}
                `}
              >
                <div className="absolute top-1 left-1.5 text-xs font-medium text-foreground z-10">
                  {day.dayOfMonth}
                </div>
                
                {/* User Photo and Status for Attended Days */}
                {day.isClassDay && day.attendanceStatus && ['present', 'late', 'excused'].includes(day.attendanceStatus) && (
                  <div className="flex-1 flex items-center justify-center pt-5">
                    <div className="relative">
                      <Avatar className="w-8 h-8 border-2 border-background">
                        <AvatarImage src={userPhoto} alt="User" />
                        <AvatarFallback className="bg-primary text-primary-foreground text-xs font-semibold">
                          {formatUserInitials('User')}
                        </AvatarFallback>
                      </Avatar>
                      {getStatusDot(day.attendanceStatus)}
                    </div>
                  </div>
                )}
                
                {/* Status indicator for absent class days */}
                {day.isClassDay && (!day.attendanceStatus || day.attendanceStatus === 'absent') && (
                  <div className="flex-1 flex items-center justify-center pt-5">
                    <div className={`w-3 h-3 rounded-full ${getStatusColor('absent')}`} />
                  </div>
                )}
                
                {/* No class indicator */}
                {!day.isClassDay && day.isCurrentMonth && (
                  <div className="flex-1 flex items-center justify-center pt-5">
                    <span className="text-xs text-muted-foreground text-center leading-tight">No Class</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 p-4 bg-muted/10 rounded-lg border border-border">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <div className="w-3 h-3 rounded-full bg-blue-500" />
          <span>Present</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <div className="w-3 h-3 rounded-full bg-orange-500" />
          <span>Late</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <div className="w-3 h-3 rounded-full bg-purple-500" />
          <span>Excused</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <div className="w-3 h-3 rounded-full bg-gray-400" />
          <span>Absent</span>
        </div>
      </div>
    </div>
  );
};

export default AttendanceCalendar;
