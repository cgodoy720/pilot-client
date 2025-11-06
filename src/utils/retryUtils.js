/**
 * Retry Utilities
 * Provides retry logic with exponential backoff for API calls
 */

/**
 * Retry configuration options
 */
const DEFAULT_RETRY_CONFIG = {
  maxRetries: 3,
  baseDelay: 1000, // 1 second
  maxDelay: 10000, // 10 seconds
  backoffMultiplier: 2,
  retryCondition: (error) => {
    // Retry on network errors, timeouts, and 5xx server errors
    return (
      !error.response || // Network error
      error.response.status >= 500 || // Server error
      error.response.status === 429 || // Rate limited
      error.code === 'ECONNABORTED' || // Timeout
      error.message?.includes('Network Error') ||
      error.message?.includes('timeout')
    );
  }
};

/**
 * Calculate delay for retry attempt with exponential backoff
 * @param {number} attempt - Current attempt number (0-based)
 * @param {Object} config - Retry configuration
 * @returns {number} Delay in milliseconds
 */
const calculateDelay = (attempt, config) => {
  const delay = config.baseDelay * Math.pow(config.backoffMultiplier, attempt);
  return Math.min(delay, config.maxDelay);
};

/**
 * Sleep for specified milliseconds
 * @param {number} ms - Milliseconds to sleep
 * @returns {Promise} Promise that resolves after delay
 */
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Retry a function with exponential backoff
 * @param {Function} fn - Function to retry
 * @param {Object} config - Retry configuration
 * @param {string} operationName - Name of operation for logging
 * @returns {Promise} Promise that resolves with function result
 */
export const retryWithBackoff = async (fn, config = {}, operationName = 'operation') => {
  const finalConfig = { ...DEFAULT_RETRY_CONFIG, ...config };
  let lastError;

  for (let attempt = 0; attempt <= finalConfig.maxRetries; attempt++) {
    try {
      const result = await fn();
      
      if (attempt > 0) {
        console.log(`✅ ${operationName} succeeded on attempt ${attempt + 1}`);
      }
      
      return result;
    } catch (error) {
      lastError = error;
      
      // Check if we should retry this error
      if (attempt === finalConfig.maxRetries || !finalConfig.retryCondition(error)) {
        console.error(`❌ ${operationName} failed after ${attempt + 1} attempts:`, error.message);
        throw error;
      }

      const delay = calculateDelay(attempt, finalConfig);
      console.warn(`⚠️ ${operationName} failed (attempt ${attempt + 1}/${finalConfig.maxRetries + 1}), retrying in ${delay}ms:`, error.message);
      
      await sleep(delay);
    }
  }

  throw lastError;
};

/**
 * Create a retry wrapper for API calls
 * @param {Function} apiCall - API call function
 * @param {Object} config - Retry configuration
 * @param {string} operationName - Name of operation for logging
 * @returns {Function} Wrapped function with retry logic
 */
export const createRetryWrapper = (apiCall, config = {}, operationName = 'API call') => {
  return async (...args) => {
    return retryWithBackoff(
      () => apiCall(...args),
      config,
      operationName
    );
  };
};

/**
 * Specific retry configurations for different types of operations
 */
export const RETRY_CONFIGS = {
  // Quick operations (dashboard data)
  QUICK: {
    maxRetries: 2,
    baseDelay: 500,
    maxDelay: 3000,
    backoffMultiplier: 2
  },
  
  // Standard operations (most API calls)
  STANDARD: {
    maxRetries: 3,
    baseDelay: 1000,
    maxDelay: 8000,
    backoffMultiplier: 2
  },
  
  // Long operations (CSV export, large data)
  LONG: {
    maxRetries: 2,
    baseDelay: 2000,
    maxDelay: 15000,
    backoffMultiplier: 2
  },
  
  // Critical operations (excuse processing)
  CRITICAL: {
    maxRetries: 4,
    baseDelay: 1000,
    maxDelay: 10000,
    backoffMultiplier: 1.5
  }
};

/**
 * Enhanced fetch with retry logic
 * @param {string} url - URL to fetch
 * @param {Object} options - Fetch options
 * @param {Object} retryConfig - Retry configuration
 * @returns {Promise<Response>} Fetch response
 */
export const fetchWithRetry = async (url, options = {}, retryConfig = RETRY_CONFIGS.STANDARD) => {
  return retryWithBackoff(
    async () => {
      const response = await fetch(url, options);
      
      if (!response.ok) {
        const error = new Error(`HTTP ${response.status}: ${response.statusText}`);
        error.response = response;
        error.status = response.status;
        throw error;
      }
      
      return response;
    },
    retryConfig,
    `Fetch ${url}`
  );
};

/**
 * Check if an error is retryable
 * @param {Error} error - Error to check
 * @returns {boolean} Whether the error is retryable
 */
export const isRetryableError = (error) => {
  return DEFAULT_RETRY_CONFIG.retryCondition(error);
};

/**
 * Get user-friendly error message for different error types
 * @param {Error} error - Error object
 * @returns {string} User-friendly error message
 */
export const getErrorMessage = (error) => {
  if (!error) return 'An unknown error occurred';
  
  // Network errors
  if (error.message?.includes('Network Error') || !error.response) {
    return 'Network connection failed. Please check your internet connection and try again.';
  }
  
  // Timeout errors
  if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
    return 'Request timed out. The server is taking too long to respond. Please try again.';
  }
  
  // HTTP status errors
  if (error.response) {
    const status = error.response.status;
    
    switch (status) {
      case 401:
        return 'Your session has expired. Please log in again.';
      case 403:
        return 'You do not have permission to perform this action.';
      case 404:
        return 'The requested resource was not found.';
      case 429:
        return 'Too many requests. Please wait a moment and try again.';
      case 500:
        return 'Server error occurred. Please try again later.';
      case 502:
      case 503:
      case 504:
        return 'Service temporarily unavailable. Please try again in a few minutes.';
      default:
        return `Server error (${status}). Please try again.`;
    }
  }
  
  // Generic error
  return error.message || 'An unexpected error occurred. Please try again.';
};

export default {
  retryWithBackoff,
  createRetryWrapper,
  fetchWithRetry,
  isRetryableError,
  getErrorMessage,
  RETRY_CONFIGS
};
