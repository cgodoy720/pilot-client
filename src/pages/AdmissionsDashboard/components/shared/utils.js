/**
 * Shared utility functions for AdmissionsDashboard
 */

// Format phone number to (000) 000-0000 format
export const formatPhoneNumber = (phoneNumber) => {
  if (!phoneNumber) return 'N/A';
  const cleaned = phoneNumber.replace(/\D/g, '');
  if (cleaned.length === 10) {
    return `(${cleaned.substring(0, 3)}) ${cleaned.substring(3, 6)}-${cleaned.substring(6, 10)}`;
  }
  return phoneNumber || 'N/A';
};

// Format time from 24-hour to 12-hour EST format
export const formatEventTime = (timeString) => {
  try {
    let hours, minutes;
    
    if (timeString.includes('T') || timeString.includes('-')) {
      const timeMatch = timeString.match(/(\d{2}):(\d{2}):/);
      if (timeMatch) {
        hours = parseInt(timeMatch[1]);
        minutes = parseInt(timeMatch[2]);
      } else {
        return timeString;
      }
    } else {
      [hours, minutes] = timeString.split(':').map(n => parseInt(n));
    }

    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    const displayMinutes = minutes.toString().padStart(2, '0');
    
    return `${displayHours}:${displayMinutes} ${period}`;
  } catch (error) {
    console.error('Error formatting time:', error);
    return timeString;
  }
};

// Check if an event has passed
export const isEventPast = (eventDate, eventTime) => {
  const eventDateTime = new Date(`${eventDate} ${eventTime}`);
  return eventDateTime < new Date();
};

// Copy text to clipboard with feedback
export const copyToClipboard = async (text, type) => {
  try {
    await navigator.clipboard.writeText(text);
    console.log(`${type} copied to clipboard: ${text}`);
    return true;
  } catch (err) {
    console.error('Failed to copy to clipboard:', err);
    // Fallback for older browsers
    const textArea = document.createElement('textarea');
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
    return true;
  }
};

// Sort events by date (most recent first by default)
export const sortEventsByDate = (events, ascending = false) => {
  return [...events].sort((a, b) => {
    const dateA = new Date(`${a.event_date} ${a.event_time || '00:00:00'}`);
    const dateB = new Date(`${b.event_date} ${b.event_time || '00:00:00'}`);
    return ascending ? dateA - dateB : dateB - dateA;
  });
};

// Format date for display
export const formatEventDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};

// Get status badge color classes
export const getStatusBadgeClasses = (status) => {
  const statusColors = {
    // Application statuses
    'no_application': 'bg-gray-100 text-gray-700',
    'in_progress': 'bg-yellow-100 text-yellow-800',
    'submitted': 'bg-blue-100 text-blue-800',
    'ineligible': 'bg-red-100 text-red-800',
    
    // Assessment statuses
    'strong_recommend': 'bg-green-100 text-green-800',
    'recommend': 'bg-emerald-100 text-emerald-700',
    'review_needed': 'bg-yellow-100 text-yellow-800',
    'not_recommend': 'bg-red-100 text-red-800',
    'pending': 'bg-gray-100 text-gray-600',
    
    // Attendance statuses
    'registered': 'bg-blue-100 text-blue-700',
    'attended': 'bg-green-100 text-green-800',
    'attended_late': 'bg-yellow-100 text-yellow-700',
    'very_late': 'bg-orange-100 text-orange-700',
    'no_show': 'bg-red-100 text-red-800',
    'cancelled': 'bg-gray-100 text-gray-600',
    
    // Admission statuses
    'accepted': 'bg-green-100 text-green-800',
    'rejected': 'bg-red-100 text-red-800',
    'waitlisted': 'bg-yellow-100 text-yellow-800',
    'deferred': 'bg-purple-100 text-purple-700',
    
    // Deliberation
    'yes': 'bg-green-100 text-green-800',
    'maybe': 'bg-yellow-100 text-yellow-800',
    'no': 'bg-red-100 text-red-800'
  };
  
  return statusColors[status] || 'bg-gray-100 text-gray-600';
};

// Format status for display
export const formatStatus = (status) => {
  if (!status) return 'N/A';
  return status
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

// Column labels for table headers
export const columnLabels = {
  structured_task_grade: 'Workshop Grade',
  info_session: 'Info Session',
  program_admission_status: 'Admission',
  workshop_status: 'Workshop',
  info_session_status: 'Info Session'
};

// Get column display label
export const getColumnLabel = (column) => {
  return columnLabels[column] || column.charAt(0).toUpperCase() + column.slice(1).replace(/_/g, ' ');
};

// Build stage cache key for demographics
export const buildStageCacheKey = (stage, quickView, status) => {
  return `${stage || 'applied'}|${quickView || 'all'}|${status || 'all'}`;
};

// Parse cohort from quick view filter
export const getCohortFromQuickView = (quickView, cohorts) => {
  if (!quickView || quickView === 'all_time') return '';
  if (quickView === 'deferred') return 'deferred';

  const norm = (s) => (s || '').toLowerCase();
  const candidates = cohorts || [];

  if (quickView === 'dec2025') {
    const match = candidates.find(c => {
      const n = norm(c.name);
      return (n.includes('dec') || n.includes('december')) && n.includes('2025');
    });
    return match?.cohort_id || '';
  }

  if (quickView === 'sep2025') {
    const match = candidates.find(c => {
      const n = norm(c.name);
      return (n.includes('sep') || n.includes('september')) && n.includes('2025');
    });
    return match?.cohort_id || '';
  }

  return '';
};

