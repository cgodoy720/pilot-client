import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Swal from 'sweetalert2';
import LoadingCurtain from '../../components/LoadingCurtain/LoadingCurtain';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';

// Icons
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import ComputerIcon from '@mui/icons-material/Computer';
import PublicIcon from '@mui/icons-material/Public';
import PeopleIcon from '@mui/icons-material/People';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import StarIcon from '@mui/icons-material/Star';
import LaunchIcon from '@mui/icons-material/Launch';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';

const API_URL = import.meta.env.VITE_API_URL;

function EventDetailPage() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  const [event, setEvent] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    fetchEvent();
  }, [eventId, token]);

  const fetchEvent = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_URL}/api/pathfinder/events/${eventId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Event not found');
        }
        throw new Error('Failed to fetch event');
      }

      const data = await response.json();
      setEvent(data);
    } catch (error) {
      console.error('Error fetching event:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.message || 'Failed to load event details',
        confirmButtonColor: '#4242ea'
      }).then(() => {
        navigate('/pathfinder/events');
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const options = { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  };

  // Format time
  const formatTime = (timeString) => {
    if (!timeString) return '';
    return timeString;
  };

  // Check if event is in the past
  const isPastEvent = event ? new Date(event.event_date) < new Date(new Date().toDateString()) : false;

  // Get location info
  const getLocationInfo = () => {
    if (!event) return { icon: null, text: '', color: '' };

    if (event.location_type === 'virtual') {
      return {
        icon: <ComputerIcon fontSize="small" />,
        text: 'Virtual Event',
        color: 'bg-blue-100 text-blue-700'
      };
    } else if (event.location_type === 'in_person') {
      return {
        icon: <LocationOnIcon fontSize="small" />,
        text: event.venue_name || `${event.city}, ${event.state}` || 'In-Person',
        color: 'bg-green-100 text-green-700'
      };
    } else if (event.location_type === 'hybrid') {
      return {
        icon: <PublicIcon fontSize="small" />,
        text: 'Hybrid Event',
        color: 'bg-purple-100 text-purple-700'
      };
    }
    return {
      icon: <LocationOnIcon fontSize="small" />,
      text: 'Location TBD',
      color: 'bg-gray-100 text-gray-700'
    };
  };

  // Handle RSVP
  const handleRSVP = async (action) => {
    setIsUpdating(true);

    try {
      let response;

      if (action === 'attending') {
        response = await fetch(`${API_URL}/api/pathfinder/events/${event.event_id}/register`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ status: 'attending' })
        });
      } else if (action === 'attended') {
        const isRegistered = event.user_registration !== null && event.user_registration !== undefined;
        if (isRegistered) {
          response = await fetch(`${API_URL}/api/pathfinder/events/${event.event_id}/register`, {
            method: 'PUT',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ status: 'attended' })
          });
        } else {
          response = await fetch(`${API_URL}/api/pathfinder/events/${event.event_id}/register`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ status: 'attended' })
          });
        }
      } else if (action === 'cancel') {
        response = await fetch(`${API_URL}/api/pathfinder/events/${event.event_id}/register`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
      }

      if (response.ok) {
        // Refresh event data
        await fetchEvent();

        if (action === 'attended') {
          const result = await Swal.fire({
            icon: 'success',
            title: 'Attendance logged!',
            text: 'Would you like to log a Hustle from this event?',
            showCancelButton: true,
            confirmButtonText: 'Yes, log Hustle',
            cancelButtonText: 'Maybe Later',
            confirmButtonColor: '#4242ea',
            cancelButtonColor: '#6b7280'
          });

          if (result.isConfirmed) {
            const eventDate = event.event_date ? event.event_date.split('T')[0] : new Date().toISOString().split('T')[0];
            const prefillData = {
              type: event.location_type === 'virtual' ? 'digital' : 'irl',
              date: eventDate,
              eventName: event.title || '',
              eventOrganizer: event.organizer || '',
              notes: event.description?.substring(0, 200) || '',
              linkedEventId: event.event_id
            };
            navigate('/pathfinder/networking', {
              state: {
                openForm: true,
                prefillData
              }
            });
          }
        } else {
          const successMessages = {
            attending: "You're going!",
            cancel: "Registration cancelled"
          };
          Swal.fire({
            toast: true,
            icon: 'success',
            title: successMessages[action],
            position: 'top-end',
            showConfirmButton: false,
            timer: 2000,
            timerProgressBar: true
          });
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        Swal.fire({
          toast: true,
          icon: 'error',
          title: errorData.error || 'Something went wrong',
          position: 'top-end',
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true
        });
      }
    } catch (error) {
      console.error('RSVP error:', error);
      Swal.fire({
        toast: true,
        icon: 'error',
        title: 'Failed to update RSVP',
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true
      });
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return <LoadingCurtain isLoading={true} />;
  }

  if (!event) {
    return null;
  }

  const locationInfo = getLocationInfo();
  const userRegistration = event.user_registration;
  const isRegistered = userRegistration !== null && userRegistration !== undefined;
  const registrationStatus = userRegistration?.registration_status;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Back Button */}
      <Button
        variant="ghost"
        onClick={() => navigate('/pathfinder/events')}
        className="mb-6 text-[#666666] hover:text-[#1a1a1a] -ml-2"
      >
        <ArrowBackIcon fontSize="small" className="mr-2" />
        Back to Events
      </Button>

      <Card className="border border-[#e0e0e0] bg-white overflow-hidden">
        {/* Event Image or Header */}
        {event.image_url ? (
          <img
            src={event.image_url}
            alt={event.title}
            className="w-full h-64 object-cover"
          />
        ) : (
          <div className="w-full h-48 bg-gradient-to-br from-[#4242ea] to-[#6b6bec] flex items-center justify-center">
            <CalendarTodayIcon sx={{ fontSize: 64, color: 'white' }} />
          </div>
        )}

        <CardContent className="p-8">
          {/* Title and Featured Badge */}
          <div className="flex items-start gap-4 mb-4">
            <h1 className="text-3xl font-bold text-[#1a1a1a] flex-1">
              {event.title}
            </h1>
            {event.is_featured && (
              <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300 flex items-center gap-1">
                <StarIcon sx={{ fontSize: 14 }} />
                Featured
              </Badge>
            )}
          </div>

          {/* Event Meta Information */}
          <div className="flex flex-wrap gap-6 mb-6 text-base">
            {/* Date */}
            <div className="flex items-center gap-2 text-[#1a1a1a]">
              <CalendarTodayIcon className="text-[#4242ea]" />
              <span className="font-medium">{formatDate(event.event_date)}</span>
            </div>

            {/* Time */}
            {event.event_time && (
              <div className="flex items-center gap-2 text-[#1a1a1a]">
                <AccessTimeIcon className="text-[#4242ea]" />
                <span>{formatTime(event.event_time)}</span>
              </div>
            )}

            {/* Registration Count */}
            {event.registration_count > 0 && (
              <div className="flex items-center gap-2 text-[#666666]">
                <PeopleIcon />
                <span>{event.registration_count} {event.registration_count === 1 ? 'person' : 'people'} going</span>
              </div>
            )}
          </div>

          {/* Location Badge */}
          <div className="mb-6">
            <Badge className={`${locationInfo.color} flex items-center gap-1 w-fit text-sm px-3 py-1`}>
              {locationInfo.icon}
              {locationInfo.text}
            </Badge>
          </div>

          {/* Full Address for in-person events */}
          {(event.location_type === 'in_person' || event.location_type === 'hybrid') && event.address && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold text-[#1a1a1a] mb-2 flex items-center gap-2">
                <LocationOnIcon className="text-[#4242ea]" fontSize="small" />
                Venue
              </h3>
              {event.venue_name && <p className="font-medium text-[#1a1a1a]">{event.venue_name}</p>}
              <p className="text-[#666666]">
                {event.address}
                {event.city && `, ${event.city}`}
                {event.state && `, ${event.state}`}
              </p>
            </div>
          )}

          {/* Price */}
          <div className="mb-6 flex items-center gap-2">
            <AttachMoneyIcon className="text-[#4242ea]" />
            {event.price === 0 || event.price === null ? (
              <span className="font-semibold text-green-600 text-lg">Free Event</span>
            ) : (
              <span className="font-semibold text-[#1a1a1a] text-lg">${event.price}</span>
            )}
          </div>

          {/* Topics */}
          {event.topics && event.topics.length > 0 && (
            <div className="mb-6">
              <h3 className="font-semibold text-[#1a1a1a] mb-3">Topics</h3>
              <div className="flex flex-wrap gap-2">
                {event.topics.map((topic, index) => (
                  <Badge
                    key={index}
                    variant="outline"
                    className="bg-[rgba(66,66,234,0.05)] text-[#4242ea] border-[#4242ea]"
                  >
                    {topic}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Description */}
          {event.description && (
            <div className="mb-8">
              <h3 className="font-semibold text-[#1a1a1a] mb-3">About This Event</h3>
              <p className="text-[#666666] whitespace-pre-wrap leading-relaxed">
                {event.description}
              </p>
            </div>
          )}

          {/* External Link */}
          {event.external_url && (
            <div className="mb-8">
              <a
                href={event.external_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-[#4242ea] hover:underline"
              >
                <LaunchIcon fontSize="small" />
                View Original Event Page
              </a>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-4 pt-6 border-t border-[#e0e0e0]">
            {registrationStatus === 'attended' ? (
              <Badge className="bg-green-100 text-green-800 border-green-300 flex items-center gap-1 px-4 py-2 text-base">
                <CheckCircleIcon sx={{ fontSize: 20 }} />
                Attended ✓
              </Badge>
            ) : !isRegistered ? (
              isPastEvent ? (
                <Button
                  onClick={() => handleRSVP('attended')}
                  disabled={isUpdating}
                  className="bg-[#4242ea] hover:bg-[#3535c9] text-white px-8"
                  size="lg"
                >
                  I Attended
                </Button>
              ) : (
                <Button
                  onClick={() => handleRSVP('attending')}
                  disabled={isUpdating}
                  className="bg-[#4242ea] hover:bg-[#3535c9] text-white px-8"
                  size="lg"
                >
                  I'm Going
                </Button>
              )
            ) : (
              isPastEvent ? (
                <div className="flex items-center gap-4">
                  <Badge className="bg-blue-100 text-blue-800 border-blue-300 flex items-center gap-1 px-4 py-2 text-base">
                    <CheckCircleIcon sx={{ fontSize: 20 }} />
                    RSVP'd
                  </Badge>
                  <Button
                    onClick={() => handleRSVP('attended')}
                    disabled={isUpdating}
                    className="bg-[#4242ea] hover:bg-[#3535c9] text-white"
                  >
                    I Attended
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-4">
                  <Badge className="bg-green-100 text-green-800 border-green-300 flex items-center gap-1 px-4 py-2 text-base">
                    <CheckCircleIcon sx={{ fontSize: 20 }} />
                    Going ✓
                  </Badge>
                  <Button
                    onClick={() => handleRSVP('cancel')}
                    disabled={isUpdating}
                    variant="outline"
                    className="text-[#666666] hover:text-[#1a1a1a]"
                  >
                    Cancel Registration
                  </Button>
                </div>
              )
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default EventDetailPage;
