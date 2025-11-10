import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
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

  // Fetch all curriculum days and group by week
  useEffect(() => {
    const fetchCalendarData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        let url = `${import.meta.env.VITE_API_URL}/api/curriculum/days`;
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
          throw new Error('Failed to fetch curriculum days');
        }
        
        const allDays = await response.json();
        
        // Group days by week number
        const weekMap = {};
        allDays.forEach(day => {
          if (!weekMap[day.week]) {
            weekMap[day.week] = {
              weekNumber: day.week,
              weeklyGoal: day.weekly_goal,
              days: []
            };
          }
          weekMap[day.week].days.push(day);
        });
        
        // Convert to array and sort by week number
        const weeks = Object.values(weekMap).sort((a, b) => a.weekNumber - b.weekNumber);
        
        // For each week, fetch tasks for each day
        const weeksWithTasks = await Promise.all(
          weeks.map(async (week) => {
            const daysWithTasks = await Promise.all(
              week.days.map(async (day) => {
                try {
                  const tasksResponse = await fetch(
                    `${import.meta.env.VITE_API_URL}/api/curriculum/weeks/${week.weekNumber}`,
                    {
                      headers: {
                        'Authorization': `Bearer ${token}`
                      }
                    }
                  );
                  
                  if (tasksResponse.ok) {
                    const weekData = await tasksResponse.json();
                    const dayData = weekData.find(d => d.id === day.id);
                    return {
                      ...day,
                      tasks: dayData?.tasks || []
                    };
                  }
                  
                  return { ...day, tasks: [] };
                } catch (err) {
                  console.error(`Error fetching tasks for day ${day.id}:`, err);
                  return { ...day, tasks: [] };
                }
              })
            );
            
            return {
              ...week,
              days: daysWithTasks
            };
          })
        );
        
        setWeeksData(weeksWithTasks);
        
        // Determine current day
        const today = new Date();
        today.setHours(0, 0, 0, 0);
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

  // Fetch user progress for past days
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
        
        // Fetch progress for each past day
        const progressMap = {};
        await Promise.all(
          pastDays.map(async (day) => {
            try {
              const progressResponse = await fetch(
                `${import.meta.env.VITE_API_URL}/api/progress/days/${day.id}/tasks`,
                {
                  headers: {
                    'Authorization': `Bearer ${token}`
                  }
                }
              );
              
              if (progressResponse.ok) {
                const progress = await progressResponse.json();
                progressMap[day.id] = progress;
              }
            } catch (err) {
              console.error(`Error fetching progress for day ${day.id}:`, err);
            }
          })
        );
        
        setUserProgress(progressMap);
      } catch (error) {
        console.error('Error fetching user progress:', error);
      }
    };
    
    if (weeksData.length > 0 && token) {
      fetchUserProgress();
    }
  }, [weeksData, token]);

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const handleMonthChange = (newMonth) => {
    setCurrentMonth(newMonth);
  };

  const handleDayClick = (dayId) => {
    navigate(`/learning?dayId=${dayId}`);
  };

  // Generate full calendar grid for the month
  const generateCalendarGrid = () => {
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
    const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);
    
    // Get day of week for first day (0=Sunday, 6=Saturday)
    // We want Saturday (6) to be first, so adjust
    const firstDayOfWeek = firstDayOfMonth.getDay();
    
    // Calculate days to show from previous month
    // If month starts on Saturday (6), no padding needed
    // If month starts on Sunday (0), need 1 day padding
    // If month starts on Monday (1), need 2 days padding, etc.
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
  };

  const calendarWeeks = generateCalendarGrid();

  if (isLoading) {
    return (
      <div className="w-full h-full bg-bg-light flex items-center justify-center">
        <div className="text-carbon-black font-proxima">Loading calendar data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-full bg-bg-light flex items-center justify-center">
        <div className="text-red-500 font-proxima">{error}</div>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-bg-light flex flex-col">
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
  );
}

export default Calendar;
