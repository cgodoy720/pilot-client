import React, { useState } from 'react';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import Swal from 'sweetalert2';

// Icons
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import ComputerIcon from '@mui/icons-material/Computer';
import PeopleIcon from '@mui/icons-material/People';
import PublicIcon from '@mui/icons-material/Public';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import StarIcon from '@mui/icons-material/Star';

const API_URL = import.meta.env.VITE_API_URL;

function EventCard({ event, onUpdate }) {
  const [isUpdating, setIsUpdating] = useState(false);
  
  const userRegistration = event.user_registration;
  const isRegistered = userRegistration !== null && userRegistration !== undefined;
  const registrationStatus = userRegistration?.registration_status;

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const options = { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  };

  // Format time
  const formatTime = (timeString) => {
    if (!timeString) return '';
    return timeString;
  };

  // Get location icon and text
  const getLocationInfo = () => {
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

  const locationInfo = getLocationInfo();

  // Handle RSVP
  const handleRSVP = async (status) => {
    // Placeholder for Phase 3.4
    Swal.fire({
      toast: true,
      icon: 'info',
      title: 'RSVP functionality coming soon!',
      position: 'top-end',
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true
    });
  };

  return (
    <Card className="hover:shadow-lg transition-shadow border border-[#e0e0e0] bg-white">
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Event Image or Placeholder */}
          <div className="flex-shrink-0">
            {event.image_url ? (
              <img 
                src={event.image_url} 
                alt={event.title}
                className="w-full md:w-48 h-32 object-cover rounded-lg"
              />
            ) : (
              <div className="w-full md:w-48 h-32 bg-gradient-to-br from-[#4242ea] to-[#6b6bec] rounded-lg flex items-center justify-center">
                <CalendarTodayIcon sx={{ fontSize: 48, color: 'white' }} />
              </div>
            )}
          </div>

          {/* Event Details */}
          <div className="flex-1 min-w-0">
            {/* Title and Featured Badge */}
            <div className="flex items-start gap-3 mb-3">
              <h3 className="text-xl font-bold text-[#1a1a1a] flex-1">
                {event.title}
              </h3>
              {event.is_featured && (
                <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300 flex items-center gap-1">
                  <StarIcon sx={{ fontSize: 14 }} />
                  Featured
                </Badge>
              )}
            </div>

            {/* Description */}
            {event.description && (
              <p className="text-[#666666] text-sm mb-4 line-clamp-2">
                {event.description}
              </p>
            )}

            {/* Event Meta Information */}
            <div className="flex flex-wrap gap-4 mb-4 text-sm">
              {/* Date */}
              <div className="flex items-center gap-2 text-[#1a1a1a]">
                <CalendarTodayIcon fontSize="small" className="text-[#4242ea]" />
                <span className="font-medium">{formatDate(event.event_date)}</span>
              </div>

              {/* Time */}
              {event.event_time && (
                <div className="flex items-center gap-2 text-[#1a1a1a]">
                  <AccessTimeIcon fontSize="small" className="text-[#4242ea]" />
                  <span>{formatTime(event.event_time)}</span>
                </div>
              )}

              {/* Registration Count */}
              {event.registration_count > 0 && (
                <div className="flex items-center gap-2 text-[#666666]">
                  <PeopleIcon fontSize="small" />
                  <span>{event.registration_count} {event.registration_count === 1 ? 'person' : 'people'} interested</span>
                </div>
              )}
            </div>

            {/* Location Badge */}
            <div className="mb-4">
              <Badge className={`${locationInfo.color} flex items-center gap-1 w-fit`}>
                {locationInfo.icon}
                {locationInfo.text}
              </Badge>
            </div>

            {/* Topics */}
            {event.topics && event.topics.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {event.topics.slice(0, 3).map((topic, index) => (
                  <Badge 
                    key={index}
                    variant="outline" 
                    className="bg-[rgba(66,66,234,0.05)] text-[#4242ea] border-[#4242ea]"
                  >
                    {topic}
                  </Badge>
                ))}
                {event.topics.length > 3 && (
                  <Badge variant="outline" className="text-[#666666]">
                    +{event.topics.length - 3} more
                  </Badge>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3">
              {!isRegistered ? (
                <>
                  <Button
                    onClick={() => handleRSVP('interested')}
                    disabled={isUpdating}
                    variant="outline"
                    className="border-[#4242ea] text-[#4242ea] hover:bg-[rgba(66,66,234,0.05)]"
                  >
                    I'm Interested
                  </Button>
                  <Button
                    onClick={() => handleRSVP('attending')}
                    disabled={isUpdating}
                    className="bg-[#4242ea] hover:bg-[#3535c9] text-white"
                  >
                    I'm Going
                  </Button>
                </>
              ) : (
                <div className="flex items-center gap-3">
                  <Badge className="bg-green-100 text-green-800 border-green-300 flex items-center gap-1 px-3 py-1">
                    <CheckCircleIcon sx={{ fontSize: 16 }} />
                    {registrationStatus === 'interested' ? "You're Interested" : "You're Going"}
                  </Badge>
                  <Button
                    onClick={() => handleRSVP('cancel')}
                    disabled={isUpdating}
                    variant="outline"
                    size="sm"
                    className="text-[#666666] hover:text-[#1a1a1a]"
                  >
                    Cancel RSVP
                  </Button>
                </div>
              )}
              
              {/* View Details Button */}
              <Button
                variant="outline"
                className="ml-auto text-[#666666] hover:text-[#1a1a1a]"
                onClick={() => {
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
              >
                View Details
              </Button>
            </div>

            {/* Price */}
            {event.price !== null && event.price !== undefined && (
              <div className="mt-3 text-sm">
                <span className="text-[#666666]">
                  {event.price === 0 ? (
                    <span className="font-semibold text-green-600">Free Event</span>
                  ) : (
                    <span className="font-semibold text-[#1a1a1a]">${event.price}</span>
                  )}
                </span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default EventCard;
