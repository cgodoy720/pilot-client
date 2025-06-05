import { fetchWithAuth } from './api';

/**
 * Fetch all user stats including tasks, submissions, and feedback
 * @param {string} token - User's auth token
 * @returns {Promise} Promise that resolves to user stats object
 */
export const fetchUserStats = async (token) => {
  return fetchWithAuth('/api/users/stats', { method: 'GET' }, token);
};

/**
 * Fetch just the user's task data
 * @param {string} token - User's auth token
 * @returns {Promise} Promise that resolves to tasks array
 */
export const fetchUserTasks = async (token) => {
  return fetchWithAuth('/api/users/tasks', { method: 'GET' }, token);
};

/**
 * Fetch just the user's submissions data
 * @param {string} token - User's auth token
 * @returns {Promise} Promise that resolves to submissions array
 */
export const fetchUserSubmissions = async (token) => {
  return fetchWithAuth('/api/users/submissions', { method: 'GET' }, token);
};

/**
 * Fetch just the user's feedback data
 * @param {string} token - User's auth token
 * @returns {Promise} Promise that resolves to feedback array
 */
export const fetchUserFeedback = async (token) => {
  return fetchWithAuth('/api/users/feedback', { method: 'GET' }, token);
};

/**
 * Fetch detailed info for a specific task
 * @param {number} taskId - ID of the task
 * @param {string} token - User's auth token
 * @returns {Promise} Promise that resolves to task detail object
 */
export const fetchTaskDetails = async (taskId, token) => {
  return fetchWithAuth(`/api/tasks/${taskId}`, { method: 'GET' }, token);
};

/**
 * Fetch detailed info for a specific submission
 * @param {number} submissionId - ID of the submission
 * @param {string} token - User's auth token
 * @returns {Promise} Promise that resolves to submission detail object
 */
export const fetchSubmissionDetails = async (submissionId, token) => {
  return fetchWithAuth(`/api/submissions/${submissionId}`, { method: 'GET' }, token);
};

/**
 * Fetch all resources linked to tasks
 * @param {string} token - User's auth token
 * @returns {Promise} Promise that resolves to resources array
 */
export const fetchUserResources = async (token) => {
  return fetchWithAuth('/api/users/resources', { method: 'GET' }, token);
};

/**
 * Fetch feedback sentiment analysis for the user
 * @param {string} token - User's auth token
 * @returns {Promise} Promise that resolves to sentiment analysis data
 */
export const fetchFeedbackSentiment = async (token) => {
  try {
    console.log('Making request to /api/users/feedback-sentiment');
    const response = await fetchWithAuth('/api/users/feedback-sentiment', { method: 'GET' }, token);
    console.log('Response received:', response);
    
    // The response is already parsed JSON data, so we can return it directly
    return response;
  } catch (error) {
    console.error('Error in fetchFeedbackSentiment:', error);
    throw error;
  }
};

/**
 * Fetch task analysis results for the user
 * @param {string} token - User's auth token
 * @returns {Promise} Promise that resolves to task analysis results data
 */
export const fetchTaskAnalysisResults = async (token) => {
  try {
    console.log('Making request to /api/users/task-analysis');
    const response = await fetchWithAuth('/api/users/task-analysis', { method: 'GET' }, token);
    console.log('Response received:', response);
    
    // The response is already parsed JSON data, so we can return it directly
    return response;
  } catch (error) {
    console.error('Error in fetchTaskAnalysisResults:', error);
    throw error;
  }
};

/**
 * Fetch comprehension data for the user
 * @param {string} token - User's auth token
 * @returns {Promise} Promise that resolves to comprehension data
 */
export const fetchComprehensionData = async (token) => {
  try {
    console.log('Making request to /api/users/comprehension');
    const response = await fetchWithAuth('/api/users/comprehension', { method: 'GET' }, token);
    console.log('Response received:', response);
    
    // The response is already parsed JSON data, so we can return it directly
    return response;
  } catch (error) {
    console.error('Error in fetchComprehensionData:', error);
    throw error;
  }
};

