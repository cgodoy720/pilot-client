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
  const [debugInfo, setDebugInfo] = useState({
    photoSource: 'loading',
    attendanceSource: 'loading',
    feedbackCount: 0
  });

  // Load user photo (real API call with fallback)
  useEffect(() => {
    const loadUserPhoto = async () => {
      if (user?.user_id && token) {
        try {
          // Try real API call first
          const photoUrl = await getUserProfilePhoto(user.user_id, token);
          setUserPhoto(photoUrl);
          setDebugInfo(prev => ({ ...prev, photoSource: 'api' }));
          console.log('✅ Loaded user photo from API:', photoUrl);
        } catch (error) {
          console.error('Failed to load user photo:', error);
          // Fallback to default avatar
          setUserPhoto('/assets/default-avatar.png');
          setDebugInfo(prev => ({ ...prev, photoSource: 'fallback' }));
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
          setDebugInfo(prev => ({ ...prev, attendanceSource: 'api' }));
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
          setDebugInfo(prev => ({ ...prev, attendanceSource: 'mock' }));
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
          setDebugInfo(prev => ({ ...prev, feedbackCount: feedback.length }));
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
    <div className="min-h-screen bg-background p-4">
      {/* Debug Info Panel (temporary) */}
      <div className="max-w-7xl mx-auto mb-4">
        <div className="bg-muted/50 border border-border rounded-lg p-3 text-xs">
          <span className="font-semibold">Debug Info:</span>
          <span className="ml-2">Photo: {debugInfo.photoSource}</span>
          <span className="ml-2">Attendance: {debugInfo.attendanceSource}</span>
          <span className="ml-2">Feedback: {debugInfo.feedbackCount} items</span>
          <span className="ml-2">User ID: {user?.user_id}</span>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-[calc(100vh-6rem)] max-w-7xl mx-auto">
        {/* Left Panel - Attendance Calendar */}
        <div className="bg-card border border-border rounded-xl p-6 overflow-hidden flex flex-col">
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
        
        {/* Right Panel - Feedback Inbox */}
        <div className="bg-card border border-border rounded-xl p-6 overflow-hidden flex flex-col">
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
