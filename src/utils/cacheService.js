/**
 * Simple Memory Cache Service
 * Provides caching functionality for API responses with expiration
 */

class MemoryCache {
  constructor() {
    this.cache = new Map();
    this.defaultTTL = 5 * 60 * 1000; // 5 minutes in milliseconds
  }

  /**
   * Generate a cache key from parameters
   * @param {string} endpoint - API endpoint
   * @param {Object} params - Request parameters
   * @returns {string} Cache key
   */
  generateKey(endpoint, params = {}) {
    const paramString = Object.keys(params)
      .sort()
      .map(key => `${key}=${params[key]}`)
      .join('&');
    return `${endpoint}${paramString ? `?${paramString}` : ''}`;
  }

  /**
   * Get cached data if it exists and hasn't expired
   * @param {string} key - Cache key
   * @returns {Object|null} Cached data or null if not found/expired
   */
  get(key) {
    const item = this.cache.get(key);
    
    if (!item) {
      return null;
    }

    // Check if expired
    if (Date.now() > item.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return {
      data: item.data,
      cachedAt: item.cachedAt,
      expiresAt: item.expiresAt,
      isFromCache: true
    };
  }

  /**
   * Store data in cache with TTL
   * @param {string} key - Cache key
   * @param {*} data - Data to cache
   * @param {number} ttl - Time to live in milliseconds (optional)
   * @returns {Object} Cache metadata
   */
  set(key, data, ttl = this.defaultTTL) {
    const now = Date.now();
    const expiresAt = now + ttl;
    
    const cacheItem = {
      data,
      cachedAt: now,
      expiresAt
    };

    this.cache.set(key, cacheItem);

    return {
      data,
      cachedAt: new Date(now),
      expiresAt: new Date(expiresAt),
      isFromCache: false
    };
  }

  /**
   * Remove specific item from cache
   * @param {string} key - Cache key to remove
   */
  delete(key) {
    this.cache.delete(key);
  }

  /**
   * Clear all cache entries
   */
  clear() {
    this.cache.clear();
  }

  /**
   * Clear cache entries matching a pattern
   * @param {string} pattern - Pattern to match (e.g., '/api/admin/dashboard/cohort-performance')
   */
  clearPattern(pattern) {
    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Get cache statistics
   * @returns {Object} Cache statistics
   */
  getStats() {
    const now = Date.now();
    let validEntries = 0;
    let expiredEntries = 0;

    for (const item of this.cache.values()) {
      if (now > item.expiresAt) {
        expiredEntries++;
      } else {
        validEntries++;
      }
    }

    return {
      totalEntries: this.cache.size,
      validEntries,
      expiredEntries,
      memoryUsage: this.cache.size
    };
  }

  /**
   * Clean up expired entries
   */
  cleanup() {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (now > item.expiresAt) {
        this.cache.delete(key);
      }
    }
  }
}

// Create singleton instance
const cacheService = new MemoryCache();

// Clean up expired entries every minute
setInterval(() => {
  cacheService.cleanup();
}, 60 * 1000);

export default cacheService;
