/**
 * Cached Admin API Service
 * Extends adminApi with caching for specific endpoints
 */

import { adminApi } from './adminApi';
import cacheService from '../utils/cacheService';
import { getErrorMessage } from '../utils/retryUtils';

/**
 * Get cached cohort performance data
 * @param {string} token - Admin authentication token
 * @param {Object} options - Cache options
 * @returns {Promise<Object>} Cohort performance data with cache metadata
 */
export const getCachedCohortPerformance = async (token, options = {}) => {
  const { 
    forceRefresh = false, 
    ttl = 5 * 60 * 1000, // 5 minutes default
    period = 'last-30-days' // Default period
  } = options;

  const cacheKey = cacheService.generateKey('/api/admin/attendance/dashboard/cohort-performance', { period });

  // Check cache first (unless force refresh)
  if (!forceRefresh) {
    const cachedData = cacheService.get(cacheKey);
    if (cachedData) {
      console.log('📦 Serving cohort performance from cache');
      return cachedData;
    }
  }

  // Fetch fresh data
  console.log('🔄 Fetching fresh cohort performance data');
  const startTime = Date.now();
  
  try {
    const data = await adminApi.getCohortPerformance(token, { period });
    const endTime = Date.now();
    
    console.log(`⏱️ Cohort performance fetch took ${endTime - startTime}ms`);
    
    // Cache the result
    const cachedResult = cacheService.set(cacheKey, data, ttl);
    
    return {
      ...cachedResult,
      fetchTime: endTime - startTime
    };
  } catch (error) {
    console.error('❌ Error fetching cohort performance:', error);
    
    // If cache service fails, try direct API call as fallback
    if (error.message?.includes('cache') || error.message?.includes('Cache')) {
      console.log('🔄 Cache service failed, falling back to direct API call');
      try {
        const data = await adminApi.getCohortPerformance(token, { period });
        const endTime = Date.now();
        
        return {
          data,
          cachedAt: new Date(),
          expiresAt: new Date(Date.now() + ttl),
          isFromCache: false,
          fetchTime: endTime - startTime,
          fallbackUsed: true
        };
      } catch (fallbackError) {
        console.error('❌ Fallback API call also failed:', fallbackError);
        throw fallbackError;
      }
    }
    
    throw error;
  }
};

/**
 * Get cached today's attendance data
 * @param {string} token - Admin authentication token
 * @param {Object} options - Cache options
 * @returns {Promise<Object>} Today's attendance data with cache metadata
 */
export const getCachedTodaysAttendance = async (token, options = {}) => {
  const { 
    forceRefresh = false, 
    ttl = 2 * 60 * 1000 // 2 minutes default (shorter than cohort performance)
  } = options;

  const cacheKey = cacheService.generateKey('/api/admin/attendance/dashboard/today');

  // Check cache first (unless force refresh)
  if (!forceRefresh) {
    const cachedData = cacheService.get(cacheKey);
    if (cachedData) {
      console.log('📦 Serving today\'s attendance from cache');
      return cachedData;
    }
  }

  // Fetch fresh data
  console.log('🔄 Fetching fresh today\'s attendance data');
  const startTime = Date.now();
  
  try {
    const data = await adminApi.getTodaysAttendanceOverview(token);
    const endTime = Date.now();
    
    console.log(`⏱️ Today's attendance fetch took ${endTime - startTime}ms`);
    
    // Cache the result
    const cachedResult = cacheService.set(cacheKey, data, ttl);
    
    return {
      ...cachedResult,
      fetchTime: endTime - startTime
    };
  } catch (error) {
    console.error('❌ Error fetching today\'s attendance:', error);
    throw error;
  }
};

/**
 * Invalidate cohort performance cache
 * Call this when excuses are processed or attendance data changes
 */
export const invalidateCohortPerformanceCache = () => {
  cacheService.clearPattern('/api/admin/attendance/dashboard/cohort-performance');
  console.log('🗑️ Cohort performance cache invalidated');
};

/**
 * Invalidate today's attendance cache
 * Call this when excuses are processed or attendance data changes
 */
export const invalidateTodaysAttendanceCache = () => {
  cacheService.clearPattern('/api/admin/attendance/dashboard/today');
  console.log('🗑️ Today\'s attendance cache invalidated');
};

/**
 * Invalidate all attendance-related caches
 * Call this when excuses are processed or attendance data changes
 */
export const invalidateAllAttendanceCaches = () => {
  invalidateCohortPerformanceCache();
  invalidateTodaysAttendanceCache();
  console.log('🗑️ All attendance caches invalidated');
};

/**
 * Get cache statistics for debugging
 * @returns {Object} Cache statistics
 */
export const getCacheStats = () => {
  return cacheService.getStats();
};

/**
 * Clear all caches
 */
export const clearAllCaches = () => {
  cacheService.clear();
  console.log('🗑️ All caches cleared');
};

// Export the cached API functions
export const cachedAdminApi = {
  // Cached functions
  getCachedCohortPerformance,
  getCachedTodaysAttendance,
  invalidateCohortPerformanceCache,
  invalidateTodaysAttendanceCache,
  invalidateAllAttendanceCaches,
  getCacheStats,
  clearAllCaches,
  
  // Pass through all other adminApi functions
  ...adminApi
};

export default cachedAdminApi;
