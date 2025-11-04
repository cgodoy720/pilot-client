/**
 * Network Status Monitoring Utility
 * Provides online/offline detection, action queuing, and retry mechanisms
 */

class NetworkStatusManager {
  constructor() {
    this.isOnline = navigator.onLine;
    this.listeners = new Set();
    this.actionQueue = [];
    this.retryAttempts = new Map();
    this.maxRetryAttempts = 3;
    this.retryDelay = 1000; // Start with 1 second
    this.maxRetryDelay = 30000; // Max 30 seconds
    
    this.init();
  }

  init() {
    // Listen for online/offline events
    window.addEventListener('online', this.handleOnline.bind(this));
    window.addEventListener('offline', this.handleOffline.bind(this));
    
    // Periodic connectivity check (every 30 seconds when offline)
    this.connectivityCheckInterval = setInterval(() => {
      if (!this.isOnline) {
        this.checkConnectivity();
      }
    }, 30000);
  }

  handleOnline() {
    console.log('🌐 Network: Back online');
    this.isOnline = true;
    this.notifyListeners();
    this.processQueuedActions();
  }

  handleOffline() {
    console.log('📴 Network: Gone offline');
    this.isOnline = false;
    this.notifyListeners();
  }

  async checkConnectivity() {
    try {
      // Try to fetch a small resource to verify connectivity
      const response = await fetch('/favicon.ico', { 
        method: 'HEAD',
        cache: 'no-cache',
        timeout: 5000
      });
      
      if (response.ok && !this.isOnline) {
        this.handleOnline();
      }
    } catch (error) {
      // Still offline
      console.log('🔍 Network: Connectivity check failed, still offline');
    }
  }

  // Subscribe to network status changes
  subscribe(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  notifyListeners() {
    this.listeners.forEach(callback => {
      try {
        callback(this.isOnline);
      } catch (error) {
        console.error('Error in network status listener:', error);
      }
    });
  }

  // Queue actions for when network comes back online
  queueAction(action) {
    if (this.isOnline) {
      return action.execute();
    }

    console.log('📦 Network: Queuing action for later execution');
    this.actionQueue.push({
      ...action,
      queuedAt: Date.now(),
      attempts: 0
    });
    
    return Promise.reject(new Error('Action queued - network offline'));
  }

  async processQueuedActions() {
    if (this.actionQueue.length === 0) return;

    console.log(`🔄 Network: Processing ${this.actionQueue.length} queued actions`);
    
    const actionsToProcess = [...this.actionQueue];
    this.actionQueue = [];

    for (const action of actionsToProcess) {
      try {
        await this.executeWithRetry(action);
      } catch (error) {
        console.error('Failed to execute queued action:', error);
        // Re-queue if not exceeded max attempts
        if (action.attempts < this.maxRetryAttempts) {
          this.actionQueue.push(action);
        }
      }
    }
  }

  async executeWithRetry(action) {
    action.attempts = (action.attempts || 0) + 1;
    
    try {
      const result = await action.execute();
      console.log(`✅ Network: Successfully executed queued action (attempt ${action.attempts})`);
      return result;
    } catch (error) {
      if (action.attempts < this.maxRetryAttempts) {
        const delay = Math.min(
          this.retryDelay * Math.pow(2, action.attempts - 1),
          this.maxRetryDelay
        );
        
        console.log(`⏳ Network: Retrying action in ${delay}ms (attempt ${action.attempts})`);
        await new Promise(resolve => setTimeout(resolve, delay));
        return this.executeWithRetry(action);
      } else {
        throw error;
      }
    }
  }

  // Create a network-aware API call
  createNetworkAwareCall(apiCall, options = {}) {
    return async (...args) => {
      const action = {
        execute: () => apiCall(...args),
        description: options.description || 'API call',
        ...options
      };

      if (this.isOnline) {
        try {
          return await action.execute();
        } catch (error) {
          // If it's a network error, queue for retry
          if (this.isNetworkError(error)) {
            return this.queueAction(action);
          }
          throw error;
        }
      } else {
        return this.queueAction(action);
      }
    };
  }

  isNetworkError(error) {
    return (
      error.name === 'TypeError' && 
      (error.message.includes('fetch') || error.message.includes('network'))
    ) || 
    error.status === 0 || // Network error
    error.code === 'NETWORK_ERROR' ||
    !navigator.onLine;
  }

  // Get current status
  getStatus() {
    return {
      isOnline: this.isOnline,
      queuedActions: this.actionQueue.length,
      lastChecked: new Date().toISOString()
    };
  }

  // Cleanup
  destroy() {
    window.removeEventListener('online', this.handleOnline);
    window.removeEventListener('offline', this.handleOffline);
    if (this.connectivityCheckInterval) {
      clearInterval(this.connectivityCheckInterval);
    }
    this.listeners.clear();
    this.actionQueue = [];
  }
}

// Create singleton instance
const networkStatus = new NetworkStatusManager();

export default networkStatus;

// React hook for network status (import React in component files)
export const useNetworkStatus = (React) => {
  const [isOnline, setIsOnline] = React.useState(networkStatus.isOnline);
  const [queuedActions, setQueuedActions] = React.useState(0);

  React.useEffect(() => {
    const unsubscribe = networkStatus.subscribe((online) => {
      setIsOnline(online);
      setQueuedActions(networkStatus.actionQueue.length);
    });

    return unsubscribe;
  }, []);

  return {
    isOnline,
    queuedActions,
    networkStatus
  };
};
