import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Layout from '../../components/Layout/Layout';
import CalendarHeader from './components/CalendarHeader';
import WeekView from './components/WeekView';
import { ScrollArea } from '../../components/ui/scroll-area';

function Calendar() {
  const [weeksData, setWeeksData] = useState([]);
  const [userProgress, setUserProgress] = useState({});
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [currentDayId, setCurrentDayId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { token, user } = useAuth();
  const navigate = useNavigate();
  const [cohortFilter, setCohortFilter] = useState(null);

  // Fetch all curriculum data (weeks, days, tasks) in ONE optimized call
  useEffect(() => {
    const fetchCalendarData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        let url = `${import.meta.env.VITE_API_URL}/api/curriculum/calendar`;
        if (user.role === 'staff' || user.role === 'admin') {
          if (cohortFilter) {
            url += `?cohort=${cohortFilter}`;
          }
        }
        
        const response = await fetch(url, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch calendar data');
        }
        
        const weeksWithTasks = await response.json();
        setWeeksData(weeksWithTasks);
        
        // Determine current day
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const allDays = weeksWithTasks.flatMap(week => week.days);
        const todayDay = allDays.find(day => {
          const dayDate = new Date(day.day_date);
          dayDate.setHours(0, 0, 0, 0);
          return dayDate.getTime() === today.getTime();
        });
        
        if (todayDay) {
          setCurrentDayId(todayDay.id);
        }
        
      } catch (error) {
        console.error('Error fetching calendar data:', error);
        setError('Failed to load calendar data. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    
    if (token) {
      fetchCalendarData();
    }
  }, [token, cohortFilter, user.role]);

  // Fetch user progress in ONE batch call
  useEffect(() => {
    const fetchUserProgress = async () => {
      try {
        // Get all past day IDs
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const pastDays = weeksData
          .flatMap(week => week.days)
          .filter(day => {
            const dayDate = new Date(day.day_date);
            dayDate.setHours(0, 0, 0, 0);
            return dayDate < today;
          });
        
        if (pastDays.length === 0) {
          return;
        }
        
        const dayIds = pastDays.map(d => d.id);
        
        // Batch fetch progress for all past days in ONE call
        const progressResponse = await fetch(
          `${import.meta.env.VITE_API_URL}/api/progress/days/batch`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ dayIds })
          }
        );
        
        if (progressResponse.ok) {
          const progressMap = await progressResponse.json();
          setUserProgress(progressMap);
        }
      } catch (error) {
        console.error('Error fetching user progress:', error);
      }
    };
    
    if (weeksData.length > 0 && token) {
      fetchUserProgress();
    }
  }, [weeksData, token]);

  const handlePrevMonth = useCallback(() => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  }, [currentMonth, currentYear]);

  const handleNextMonth = useCallback(() => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  }, [currentMonth, currentYear]);

  const handleMonthChange = useCallback((newMonth) => {
    setCurrentMonth(newMonth);
  }, []);

  const handleDayClick = useCallback((dayId) => {
    navigate(`/learning?dayId=${dayId}`);
  }, [navigate]);

  // Memoize calendar grid generation - only recalculate when dependencies change
  const calendarWeeks = useMemo(() => {
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
    const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);
    
    // Get day of week for first day (0=Sunday, 6=Saturday)
    const firstDayOfWeek = firstDayOfMonth.getDay();
    
    // Calculate days to show from previous month
    const daysFromPrevMonth = firstDayOfWeek === 6 ? 0 : (firstDayOfWeek + 1) % 7;
    
    // Start date is first day minus the padding
    const startDate = new Date(firstDayOfMonth);
    startDate.setDate(startDate.getDate() - daysFromPrevMonth);
    
    // Calculate total days to show (should be multiple of 7)
    const daysInMonth = lastDayOfMonth.getDate();
    const totalDaysNeeded = daysFromPrevMonth + daysInMonth;
    const weeksNeeded = Math.ceil(totalDaysNeeded / 7);
    const totalDays = weeksNeeded * 7;
    
    // Generate array of all dates
    const calendarDates = [];
    const currentDate = new Date(startDate);
    
    for (let i = 0; i < totalDays; i++) {
      const dateObj = new Date(currentDate);
      const dayOfMonth = dateObj.getDate();
      const monthOfDate = dateObj.getMonth();
      const yearOfDate = dateObj.getFullYear();
      
      // Find matching curriculum day if exists
      const curriculumDay = weeksData
        .flatMap(week => week.days)
        .find(day => {
          const dayDate = new Date(day.day_date);
          return dayDate.getFullYear() === yearOfDate &&
                 dayDate.getMonth() === monthOfDate &&
                 dayDate.getDate() === dayOfMonth;
        });
      
      calendarDates.push({
        date: new Date(dateObj),
        dayOfMonth: dayOfMonth,
        dayOfWeek: dateObj.getDay(),
        isCurrentMonth: monthOfDate === currentMonth && yearOfDate === currentYear,
        isPreviousMonth: (yearOfDate < currentYear) || (yearOfDate === currentYear && monthOfDate < currentMonth),
        isNextMonth: (yearOfDate > currentYear) || (yearOfDate === currentYear && monthOfDate > currentMonth),
        curriculumDay: curriculumDay || null,
        hasClass: !!curriculumDay,
        tasks: curriculumDay?.tasks || [],
        weekNumber: curriculumDay?.week || null
      });
      
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    // Group by weeks (7 days each)
    const weeks = [];
    for (let i = 0; i < calendarDates.length; i += 7) {
      const weekDays = calendarDates.slice(i, i + 7);
      
      // Determine week number (use the first curriculum day's week number in this week)
      const weekNumber = weekDays.find(d => d.weekNumber)?.weekNumber || null;
      
      // Get weekly goal if this week has curriculum days
      const weeklyGoal = weekNumber ? 
        weeksData.find(w => w.weekNumber === weekNumber)?.weeklyGoal : null;
      
      weeks.push({
        weekNumber,
        weeklyGoal,
        days: weekDays
      });
    }
    
    return weeks;
  }, [weeksData, currentMonth, currentYear]);

  if (error && !isLoading) {
    return (
      <Layout isLoading={isLoading}>
        <div className="w-full h-full bg-bg-light flex items-center justify-center">
          <div className="text-red-500 font-proxima">{error}</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout isLoading={isLoading}>
      <div className="w-full h-full bg-bg-light flex flex-col">
        {/* Error State */}
        {error && (
          <div className="p-4 mx-6 mt-6 bg-destructive/10 border border-destructive/20 rounded-lg">
            <p className="text-destructive text-sm">{error}</p>
          </div>
        )}
        
        {/* Calendar Header */}
        <CalendarHeader
          currentMonth={currentMonth}
          currentYear={currentYear}
          onPrevMonth={handlePrevMonth}
          onNextMonth={handleNextMonth}
          onMonthChange={handleMonthChange}
          cohortFilter={cohortFilter}
          onCohortChange={setCohortFilter}
          userRole={user?.role}
        />
        
        {/* Weeks List */}
        <ScrollArea className="flex-1 px-[85px] py-[20px]">
          <div className="flex flex-col gap-[34px]">
            {calendarWeeks.map((week, idx) => (
              <WeekView
                key={idx}
                weekNumber={week.weekNumber}
                weeklyGoal={week.weeklyGoal}
                days={week.days}
                onDayClick={handleDayClick}
                currentDayId={currentDayId}
                userProgress={userProgress}
                currentMonth={currentMonth}
                currentYear={currentYear}
              />
            ))}
          </div>
        </ScrollArea>
      </div>
    </Layout>
  );
}

export default Calendar;
