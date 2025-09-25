/**
 * Admin API Service
 * Handles all admin dashboard API calls for attendance management
 */

import { fetchWithAuth } from '../utils/api';
import { retryWithBackoff, RETRY_CONFIGS, getErrorMessage } from '../utils/retryUtils';

// Base API URL from environment variable
const API_URL = import.meta.env.VITE_API_URL;

/**
 * Get today's attendance overview
 * @param {string} token - Admin authentication token
 * @returns {Promise<Object>} Today's attendance data
 */
export const getTodaysAttendanceOverview = async (token) => {
  try {
    const response = await fetch(`${API_URL}/api/admin/dashboard/today`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching today\'s attendance overview:', error);
    throw error;
  }
};

/**
 * Get cohort performance data
 * @param {string} token - Admin authentication token
 * @param {Object} options - Options including period
 * @returns {Promise<Object>} Cohort performance data
 */
export const getCohortPerformance = async (token, options = {}) => {
  const { period = 'last-30-days' } = options;
  
  return retryWithBackoff(
    async () => {
      const url = new URL(`${API_URL}/api/admin/dashboard/cohort-performance`);
      if (period) {
        url.searchParams.append('period', period);
      }
      
      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const error = new Error(errorData.error || `API error: ${response.status}`);
        error.response = response;
        error.status = response.status;
        throw error;
      }

      return await response.json();
    },
    RETRY_CONFIGS.STANDARD,
    'Cohort Performance API'
  );
};

/**
 * Get daily attendance report
 * @param {string} date - Date in YYYY-MM-DD format
 * @param {string} token - Admin authentication token
 * @returns {Promise<Object>} Daily report data
 */
export const getDailyReport = async (date, token) => {
  try {
    const response = await fetch(`${API_URL}/api/admin/reports/daily/${date}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching daily report:', error);
    throw error;
  }
};

/**
 * Get weekly attendance report
 * @param {string} startDate - Start date in YYYY-MM-DD format
 * @param {string} token - Admin authentication token
 * @returns {Promise<Object>} Weekly report data
 */
export const getWeeklyReport = async (startDate, token) => {
  try {
    const response = await fetch(`${API_URL}/api/admin/reports/weekly/${startDate}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching weekly report:', error);
    throw error;
  }
};

/**
 * Get monthly attendance report
 * @param {string} month - Month in YYYY-MM format
 * @param {string} token - Admin authentication token
 * @returns {Promise<Object>} Monthly report data
 */
export const getMonthlyReport = async (month, token) => {
  try {
    const response = await fetch(`${API_URL}/api/admin/reports/monthly/${month}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching monthly report:', error);
    throw error;
  }
};

/**
 * Get builders risk assessment
 * @param {string} token - Admin authentication token
 * @returns {Promise<Object>} Risk assessment data
 */
export const getBuildersRiskAssessment = async (token) => {
  try {
    const response = await fetch(`${API_URL}/api/admin/builders/risk-assessment`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching risk assessment:', error);
    throw error;
  }
};

/**
 * Get pending excuses
 * @param {Object} params - Query parameters (days, cohort)
 * @param {string} token - Admin authentication token
 * @returns {Promise<Object>} Pending excuses data
 */
export const getPendingExcuses = async (params = {}, token) => {
  try {
    const queryParams = new URLSearchParams();
    if (params.days) queryParams.append('days', params.days);
    if (params.cohort) queryParams.append('cohort', params.cohort);

    const url = `${API_URL}/api/admin/excuses/pending${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    
    console.log('🌐 [DEBUG] API Request URL:', url);
    console.log('🌐 [DEBUG] API Request params:', params);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('🌐 [DEBUG] API Response status:', response.status);
    console.log('🌐 [DEBUG] API Response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('❌ [DEBUG] API Error response:', errorData);
      throw new Error(errorData.error || `API error: ${response.status}`);
    }

    const responseData = await response.json();
    console.log('📡 [DEBUG] API Response data:', {
      timestamp: new Date().toISOString(),
      summary: responseData.summary,
      unexcusedAbsencesCount: responseData.unexcusedAbsences?.length,
      summaryTotalUnexcused: responseData.summary?.totalUnexcusedAbsences,
      fullResponse: responseData
    });

    return responseData;
  } catch (error) {
    console.error('❌ [DEBUG] Error fetching pending excuses:', error);
    throw error;
  }
};

/**
 * Get excuse history
 * @param {Object} params - Query parameters
 * @param {string} token - Admin authentication token
 * @returns {Promise<Object>} Excuse history data
 */
export const getExcuseHistory = async (params = {}, token) => {
  try {
    const queryParams = new URLSearchParams();
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== null) {
        queryParams.append(key, params[key]);
      }
    });

    const url = `${API_URL}/api/admin/excuses/history${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching excuse history:', error);
    throw error;
  }
};

/**
 * Mark builder as excused
 * @param {Object} excuseData - Excuse data
 * @param {string} token - Admin authentication token
 * @returns {Promise<Object>} Created excuse data
 */
export const markBuilderExcused = async (excuseData, token) => {
  try {
    console.log('📤 [DEBUG] markBuilderExcused API call started:', {
      timestamp: new Date().toISOString(),
      excuseData: excuseData
    });

    const response = await fetch(`${API_URL}/api/admin/excuses/mark-excused`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(excuseData)
    });

    console.log('📤 [DEBUG] markBuilderExcused API response status:', response.status);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('❌ [DEBUG] markBuilderExcused API error:', errorData);
      throw new Error(errorData.error || `API error: ${response.status}`);
    }

    const responseData = await response.json();
    console.log('✅ [DEBUG] markBuilderExcused API success response:', {
      timestamp: new Date().toISOString(),
      responseData: responseData
    });

    return responseData;
  } catch (error) {
    console.error('❌ [DEBUG] Error marking builder as excused:', error);
    throw error;
  }
};

/**
 * Update excuse
 * @param {number} excuseId - Excuse ID
 * @param {Object} updateData - Update data
 * @param {string} token - Admin authentication token
 * @returns {Promise<Object>} Updated excuse data
 */
export const updateExcuse = async (excuseId, updateData, token) => {
  try {
    const response = await fetch(`${API_URL}/api/admin/excuses/${excuseId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updateData)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error updating excuse:', error);
    throw error;
  }
};

