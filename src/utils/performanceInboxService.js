import { fetchWithAuth } from './api';

/**
 * Fetch tasks with feedback data for the Performance Inbox
 * Backend now uses user_enrollment to determine cohorts automatically
 * 
 * @param {string} token - Auth token
 * @param {string} month - Optional month filter (YYYY-MM format)
 * @param {string} cohort - Optional cohort filter (deprecated - backend uses enrollments)
 * @param {number} testUserId - Optional test user ID (for development)
 * @returns {Promise<Object>} Response with tasks and metadata
 */
export const fetchTasksWithFeedback = async (token, month = null, cohort = null, testUserId = null) => {
  try {
    console.log('🔍 Fetching tasks with feedback...', { month, testUserId });
    
    // Build query parameters - cohort is no longer needed, backend uses enrollments
    const params = new URLSearchParams();
    if (month) params.append('month', month);
    if (testUserId) params.append('testUserId', testUserId);
    
    const url = `/api/performance/tasks-with-feedback${params.toString() ? '?' + params.toString() : ''}`;
    
    const response = await fetchWithAuth(url, { method: 'GET' }, token);
    
    console.log('✅ Performance tasks response:', response);
    
    if (!response.success) {
      throw new Error(response.error || 'Failed to fetch tasks');
    }
    
    return response;
    
  } catch (error) {
    console.error('❌ Error fetching tasks with feedback:', error);
    throw error;
  }
};

/**
 * Get completion status for a task based on submission and feedback
 * 
 * @param {Object} task - Task object with submission and feedback info
 * @param {number} userId - The user ID (for localStorage key)
 * @returns {string} - Status: 'incomplete', 'new-feedback', 'complete', or 'submitted'
 */
export const getTaskCompletionStatus = (task, userId) => {
  if (!task.has_submission) {
    return 'incomplete'; // Pink circle - not submitted
  }
  
  if (task.has_feedback) {
    // Check if feedback has been viewed
    const viewedKey = `feedback_viewed_${userId}_${task.task_id}`;
    const feedbackViewed = localStorage.getItem(viewedKey) === 'true';
    
    if (!feedbackViewed) {
      return 'new-feedback'; // Gold circle - new feedback available
    } else {
      return 'complete'; // Purple circle - feedback viewed
    }
  }
  
  return 'submitted'; // Purple circle - submitted but no feedback yet
};

/**
 * Mark feedback as viewed for a task
 * 
 * @param {number} userId - The user ID
 * @param {number} taskId - The task ID
 */
export const markFeedbackAsViewed = (userId, taskId) => {
  const viewedKey = `feedback_viewed_${userId}_${taskId}`;
  localStorage.setItem(viewedKey, 'true');
  console.log(`✅ Marked feedback as viewed for user ${userId}, task ${taskId}`);
};
