import { fetchWithAuth } from './api';

/**
 * Fetch user's attendance data for a date range
 * 
 * @param {number} userId - The user ID
 * @param {string} startDate - Start date in YYYY-MM-DD format
 * @param {string} endDate - End date in YYYY-MM-DD format
 * @param {string} token - Auth token
 * @returns {Promise<Array>} - Array of attendance records
 */
export const fetchUserAttendance = async (userId, startDate, endDate, token) => {
  try {
    const response = await fetchWithAuth(
      `/api/performance/attendance/user/${userId}?startDate=${startDate}&endDate=${endDate}`,
      { method: 'GET' },
      token
    );
    
    if (response.success && response.data) {
      return response.data.map(record => ({
        date: record.attendance_date,
        status: record.status, // 'present', 'late', 'absent', 'excused'
        checkInTime: record.check_in_time,
        lateMinutes: record.late_arrival_minutes,
        photoUrl: record.photo_url,
        notes: record.notes
      }));
    }
    
    return [];
  } catch (error) {
    console.error('Error fetching attendance:', error);
    return [];
  }
};

/**
 * Calculate attendance rate from attendance records
 * 
 * @param {Array} attendanceRecords - Array of attendance records
 * @param {number} totalPossibleDays - Total possible class days
 * @returns {number} - Attendance rate as percentage (0-100)
 */
export const calculateAttendanceRate = (attendanceRecords, totalPossibleDays) => {
  const attendedDays = attendanceRecords.filter(r => 
    ['present', 'late', 'excused'].includes(r.status)
  ).length;
  
  return totalPossibleDays > 0 ? Math.round((attendedDays / totalPossibleDays) * 100) : 0;
};

/**
 * Get class days in a date range (Saturday-Friday structure)
 * Class days are: Saturday (6), Sunday (0), Monday (1), Tuesday (2), Wednesday (3)
 * 
 * @param {Date} startDate - Start date
 * @param {Date} endDate - End date
 * @returns {number} - Number of class days in the range
 */
export const getClassDaysInRange = (startDate, endDate) => {
  let classDays = 0;
  const current = new Date(startDate);
  const end = new Date(endDate);
  
  while (current <= end) {
    const dayOfWeek = current.getDay();
    // Class days: Saturday (6), Sunday (0), Monday (1), Tuesday (2), Wednesday (3)
    if ([0, 1, 2, 3, 6].includes(dayOfWeek)) {
      classDays++;
    }
    current.setDate(current.getDate() + 1);
  }
  
  return classDays;
};

/**
 * Generate calendar weeks with Saturday-Friday structure
 * 
 * @param {number} month - Month (0-11)
 * @param {number} year - Year
 * @param {Array} attendanceRecords - Array of attendance records
 * @returns {Array} - Array of calendar weeks
 */
export const generateCalendarWeeks = (month, year, attendanceRecords = []) => {
  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  
  // Get day of week for first day (0=Sunday, 6=Saturday)
  const firstDayOfWeek = firstDayOfMonth.getDay();
  
  // Calculate days to show from previous month
  // Saturday-Friday week structure: Saturday is the start (6)
  const daysFromPrevMonth = firstDayOfWeek === 6 ? 0 : (firstDayOfWeek + 1) % 7;
  
  // Start date is first day minus the padding
  const startDate = new Date(firstDayOfMonth);
  startDate.setDate(startDate.getDate() - daysFromPrevMonth);
  
  // Calculate total days to show (should be multiple of 7)
  const daysInMonth = lastDayOfMonth.getDate();
  const totalDaysNeeded = daysFromPrevMonth + daysInMonth;
  const weeksNeeded = Math.ceil(totalDaysNeeded / 7);
  const totalDays = weeksNeeded * 7;
  
  // Create attendance lookup map
  const attendanceMap = {};
  attendanceRecords.forEach(record => {
    const dateKey = new Date(record.date).toDateString();
    attendanceMap[dateKey] = record;
  });
  
  // Generate array of all dates
  const calendarDates = [];
  const currentDate = new Date(startDate);
  
  for (let i = 0; i < totalDays; i++) {
    const dateObj = new Date(currentDate);
    const dayOfMonth = dateObj.getDate();
    const monthOfDate = dateObj.getMonth();
    const yearOfDate = dateObj.getFullYear();
    const dateKey = dateObj.toDateString();
    
    // Check if this is a class day
    const dayOfWeek = dateObj.getDay();
    const isClassDay = [0, 1, 2, 3, 6].includes(dayOfWeek); // Sat, Sun, Mon, Tue, Wed
    
    // Get attendance record for this date
    const attendanceRecord = attendanceMap[dateKey];
    
    calendarDates.push({
      date: new Date(dateObj),
      dayOfMonth: dayOfMonth,
      dayOfWeek: dayOfWeek,
      isCurrentMonth: monthOfDate === month && yearOfDate === year,
      isPreviousMonth: (yearOfDate < year) || (yearOfDate === year && monthOfDate < month),
      isNextMonth: (yearOfDate > year) || (yearOfDate === year && monthOfDate > month),
      isClassDay: isClassDay,
      attendanceStatus: attendanceRecord?.status || (isClassDay ? 'absent' : null),
      attendanceRecord: attendanceRecord || null
    });
    
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  // Group by weeks (7 days each)
  const weeks = [];
  for (let i = 0; i < calendarDates.length; i += 7) {
    const weekDays = calendarDates.slice(i, i + 7);
    weeks.push({
      days: weekDays
    });
  }
  
  return weeks;
};

/**
 * Get attendance statistics for a user in a date range
 * 
 * @param {number} userId - The user ID
 * @param {string} startDate - Start date in YYYY-MM-DD format
 * @param {string} endDate - End date in YYYY-MM-DD format
 * @returns {Promise<Object>} - Attendance statistics
 */
export const getAttendanceStatistics = async (userId, startDate, endDate) => {
  try {
    const attendanceRecords = await fetchUserAttendance(userId, startDate, endDate);
    const totalClassDays = getClassDaysInRange(new Date(startDate), new Date(endDate));
    
    const stats = {
      present: 0,
      late: 0,
      excused: 0,
      absent: 0,
      totalClassDays,
      attendanceRate: 0
    };
    
    attendanceRecords.forEach(record => {
      if (stats.hasOwnProperty(record.status)) {
        stats[record.status]++;
      }
    });
    
    // Calculate absent days (class days with no attendance record)
    const recordedDays = attendanceRecords.length;
    stats.absent = Math.max(0, totalClassDays - recordedDays + stats.absent);
    
    // Calculate attendance rate
    const attendedDays = stats.present + stats.late + stats.excused;
    stats.attendanceRate = calculateAttendanceRate(attendanceRecords, totalClassDays);
    
    return stats;
  } catch (error) {
    console.error('Error getting attendance statistics:', error);
    return {
      present: 0,
      late: 0,
      excused: 0,
      absent: 0,
      totalClassDays: 0,
      attendanceRate: 0
    };
  }
};
