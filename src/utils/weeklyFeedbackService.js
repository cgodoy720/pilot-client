const API_URL = import.meta.env.VITE_API_URL;

/**
 * Fetch available report weeks for the current user
 */
export const fetchAvailableReportWeeks = async (token) => {
  try {
    const response = await fetch(`${API_URL}/api/performance/weekly-feedback-report/weeks`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      console.error('Failed to fetch report weeks:', response.status);
      return { success: false, weeks: [] };
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching report weeks:', error);
    return { success: false, weeks: [] };
  }
};

/**
 * Fetch a weekly feedback report for a specific week
 */
export const fetchWeeklyFeedbackReport = async (token, weekNumber) => {
  try {
    const response = await fetch(
      `${API_URL}/api/performance/weekly-feedback-report?weekNumber=${weekNumber}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response.ok) {
      console.error('Failed to fetch weekly report:', response.status);
      return { success: false, report: null };
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching weekly report:', error);
    return { success: false, report: null };
  }
};
