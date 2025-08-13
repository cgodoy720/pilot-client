import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './AttendanceDashboard.css';

const AttendanceDashboard = () => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Check for attendance token and user data
    const attendanceToken = localStorage.getItem('attendanceToken');
    const attendanceUser = localStorage.getItem('attendanceUser');

    if (!attendanceToken || !attendanceUser) {
      // No attendance session, redirect to login
      navigate('/attendance-login');
      return;
    }

    try {
      const userData = JSON.parse(attendanceUser);
      setUser(userData);
    } catch (error) {
      console.error('Error parsing attendance user data:', error);
      localStorage.removeItem('attendanceToken');
      localStorage.removeItem('attendanceUser');
      navigate('/attendance-login');
      return;
    }

    setIsLoading(false);
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('attendanceToken');
    localStorage.removeItem('attendanceUser');
    navigate('/attendance-login');
  };

  if (isLoading) {
    return (
      <div className="attendance-dashboard-loading">
        <div className="loading-spinner">Loading...</div>
      </div>
    );
  }

  return (
    <div className="attendance-dashboard">
      <div className="attendance-dashboard-header">
        <h1>Attendance Management Dashboard</h1>
        <div className="attendance-user-info">
          <span>Welcome, {user?.firstName} {user?.lastName}</span>
          <button onClick={handleLogout} className="logout-button">
            Logout
          </button>
        </div>
      </div>
      
      <div className="attendance-dashboard-content">
        <div className="attendance-dashboard-card">
          <h2>Builder Check-in</h2>
          <p>Camera-based attendance system for builders</p>
          <button className="attendance-action-button">
            Start Check-in Session
          </button>
        </div>
        
        <div className="attendance-dashboard-card">
          <h2>Today's Attendance</h2>
          <p>View current day attendance records</p>
          <button className="attendance-action-button">
            View Attendance
          </button>
        </div>
        
        <div className="attendance-dashboard-card">
          <h2>Builder Search</h2>
          <p>Search and manage builder information</p>
          <button className="attendance-action-button">
            Search Builders
          </button>
        </div>
      </div>
    </div>
  );
};

export default AttendanceDashboard;
