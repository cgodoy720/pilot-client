import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, Calendar, BookOpen, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
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

  useEffect(() => {
    // Only fetch dashboard data if user is active
    if (isActive) {
      fetchDashboardData();
    } else {
      // If user is inactive, we don't need to load the dashboard data
      setIsLoading(false);
    }
  }, [token, cohortFilter, user.role, isActive]);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      let url = `${import.meta.env.VITE_API_URL}/api/progress/current-day`;
      
      // Add cohort parameter for staff/admin if selected
      if ((user.role === 'staff' || user.role === 'admin') && cohortFilter) {
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
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Failed to load dashboard data. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle continue session button click
  const handleContinueSession = () => {
    if (!isActive) {
      setError('You have historical access only and cannot access new learning sessions.');
      return;
    }
    
    const cohortParam = (user.role === 'staff' || user.role === 'admin') && cohortFilter 
      ? `?cohort=${encodeURIComponent(cohortFilter)}` 
      : '';
    
    navigate(`/learning${cohortParam}`);
  };

  // Navigate to the specific task in the Learning page
  const navigateToTask = (taskId) => {
    if (!isActive) {
      setError('You have historical access only and cannot access new learning sessions.');
      return;
    }
    
    const cohortParam = (user.role === 'staff' || user.role === 'admin') && cohortFilter 
      ? `&cohort=${encodeURIComponent(cohortFilter)}` 
      : '';
    
    navigate(`/learning?taskId=${taskId}${cohortParam}`);
  };

  // Navigate to calendar for historical viewing
  const navigateToCalendar = () => {
    navigate('/calendar');
  };

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

  // Navigate to volunteer feedback
  const navigateToVolunteerFeedback = () => {
    navigate('/volunteer-feedback');
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
            <Button onClick={navigateToVolunteerFeedback}>
              <BookOpen className="h-4 w-4 mr-2" />
              Go to Volunteer Feedback
            </Button>
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

  const weeklyAgenda = [
    {
      date: '10.2 SAT',
      isToday: false,
      activities: ['Prompting workshop', 'Build block', 'Researching MVP\'s', 'Writing small Python scripts using ChatGPT', 'Create a business plan'],
      events: ['Fireside chat with David Yang fro, adsf', 'Presentation'],
      hasCheckbox: true,
      checkboxChecked: true
    },
    {
      date: '10.20 SAT',
      isToday: false,
      activities: ['Prompting workshop', 'Build block', 'Researching MVP\'s', 'Writing small Python scripts using ChatGPT', 'Create a business plan'],
      events: ['Fireside chat with David Yang fro, adsf', 'Presentation'],
      hasCheckbox: true,
      checkboxChecked: false
    },
    {
      date: 'TODAY 10.22 MON',
      isToday: true,
      activities: ['Prompting workshop', 'Build block', 'Researching MVP\'s', 'Writing small Python scripts using ChatGPT', 'Create a business plan'],
      events: [],
      hasCheckbox: false,
      checkboxChecked: false
    },
    {
      date: '10.20 SAT',
      isToday: false,
      activities: ['Prompting workshop', 'Build block', 'Researching MVP\'s', 'Writing small Python scripts using ChatGPT', 'Create a business plan'],
      events: ['Fireside chat with David Yang fro, adsf'],
      hasCheckbox: false,
      checkboxChecked: false
    },
    {
      date: '10.20 SAT',
      isToday: false,
      activities: ['Prompting workshop', 'Build block', 'Researching MVP\'s', 'Writing small Python scripts using ChatGPT', 'Create a business plan'],
      events: [],
      hasCheckbox: false,
      checkboxChecked: false
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
              Hey {user?.first_name || 'Yoshi'}. Good to see you!
            </h1>
            <div className="dashboard__missed-assignments">
              <div className="dashboard__missed-icon" />
              <span>( 0 ) missed assignments</span>
            </div>
          </div>

          {/* Top Grid: Today's Goal and Upcoming */}
          <div className="dashboard__top-grid">
            {/* Today's Goal Section */}
            <div className="dashboard__todays-goal">
              <h2 className="dashboard__section-title">Today's Goal</h2>
              <p className="dashboard__goal-text">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam a vestibulum justo. 
                Vestibulum id vulputate magna. Morbi a elit tortor. Sed ut mattis quam. Vestibulum quis 
                consequat odio. Vivamus non lacus ut sem fringilla suscipit.
              </p>
              <button className="dashboard__start-btn">Start</button>
            </div>

            {/* Upcoming Section */}
            <div className="dashboard__upcoming">
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
          <div className="dashboard__week-header">
            <div className="dashboard__week-title">
              <span className="dashboard__week-label">L1: Week 5</span>
              <span className="dashboard__week-subtitle">Learn to write small Python scripts using ChatGPT</span>
            </div>

            <div className="dashboard__date-picker">
              <button className="dashboard__date-btn dashboard__date-btn--active">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="dashboard__date-label">May 2025</span>
              <button className="dashboard__date-btn">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Weekly Agenda Cards */}
          <div className="dashboard__weekly-grid">
            {weeklyAgenda.map((day, index) => (
              <div 
                key={index} 
                className={`dashboard__day-card ${day.isToday ? 'dashboard__day-card--today' : ''}`}
              >
                {/* Date */}
                <div className="dashboard__day-date">{day.date}</div>
                
                {/* Separator */}
                <div className="dashboard__day-separator" />
                
                {/* Checkbox (for first two cards) */}
                {day.hasCheckbox && (
                  <div className={`dashboard__checkbox ${day.checkboxChecked ? 'dashboard__checkbox--checked' : ''}`} />
                )}
                
                {/* Activities */}
                <div className="dashboard__day-section">
                  <h4 className="dashboard__day-section-title">Activities</h4>
                  <div className="dashboard__day-activities">
                    {day.activities.map((activity, actIndex) => (
                      <div key={actIndex} className="dashboard__day-activity">
                        <span>{activity}</span>
                        {actIndex < day.activities.length - 1 && (
                          <div className="dashboard__activity-divider" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Events (if any) */}
                {day.events.length > 0 && (
                  <div className="dashboard__day-section">
                    <h4 className="dashboard__day-section-title">Events</h4>
                    <div className="dashboard__day-events">
                      {day.events.map((event, eventIndex) => (
                        <div key={eventIndex} className="dashboard__day-event">
                          <span>{event}</span>
                          {eventIndex < day.events.length - 1 && (
                            <div className="dashboard__activity-divider" />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Go Button (for today card) */}
                {day.isToday && (
                  <button className="dashboard__go-btn dashboard__go-btn--today">Go</button>
                )}
                {!day.isToday && index < 2 && (
                  <button className="dashboard__go-btn">Go</button>
                )}
              </div>
            ))}
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
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam a vestibulum justo. 
              Vestibulum id vulputate magna. Morbi a elit tortor. Sed ut mattis quam. Vestibulum quis 
              consequat odio. Vivamus non lacus ut sem fringilla suscipit.
            </p>
          </div>

          {/* Start Button */}
          <button className="dashboard__mobile-start-btn">Start</button>

          {/* L1 Week 5 Title */}
          <div className="dashboard__mobile-week-title">
            L1: Week 5 <br />
            Learn to write small Python scripts using ChatGPT
          </div>

          {/* Divider 2 */}
          <div className="dashboard__mobile-divider-2" />

          {/* Date Picker */}
          <div className="dashboard__mobile-date-picker">
            <button className="dashboard__mobile-date-btn dashboard__mobile-date-btn--active">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="dashboard__mobile-date-label">May 2025</span>
            <button className="dashboard__mobile-date-btn">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Weekly Agenda - Mobile */}
          <div className="dashboard__mobile-agenda">
            {/* First two days */}
            <div className="dashboard__mobile-day">
              <div className="dashboard__mobile-day-header">10/20 SAT</div>
              <div className="dashboard__mobile-checkbox" />
            </div>
            <div className="dashboard__mobile-day">
              <div className="dashboard__mobile-day-header">10/21 SUN</div>
              <div className="dashboard__mobile-checkbox dashboard__mobile-checkbox--checked" />
            </div>

            {/* Today Card */}
            <div className="dashboard__mobile-today-card">
              <div className="dashboard__mobile-today-header">TODAY 10/22 MON</div>
              <div className="dashboard__mobile-today-separator" />
              <div className="dashboard__mobile-today-section">
                <h4 className="dashboard__mobile-today-section-title">Activities</h4>
                <div className="dashboard__mobile-today-activities">
                  {weeklyAgenda[2].activities.map((activity, index) => (
                    <div key={index}>
                      <div className="dashboard__mobile-today-activity">{activity}</div>
                      {index < weeklyAgenda[2].activities.length - 1 && (
                        <div className="dashboard__mobile-activity-divider" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
              <button className="dashboard__mobile-go-btn">Go</button>
            </div>

            {/* Last two days */}
            <div className="dashboard__mobile-day">
              <div className="dashboard__mobile-day-header">10/23 TUE</div>
            </div>
            <div className="dashboard__mobile-day">
              <div className="dashboard__mobile-day-header">10/24 WED</div>
            </div>
          </div>

          {/* Divider 3 */}
          <div className="dashboard__mobile-divider-3" />

          {/* Upcoming Section */}
          <div className="dashboard__mobile-upcoming">
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-foreground">Loading dashboard data...</div>
      </div>
    );
  }

  return (
    <>
      {error && (
        <div className="p-4 mx-6 mt-6 bg-destructive/10 border border-destructive/20 rounded-lg">
          <p className="text-destructive text-sm">{error}</p>
          </div>
        )}
      
      {/* Conditionally render based on user status and role */}
      {!isActive ? renderHistoricalView() : 
       isVolunteer ? renderVolunteerView() : 
       renderDashboardContent()}
    </>
  );
}

export default Dashboard; 