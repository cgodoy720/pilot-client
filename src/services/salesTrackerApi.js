import { fetchWithAuth } from '../utils/api';

/**
 * Sales Tracker API Service
 * Handles all API calls for the Sales Tracker functionality
 */

// Get current user token
const getToken = () => localStorage.getItem('token');

/**
 * Dashboard API functions
 */
export const getDashboardStats = async (timePeriod = '30') => {
  const token = getToken();
  return fetchWithAuth(`/api/sales-tracker/dashboard/stats?period=${timePeriod}`, {}, token);
};

export const getRecentActivity = async (limit = 10) => {
  const token = getToken();
  return fetchWithAuth(`/api/sales-tracker/dashboard/activity?limit=${limit}`, {}, token);
};

/**
 * Leads API functions
 */
export const getAllLeads = async (params = {}) => {
  const token = getToken();
  const queryParams = new URLSearchParams({
    search: params.search || '',
    stage: params.stage || 'all-stages',
    owner: params.owner || 'all-owners',
    tab: params.tab || 'all',
    page: params.page || 1,
    limit: params.limit || 50
  });
  
  return fetchWithAuth(`/api/sales-tracker/leads?${queryParams}`, {}, token);
};

export const getLeadById = async (leadId) => {
  const token = getToken();
  return fetchWithAuth(`/api/sales-tracker/leads/${leadId}`, {}, token);
};

export const createLead = async (leadData) => {
  const token = getToken();
  return fetchWithAuth('/api/sales-tracker/leads', {
    method: 'POST',
    body: JSON.stringify(leadData)
  }, token);
};

export const updateLead = async (leadId, leadData) => {
  const token = getToken();
  return fetchWithAuth(`/api/sales-tracker/leads/${leadId}`, {
    method: 'PUT',
    body: JSON.stringify(leadData)
  }, token);
};

export const deleteLead = async (leadId) => {
  const token = getToken();
  return fetchWithAuth(`/api/sales-tracker/leads/${leadId}`, {
    method: 'DELETE'
  }, token);
};

