/**
 * Format a date as MM/DD/YYYY
 * @param {Date|string} date - Date object or date string
 * @returns {string} Formatted date string
 */
export const formatDate = (date) => {
  if (!date) return 'N/A';
  
  const d = date instanceof Date ? date : new Date(date);
  
  // Check if date is valid
  if (isNaN(d.getTime())) return 'Invalid date';
  
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  const day = d.getDate().toString().padStart(2, '0');
  const year = d.getFullYear();
  
  return `${month}/${day}/${year}`;
};

/**
 * Format a date with time as MM/DD/YYYY, HH:MM AM/PM
 * @param {Date|string} date - Date object or date string
 * @returns {string} Formatted date and time string
 */
export const formatDateTime = (date) => {
  if (!date) return 'N/A';
  
  const d = date instanceof Date ? date : new Date(date);
  
  // Check if date is valid
  if (isNaN(d.getTime())) return 'Invalid date';
  
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  const day = d.getDate().toString().padStart(2, '0');
  const year = d.getFullYear();
  
  let hours = d.getHours();
  const minutes = d.getMinutes().toString().padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  
  hours = hours % 12;
  hours = hours ? hours : 12; // Convert 0 to 12
  
  return `${month}/${day}/${year}, ${hours}:${minutes} ${ampm}`;
};

/**
 * Format submission timestamp consistently across environments
 * This ensures the same display in both local and production
 * @param {Date|string} timestamp - Database timestamp (now stores Eastern time correctly)
 * @returns {string} Formatted timestamp string
 */
export const formatSubmissionTimestamp = (timestamp) => {
  if (!timestamp) return 'N/A';
  
  const date = timestamp instanceof Date ? timestamp : new Date(timestamp);
  
  // Check if date is valid
  if (isNaN(date.getTime())) return 'Invalid date';
  
  // The server now stores Eastern time correctly, so we can format it directly
  // But we need to treat the stored timestamp as Eastern time (not UTC)
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth();
  const day = date.getUTCDate();
  const hour = date.getUTCHours();
  const minute = date.getUTCMinutes();
  
  // Create a new date treating these UTC components as Eastern time
  const easternDate = new Date(year, month, day, hour, minute);
  
  return easternDate.toLocaleString("en-US", {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
};

/**
 * Treat database time as Eastern Time (not UTC conversion)
 * @param {Date|string} dbDate - Database date that should be treated as Eastern time
 * @returns {Date} Date object with database time treated as Eastern
 */
export const getEasternTimeParts = (dbDate) => {
  if (!dbDate) return null;
  
  const date = dbDate instanceof Date ? dbDate : new Date(dbDate);
  
  // Check if date is valid
  if (isNaN(date.getTime())) return null;
  
  // Treat the database time as if it's already in Eastern Time
  // Extract the date/time components directly without timezone conversion
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth();
  const day = date.getUTCDate();
  const hour = date.getUTCHours();
  const minute = date.getUTCMinutes();
  
  return new Date(year, month, day, hour, minute);
};

/**
 * Format database time as Eastern Time (treat DB time as Eastern, not UTC)
 * @param {Date|string} dbDate - Database date that should be treated as Eastern time
 * @param {string} formatType - 'time' for time only, 'date' for date only
 * @returns {string} Formatted time string treating DB time as Eastern
 */
export const formatInEasternTime = (dbDate, formatType = 'time') => {
  if (!dbDate) return 'N/A';
  
  const date = dbDate instanceof Date ? dbDate : new Date(dbDate);
  
  // Check if date is valid
  if (isNaN(date.getTime())) return 'Invalid date';
  
  // Extract UTC parts but treat them as Eastern Time
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth();
  const day = date.getUTCDate();
  const hour = date.getUTCHours();
  const minute = date.getUTCMinutes();
  
  // Create a new date with these parts as local time (Eastern)
  const easternDate = new Date(year, month, day, hour, minute);
  
  if (formatType === 'time') {
    return easternDate.toLocaleTimeString("en-US", {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  } else if (formatType === 'date') {
    return easternDate.toLocaleDateString("en-US", {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } else {
    return easternDate.toLocaleString("en-US", {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  }
}; 