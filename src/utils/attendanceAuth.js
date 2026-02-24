/**
 * Attendance Authentication Utility Service
 * Handles token management, validation, and session management for attendance system
 */

// Storage keys
const STORAGE_KEYS = {
  TOKEN: 'attendanceToken',
  USER: 'attendanceUser',
  SESSION_START: 'attendanceSessionStart',
  LAST_ACTIVITY: 'attendanceLastActivity'
};

// Session timeout (7 days in milliseconds)
const SESSION_TIMEOUT = 7 * 24 * 60 * 60 * 1000;

/**
 * Store authentication data securely
 * @param {string} token - JWT token
 * @param {object} user - User data
 */
export const storeAuthData = (token, user) => {
  try {
    localStorage.setItem(STORAGE_KEYS.TOKEN, token);
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    localStorage.setItem(STORAGE_KEYS.SESSION_START, Date.now().toString());
    localStorage.setItem(STORAGE_KEYS.LAST_ACTIVITY, Date.now().toString());
    return true;
  } catch (error) {
    console.error('Error storing auth data:', error);
    return false;
  }
};

/**
 * Get stored authentication token
 * @returns {string|null} JWT token or null if not found
 */
export const getAuthToken = () => {
  try {
    return localStorage.getItem(STORAGE_KEYS.TOKEN);
  } catch (error) {
    console.error('Error getting auth token:', error);
    return null;
  }
};

/**
 * Get stored user data
 * @returns {object|null} User data or null if not found
 */
export const getAuthUser = () => {
  try {
    const userData = localStorage.getItem(STORAGE_KEYS.USER);
    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    console.error('Error getting auth user:', error);
    return null;
  }
};

/**
 * Clear all authentication data
 */
export const clearAuthData = () => {
  try {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
  } catch (error) {
    console.error('Error clearing auth data:', error);
  }
};

/**
 * Check if user is authenticated
 * @returns {boolean} True if authenticated and session is valid
 */
export const isAuthenticated = () => {
  try {
    const token = getAuthToken();
    const user = getAuthUser();
    
    if (!token || !user) {
      return false;
    }

    // Validate token structure
    const tokenParts = token.split('.');
    if (tokenParts.length !== 3) {
      clearAuthData();
      return false;
    }

    // Decode and validate token
    const payload = JSON.parse(atob(tokenParts[1]));
    const currentTime = Math.floor(Date.now() / 1000);

    // Check token expiration
    if (payload.exp <= currentTime) {
      clearAuthData();
      return false;
    }

    // Check session timeout
    const sessionStart = localStorage.getItem(STORAGE_KEYS.SESSION_START);
    if (sessionStart) {
      const sessionAge = Date.now() - parseInt(sessionStart);
      if (sessionAge > SESSION_TIMEOUT) {
        clearAuthData();
        return false;
      }
    }

    // Update last activity
    localStorage.setItem(STORAGE_KEYS.LAST_ACTIVITY, Date.now().toString());

    return true;
  } catch (error) {
    console.error('Error checking authentication:', error);
    clearAuthData();
    return false;
  }
};

/**
 * Validate JWT token structure and content
 * @param {string} token - JWT token to validate
 * @returns {object} Validation result with isValid and payload
 */
export const validateToken = (token) => {
  try {
    if (!token) {
      return { isValid: false, error: 'No token provided' };
    }

    const tokenParts = token.split('.');
    if (tokenParts.length !== 3) {
      return { isValid: false, error: 'Invalid token structure' };
    }

    const payload = JSON.parse(atob(tokenParts[1]));
    const currentTime = Math.floor(Date.now() / 1000);

    if (payload.exp <= currentTime) {
      return { isValid: false, error: 'Token expired' };
    }

    if (!payload.userId || !payload.email || !payload.role) {
      return { isValid: false, error: 'Invalid token payload' };
    }

    if (payload.role !== 'admin' && payload.role !== 'staff') {
      return { isValid: false, error: 'Insufficient privileges' };
    }

    return { isValid: true, payload };
  } catch (error) {
    return { isValid: false, error: 'Token validation failed' };
  }
};

/**
 * Get authentication headers for API requests
 * @returns {object} Headers object with Authorization
 */
export const getAuthHeaders = () => {
  const token = getAuthToken();
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
};

/**
 * Check if user has admin privileges
 * @returns {boolean} True if user is admin or staff
 */
export const hasAdminPrivileges = () => {
  try {
    const user = getAuthUser();
    return user && (user.role === 'admin' || user.role === 'staff');
  } catch (error) {
    return false;
  }
};

/**
 * Get session information
 * @returns {object} Session info including age and remaining time
 */
export const getSessionInfo = () => {
  try {
    const sessionStart = localStorage.getItem(STORAGE_KEYS.SESSION_START);
    const lastActivity = localStorage.getItem(STORAGE_KEYS.LAST_ACTIVITY);
    
    if (!sessionStart) {
      return null;
    }

    const sessionAge = Date.now() - parseInt(sessionStart);
    const remainingTime = SESSION_TIMEOUT - sessionAge;
    const lastActivityAge = lastActivity ? Date.now() - parseInt(lastActivity) : 0;

    return {
      sessionAge,
      remainingTime,
      lastActivityAge,
      isExpired: remainingTime <= 0
    };
  } catch (error) {
    return null;
  }
};

/**
 * Refresh session activity timestamp
 */
export const refreshSession = () => {
  try {
    localStorage.setItem(STORAGE_KEYS.LAST_ACTIVITY, Date.now().toString());
  } catch (error) {
    console.error('Error refreshing session:', error);
  }
};

/**
 * Setup session monitoring
 * @param {function} onSessionExpired - Callback when session expires
 */
export const setupSessionMonitoring = (onSessionExpired) => {
  // Check session every minute
  const interval = setInterval(() => {
    if (!isAuthenticated()) {
      clearInterval(interval);
      if (onSessionExpired) {
        onSessionExpired();
      }
    }
  }, 60000);

  // Update activity on user interaction
  const updateActivity = () => {
    if (isAuthenticated()) {
      refreshSession();
    }
  };

  // Listen for user activity
  ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'].forEach(event => {
    document.addEventListener(event, updateActivity, true);
  });

  return () => {
    clearInterval(interval);
    ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'].forEach(event => {
      document.removeEventListener(event, updateActivity, true);
    });
  };
};

/**
 * Secure logout function
 * @param {function} redirectCallback - Optional callback for redirect
 */
export const secureLogout = (redirectCallback) => {
  clearAuthData();
  
  if (redirectCallback) {
    redirectCallback();
  }
};

export default {
  storeAuthData,
  getAuthToken,
  getAuthUser,
  clearAuthData,
  isAuthenticated,
  validateToken,
  getAuthHeaders,
  hasAdminPrivileges,
  getSessionInfo,
  refreshSession,
  setupSessionMonitoring,
  secureLogout
};