export const exportLeadsCSV = async (params = {}) => {
  const token = getToken();
  const queryParams = new URLSearchParams(params);
  
  const response = await fetch(`${import.meta.env.VITE_API_URL}/api/sales-tracker/leads/export?${queryParams}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  if (!response.ok) {
    throw new Error('Failed to export leads');
  }
  
  return response.blob();
};

/**
 * Job Postings API functions
 */
export const getAllJobPostings = async (params = {}) => {
  const token = getToken();
  const queryParams = new URLSearchParams({
    search: params.search || '',
    sort: params.sort || 'newest',
    page: params.page || 1,
    limit: params.limit || 50
  });
  
  return fetchWithAuth(`/api/sales-tracker/job-postings?${queryParams}`, {}, token);
};

export const getJobPostingById = async (jobId) => {
  const token = getToken();
  return fetchWithAuth(`/api/sales-tracker/job-postings/${jobId}`, {}, token);
};

export const createJobPosting = async (jobData) => {
  const token = getToken();
  return fetchWithAuth('/api/sales-tracker/job-postings', {
    method: 'POST',
    body: JSON.stringify(jobData)
  }, token);
};

export const updateJobPosting = async (jobId, jobData) => {
  const token = getToken();
  return fetchWithAuth(`/api/sales-tracker/job-postings/${jobId}`, {
    method: 'PUT',
    body: JSON.stringify(jobData)
  }, token);
};

export const deleteJobPosting = async (jobId) => {
  const token = getToken();
  return fetchWithAuth(`/api/sales-tracker/job-postings/${jobId}`, {
    method: 'DELETE'
  }, token);
};

export const exportJobPostingsCSV = async (params = {}) => {
  const token = getToken();
  const queryParams = new URLSearchParams(params);
  
  const response = await fetch(`${import.meta.env.VITE_API_URL}/api/sales-tracker/job-postings/export?${queryParams}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  if (!response.ok) {
    throw new Error('Failed to export job postings');
  }
  
  return response.blob();
};

export const bulkUpdateJobPostings = async (jobIds, updates) => {
  const token = getToken();
  return fetchWithAuth('/api/sales-tracker/job-postings/bulk-update', {
    method: 'PUT',
    body: JSON.stringify({ jobIds, updates })
  }, token);
};

/**
 * Job Posting Builders API functions
 */
export const getJobPostingBuilders = async (jobPostingId) => {
  const token = getToken();
  return fetchWithAuth(`/api/sales-tracker/job-postings/${jobPostingId}/builders`, {}, token);
};

export const addBuilderToJobPosting = async (jobPostingId, builderData) => {
  const token = getToken();
  return fetchWithAuth(`/api/sales-tracker/job-postings/${jobPostingId}/builders`, {
    method: 'POST',
    body: JSON.stringify(builderData)
  }, token);
};

export const updateJobPostingBuilder = async (jobPostingId, builderId, builderData) => {
  const token = getToken();
  return fetchWithAuth(`/api/sales-tracker/job-postings/${jobPostingId}/builders/${builderId}`, {
    method: 'PUT',
    body: JSON.stringify(builderData)
  }, token);
};

export const removeBuilderFromJobPosting = async (jobPostingId, builderId) => {
  const token = getToken();
  return fetchWithAuth(`/api/sales-tracker/job-postings/${jobPostingId}/builders/${builderId}`, {
    method: 'DELETE'
  }, token);
};

/**
 * Leaderboard API functions
 */
export const getLeaderboard = async (timePeriod = '7') => {
  const token = getToken();
  return fetchWithAuth(`/api/sales-tracker/leaderboard?period=${timePeriod}`, {}, token);
};

export const getLeaderboardStats = async (timePeriod = '7') => {
  const token = getToken();
  return fetchWithAuth(`/api/sales-tracker/leaderboard/stats?period=${timePeriod}`, {}, token);
};

/**
 * Activities API functions
 */
export const getActivities = async (params = {}) => {
  const token = getToken();
  const queryParams = new URLSearchParams({
    user_id: params.userId || '',
    action_type: params.actionType || '',
    entity_type: params.entityType || '',
    page: params.page || 1,
    limit: params.limit || 50
  });
  
  return fetchWithAuth(`/api/sales-tracker/activities?${queryParams}`, {}, token);
};

export const createActivity = async (activityData) => {
  const token = getToken();
  return fetchWithAuth('/api/sales-tracker/activities', {
    method: 'POST',
    body: JSON.stringify(activityData)
  }, token);
};

/**
 * LinkedIn Sessions API functions
 */
export const getLinkedInSessions = async () => {
  const token = getToken();
  return fetchWithAuth('/api/sales-tracker/linkedin-sessions', {}, token);
};

export const createLinkedInSession = async (sessionData) => {
  const token = getToken();
  return fetchWithAuth('/api/sales-tracker/linkedin-sessions', {
    method: 'POST',
    body: JSON.stringify(sessionData)
  }, token);
};

export const updateLinkedInSession = async (sessionId, sessionData) => {
  const token = getToken();
  return fetchWithAuth(`/api/sales-tracker/linkedin-sessions/${sessionId}`, {
    method: 'PUT',
    body: JSON.stringify(sessionData)
  }, token);
};

export const deleteLinkedInSession = async (sessionId) => {
  const token = getToken();
  return fetchWithAuth(`/api/sales-tracker/linkedin-sessions/${sessionId}`, {
    method: 'DELETE'
  }, token);
};

/**
 * Users API functions (for dropdowns and owner assignments)
 */
export const getSalesTrackerUsers = async () => {
  const token = getToken();
  return fetchWithAuth('/api/sales-tracker/staff-users', {}, token);
};

/**
 * Utility functions
 */

// Download blob as file
export const downloadFile = (blob, filename) => {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.style.display = 'none';
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
};

// Format API error messages
export const handleApiError = (error) => {
  console.error('Sales Tracker API Error:', error);
  
  if (error.message) {
    return error.message;
  }
  
  if (typeof error === 'string') {
    return error;
  }
  
  return 'An unexpected error occurred. Please try again.';
};