/**
 * Bulk excuse for cohort
 * @param {Object} bulkData - Bulk excuse data
 * @param {string} token - Admin authentication token
 * @returns {Promise<Object>} Bulk excuse results
 */
export const bulkExcuseCohort = async (bulkData, token) => {
  try {
    const response = await fetch(`${API_URL}/api/admin/excuses/bulk-excuse`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(bulkData)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error performing bulk excuse:', error);
    throw error;
  }
};

/**
 * Get excuse statistics
 * @param {Object} params - Query parameters
 * @param {string} token - Admin authentication token
 * @returns {Promise<Object>} Excuse statistics data
 */
export const getExcuseStatistics = async (params = {}, token) => {
  try {
    const queryParams = new URLSearchParams();
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== null) {
        queryParams.append(key, params[key]);
      }
    });

    const url = `${API_URL}/api/admin/excuses/statistics${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching excuse statistics:', error);
    throw error;
  }
};

/**
 * Export attendance data as CSV
 */
export const exportAttendanceCSV = async (startDate, endDate, cohort = 'all') => {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('No authentication token found');
  }

  return retryWithBackoff(
    async () => {
      const params = new URLSearchParams({
        startDate,
        endDate,
        cohort
      });

      const response = await fetch(`${API_URL}/api/admin/export/csv?${params}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const error = new Error(errorData.error || 'Failed to export CSV');
        error.response = response;
        error.status = response.status;
        throw error;
      }

      // Get filename from Content-Disposition header
      const contentDisposition = response.headers.get('Content-Disposition');
      let filename = 'attendance_export.csv';
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/);
        if (filenameMatch) {
          filename = filenameMatch[1];
        }
      }

      // Convert response to blob and trigger download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      return { success: true, filename };
    },
    RETRY_CONFIGS.LONG, // CSV export can take longer
    'CSV Export'
  );
};

/**
 * Get CSV export history for the current user
 */
export const getCsvExportHistory = async (params = {}) => {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('No authentication token found');
  }

  return retryWithBackoff(
    async () => {
      const queryParams = new URLSearchParams({
        limit: params.limit || 50,
        offset: params.offset || 0,
        ...(params.startDate && { startDate: params.startDate }),
        ...(params.endDate && { endDate: params.endDate })
      });

      const response = await fetch(`${API_URL}/api/admin/export/history?${queryParams}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to get export history: ${response.status} ${response.statusText}`);
      }

      return response.json();
    },
    { maxRetries: 2, baseDelay: 1000 }
  );
};

/**
 * Get all CSV export history (admin only)
 */
export const getAllCsvExportHistory = async (params = {}) => {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('No authentication token found');
  }

  return retryWithBackoff(
    async () => {
      const queryParams = new URLSearchParams({
        limit: params.limit || 100,
        offset: params.offset || 0,
        ...(params.startDate && { startDate: params.startDate }),
        ...(params.endDate && { endDate: params.endDate }),
        ...(params.userId && { userId: params.userId }),
        ...(params.successStatus !== undefined && { successStatus: params.successStatus })
      });

      const response = await fetch(`${API_URL}/api/admin/export/history/all?${queryParams}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to get all export history: ${response.status} ${response.statusText}`);
      }

      return response.json();
    },
    { maxRetries: 2, baseDelay: 1000 }
  );
};

/**
 * Get CSV export statistics
 */
export const getCsvExportStatistics = async (params = {}) => {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('No authentication token found');
  }

  return retryWithBackoff(
    async () => {
      const queryParams = new URLSearchParams({
        ...(params.startDate && { startDate: params.startDate }),
        ...(params.endDate && { endDate: params.endDate })
      });

      const response = await fetch(`${API_URL}/api/admin/export/statistics?${queryParams}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to get export statistics: ${response.status} ${response.statusText}`);
      }

      return response.json();
    },
    { maxRetries: 2, baseDelay: 1000 }
  );
};

export const adminApi = {
  getTodaysAttendanceOverview,
  getCohortPerformance,
  getDailyReport,
  getWeeklyReport,
  getMonthlyReport,
  getBuildersRiskAssessment,
  getPendingExcuses,
  getExcuseHistory,
  markBuilderExcused,
  updateExcuse,
  bulkExcuseCohort,
  getExcuseStatistics,
  exportAttendanceCSV,
  getCsvExportHistory,
  getAllCsvExportHistory,
  getCsvExportStatistics
};

export default adminApi;
