import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, Calendar, BookOpen, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';

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

  // Mock upcoming events for the wireframe
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
      <div className="min-h-screen bg-background">
        
        {/* Header */}
        <div className="border-b border-gray-200 bg-white px-8 py-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Hey {user?.first_name || 'Yoshi'}. Good to see you!
              </h1>
              <p className="text-gray-600 mt-1 text-lg">
                Friday, October 3, 2025
              </p>
            </div>

            {/* Missed assignments indicator */}
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2 text-sm">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span className="text-gray-600">( 0 ) missed assignments</span>
              </div>

              {/* Cohort selector for staff/admin users */}
              {isActive && (user.role === 'staff' || user.role === 'admin') && (
                <div className="flex items-center gap-3">
                  <label className="text-sm font-medium text-gray-700">View Cohort:</label>
                  <Select value={cohortFilter || "my-cohort"} onValueChange={(value) => setCohortFilter(value === "my-cohort" ? null : value)}>
                    <SelectTrigger className="w-[180px] border-gray-300">
                      <SelectValue placeholder="My Cohort" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="my-cohort">My Cohort</SelectItem>
                      <SelectItem value="March 2025">March 2025</SelectItem>
                      <SelectItem value="June 2025">June 2025</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex bg-gray-50 min-h-screen">
          {/* Left side - Main content */}
          <div className="flex-1 p-8">
            {/* Today's Goal */}
            <Card className="mb-8 bg-white border border-gray-200 shadow-sm rounded-xl">
              <CardHeader className="pb-4">
                <CardTitle className="text-2xl font-semibold text-gray-900">
                  Today's Goal
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-gray-700 mb-6 leading-relaxed text-base">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam
                  a vestibulum justo. Vestibulum id vulputate magna. Morbi a elit
                  tortor. Sed ut mattis quam. Vestibulum quis consequat odio.
                  Vivamus non lacus ut sem fringilla suscipit.
                </p>
                <Button className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-medium">
                  Start
                </Button>
              </CardContent>
            </Card>

            {/* L1 Week 5 Section */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900">
                    <span className="text-indigo-600">L1</span> Week 5
                  </h2>
                  <p className="text-gray-600 text-lg mt-1">Learn to write small Python scripts using ChatGPT</p>
                </div>
                <div className="flex items-center gap-3 bg-white rounded-lg border border-gray-200 p-1">
                  <Button variant="outline" size="sm" className="border-gray-300 text-gray-600 hover:bg-gray-50">
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm font-medium px-4 text-gray-700">Week 5</span>
                  <Button variant="outline" size="sm" className="border-gray-300 text-gray-600 hover:bg-gray-50">
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Weekly Schedule Grid */}
              <div className="grid grid-cols-5 gap-6">
                {[
                  { day: '10.2 SAT', isToday: false },
                  { day: '10.20 SAT', isToday: false },
                  { day: 'TODAY 10.22 MON', isToday: true },
                  { day: '10.20 SAT', isToday: false },
                  { day: '10.20 SAT', isToday: false }
                ].map((item, index) => (
                  <Card key={index} className={`bg-white border rounded-xl shadow-sm hover:shadow-md transition-shadow ${
                    item.isToday ? 'bg-indigo-600 text-white border-indigo-600' : 'border-gray-200'
                  }`}>
                    <CardHeader className="pb-3">
                      <CardTitle className={`text-sm font-semibold ${item.isToday ? 'text-white' : 'text-gray-900'}`}>
                        {item.day}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <h4 className={`font-semibold text-sm mb-3 ${item.isToday ? 'text-white' : 'text-gray-900'}`}>
                          Activities
                        </h4>
                        <div className={`space-y-2 text-sm ${item.isToday ? 'text-indigo-100' : 'text-gray-600'}`}>
                          <div className="flex items-center gap-2">
                            <div className={`w-1.5 h-1.5 rounded-full ${item.isToday ? 'bg-white' : 'bg-gray-400'}`}></div>
                            Prompting workshop
                          </div>
                          <div className="flex items-center gap-2">
                            <div className={`w-1.5 h-1.5 rounded-full ${item.isToday ? 'bg-white' : 'bg-gray-400'}`}></div>
                            Build block
                          </div>
                          <div className="flex items-center gap-2">
                            <div className={`w-1.5 h-1.5 rounded-full ${item.isToday ? 'bg-white' : 'bg-gray-400'}`}></div>
                            Researching MVP's
                          </div>
                          <div className="flex items-center gap-2">
                            <div className={`w-1.5 h-1.5 rounded-full ${item.isToday ? 'bg-white' : 'bg-gray-400'}`}></div>
                            Writing small Python scripts using ChatGPT
                          </div>
                          <div className="flex items-center gap-2">
                            <div className={`w-1.5 h-1.5 rounded-full ${item.isToday ? 'bg-white' : 'bg-gray-400'}`}></div>
                            Create a business plan
                          </div>
                        </div>
                      </div>

                      {index < 2 && (
                        <div>
                          <h4 className={`font-semibold text-sm mb-3 ${item.isToday ? 'text-white' : 'text-gray-900'}`}>
                            Events
                          </h4>
                          <div className={`text-sm space-y-2 ${item.isToday ? 'text-indigo-100' : 'text-gray-600'}`}>
                            <div className="flex items-center gap-2">
                              <div className={`w-1.5 h-1.5 rounded-full ${item.isToday ? 'bg-white' : 'bg-gray-400'}`}></div>
                              Fireside chat with David Yang
                            </div>
                            <div className="flex items-center gap-2">
                              <div className={`w-1.5 h-1.5 rounded-full ${item.isToday ? 'bg-white' : 'bg-gray-400'}`}></div>
                              fro, adsf
                            </div>
                            <div className="flex items-center gap-2">
                              <div className={`w-1.5 h-1.5 rounded-full ${item.isToday ? 'bg-white' : 'bg-gray-400'}`}></div>
                              Presentation
                            </div>
                          </div>
                        </div>
                      )}

                      {item.isToday && (
                        <Button size="sm" className="w-full mt-4 bg-white text-indigo-600 hover:bg-indigo-50 font-medium">
                          Go
                        </Button>
                      )}

                      {index > 2 && (
                        <div className="flex justify-center mt-4">
                          <div className={`w-10 h-10 rounded-full border-2 ${item.isToday ? 'border-white' : 'border-gray-300'}`}></div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>

          {/* Right sidebar - Upcoming */}
          <div className="w-80 border-l border-gray-200 bg-white p-8">
            <h3 className="text-xl font-bold text-gray-900 mb-6">
              Upcoming
            </h3>
            <div className="space-y-6">
              {upcomingEvents.map((event, index) => (
                <div key={index} className="space-y-4 p-4 bg-gray-50 rounded-lg border border-gray-100">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
                      {event.date}
                    </span>
                    <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-1.5 rounded-lg text-sm font-medium">
                      Sign up
                    </Button>
                  </div>
                  <div>
                    <h4 className="font-semibold text-base text-gray-900 mb-2">
                      {event.title}
                    </h4>
                    <p className="text-sm text-gray-600 mb-1">{event.time}</p>
                    {event.location && (
                      <p className="text-sm text-gray-500">{event.location}</p>
                    )}
                  </div>
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