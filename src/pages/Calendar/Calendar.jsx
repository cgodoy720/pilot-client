import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import './Calendar.css';
import { useAuth } from '../../context/AuthContext';

function Calendar() {
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { token, user } = useAuth();
  const navigate = useNavigate();
  const [cohortFilter, setCohortFilter] = useState(null);

  useEffect(() => {
    const fetchCurriculumDays = async () => {
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
        
        const data = await response.json();
        
        // Convert curriculum days to FullCalendar events
        const calendarEvents = data.map(day => {
          console.log('Day data from API:', day); // Log the individual day data

          // Create a date string without time portion to avoid timezone issues
          // This ensures the date is displayed exactly as stored in the database
          const dayDate = day.day_date.split('T')[0]; // Extract just the YYYY-MM-DD part
          
          return {
            id: day.id, // Use id which matches the database column name
            title: `Day ${day.day_number}: ${day.daily_goal}`,
            date: dayDate, // Use just the date portion without time
            allDay: true,
            extendedProps: {
              dayNumber: day.day_number,
              dayType: day.day_type,
              resource: day // Store the full day object
            }
          };
        });
        
        console.log('Calendar events data:', calendarEvents);
        
        setEvents(calendarEvents);
      } catch (error) {
        console.error('Error fetching curriculum days:', error);
        setError('Failed to load curriculum days. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchCurriculumDays();
  }, [token, cohortFilter]);

  const handleEventClick = (clickInfo) => {
    console.log('Event clicked:', clickInfo.event);
    console.log('Event ID:', clickInfo.event.id);
    console.log('Event extendedProps:', clickInfo.event.extendedProps);
    
    const dayNumber = clickInfo.event.extendedProps.dayNumber;
    
    // Fix: Create date strings using local timezone instead of UTC
    const today = new Date();
    // Format using YYYY-MM-DD with local timezone
    const todayString = today.getFullYear() + '-' + 
                       String(today.getMonth() + 1).padStart(2, '0') + '-' + 
                       String(today.getDate()).padStart(2, '0');
    
    const clickedDateString = clickInfo.event.startStr; // Already in YYYY-MM-DD format
    
    console.log('Today (local):', todayString, 'Clicked:', clickedDateString);
    
    // For staff/admin users, pass the selected cohort
    let url;
    if (clickedDateString === todayString) {
      // Today - navigate to Learning page
      url = `/learning?dayNumber=${dayNumber}`;
    } else {
      // Past or future day - navigate to PastSession page
      url = `/past-session?dayNumber=${dayNumber}`;
    }

    // If staff/admin user has selected a cohort, add it to the URL
    if (cohortFilter && (user.role === 'staff' || user.role === 'admin')) {
      url += `&cohort=${encodeURIComponent(cohortFilter)}`;
    }
    
    console.log('Navigating to URL:', url);
    navigate(url);
  };

  if (isLoading) {
    return (
      <div className="calendar">
        <div className="calendar__content">
          <div className="loading-message">Loading calendar data...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="calendar">
        <div className="calendar__content">
          <div className="error-message">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="calendar">
      <div className="calendar__content">
        <div className="calendar-container">
          <div className="calendar-view">
            <div className="calendar__toolbar">
              <FullCalendar
                plugins={[dayGridPlugin]}
                initialView="dayGridMonth"
                headerToolbar={{
                  left: 'prev,next today',
                  center: 'title',
                  right: ''
                }}
                events={events}
                eventClick={handleEventClick}
                eventDidMount={(info) => {
                  // Add tooltip
                  info.el.title = `${info.event.title}\nClick to view tasks`;
                }}
                height="calc(100vh - 120px)"
              />
              
              {/* Render cohort selector in the toolbar space for staff/admin */}
              {(user.role === 'staff' || user.role === 'admin') && (
                <div className="calendar__cohort-filter">
                  <label>Cohort:</label>
                  <select 
                    value={cohortFilter || ''} 
                    onChange={(e) => setCohortFilter(e.target.value || null)}
                  >
                    <option value="">My Cohort</option>
                    <option value="March 2025">March 2025</option>
                    <option value="June 2025">June 2025</option>
                    <option value="September 2025">September 2025</option>
                    {/* Add more cohorts as needed */}
                  </select>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Calendar; 