/**
 * Convert a month filter string (YYYY-MM) to start and end dates
 * @param {string} month - Month string in format YYYY-MM or 'all' for all time
 * @returns {Object} Object with startDate and endDate properties
 */
export const getDateRangeFromMonth = (month) => {
  if (!month || month === 'all') {
    return {
      startDate: '2025-03-15', // Default start date
      endDate: new Date().toISOString().split('T')[0] // Current date
    };
  }

  const [year, monthNum] = month.split('-');
  
  // Create first day of selected month
  const startDate = `${year}-${monthNum}-01`;
  
  // Create last day of selected month
  const lastDay = new Date(parseInt(year), parseInt(monthNum), 0).getDate();
  const endDate = `${year}-${monthNum}-${lastDay}`;
  
  return { startDate, endDate };
};

/**
 * Fetch work product data from external API using the user ID
 * @param {number} userId - User's ID to fetch work product data for
 * @param {string} month - Optional month filter in YYYY-MM format
 * @returns {Promise} Promise that resolves to work product data
 */
export const fetchExternalWorkProduct = async (userId, month) => {
  try {
    console.log('Fetching external work product data for user:', userId);
    
    // Get date range from month filter
    const { startDate, endDate } = getDateRangeFromMonth(month);
    
    // Use the correct camelCase format for the type parameter
    const apiUrl = `https://ai-pilot-admin-dashboard-866060457933.us-central1.run.app/api/builders/${userId}/details?type=workProduct&startDate=${startDate}&endDate=${endDate}`;
    
    console.log('Making request to external API:', apiUrl);
    
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      console.error(`API request failed with status: ${response.status}`);
      console.error('Response:', await response.text().catch(() => 'Could not read response text'));
      throw new Error(`External API request failed with status: ${response.status}`);
    }

    const data = await response.json();
    console.log('External work product data received:', data);
    return data;
  } catch (error) {
    console.error('Error fetching external work product data:', error);
    throw error;
  }
};

/**
 * Fetch comprehension data from external API using the user ID
 * @param {number} userId - User's ID to fetch comprehension data for
 * @param {string} month - Optional month filter in YYYY-MM format
 * @returns {Promise} Promise that resolves to comprehension data
 */
export const fetchExternalComprehension = async (userId, month) => {
  try {
    console.log('Fetching external comprehension data for user:', userId);
    
    // Get date range from month filter
    const { startDate, endDate } = getDateRangeFromMonth(month);
    
    // Construct the API URL with the comprehension type - fixed the domain name
    const apiUrl = `https://ai-pilot-admin-dashboard-866060457933.us-central1.run.app/api/builders/${userId}/details?type=comprehension&startDate=${startDate}&endDate=${endDate}`;
    
    console.log('Making request to external API:', apiUrl);
    
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      console.error(`API request failed with status: ${response.status}`);
      console.error('Response:', await response.text().catch(() => 'Could not read response text'));
      throw new Error(`External API request failed with status: ${response.status}`);
    }

    const data = await response.json();
    console.log('External comprehension data received:', data);
    return data;
  } catch (error) {
    console.error('Error fetching external comprehension data:', error);
    throw error;
  }
};

/**
 * Fetch peer feedback from external API using the user ID
 * @param {number} userId - User's ID to fetch feedback for
 * @param {string} month - Optional month filter in YYYY-MM format
 * @returns {Promise} Promise that resolves to peer feedback data
 */
export const fetchExternalPeerFeedback = async (userId, month) => {
  try {
    console.log('Fetching external peer feedback for user:', userId);
    
    // Get date range from month filter
    const { startDate, endDate } = getDateRangeFromMonth(month);
    
    // Construct the API URL
    const apiUrl = `https://ai-pilot-admin-dashboard-866060457933.us-central1.run.app/api/builders/${userId}/details?type=peer_feedback&startDate=${startDate}&endDate=${endDate}`;
    
    console.log('Making request to external API:', apiUrl);
    
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`External API request failed with status: ${response.status}`);
    }

    const data = await response.json();
    console.log('External peer feedback received:', data);
    return data;
  } catch (error) {
    console.error('Error fetching external peer feedback:', error);
    throw error;
  }
}; 