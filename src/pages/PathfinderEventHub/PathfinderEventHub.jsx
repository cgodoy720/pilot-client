import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Swal from 'sweetalert2';
import LoadingCurtain from '../../components/LoadingCurtain/LoadingCurtain';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Input } from '../../components/ui/input';
import { Checkbox } from '../../components/ui/checkbox';
import EventCard from './EventCard';
import EventCalendar from './EventCalendar';
import AddEventDialog from './AddEventDialog';

// Icons
import ViewListIcon from '@mui/icons-material/ViewList';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';

const API_URL = import.meta.env.VITE_API_URL;

function PathfinderEventHub() {
  const { token } = useAuth();
  const location = useLocation();
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [view, setView] = useState('list'); // 'list' or 'calendar'
  const [filter, setFilter] = useState('all'); // 'all', 'going', 'attended'
  const [locationFilter, setLocationFilter] = useState('all'); // 'all', 'in_person', 'virtual', 'hybrid'
  const [typeFilter, setTypeFilter] = useState('all'); // 'all', 'hackathon', 'networking', etc.
  const [searchQuery, setSearchQuery] = useState('');
  const [freeOnly, setFreeOnly] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);

  useEffect(() => {
    fetchEvents();
  }, [token]);

  useEffect(() => {
    if (location.state?.openAddDialog) {
      setShowAddDialog(true);
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const fetchEvents = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_URL}/api/pathfinder/events`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch events');
      }
      
      const data = await response.json();
      setEvents(data);
    } catch (error) {
      console.error('Error fetching events:', error);
      Swal.fire({
        toast: true,
        icon: 'error',
        title: 'Failed to load events',
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddEvent = () => {
    setShowAddDialog(true);
  };

  const handleViewChange = (newView) => {
    setView(newView);
  };

  const filteredEvents = events.filter(event => {
    // My Events filter
    if (filter === 'going' && event.user_registration?.registration_status !== 'attending') return false;
    if (filter === 'attended' && event.user_registration?.registration_status !== 'attended') return false;

    // Location filter
    if (locationFilter !== 'all' && event.location_type !== locationFilter) return false;

    // Type filter
    if (typeFilter !== 'all' && event.event_type !== typeFilter) return false;

    // Search filter - match title or description
    if (searchQuery && !event.title?.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !event.description?.toLowerCase().includes(searchQuery.toLowerCase())) return false;

    // Free only filter
    if (freeOnly && event.cost > 0) return false;

    return true;
  });

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <LoadingCurtain isLoading={isLoading} />
      
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#1a1a1a]">EventHub</h1>
          <p className="text-[#666666] text-sm mt-1">
            Discover and attend tech events to grow your network
          </p>
        </div>
        <Button 
          onClick={handleAddEvent}
          className="bg-[#4242ea] hover:bg-[#3535c9] text-white font-semibold px-6"
        >
          + Add Event
        </Button>
      </div>

      {/* View Toggle & Filters */}
      <div className="flex flex-col sm:flex-row flex-wrap gap-4 mb-6">
        {/* Search Input */}
        <div className="w-64">
          <Input
            type="text"
            placeholder="Search events..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-white border-[#e0e0e0]"
          />
        </div>

        {/* Free Only Checkbox */}
        <div className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg border border-[#e0e0e0]">
          <Checkbox
            id="freeOnly"
            checked={freeOnly}
            onCheckedChange={setFreeOnly}
          />
          <label
            htmlFor="freeOnly"
            className="text-sm font-medium text-[#1a1a1a] cursor-pointer"
          >
            Free only
          </label>
        </div>

        {/* View Toggle */}
        <div className="flex gap-2 bg-white rounded-lg p-1 border border-[#e0e0e0]">
          <button
            onClick={() => handleViewChange('list')}
            className={`px-4 py-2 rounded-md flex items-center gap-2 transition-all ${
              view === 'list'
                ? 'bg-[#4242ea] text-white'
                : 'text-[#666666] hover:bg-[rgba(66,66,234,0.05)]'
            }`}
          >
            <ViewListIcon fontSize="small" />
            <span className="font-medium">List</span>
          </button>
          <button
            onClick={() => handleViewChange('calendar')}
            className={`px-4 py-2 rounded-md flex items-center gap-2 transition-all ${
              view === 'calendar'
                ? 'bg-[#4242ea] text-white'
                : 'text-[#666666] hover:bg-[rgba(66,66,234,0.05)]'
            }`}
          >
            <CalendarMonthIcon fontSize="small" />
            <span className="font-medium">Calendar</span>
          </button>
        </div>

        {/* My Events Filter */}
        <div className="w-40">
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="bg-white border-[#e0e0e0]">
              <SelectValue placeholder="My Events" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Events</SelectItem>
              <SelectItem value="going">Going</SelectItem>
              <SelectItem value="attended">Attended</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Location Filter */}
        <div className="w-40">
          <Select value={locationFilter} onValueChange={setLocationFilter}>
            <SelectTrigger className="bg-white border-[#e0e0e0]">
              <SelectValue placeholder="Location" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Locations</SelectItem>
              <SelectItem value="in_person">In-Person</SelectItem>
              <SelectItem value="virtual">Virtual</SelectItem>
              <SelectItem value="hybrid">Hybrid</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Type Filter */}
        <div className="w-40">
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="bg-white border-[#e0e0e0]">
              <SelectValue placeholder="Event Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="hackathon">Hackathon</SelectItem>
              <SelectItem value="networking">Networking</SelectItem>
              <SelectItem value="conference">Conference</SelectItem>
              <SelectItem value="workshop">Workshop</SelectItem>
              <SelectItem value="meetup">Meetup</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* List View */}
      {view === 'list' && (
        <div className="space-y-4">
          {filteredEvents.length === 0 ? (
            <Card className="p-12 text-center border border-[#e0e0e0] bg-white">
              <div className="flex flex-col items-center gap-3">
                <CalendarMonthIcon sx={{ fontSize: 48, color: '#cccccc' }} />
                <h3 className="text-lg font-semibold text-[#1a1a1a]">
                  No events found
                </h3>
                <p className="text-[#666666] max-w-md">
                  {filter === 'all' 
                    ? 'No upcoming events at the moment. Check back soon or add your own!'
                    : 'No events match your current filter. Try changing your selection.'}
                </p>
                {filter === 'all' && (
                  <Button 
                    onClick={handleAddEvent}
                    className="mt-4 bg-[#4242ea] hover:bg-[#3535c9] text-white"
                  >
                    Add Your First Event
                  </Button>
                )}
              </div>
            </Card>
          ) : (
            filteredEvents.map(event => (
              <EventCard 
                key={event.event_id} 
                event={event}
                onUpdate={fetchEvents}
              />
            ))
          )}
        </div>
      )}

      {/* Calendar View */}
      {view === 'calendar' && (
        <EventCalendar 
          events={filteredEvents}
          onEventClick={(event) => {
            // Placeholder for Phase 3.4 - Event detail modal
            console.log('Event clicked:', event);
          }}
        />
      )}

      {/* Add Event Dialog */}
      <AddEventDialog 
        isOpen={showAddDialog}
        onClose={() => setShowAddDialog(false)}
        onEventAdded={() => {
          setShowAddDialog(false);
          fetchEvents();
        }}
      />
    </div>
  );
}

export default PathfinderEventHub;
