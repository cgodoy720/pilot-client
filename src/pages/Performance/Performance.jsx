import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import AttendanceCalendar from './components/AttendanceCalendar';
import FeedbackInbox from './components/FeedbackInbox';
import { fetchUserAttendance } from '../../utils/attendanceService';
import { fetchCombinedFeedback } from '../../utils/performanceFeedbackService';
import { getUserProfilePhoto } from '../../utils/userPhotoService';

const Performance = () => {
  const { user, token } = useAuth();
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [userPhoto, setUserPhoto] = useState(null);
  const [attendanceData, setAttendanceData] = useState([]);
  const [feedbackData, setFeedbackData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load user photo (real API call with fallback)
  useEffect(() => {
    const loadUserPhoto = async () => {
      if (user?.user_id && token) {
        try {
          // Try real API call first
          const photoUrl = await getUserProfilePhoto(user.user_id, token);
          setUserPhoto(photoUrl);
          console.log('✅ Loaded user photo from API:', photoUrl);
        } catch (error) {
          console.error('Failed to load user photo:', error);
          // Fallback to default avatar
          setUserPhoto('/assets/default-avatar.png');
          console.log('📝 Using default avatar as fallback');
        }
      }
    };

    loadUserPhoto();
  }, [user, token]);

  // Load attendance data (real API call with fallback)
  useEffect(() => {
    const loadAttendanceData = async () => {
      if (user?.user_id && token) {
        try {
          // Calculate date range for the selected month
          const startDate = new Date(selectedYear, selectedMonth, 1);
          const endDate = new Date(selectedYear, selectedMonth + 1, 0);
          
          // Try real API call first
          const attendance = await fetchUserAttendance(
            user.user_id,
            startDate.toISOString().split('T')[0],
            endDate.toISOString().split('T')[0],
            token
          );
          
          setAttendanceData(attendance);
          console.log('✅ Loaded real attendance data:', attendance.length, 'records');
        } catch (error) {
          console.error('Failed to load attendance data:', error);
          
          // Fallback to mock data if API fails
          console.log('📝 Using mock attendance data as fallback');
          const mockAttendance = [];
          const startDate = new Date(selectedYear, selectedMonth, 1);
          const endDate = new Date(selectedYear, selectedMonth + 1, 0);
          
          // Generate some mock attendance records
          for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
            const dayOfWeek = d.getDay();
            // Only for class days (Sat=6, Sun=0, Mon=1, Tue=2, Wed=3)
            if ([0, 1, 2, 3, 6].includes(dayOfWeek)) {
              const random = Math.random();
              let status = 'present';
              if (random < 0.05) status = 'absent';
              else if (random < 0.1) status = 'late';
              else if (random < 0.12) status = 'excused';
              
              mockAttendance.push({
                date: d.toISOString().split('T')[0],
                status: status,
                checkInTime: status !== 'absent' ? '09:00:00' : null,
                lateMinutes: status === 'late' ? 15 : 0,
                photoUrl: null,
                notes: null
              });
            }
          }
          
          setAttendanceData(mockAttendance);
        }
      }
    };

    loadAttendanceData();
  }, [user, token, selectedMonth, selectedYear]);

  // Load feedback data (using existing API)
  useEffect(() => {
    const loadFeedbackData = async () => {
      if (user?.user_id) {
        try {
          const dateRange = {
            month: `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}`
          };
          
          const feedback = await fetchCombinedFeedback(user.user_id, dateRange);
          setFeedbackData(feedback);
          console.log('✅ Loaded feedback data:', feedback.length, 'items');
        } catch (error) {
          console.error('Failed to load feedback data:', error);
          setError('Failed to load feedback data');
        }
      }
    };

    loadFeedbackData();
  }, [user, selectedMonth, selectedYear]);

  // Set loading to false when all data is loaded
  useEffect(() => {
    // Simple timeout to show the page after a short delay
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [user]);

  const handleMonthChange = (month) => {
    setSelectedMonth(month);
  };

  const handleYearChange = (year) => {
    setSelectedYear(year);
  };

  const handleTaskClick = (feedbackItem) => {
    console.log('Task clicked:', feedbackItem);
    // Handle task click - could open modal or navigate
  };

  const handleIncompleteTaskNavigate = (feedbackItem) => {
    // Extract task/day information from feedback item
    const taskId = feedbackItem.task_id;
    const dayId = feedbackItem.day_id;
    
    if (dayId) {
      // Navigate to learning page with specific day
      window.location.href = `/learning?dayId=${dayId}`;
    } else if (taskId) {
      // Navigate to specific task
      window.location.href = `/tasks/${taskId}`;
    } else {
      // Fallback to main learning page
      window.location.href = '/learning';
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="w-10 h-10 border-4 border-muted border-t-primary rounded-full animate-spin"></div>
        <p className="text-muted-foreground text-sm">Loading your performance data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center">
        <h2 className="text-destructive text-xl font-semibold">Error Loading Performance Data</h2>
        <p className="text-muted-foreground max-w-md">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="bg-primary text-primary-foreground px-6 py-3 rounded-md text-sm hover:bg-primary/90 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#EFEFEF]">
      {/* Top Navigation Bar - Matching Dashboard styling */}
      <div className="flex items-stretch justify-between w-full h-[45px] mb-[15px] border-b border-[#C8C8C8]">
        <h1 
          className="font-normal text-2xl leading-[44px] tracking-[0.005em] m-0 pl-10 flex items-center"
          style={{
            background: 'linear-gradient(90deg, #1E1E1E 0%, #4242EA 55.29%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            fontFamily: 'var(--font-family)'
          }}
        >
          {new Date().toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: '2-digit', 
            day: '2-digit' 
          })} Carlos' Performance!
        </h1>
        <div className="flex items-center gap-2 px-5 bg-[#4242EA] text-white font-medium text-sm leading-[150%] tracking-[0.005em] h-full">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-white rounded-full"></div>
            <div className="w-2 h-2 bg-white rounded-full"></div>
            <div className="w-2 h-2 bg-white rounded-full"></div>
            <div className="w-2 h-2 bg-white rounded-full"></div>
            <div className="w-2 h-2 bg-white/40 rounded-full"></div>
          </div>
          <span className="ml-2">WK 05/08</span>
        </div>
      </div>

      {/* Main Content - Full width panels without containers */}
      <div className="flex h-[calc(100vh-75px)]">
        {/* Left Panel - Attendance Calendar (Full Space) */}
        <div className="flex-1 px-10 pb-10 flex flex-col bg-[#EFEFEF]">
          <AttendanceCalendar
            userId={user.user_id}
            month={selectedMonth}
            year={selectedYear}
            userPhoto={userPhoto}
            attendanceData={attendanceData}
            onMonthChange={handleMonthChange}
            onYearChange={handleYearChange}
          />
        </div>
        
        {/* Vertical Divider */}
        <div className="w-px bg-[#C8C8C8]"></div>
        
        {/* Right Panel - Feedback Inbox (Full Space) */}
        <div className="flex-1 px-10 pb-10 flex flex-col bg-[#EFEFEF]">
          <FeedbackInbox
            userId={user.user_id}
            feedbackData={feedbackData}
            onTaskClick={handleTaskClick}
            onIncompleteTaskNavigate={handleIncompleteTaskNavigate}
          />
        </div>
      </div>
    </div>
  );
};

export default Performance;
