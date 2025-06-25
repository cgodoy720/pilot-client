// Global error handler that overrides fetch to handle auth errors automatically
// This ensures all API calls get proper auth error handling without component changes

let hasTriggeredAuthModal = false; // One-time flag to prevent any further modals

// Store original fetch
const originalFetch = window.fetch;

// Create enhanced fetch with global auth error handling
const enhancedFetch = async (...args) => {
  try {
    const response = await originalFetch(...args);
    
    // Check if this is an API call to our backend
    const url = args[0];
    const isApiCall = typeof url === 'string' && url.includes(import.meta.env.VITE_API_URL);
    
    // Only handle auth errors for our API calls
    if (isApiCall && (response.status === 401 || response.status === 403)) {
      
      // Prevent multiple auth error modals - only trigger once per session
      if (hasTriggeredAuthModal) {
        console.log('🚫 Auth modal already triggered this session, skipping...');
        return response;
      }
      
      hasTriggeredAuthModal = true;
      console.log('🚨 First auth error detected, triggering modal...');
      
      try {
        const errorData = await response.clone().json().catch(() => ({}));
        
        console.log('🚨 Auth error detected:', { status: response.status, errorData });
        
        // Handle different types of auth errors
        if (response.status === 401 && errorData.tokenExpired) {
          // Token expired - show simple alert and redirect immediately
          console.log('🚨 Token expired, redirecting to login...');
          
          // Show brief user-friendly message
          const message = errorData.message || 'Your session has expired. Redirecting to login...';
          
          // Emit event for modal (but also do immediate redirect as backup)
          const event = new CustomEvent('authError', {
            detail: {
              type: 'token_expired',
              message: message
            }
          });
          window.dispatchEvent(event);
          
          // Clear auth data and redirect immediately (don't wait for modal)
          setTimeout(() => {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
          }, 2000); // 2 second delay to show modal briefly
          
        } else if (response.status === 403 && errorData.userInactive) {
          // User is inactive - only show modal, no redirect
          const event = new CustomEvent('authError', {
            detail: {
              type: 'user_inactive',
              message: errorData.message || 'Your account now has view-only access. You can browse historical content but cannot make new submissions or access active features.'
            }
          });
          window.dispatchEvent(event);
          
        } else {
          // Generic auth error - show message and redirect immediately
          console.log('🚨 Auth error, redirecting to login...');
          
          const event = new CustomEvent('authError', {
            detail: {
              type: 'generic_auth_error',
              message: 'Authentication error. Redirecting to login...'
            }
          });
          window.dispatchEvent(event);
          
          // Clear auth data and redirect immediately
          setTimeout(() => {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
          }, 2000);
        }
        
      } catch (parseError) {
        console.error('Error parsing auth error response:', parseError);
        
        // Fallback for unparseable errors - immediate redirect
        console.log('🚨 Unparseable auth error, redirecting immediately...');
        
        const event = new CustomEvent('authError', {
          detail: {
            type: 'generic_auth_error',
            message: 'Authentication error. Redirecting to login...'
          }
        });
        window.dispatchEvent(event);
        
        // Immediate redirect for fallback case
        setTimeout(() => {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }, 1500);
      }
      
      // No need to reset flag - we only want one modal per session
    }
    
    return response;
  } catch (error) {
    // Network errors, etc. - just pass through
    throw error;
  }
};

// Reset auth modal state (useful for page refreshes)
export const resetAuthModalState = () => {
  hasTriggeredAuthModal = false;
  console.log('🔄 Auth modal state reset');
};

// Install the global error handler
export const installGlobalErrorHandler = () => {
  if (window.fetch === enhancedFetch) {
    console.log('⚠️ Global error handler already installed');
    return;
  }
  
  window.fetch = enhancedFetch;
  console.log('🔧 Global auth error handler installed');
};

// Uninstall the global error handler
export const uninstallGlobalErrorHandler = () => {
  window.fetch = originalFetch;
  console.log('🔧 Global auth error handler removed');
};

// Auto-install when this module is imported
installGlobalErrorHandler(); 