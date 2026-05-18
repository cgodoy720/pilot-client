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
 *
 * IMPORTANT: Must clear every cache key that's read on the attendance
 * surfaces — including day-builder-status and cohort-daily-breakdown —
 * otherwise sibling components keep serving stale data even after a
 * mutation. The forceRefresh path only bypasses cache reads for the
 * single call that asks for it; it does not clear the underlying entry.
 */
export const invalidateAllAttendanceCaches = () => {
  invalidateCohortPerformanceCache();
  invalidateTodaysAttendanceCache();
  cacheService.clearPattern('/api/admin/attendance/dashboard/day-builder-status');
  cacheService.clearPattern('/api/admin/attendance/dashboard/cohort-daily-breakdown');
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

/**
 * Get cached cohort daily breakdown
 * @param {string} cohort - Cohort name
 * @param {string} token - Admin authentication token
 * @param {Object} options - Cache options
 * @returns {Promise<Object>} Daily breakdown data with cache metadata
 */
export const getCachedCohortDailyBreakdown = async (cohort, token, options = {}) => {
  const { 
    forceRefresh = false, 
    ttl = 5 * 60 * 1000, // 5 minutes default
    period = 'last-30-days'
  } = options;

  const cacheKey = cacheService.generateKey(`/api/admin/attendance/dashboard/cohort-daily-breakdown/${cohort}`, { period });

  // Check cache first (unless force refresh)
  if (!forceRefresh) {
    const cachedData = cacheService.get(cacheKey);
    if (cachedData) {
      console.log('📦 Serving cohort daily breakdown from cache');
      return cachedData;
    }
  }

  // Fetch fresh data
  console.log('🔄 Fetching fresh cohort daily breakdown data');
  const startTime = Date.now();
  
  try {
    const data = await adminApi.getCohortDailyBreakdown(cohort, token, { period });
    const endTime = Date.now();
    
    console.log(`⏱️ Cohort daily breakdown fetch took ${endTime - startTime}ms`);
    
    // Cache the result
    const cachedResult = cacheService.set(cacheKey, data, ttl);
    
    return {
      ...cachedResult,
      fetchTime: endTime - startTime
    };
  } catch (error) {
    console.error('❌ Error fetching cohort daily breakdown:', error);
    throw error;
  }
};

/**
 * Get cached day builder status
 * @param {string} cohort - Cohort name
 * @param {string} date - Date in YYYY-MM-DD format
 * @param {string} token - Admin authentication token
 * @param {Object} options - Cache options
 * @returns {Promise<Object>} Builder status data with cache metadata
 */
export const getCachedDayBuilderStatus = async (cohort, date, token, options = {}) => {
  const { 
    forceRefresh = false, 
    ttl = 2 * 60 * 1000 // 2 minutes default (more dynamic)
  } = options;

  const cacheKey = cacheService.generateKey(`/api/admin/attendance/dashboard/day-builder-status/${cohort}/${date}`);

  // Check cache first (unless force refresh)
  if (!forceRefresh) {
    const cachedData = cacheService.get(cacheKey);
    if (cachedData) {
      console.log('📦 Serving day builder status from cache');
      return cachedData;
    }
  }

  // Fetch fresh data
  console.log('🔄 Fetching fresh day builder status data');
  const startTime = Date.now();
  
  try {
    const data = await adminApi.getDayBuilderStatus(cohort, date, token);
    const endTime = Date.now();
    
    console.log(`⏱️ Day builder status fetch took ${endTime - startTime}ms`);
    
    // Cache the result
    const cachedResult = cacheService.set(cacheKey, data, ttl);
    
    return {
      ...cachedResult,
      fetchTime: endTime - startTime
    };
  } catch (error) {
    console.error('❌ Error fetching day builder status:', error);
    throw error;
  }
};

// Export the cached API functions
export const cachedAdminApi = {
  // Cached functions
  getCachedCohortPerformance,
  getCachedTodaysAttendance,
  getCachedCohortDailyBreakdown,
  getCachedDayBuilderStatus,
  invalidateCohortPerformanceCache,
  invalidateTodaysAttendanceCache,
  invalidateAllAttendanceCaches,
  getCacheStats,
  clearAllCaches,
  
  // Pass through all other adminApi functions
  ...adminApi
};

export default cachedAdminApi;
