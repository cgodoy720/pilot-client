import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import Swal from 'sweetalert2';

// Icons
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import ComputerIcon from '@mui/icons-material/Computer';
import PublicIcon from '@mui/icons-material/Public';

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

function EventCalendar({ events, onEventClick }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [currentYear, setCurrentYear] = useState(currentDate.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(currentDate.getMonth());

  // Get number of days in a month
  const getDaysInMonth = (year, month) => {
    return new Date(year, month + 1, 0).getDate();
  };

  // Get the first day of the month (0 = Sunday, 6 = Saturday)
  const getFirstDayOfMonth = (year, month) => {
    return new Date(year, month, 1).getDay();
  };

  // Get events for a specific date
  const getEventsForDate = (date) => {
    if (!date) return [];
    
    return events.filter(event => {
      const eventDate = new Date(event.event_date);
      return (
        eventDate.getFullYear() === date.getFullYear() &&
        eventDate.getMonth() === date.getMonth() &&
        eventDate.getDate() === date.getDate()
      );
    });
  };

  // Check if date is today
  const isToday = (date) => {
    const today = new Date();
    return (
      date.getFullYear() === today.getFullYear() &&
      date.getMonth() === today.getMonth() &&
      date.getDate() === today.getDate()
    );
  };

  // Check if date is selected
  const isSelected = (date) => {
    if (!selectedDate) return false;
    return (
      date.getFullYear() === selectedDate.getFullYear() &&
      date.getMonth() === selectedDate.getMonth() &&
      date.getDate() === selectedDate.getDate()
    );
  };

  // Navigate to previous month
  const goToPreviousMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  // Navigate to next month
  const goToNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  // Go to today
  const goToToday = () => {
    const today = new Date();
    setCurrentYear(today.getFullYear());
    setCurrentMonth(today.getMonth());
    setSelectedDate(today);
  };

  // Handle day click
  const handleDayClick = (day) => {
    const date = new Date(currentYear, currentMonth, day);
    setSelectedDate(date);
  };

  // Generate calendar days
  const generateCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentYear, currentMonth);
    const firstDay = getFirstDayOfMonth(currentYear, currentMonth);
    const days = [];

    // Empty cells for days before the first day of month
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }

    return days;
  };

  const calendarDays = generateCalendarDays();
  const selectedDayEvents = selectedDate ? getEventsForDate(selectedDate) : [];

  // Format date for display
  const formatDate = (date) => {
    const options = { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  };

  // Get location icon
  const getLocationIcon = (locationType) => {
    if (locationType === 'virtual') return <ComputerIcon sx={{ fontSize: 14 }} />;
    if (locationType === 'hybrid') return <PublicIcon sx={{ fontSize: 14 }} />;
    return <LocationOnIcon sx={{ fontSize: 14 }} />;
  };

  return (
    <div className="space-y-6">
      {/* Calendar Card */}
      <Card className="border border-[#e0e0e0] bg-white">
        <CardContent className="p-6">
          {/* Month Navigation */}
          <div className="flex items-center justify-between mb-6">
            <Button
              onClick={goToPreviousMonth}
              variant="outline"
              size="sm"
              className="hover:bg-[rgba(66,66,234,0.05)]"
            >
              <ChevronLeftIcon />
            </Button>
            
            <div className="flex items-center gap-4">
              <h2 className="text-xl font-bold text-[#1a1a1a]">
                {MONTHS[currentMonth]} {currentYear}
              </h2>
              <Button
                onClick={goToToday}
                variant="outline"
                size="sm"
                className="text-[#4242ea] border-[#4242ea] hover:bg-[rgba(66,66,234,0.05)]"
              >
                Today
              </Button>
            </div>
            
            <Button
              onClick={goToNextMonth}
              variant="outline"
              size="sm"
              className="hover:bg-[rgba(66,66,234,0.05)]"
            >
              <ChevronRightIcon />
            </Button>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-2">
            {/* Day Headers */}
            {DAYS_OF_WEEK.map(day => (
              <div
                key={day}
                className="text-center text-sm font-semibold text-[#666666] py-2"
              >
                {day}
              </div>
            ))}

            {/* Calendar Days */}
            {calendarDays.map((day, index) => {
              if (!day) {
                return (
                  <div
                    key={`empty-${index}`}
                    className="aspect-square p-2"
                  />
                );
              }

              const date = new Date(currentYear, currentMonth, day);
              const dayEvents = getEventsForDate(date);
              const isTodayDate = isToday(date);
              const isSelectedDate = isSelected(date);

              return (
                <button
                  key={day}
                  onClick={() => handleDayClick(day)}
                  className={`
                    aspect-square p-2 rounded-lg border-2 transition-all
                    flex flex-col items-center justify-between
                    ${isTodayDate && !isSelectedDate 
                      ? 'border-[#4242ea] bg-[rgba(66,66,234,0.1)]' 
                      : 'border-transparent'
                    }
                    ${isSelectedDate 
                      ? 'bg-[#4242ea] text-white border-[#4242ea]' 
                      : 'hover:bg-gray-100'
                    }
                    ${!isSelectedDate && !isTodayDate ? 'text-[#1a1a1a]' : ''}
                  `}
                >
                  <span className="text-sm font-medium">{day}</span>
                  
                  {/* Event Indicators */}
                  {dayEvents.length > 0 && (
                    <div className="flex gap-0.5 mt-1">
                      {Array.from({ length: Math.min(dayEvents.length, 3) }).map((_, i) => (
                        <div
                          key={i}
                          className={`w-1.5 h-1.5 rounded-full ${
                            isSelectedDate ? 'bg-white' : 'bg-[#4242ea]'
                          }`}
                        />
                      ))}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Selected Day Events */}
      {selectedDate && (
        <Card className="border border-[#e0e0e0] bg-white">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <CalendarTodayIcon className="text-[#4242ea]" />
              <h3 className="text-lg font-bold text-[#1a1a1a]">
                {formatDate(selectedDate)}
              </h3>
              {selectedDayEvents.length > 0 && (
                <Badge className="bg-[#4242ea] text-white ml-2">
                  {selectedDayEvents.length} {selectedDayEvents.length === 1 ? 'event' : 'events'}
                </Badge>
              )}
            </div>

            {selectedDayEvents.length === 0 ? (
              <div className="text-center py-8 text-[#666666]">
                <CalendarTodayIcon sx={{ fontSize: 48, color: '#cccccc' }} />
                <p className="mt-2">No events scheduled for this day</p>
              </div>
            ) : (
              <div className="space-y-3">
                {selectedDayEvents.map(event => (
                  <div
                    key={event.event_id}
                    onClick={() => {
                      // Placeholder for Phase 3.4
                      Swal.fire({
                        toast: true,
                        icon: 'info',
                        title: 'Event details coming soon!',
                        position: 'top-end',
                        showConfirmButton: false,
                        timer: 3000,
                        timerProgressBar: true
                      });
                    }}
                    className="p-4 border border-[#e0e0e0] rounded-lg hover:shadow-md transition-shadow cursor-pointer hover:border-[#4242ea]"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-[#1a1a1a] mb-2">
                          {event.title}
                        </h4>
                        
                        <div className="flex flex-wrap gap-3 text-sm text-[#666666]">
                          {/* Time */}
                          {event.event_time && (
                            <div className="flex items-center gap-1">
                              <AccessTimeIcon sx={{ fontSize: 16 }} className="text-[#4242ea]" />
                              <span>{event.event_time}</span>
                            </div>
                          )}
                          
                          {/* Location */}
                          <div className="flex items-center gap-1">
                            {getLocationIcon(event.location_type)}
                            <span className="capitalize">
                              {event.location_type === 'in_person' 
                                ? (event.venue_name || 'In-Person')
                                : event.location_type.replace('_', ' ')
                              }
                            </span>
                          </div>
                        </div>

                        {/* Topics */}
                        {event.topics && event.topics.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-2">
                            {event.topics.slice(0, 2).map((topic, index) => (
                              <Badge 
                                key={index}
                                variant="outline"
                                className="text-xs bg-[rgba(66,66,234,0.05)] text-[#4242ea] border-[#4242ea]"
                              >
                                {topic}
                              </Badge>
                            ))}
                            {event.topics.length > 2 && (
                              <Badge variant="outline" className="text-xs text-[#666666]">
                                +{event.topics.length - 2}
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Event Image Thumbnail */}
                      {event.image_url && (
                        <img 
                          src={event.image_url} 
                          alt={event.title}
                          className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
                        />
                      )}
                    </div>

                    {/* Registration Status */}
                    {event.user_registration && (
                      <div className="mt-3 pt-3 border-t border-[#e0e0e0]">
                        <Badge className="bg-green-100 text-green-800 border-green-300">
                          {event.user_registration.registration_status === 'interested' 
                            ? "You're Interested" 
                            : "You're Going"}
                        </Badge>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* No Date Selected Message */}
      {!selectedDate && (
        <Card className="border border-[#e0e0e0] bg-white">
          <CardContent className="p-12 text-center">
            <CalendarTodayIcon sx={{ fontSize: 48, color: '#cccccc' }} />
            <p className="text-[#666666] mt-2">
              Click on a date to view events for that day
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default EventCalendar;
