import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4001';

// Get auth token
const getAuthToken = () => {
  return localStorage.getItem('token');
};

// Create axios instance with auth
const apiClient = axios.create({
  baseURL: API_URL,
});

apiClient.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ============================================================================
// ADMIN API (Protected)
// ============================================================================

// Form Management
export const createForm = async (formData) => {
  const response = await apiClient.post('/api/forms', formData);
  return response.data;
};

export const getAllForms = async (filters = {}) => {
  const params = new URLSearchParams(filters).toString();
  const response = await apiClient.get(`/api/forms?${params}`);
  return response.data;
};

export const getFormById = async (formId) => {
  const response = await apiClient.get(`/api/forms/${formId}`);
  return response.data;
};

export const updateForm = async (formId, formData) => {
  const response = await apiClient.put(`/api/forms/${formId}`, formData);
  return response.data;
};

export const deleteForm = async (formId) => {
  const response = await apiClient.delete(`/api/forms/${formId}`);
  return response.data;
};

export const duplicateForm = async (formId) => {
  const response = await apiClient.post(`/api/forms/${formId}/duplicate`);
  return response.data;
};

export const updateFormStatus = async (formId, status) => {
  const response = await apiClient.patch(`/api/forms/${formId}/status`, { status });
  return response.data;
};

// Submission Management
export const getFormSubmissions = async (formId, filters = {}) => {
  const params = new URLSearchParams(filters).toString();
  const response = await apiClient.get(`/api/forms/${formId}/submissions?${params}`);
  return response.data;
};

export const getSubmissionById = async (formId, submissionId) => {
  const response = await apiClient.get(`/api/forms/${formId}/submissions/${submissionId}`);
  return response.data;
};

export const updateSubmission = async (formId, submissionId, data) => {
  const response = await apiClient.patch(`/api/forms/${formId}/submissions/${submissionId}`, data);
  return response.data;
};

export const deleteSubmission = async (formId, submissionId) => {
  const response = await apiClient.delete(`/api/forms/${formId}/submissions/${submissionId}`);
  return response.data;
};

// Analytics
export const getFormAnalytics = async (formId, filters = {}) => {
  const params = new URLSearchParams(filters).toString();
  const response = await apiClient.get(`/api/forms/${formId}/analytics?${params}`);
  return response.data;
};

export const getCompletionStats = async (formId) => {
  const response = await apiClient.get(`/api/forms/${formId}/analytics/completion`);
  return response.data;
};

export const getResponseDistribution = async (formId, questionId) => {
  const response = await apiClient.get(`/api/forms/${formId}/analytics/distribution/${questionId}`);
  return response.data;
};

// Export
export const exportFormCSV = async (formId, filters = {}) => {
  const params = new URLSearchParams(filters).toString();
  const response = await apiClient.get(`/api/forms/${formId}/export/csv?${params}`, {
    responseType: 'blob'
  });
  
  // Create download link
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `form-${formId}-submissions.csv`);
  document.body.appendChild(link);
  link.click();
  link.remove();
};

export const exportFormJSON = async (formId, filters = {}) => {
  const params = new URLSearchParams(filters).toString();
  const response = await apiClient.get(`/api/forms/${formId}/export/json?${params}`, {
    responseType: 'blob'
  });
  
  // Create download link
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `form-${formId}-submissions.json`);
  document.body.appendChild(link);
  link.click();
  link.remove();
};

// ============================================================================
// PUBLIC API (Unprotected)
// ============================================================================

export const getPublicForm = async (slug) => {
  const response = await axios.get(`${API_URL}/api/public/forms/${slug}`);
  return response.data;
};

export const getFormStatus = async (slug) => {
  const response = await axios.get(`${API_URL}/api/public/forms/${slug}/status`);
  return response.data;
};

export const submitForm = async (slug, submissionData) => {
  const response = await axios.post(`${API_URL}/api/public/forms/${slug}/submit`, submissionData);
  return response.data;
};

export const saveDraft = async (slug, draftData) => {
  const response = await axios.post(`${API_URL}/api/public/forms/${slug}/draft`, draftData);
  return response.data;
};

export const getDraft = async (slug, sessionId) => {
  const response = await axios.get(`${API_URL}/api/public/forms/${slug}/draft/${sessionId}`);
  return response.data;
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

export const generateSessionId = () => {
  return `session_${Date.now()}_${Math.random().toString(36).substring(7)}`;
};

export const validateEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

export const getFormUrl = (slug) => {
  const baseUrl = window.location.origin;
  return `${baseUrl}/form/${slug}`;
};

export default {
  // Admin
  createForm,
  getAllForms,
  getFormById,
  updateForm,
  deleteForm,
  duplicateForm,
  updateFormStatus,
  getFormSubmissions,
  getSubmissionById,
  updateSubmission,
  deleteSubmission,
  getFormAnalytics,
  getCompletionStats,
  getResponseDistribution,
  exportFormCSV,
  exportFormJSON,
  
  // Public
  getPublicForm,
  getFormStatus,
  submitForm,
  saveDraft,
  getDraft,
  
  // Utility
  generateSessionId,
  validateEmail,
  getFormUrl
};

