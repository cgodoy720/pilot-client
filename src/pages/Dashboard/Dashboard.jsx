import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, Calendar, BookOpen, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Layout from '../../components/Layout/Layout';
import ArrowButton from '../../components/ArrowButton/ArrowButton';
import MissedAssignmentsSidebar from '../../components/MissedAssignmentsSidebar/MissedAssignmentsSidebar';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import './Dashboard.css';

function Dashboard() {
  const navigate = useNavigate();
  const { token, user } = useAuth();
  
  // Check if user has active status
  const isActive = user?.active !== false;
  // Check if user is volunteer
  const isVolunteer = user?.role === 'volunteer';
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentDay, setCurrentDay] = useState(null);
  const [dailyTasks, setDailyTasks] = useState([]);
  const [objectives, setObjectives] = useState([]);
  const [cohortFilter, setCohortFilter] = useState(null);
  const [missedAssignmentsCount, setMissedAssignmentsCount] = useState(0);
  const [allWeeksData, setAllWeeksData] = useState([]); // Store all weeks from API
  const [currentWeek, setCurrentWeek] = useState(null);
  const [currentLevel, setCurrentLevel] = useState(null);
  const [weeklyGoal, setWeeklyGoal] = useState('');
  const [slideDirection, setSlideDirection] = useState(null); // 'left' or 'right'
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // NEW: Task completion status map for current week
  const [taskCompletionMap, setTaskCompletionMap] = useState({});

  useEffect(() => {
    // Only fetch dashboard data if user is active
    if (isActive) {
      fetchDashboardData();
    } else {
      // If user is inactive, we don't need to load the dashboard data
      setIsLoading(false);
    }
  }, [token, cohortFilter, user?.role, isActive]);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // NEW: Single optimized API call for ALL dashboard data
      let url = `${import.meta.env.VITE_API_URL}/api/progress/dashboard-full`;
      
      // Add cohort parameter for staff/admin if selected
      if ((user?.role === 'staff' || user?.role === 'admin') && cohortFilter) {
        url += `?cohort=${encodeURIComponent(cohortFilter)}`;
      }
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const error = new Error(errorData.error || 'Failed to fetch dashboard data');
        error.response = { status: response.status, data: errorData };
        throw error;
      }
      
      const data = await response.json();
      
      if (data.message === 'No schedule for today') {
        setIsLoading(false);
        return;
      }
      
      // Process the data
      const timeBlocks = data.timeBlocks || [];
      const taskProgress = Array.isArray(data.taskProgress) ? data.taskProgress : [];
      
      // Extract tasks from all time blocks
      const allTasks = [];
      
      timeBlocks.forEach(block => {
        // Add tasks with their completion status
        block.tasks.forEach(task => {
          const taskCompleted = taskProgress.find(
            progress => progress.task_id === task.id
          )?.status === 'completed';
          
          allTasks.push({
            id: task.id,
            time: formatTime(block.start_time),
            title: task.task_title,
            duration: `${task.duration_minutes} min`,
            type: task.task_type,
            completed: taskCompleted
          });
        });
      });
      
      // Set state with the processed data
      setCurrentDay(data.day || {});
      setDailyTasks(allTasks);
      
      // Get learning objectives from the day object
      const dayObjectives = data.day && data.day.learning_objectives ? 
        data.day.learning_objectives : [];
      setObjectives(dayObjectives);
      
      // Set missed assignments count
      setMissedAssignmentsCount(data.missedAssignmentsCount || 0);
      
      // Set all weeks data (already includes tasks and submission status)
      setAllWeeksData(data.weeks || []);
      
      // Set level, week, and weekly goal
      if (data.day) {
        setCurrentLevel(data.day.level || 1);
        setCurrentWeek(data.day.week);
        setWeeklyGoal(data.day.weekly_goal || '');
      }
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Failed to load dashboard data. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  // Memoized week data for current week - only recalculates when currentWeek or allWeeksData changes
  const weekData = useMemo(() => {
    if (!currentWeek || !allWeeksData.length) return [];
    const week = allWeeksData.find(w => w.weekNumber === currentWeek);
    return week?.days || [];
  }, [currentWeek, allWeeksData]);
  
  // NEW: Fetch completion status for all tasks in current week
  useEffect(() => {
    const fetchWeekCompletionStatus = async () => {
      if (!weekData.length || !token) return;
      
      // Collect all task IDs from the current week
      const taskIds = [];
      weekData.forEach(day => {
        day.tasks?.forEach(task => {
          taskIds.push(task.id);
        });
      });
      
      if (taskIds.length === 0) return;
      
      try {
        console.log(`📊 Fetching completion status for ${taskIds.length} tasks in week ${currentWeek}`);
        
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/learning/batch-completion-status?taskIds=${taskIds.join(',')}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        );
        
        if (response.ok) {
          const data = await response.json();
          console.log(`✅ Received completion status for ${Object.keys(data.completionStatus).length} tasks`);
          setTaskCompletionMap(data.completionStatus);
        } else {
          console.error('Failed to fetch completion status');
        }
      } catch (error) {
        console.error('Error fetching batch completion status:', error);
      }
    };
    
    fetchWeekCompletionStatus();
  }, [weekData, currentWeek, token]);

  // Memoized navigation handlers
  const navigateToWeek = useCallback(async (direction) => {
    if (!currentWeek) return;
    
    const newWeek = direction === 'prev' ? currentWeek - 1 : currentWeek + 1;
    
    // Don't go below week 1
    if (newWeek < 1) return;
    
    // Don't go past the current week (the week from currentDay)
    if (direction === 'next' && currentDay?.week && newWeek > currentDay.week) {
      return;
    }
    
    // Phase 1: Slide out old cards
    const slideOutDirection = direction === 'prev' ? 'out-right' : 'out-left';
    setSlideDirection(slideOutDirection);
    
    // Wait for slide-out animation
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Phase 2: Update week
    setCurrentWeek(newWeek);
    
    // Update weekly goal and level
    const newWeekData = allWeeksData.find(w => w.weekNumber === newWeek);
    if (newWeekData) {
      setWeeklyGoal(newWeekData.weeklyGoal || '');
      // Update level based on the first day of the new week
      if (newWeekData.days && newWeekData.days.length > 0) {
        setCurrentLevel(newWeekData.days[0].level || 1);
      }
    }
    
    // Phase 3: Slide in new cards from opposite direction
    const slideInDirection = direction === 'prev' ? 'in-from-left' : 'in-from-right';
    setSlideDirection(slideInDirection);
    
    // Reset after slide-in completes
    setTimeout(() => {
      setSlideDirection(null);
    }, 1000);
  }, [currentWeek, currentDay?.week, allWeeksData]);

  // Handle continue session button click
  const handleContinueSession = useCallback(() => {
    if (!isActive) {
      setError('You have historical access only and cannot access new learning sessions.');
      return;
    }
    
    const cohortParam = (user?.role === 'staff' || user?.role === 'admin') && cohortFilter
      ? `?cohort=${encodeURIComponent(cohortFilter)}`
      : '';
    
    navigate(`/learning${cohortParam}`);
  }, [isActive, user?.role, cohortFilter, navigate]);

  // Navigate to the specific task in the Learning page
  const navigateToTask = useCallback((taskId) => {
    if (!isActive) {
      setError('You have historical access only and cannot access new learning sessions.');
      return;
    }
    
    const cohortParam = (user?.role === 'staff' || user?.role === 'admin') && cohortFilter
      ? `&cohort=${encodeURIComponent(cohortFilter)}`
      : '';
    
    navigate(`/learning?taskId=${taskId}${cohortParam}`);
  }, [isActive, user?.role, cohortFilter, navigate]);

  // Navigate to calendar for historical viewing
  const navigateToCalendar = useCallback(() => {
    navigate('/calendar');
  }, [navigate]);

  // Add a helper function to format time from 24-hour to 12-hour format
  const formatTime = (timeString) => {
    if (!timeString) return '';
    
    const timeParts = timeString.split(':');
    const hours = parseInt(timeParts[0], 10);
    const minutes = timeParts[1];
    
    const period = hours >= 12 ? 'PM' : 'AM';
    const formattedHours = hours % 12 || 12;
    
    return `${formattedHours}:${minutes} ${period}`;
  };

  // Format date for display (e.g., "10.2 SAT" or "TODAY 10.22 MON")
  const formatDayDate = (dateString, isToday = false) => {
    if (!dateString) return { prefix: '', date: '', full: '' };
    // Handle ISO timestamps or simple date strings
    const date = new Date(dateString);
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();
    
    const dateStr = `${month}.${day} ${dayOfWeek}`;
    
    if (isToday) {
      return {
        prefix: 'TODAY ',
        date: dateStr,
        full: `TODAY ${dateStr}`
      };
    }
    return {
      prefix: '',
      date: dateStr,
      full: dateStr
    };
  };

  // Check if a date is today
  const isDateToday = (dateString) => {
    if (!dateString) return false;
    const date = new Date(dateString);
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  };

  // Check if date is in the past
  const isDatePast = (dateString) => {
    if (!dateString) return false;
    const date = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  // Cutoff date for showing incomplete task indicators (11/1/2025)
  const TASK_TRACKING_CUTOFF_DATE = new Date('2025-11-01');

  // Check if date is on or after the cutoff date for task tracking
  const isDateAfterCutoff = (dateString) => {
    if (!dateString) return false;
    const date = new Date(dateString);
    date.setHours(0, 0, 0, 0);
    return date >= TASK_TRACKING_CUTOFF_DATE;
  };

  // Navigate to volunteer feedback
  const navigateToVolunteerFeedback = useCallback(() => {
    navigate('/volunteer-feedback');
  }, [navigate]);

  // Handle opening missed assignments sidebar
  const handleMissedAssignmentsClick = useCallback(() => {
    setIsSidebarOpen(true);
  }, []);

  // Handle closing sidebar
  const handleCloseSidebar = useCallback(() => {
    setIsSidebarOpen(false);
  }, []);

  // Handle navigation from sidebar to specific day/task
  const handleNavigateToDay = useCallback((dayId, taskId) => {
    // Navigate to the day view with the task highlighted
    navigate(`/calendar?day=${dayId}&task=${taskId}`);
  }, [navigate]);

  // Handle navigation to Learning page for a specific day
  const handleNavigateToDayLearning = useCallback((dayId) => {
    if (!isActive) {
      setError('You have historical access only and cannot access new learning sessions.');
      return;
    }
    
    // Build query params
    const params = new URLSearchParams();
    params.append('dayId', dayId);
    
    // Add cohort for staff/admin
    if ((user?.role === 'staff' || user?.role === 'admin') && cohortFilter) {
      params.append('cohort', cohortFilter);
    }
    
    navigate(`/learning?${params.toString()}`);
  }, [isActive, user?.role, cohortFilter, navigate]);

  // Handle navigation to Learning page for a specific task
  const handleNavigateToTask = useCallback((dayId, taskId) => {
    if (!isActive) {
      setError('You have historical access only and cannot access new learning sessions.');
      return;
    }
    
    const params = new URLSearchParams();
    params.append('dayId', dayId);
    params.append('taskId', taskId);
    
    if ((user?.role === 'staff' || user?.role === 'admin') && cohortFilter) {
      params.append('cohort', cohortFilter);
    }
    
    navigate(`/learning?${params.toString()}`);
  }, [isActive, user?.role, cohortFilter, navigate]);

  // Render skeleton loading cards
  const renderSkeletonCards = () => {
    return Array(5).fill(0).map((_, index) => (
      <div key={`skeleton-${index}`} className="dashboard__day-card dashboard__day-card--skeleton">
        <div className="skeleton-line skeleton-date"></div>
        <div className="skeleton-divider"></div>
        <div className="skeleton-section">
          <div className="skeleton-line skeleton-title"></div>
          <div className="skeleton-line"></div>
          <div className="skeleton-line"></div>
          <div className="skeleton-line skeleton-short"></div>
        </div>
        <div className="skeleton-section">
          <div className="skeleton-line skeleton-title"></div>
          <div className="skeleton-line"></div>
        </div>
      </div>
    ));
  };

  // Render historical access view
  const renderHistoricalView = () => {
    return (
      <div className="flex items-center justify-center min-h-screen p-8">
        <Card className="w-full max-w-2xl">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <AlertTriangle className="h-8 w-8 text-primary" />
            </div>
            <CardTitle>Historical Access Only</CardTitle>
            <CardDescription>
              You have historical access only. You can view your past activities but cannot 
              participate in new sessions. Please visit the calendar to access your completed work.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button onClick={navigateToCalendar}>
              <Calendar className="h-4 w-4 mr-2" />
              View Past Sessions
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  };

  // Render volunteer dashboard view
  const renderVolunteerView = () => {
    return (
      <div className="flex items-center justify-center min-h-screen p-8">
        <Card className="w-full max-w-2xl">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Welcome, Volunteer!</CardTitle>
            <CardDescription>
              Thank you for volunteering with us. You can provide feedback on learner sessions below.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <button 
              className="group relative overflow-hidden inline-flex justify-center items-center px-6 py-2.5 bg-pursuit-purple border border-pursuit-purple rounded-full font-normal text-base leading-5 text-white cursor-pointer transition-colors duration-300"
              onClick={navigateToVolunteerFeedback}
            >
              <BookOpen className="h-4 w-4 mr-2 relative z-10 transition-colors duration-300 group-hover:text-pursuit-purple" />
              <span className="relative z-10 transition-colors duration-300 group-hover:text-pursuit-purple">Go to Volunteer Feedback</span>
              <div className="absolute inset-0 bg-[#EFEFEF] -translate-x-full group-hover:translate-x-0 transition-transform duration-300"></div>
            </button>
          </CardContent>
        </Card>
      </div>
    );
  };

  // Mock data for the Figma wireframe
  const upcomingEvents = [
    {
      date: "10.15.25",
      title: "Demo Day",
      time: "8:30PM - 11:00 PM",
      location: "Blackrock"
    },
    {
      date: "10.25.25", 
      title: "Fireside Chat with David Yang",
      time: "2:30PM - 4:00 PM",
      location: "Pursuit HQ"
    },
    {
      date: "10.26.25",
      title: "Presentation", 
      time: "8:30PM - 11:00 PM",
      location: ""
    }
  ];

  // Render regular dashboard content matching the Figma wireframe
  const renderDashboardContent = () => {
    return (
      <div className="dashboard">
        {/* Desktop View */}
        <div className="dashboard__desktop hidden md:block">
          {/* Greeting Section */}
          <div className="dashboard__greeting">
            <h1 className="dashboard__greeting-text">
              Hey {user?.firstName || 'there'}. Good to see you!
            </h1>
            <button
              className={`dashboard__missed-assignments ${missedAssignmentsCount > 0 ? 'dashboard__missed-assignments--active' : ''}`}
              onClick={handleMissedAssignmentsClick}
            >
              <div className="dashboard__missed-icon" />
              <span>( {missedAssignmentsCount} ) missed assignments</span>
            </button>
          </div>
          
          {/* Top Grid: Today's Goal and Upcoming */}
          <div className="dashboard__top-grid">
            {/* Today's Goal Section */}
            <div className="dashboard__todays-goal">
              <h2 className="dashboard__section-title">Today's Goal</h2>
              <p className="dashboard__goal-text">
                {currentDay?.daily_goal || 'No goal set for today'}
              </p>
              <button className="group relative overflow-hidden inline-flex justify-center items-center px-[30px] py-2.5 w-fit bg-pursuit-purple border border-pursuit-purple rounded-full font-normal text-2xl leading-5 text-white cursor-pointer transition-colors duration-300 animate-breathe hover:animate-none" onClick={handleContinueSession}>
                <span className="relative z-10 transition-colors duration-300 group-hover:text-pursuit-purple">Start</span>
                <div className="absolute inset-0 bg-[#EFEFEF] -translate-x-full group-hover:translate-x-0 transition-transform duration-300"></div>
              </button>
            </div>

            {/* Vertical Divider */}
            <div className="dashboard__vertical-divider"></div>

            {/* Upcoming Section - Hidden until events are available */}
            <div className="dashboard__upcoming" style={{ visibility: 'hidden' }}>
              <h2 className="dashboard__section-title">Upcoming</h2>
              <div className="dashboard__upcoming-list">
                {upcomingEvents.map((event, index) => (
                  <div key={index} className="dashboard__upcoming-item">
                    <div className="dashboard__upcoming-content">
                      <span className="dashboard__upcoming-date">{event.date}</span>
                      <div className="dashboard__upcoming-details">
                        <p className="dashboard__upcoming-title">{event.title}</p>
                        <p className="dashboard__upcoming-time">{event.time}</p>
                        {event.location && <p className="dashboard__upcoming-location">{event.location}</p>}
                      </div>
                    </div>
                    <button className="dashboard__signup-btn">Sign up</button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Divider 2 */}
          <div className="dashboard__divider-2" />

          {/* Week Header: Title and Date Picker */}
          <div className="dashboard__week-header items-end">
            <div className="dashboard__week-title">
              <span className="dashboard__week-label">
                <span className="dashboard__week-level">{currentLevel}</span>: Week {currentWeek}
              </span>
              <span 
                className={`dashboard__week-subtitle ${
                  slideDirection === 'out-left' ? 'animate__animated animate__fadeOutLeft' :
                  slideDirection === 'out-right' ? 'animate__animated animate__fadeOutRight' :
                  slideDirection === 'in-from-left' ? 'animate__animated animate__fadeInLeft' :
                  slideDirection === 'in-from-right' ? 'animate__animated animate__fadeInRight' : ''
                }`}
                style={{ animationDuration: '0.6s' }}
              >
                {weeklyGoal}
              </span>
            </div>

            <div className="dashboard__date-picker">
              <button
                className={`group relative overflow-hidden inline-flex items-center justify-center w-10 h-10 transition-all duration-300 ${
                  currentWeek > 1 
                    ? 'bg-[#EFEFEF] border border-pursuit-purple text-pursuit-purple cursor-pointer' 
                    : 'bg-background border border-divider text-divider cursor-not-allowed opacity-100'
                }`}
                style={{ borderRadius: '.5rem' }}
                onClick={() => navigateToWeek('prev')}
                disabled={currentWeek <= 1 || slideDirection !== null}
              >
                <ChevronLeft className={`w-10 h-10 relative z-10 transition-colors duration-300 ${currentWeek > 1 ? 'group-hover:!text-white' : ''}`} strokeWidth={0.8} />
                {currentWeek > 1 && (
                  <div className="absolute inset-0 bg-pursuit-purple -translate-x-full group-hover:translate-x-0 transition-transform duration-300"></div>
                )}
              </button>
              
              {/* Week Dropdown */}
              <Select 
                value={String(currentWeek)} 
                onValueChange={(val) => {
                  const targetWeek = parseInt(val);
                  if (targetWeek !== currentWeek && !slideDirection) {
                    // Future week: slide out LEFT, slide in from RIGHT
                    // Past week: slide out RIGHT, slide in from LEFT
                    setSlideDirection(targetWeek > currentWeek ? 'out-left' : 'out-right');
                    setTimeout(() => {
                      setCurrentWeek(targetWeek);
                      const newWeekData = allWeeksData.find(w => w.weekNumber === targetWeek);
                      if (newWeekData) {
                        setWeeklyGoal(newWeekData.weeklyGoal || '');
                        // Update level based on the first day of the new week
                        if (newWeekData.days && newWeekData.days.length > 0) {
                          setCurrentLevel(newWeekData.days[0].level || 1);
                        }
                      }
                      setSlideDirection(targetWeek > currentWeek ? 'in-from-right' : 'in-from-left');
                      setTimeout(() => setSlideDirection(null), 1000);
                    }, 1000);
                  }
                }}
              >
                <SelectTrigger className="w-[100px] h-10 bg-white px-[10px] border-0 text-[16px] leading-[18px] font-proxima font-normal text-carbon-black" style={{ borderRadius: '7px' }}>
                  <SelectValue>Week {String(currentWeek).padStart(2, '0')}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: currentDay?.week || 1 }, (_, i) => i + 1).map((week) => (
                    <SelectItem key={week} value={String(week)}>
                      Week {String(week).padStart(2, '0')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <button
                className={`group relative overflow-hidden inline-flex items-center justify-center w-10 h-10 transition-all duration-300 ${
                  currentDay?.week && currentWeek < currentDay.week
                    ? 'bg-[#EFEFEF] border border-pursuit-purple text-pursuit-purple cursor-pointer' 
                    : 'bg-background border border-divider text-divider cursor-not-allowed opacity-100'
                }`}
                style={{ borderRadius: '.5rem' }}
                onClick={() => navigateToWeek('next')}
                disabled={!currentDay?.week || currentWeek >= currentDay.week || slideDirection !== null}
              >
                <ChevronRight className={`w-10 h-10 relative z-10 transition-colors duration-300 ${currentDay?.week && currentWeek < currentDay.week ? 'group-hover:!text-white' : ''}`} strokeWidth={0.8} />
                {currentDay?.week && currentWeek < currentDay.week && (
                  <div className="absolute inset-0 bg-pursuit-purple -translate-x-full group-hover:translate-x-0 transition-transform duration-300"></div>
                )}
              </button>
            </div>
          </div>

          {/* Weekly Agenda Cards */}
          <div className="dashboard__weekly-grid">
            {weekData.map((day, index) => {
              const dayIsToday = isDateToday(day.day_date);
              const dayIsPast = isDatePast(day.day_date);
              const dayIsFuture = !dayIsToday && !dayIsPast;
              const showCheckbox = dayIsPast && !dayIsToday;
              
              // For future weeks (going forward): out-left and in-from-right flow left-to-right
              // For past weeks (going back): out-right and in-from-left flow right-to-left (reversed)
              const isRightToLeft = slideDirection === 'out-right' || slideDirection === 'in-from-left';
              const cardCount = weekData.length;
              const delayIndex = isRightToLeft ? (cardCount - 1 - index) : index;
              
              // Determine Animate.css classes based on slide direction
              let animateClass = '';
              if (slideDirection === 'out-left') animateClass = 'animate__animated animate__fadeOutLeft';
              else if (slideDirection === 'out-right') animateClass = 'animate__animated animate__fadeOutRight';
              else if (slideDirection === 'in-from-left') animateClass = 'animate__animated animate__fadeInLeft';
              else if (slideDirection === 'in-from-right') animateClass = 'animate__animated animate__fadeInRight';
              
              // Calculate completion status for past days
              const deliverableTasks = day.tasks?.filter(t => 
                t.deliverable_type && ['video', 'document', 'link', 'structured'].includes(t.deliverable_type)
              ) || [];
              const completedDeliverables = deliverableTasks.filter(t => t.hasSubmission);
              const isComplete = deliverableTasks.length > 0 && deliverableTasks.length === completedDeliverables.length;
              
              return (
                <div 
                  key={day.id} 
                  className={`dashboard__day-card ${dayIsToday ? 'dashboard__day-card--today' : ''} ${animateClass}`}
                  style={{ 
                    animationDelay: `${delayIndex * 0.08}s`
                  }}
                >
                  
                  {/* Date */}
                  <div className="dashboard__day-date">
                    {(() => {
                      const formattedDate = formatDayDate(day.day_date, dayIsToday);
                      return (
                        <>
                          {formattedDate.prefix && <strong>{formattedDate.prefix}</strong>}
                          {formattedDate.date}
                        </>
                      );
                    })()}
                  </div>
                  
                  {/* Separator */}
                  <div className="dashboard__day-separator" />
                  
                  {/* Activities */}
                  {day.tasks && day.tasks.length > 0 && (
                    <div className="dashboard__day-section">
                      <h4 className="dashboard__day-section-title">Activities</h4>
                      <div className="dashboard__day-activities">
                        {day.tasks.map((task, taskIndex) => {
                          // NEW: Use completion map for all tasks (not just deliverables)
                          const completionStatus = taskCompletionMap[task.id];
                          const isComplete = completionStatus?.isComplete || false;
                          // Only show checkbox for past days on or after 11/1/2025
                          const showTaskCheckbox = dayIsPast && !dayIsToday && isDateAfterCutoff(day.day_date);
                          const isBreakTask = task.task_type === 'break';
                          
                          return (
                            <div key={task.id}>
                              <div className="dashboard__day-activity">
                                {/* Task Checkbox - Purple (complete), Pink (incomplete with deliverable), or White circle (incomplete without deliverable) */}
                                {/* Hide checkbox for break tasks but add spacer to maintain alignment */}
                                {showTaskCheckbox && !isBreakTask && (
                                  <div className={`dashboard__task-checkbox ${
                                    isComplete 
                                      ? 'dashboard__task-checkbox--complete' 
                                      : (completionStatus?.requiresDeliverable || completionStatus?.shouldAnalyze)
                                        ? 'dashboard__task-checkbox--incomplete' 
                                        : 'dashboard__task-checkbox--empty'
                                  }`}>
                                    {isComplete ? (
                                      <svg viewBox="0 0 14 14" className="dashboard__task-checkbox-check">
                                        <polyline points="2.5,6 5.5,9 11.5,3" />
                                      </svg>
                                    ) : (completionStatus?.requiresDeliverable || completionStatus?.shouldAnalyze) ? (
                                      <svg viewBox="0 0 8 8" className="dashboard__task-checkbox-x">
                                        <line x1="1" y1="1" x2="7" y2="7" />
                                        <line x1="7" y1="1" x2="1" y2="7" />
                                      </svg>
                                    ) : null}
                                  </div>
                                )}
                                {/* Empty spacer for break tasks to maintain alignment */}
                                {showTaskCheckbox && isBreakTask && (
                                  <div className="dashboard__task-checkbox" style={{ visibility: 'hidden' }} />
                                )}
                                
                                <div className="dashboard__day-activity-content">
                                  <span className="dashboard__task-title">{task.task_title}</span>
                                  
                  {/* Deliverable Submit Button */}
                  {completionStatus?.requiresDeliverable && (
                    <button 
                      className={`dashboard__deliverable-link ${
                        task.hasSubmission ? 'dashboard__deliverable-link--submitted' : 'dashboard__deliverable-link--pending'
                      } ${dayIsFuture ? 'dashboard__deliverable-link--disabled' : ''}`}
                      onClick={() => {
                        if (!dayIsFuture) {
                          handleNavigateToTask(day.id, task.id);
                        }
                      }}
                      disabled={dayIsFuture}
                    >
                      {task.hasSubmission ? (
                        <>
                          <svg viewBox="0 0 14 14" className="inline-block w-3 h-3 mr-1 align-middle" style={{ marginTop: '-2px' }}>
                            <polyline points="2.5,6 5.5,9 11.5,3" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                          {task.deliverable_type.charAt(0).toUpperCase() + task.deliverable_type.slice(1)} Submitted
                        </>
                      ) : (
                        `Submit ${task.deliverable_type}`
                      )}
                    </button>
                  )}
                                </div>
                              </div>
                              {taskIndex < day.tasks.length - 1 && (
                                <div className="dashboard__activity-divider" />
                              )}
                            </div>
                          );
                        })}
                      </div>
              </div>
            )}

                  {/* Arrow Button in top-right corner */}
                  {dayIsToday && (
                    <div className="absolute top-[13px] right-3 z-10">
                      <ArrowButton
                        onClick={() => handleNavigateToDayLearning(day.id)}
                        borderColor="#FFFFFF"
                        backgroundColor="#FFFFFF"
                        arrowColor="#4242EA"
                        hoverBackgroundColor="#4242EA"
                        hoverArrowColor="#FFFFFF"
                        size="md"
                        strokeWidth={1}
                      />
                    </div>
                  )}
                  {!dayIsToday && showCheckbox && (
                    <div className="absolute top-[13px] right-3 z-10">
                      <ArrowButton
                        onClick={() => handleNavigateToDayLearning(day.id)}
                        borderColor="#4242EA"
                        backgroundColor="#E3E3E3"
                        arrowColor="#4242EA"
                        hoverBackgroundColor="#4242EA"
                        hoverArrowColor="#E3E3E3"
                        size="md"
                        strokeWidth={1}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Divider 3 */}
          <div className="dashboard__divider-3" />
        </div>
        
        {/* Mobile View */}
        <div className="dashboard__mobile block md:hidden">
          {/* Divider at top */}
          <div className="dashboard__mobile-divider-top" />

          {/* Today's Goal */}
          <div className="dashboard__mobile-goal">
            <h2 className="dashboard__mobile-section-title">Today's Goal</h2>
            <p className="dashboard__mobile-goal-text">
              {currentDay?.daily_goal || 'No goal set for today'}
            </p>
          </div>

          {/* Start Button */}
          <button className="dashboard__mobile-start-btn group relative overflow-hidden" onClick={handleContinueSession}>
            <span className="relative z-10">Start</span>
            <div className="absolute inset-0 bg-pursuit-purple -translate-x-full group-hover:translate-x-0 transition-transform duration-300"></div>
          </button>

          {/* L1 Week 5 Title */}
          <div className="dashboard__mobile-week-title">
            {currentLevel}: Week {currentWeek} <br />
            {weeklyGoal}
          </div>

          {/* Divider 2 */}
          <div className="dashboard__mobile-divider-2" />

          {/* Date Picker */}
          <div className="dashboard__mobile-date-picker">
            <button
              className={`group relative overflow-hidden inline-flex items-center justify-center w-10 h-10 transition-all duration-300 ${
                currentWeek > 1 
                  ? 'bg-pursuit-purple border border-pursuit-purple text-white cursor-pointer' 
                  : 'bg-background border border-divider text-divider cursor-not-allowed opacity-100'
              }`}
              style={{ borderRadius: '.5rem' }}
              onClick={() => navigateToWeek('prev')}
              disabled={currentWeek <= 1 || slideDirection !== null}
            >
              <ChevronLeft className={`w-10 h-10 relative z-10 transition-colors duration-300 ${currentWeek > 1 ? 'group-hover:!text-pursuit-purple' : ''}`} strokeWidth={0.8} />
              {currentWeek > 1 && (
                <div className="absolute inset-0 bg-[#EFEFEF] -translate-x-full group-hover:translate-x-0 transition-transform duration-300"></div>
              )}
            </button>
            
            {/* Week Dropdown */}
            <Select 
              value={String(currentWeek)} 
              onValueChange={(val) => {
                const targetWeek = parseInt(val);
                if (targetWeek !== currentWeek && !slideDirection) {
                  // Future week: slide out LEFT, slide in from RIGHT
                  // Past week: slide out RIGHT, slide in from LEFT
                  setSlideDirection(targetWeek > currentWeek ? 'out-left' : 'out-right');
                  setTimeout(() => {
                    setCurrentWeek(targetWeek);
                    // Update level for mobile dropdown as well
                    const newWeekData = allWeeksData.find(w => w.weekNumber === targetWeek);
                    if (newWeekData && newWeekData.days && newWeekData.days.length > 0) {
                      setCurrentLevel(newWeekData.days[0].level || 1);
                      setWeeklyGoal(newWeekData.weeklyGoal || '');
                    }
                    setSlideDirection(targetWeek > currentWeek ? 'in-from-right' : 'in-from-left');
                    setTimeout(() => setSlideDirection(null), 600);
                  }, 600);
                }
              }}
            >
              <SelectTrigger className="w-[100px] h-10 bg-white px-[10px] border-0 text-[16px] leading-[18px] font-proxima font-normal text-carbon-black" style={{ borderRadius: '7px' }}>
                <SelectValue>Week {String(currentWeek).padStart(2, '0')}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: currentDay?.week || 1 }, (_, i) => i + 1).map((week) => (
                  <SelectItem key={week} value={String(week)}>
                    Week {String(week).padStart(2, '0')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <button
              className={`group relative overflow-hidden inline-flex items-center justify-center w-10 h-10 transition-all duration-300 ${
                currentDay?.week && currentWeek < currentDay.week
                  ? 'bg-pursuit-purple border border-pursuit-purple text-white cursor-pointer' 
                  : 'bg-background border border-divider text-divider cursor-not-allowed opacity-100'
              }`}
              style={{ borderRadius: '.5rem' }}
              onClick={() => navigateToWeek('next')}
              disabled={!currentDay?.week || currentWeek >= currentDay.week || slideDirection !== null}
            >
              <ChevronRight className={`w-10 h-10 relative z-10 transition-colors duration-300 ${currentDay?.week && currentWeek < currentDay.week ? 'group-hover:!text-pursuit-purple' : ''}`} strokeWidth={0.8} />
              {currentDay?.week && currentWeek < currentDay.week && (
                <div className="absolute inset-0 bg-[#EFEFEF] -translate-x-full group-hover:translate-x-0 transition-transform duration-300"></div>
              )}
            </button>
          </div>

          {/* Weekly Agenda - Mobile */}
          <div className="dashboard__mobile-agenda">
            {weekData.map((day, index) => {
              const dayIsToday = isDateToday(day.day_date);
              const dayIsPast = isDatePast(day.day_date);
              
              if (dayIsToday) {
                // Today Card - expanded
                return (
                  <div key={day.id} className="dashboard__mobile-today-card">
                    <div className="dashboard__mobile-today-header">
                      {(() => {
                        const formattedDate = formatDayDate(day.day_date, true);
                        return (
                          <>
                            {formattedDate.prefix && <strong>{formattedDate.prefix}</strong>}
                            {formattedDate.date}
                          </>
                        );
                      })()}
                    </div>
                    <div className="dashboard__mobile-today-separator" />
                    {day.tasks && day.tasks.length > 0 && (
                      <div className="dashboard__mobile-today-section">
                        <h4 className="dashboard__mobile-today-section-title">Activities</h4>
                        <div className="dashboard__mobile-today-activities">
                          {day.tasks.map((task, taskIndex) => (
                            <div key={task.id}>
                              <div className="dashboard__mobile-today-activity">{task.task_title}</div>
                              {taskIndex < day.tasks.length - 1 && (
                                <div className="dashboard__mobile-activity-divider" />
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
          <div className="absolute top-[13px] right-3 z-10">
            <ArrowButton
              onClick={() => handleNavigateToDayLearning(day.id)}
              borderColor="#FFFFFF"
              backgroundColor="#FFFFFF"
              arrowColor="#4242EA"
              hoverBackgroundColor="#4242EA"
              hoverArrowColor="#FFFFFF"
              size="md"
              strokeWidth={1}
            />
          </div>
                  </div>
                );
              } else {
                // Regular day card - condensed
                return (
                  <div key={day.id} className="dashboard__mobile-day">
                    <div className="dashboard__mobile-day-header">
                      {formatDayDate(day.day_date, false).full}
                    </div>
                    {dayIsPast && (
                      <div className={`dashboard__mobile-checkbox ${day.completed ? 'dashboard__mobile-checkbox--checked' : ''}`} />
                    )}
                  </div>
                );
              }
            })}
          </div>

          {/* Divider 3 */}
          <div className="dashboard__mobile-divider-3" />

          {/* Upcoming Section - Hidden until events are available */}
          <div className="dashboard__mobile-upcoming" style={{ visibility: 'hidden' }}>
            <h2 className="dashboard__mobile-section-title">Upcoming</h2>
            <div className="dashboard__mobile-upcoming-list">
              {upcomingEvents.map((event, index) => (
                <div key={index} className="dashboard__mobile-upcoming-item">
                  <div className="dashboard__mobile-upcoming-content">
                    <span className="dashboard__mobile-upcoming-date">{event.date}</span>
                    <div className="dashboard__mobile-upcoming-details">
                      <p className="dashboard__mobile-upcoming-title">{event.title}</p>
                      <p className="dashboard__mobile-upcoming-time">{event.time}</p>
                      {event.location && <p className="dashboard__mobile-upcoming-location">{event.location}</p>}
                    </div>
                  </div>
                  <button className="dashboard__mobile-signup-btn">Sign up</button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <Layout isLoading={isLoading}>
      {error && (
        <div className="p-4 mx-6 mt-6 bg-destructive/10 border border-destructive/20 rounded-lg">
          <p className="text-destructive text-sm">{error}</p>
          </div>
        )}
      
      {/* Conditionally render based on user status and role */}
      {!isActive ? renderHistoricalView() : 
       isVolunteer ? renderVolunteerView() : 
       renderDashboardContent()}

      {/* Missed Assignments Sidebar */}
      <MissedAssignmentsSidebar
        isOpen={isSidebarOpen}
        onClose={handleCloseSidebar}
        onNavigateToDay={handleNavigateToDay}
      />
    </Layout>
  );
}

export default Dashboard; 