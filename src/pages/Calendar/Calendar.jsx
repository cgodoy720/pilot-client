import React, { useState, useEffect } from 'react';
import { Calendar as BigCalendar, dateFnsLocalizer } from 'react-big-calendar';
import { useNavigate } from 'react-router-dom';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import enUS from 'date-fns/locale/en-US';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import './Calendar.css';
import { useAuth } from '../../context/AuthContext';

const locales = {
  'en-US': enUS
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

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
        
        // Convert curriculum days to calendar events
        const calendarEvents = data.map(day => {
          // Parse the date string to a Date object
          const date = new Date(day.day_date);
          
          return {
            id: day.id,
            title: `Day ${day.day_number}: ${day.daily_goal}`,
            start: date,
            end: date,
            allDay: true,
            dayNumber: day.day_number,
            dayType: day.day_type,
            resource: day // Store the full day object as a resource
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

  const handleSelectEvent = (event) => {
    // Navigate to the Learning page with the selected day's ID
    navigate(`/learning?dayId=${event.id}`);
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
            <BigCalendar
              localizer={localizer}
              events={events}
              startAccessor="start"
              endAccessor="end"
              style={{ height: 'calc(100vh - 120px)' }}
              className="dark-calendar"
              onSelectEvent={handleSelectEvent}
              tooltipAccessor={(event) => `${event.title}\nClick to view tasks`}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Calendar; 