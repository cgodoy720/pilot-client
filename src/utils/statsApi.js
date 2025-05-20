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