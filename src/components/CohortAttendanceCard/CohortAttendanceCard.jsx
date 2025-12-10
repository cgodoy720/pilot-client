import React from 'react';
import './CohortAttendanceCard.css';

const CohortAttendanceCard = ({ 
  cohortName, 
  cohortLevel, 
  attendees = [], 
  className = '' 
}) => {


  // Get cohort display name
  const getCohortDisplayName = (level, name) => {
    return `${level} ${name} Cohort`;
  };

  // Get placeholder photo for attendees without photos
  const getAttendeePhoto = (attendee) => {
    if (attendee.photoUrl) {
      // If it's already a full URL, use it as is
      if (attendee.photoUrl.startsWith('http') || attendee.photoUrl.startsWith('data:')) {
        return attendee.photoUrl;
      }
      // If it's a relative path, prefix with API URL
      return `${import.meta.env.VITE_API_URL}${attendee.photoUrl}`;
    }
    // Return a placeholder photo - you can replace this with an actual placeholder image
    return `data:image/svg+xml;base64,${btoa(`
      <svg width="100" height="100" xmlns="http://www.w3.org/2000/svg">
        <rect width="100" height="100" fill="#6366f1" opacity="0.1"/>
        <circle cx="50" cy="35" r="15" fill="#6366f1" opacity="0.3"/>
        <rect x="25" y="55" width="50" height="30" rx="15" fill="#6366f1" opacity="0.3"/>
        <text x="50" y="85" text-anchor="middle" font-family="Arial" font-size="12" fill="#6366f1">${(attendee.firstName && attendee.firstName !== 'Unknown') ? attendee.firstName.charAt(0) : '?'}</text>
      </svg>
    `)}`;
  };

  if (attendees.length === 0) {
    return (
      <div className={`cohort-attendance-card ${className}`}>
        <div className="card-header">
          <div className="card-icon">👥</div>
          <h2>{getCohortDisplayName(cohortLevel, cohortName)} Present Today (0)</h2>
        </div>
        <div className="cohort-empty-state">
          <div className="empty-icon">📷</div>
          <p>No attendees yet today</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`cohort-attendance-card ${className}`}>
      <div className="card-header">
        <div className="card-icon">👥</div>
        <h2>{getCohortDisplayName(cohortLevel, cohortName)} Present Today ({attendees.length})</h2>
      </div>
      
      <div className="cohort-photos-container">
        <div className="horizontal-thumbnails">
          {attendees.map((attendee, index) => (
            <div 
              key={attendee.attendanceId || index}
              className="attendee-thumbnail"
            >
              <div className="thumbnail-photo">
                <img 
                  src={getAttendeePhoto(attendee)} 
                  alt={`${attendee.firstName} ${attendee.lastName}`}
                  className="thumbnail-image"
                />
              </div>
              <div className="thumbnail-info">
                <p className="attendee-name">
                  {attendee.userType === 'volunteer' && (
                    <span className="volunteer-badge" title="Volunteer">🤝</span>
                  )}
                  {attendee.firstName || 'Unknown'} {attendee.lastName || 'Unknown'}
                </p>
                <p className="check-in-time">
                  {(() => {
                    try {
                      const checkInTime = attendee.checkInTime;
                      if (!checkInTime) return 'Unknown time';
                      
                      // The timestamp is already in Eastern time, so we need to parse it as local time
                      // instead of treating it as UTC
                      const timeString = checkInTime.replace('Z', ''); // Remove the Z to treat as local time
                      const date = new Date(timeString);
                      if (isNaN(date.getTime())) return 'Unknown time';
                      
                      return date.toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit'
                      });
                    } catch (error) {
                      return 'Unknown time';
                    }
                  })()}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CohortAttendanceCard;
