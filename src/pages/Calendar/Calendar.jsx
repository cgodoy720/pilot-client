import React, { useState } from 'react';
import { Calendar as BigCalendar, dateFnsLocalizer } from 'react-big-calendar';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import enUS from 'date-fns/locale/en-US';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import './Calendar.css';

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

// Sample events - updated to use current year
const currentYear = new Date().getFullYear();
const currentMonth = new Date().getMonth();

const sampleEvents = [
  {
    title: 'Meeting with Design Team',
    start: new Date(currentYear, currentMonth, 15, 10, 0),
    end: new Date(currentYear, currentMonth, 15, 11, 30),
  },
  {
    title: 'Product Launch',
    start: new Date(currentYear, currentMonth, 20, 14, 0),
    end: new Date(currentYear, currentMonth, 20, 16, 30),
  },
  {
    title: 'Client Presentation',
    start: new Date(currentYear, currentMonth, 25, 9, 0),
    end: new Date(currentYear, currentMonth, 25, 10, 30),
  },
];

function Calendar() {
  const [events] = useState(sampleEvents);

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
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Calendar; 