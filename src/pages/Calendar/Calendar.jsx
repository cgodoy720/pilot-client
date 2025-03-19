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
  const { token } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCurriculumDays = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/curriculum/days`, {
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
          return {
            id: day.id,
            title: `Day ${day.day_number}: ${day.daily_goal}`,
            date: day.day_date,
            allDay: true,
            extendedProps: {
              dayNumber: day.day_number,
              dayType: day.day_type,
              resource: day // Store the full day object
            }
          };
        });
        
        setEvents(calendarEvents);
      } catch (error) {
        console.error('Error fetching curriculum days:', error);
        setError('Failed to load curriculum days. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchCurriculumDays();
  }, [token]);

  const handleEventClick = (clickInfo) => {
    // Navigate to the Learning page with the selected day's ID
    navigate(`/learning?dayId=${clickInfo.event.id}`);
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
          </div>
        </div>
      </div>
    </div>
  );
}

export default Calendar; 