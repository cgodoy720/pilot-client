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