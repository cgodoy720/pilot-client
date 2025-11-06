/**
 * Attendance Action Queue Manager
 * Handles queuing of attendance-related actions when offline
 */

import networkStatus from './networkStatus';

class AttendanceActionQueue {
  constructor() {
    this.queuedActions = [];
    this.maxQueueSize = 100;
    this.storageKey = 'attendance_action_queue';
    
    // Load queued actions from localStorage on initialization
    this.loadFromStorage();
    
    // Process queue when network comes back online
    networkStatus.subscribe((isOnline) => {
      if (isOnline) {
        this.processQueue();
      }
    });
  }

  // Queue an excuse submission
  queueExcuseSubmission(excuseData, token) {
    const action = {
      id: this.generateActionId(),
      type: 'excuse_submission',
      data: excuseData,
      token: token,
      timestamp: Date.now(),
      description: `Submit excuse for ${excuseData.userId} on ${excuseData.absenceDate}`
    };

    return this.queueAction(action);
  }

  // Queue a CSV export request
  queueCSVExport(exportParams, token) {
    const action = {
      id: this.generateActionId(),
      type: 'csv_export',
      data: exportParams,
      token: token,
      timestamp: Date.now(),
      description: `Export CSV for ${exportParams.startDate} to ${exportParams.endDate}`
    };

    return this.queueAction(action);
  }

  // Queue a bulk excuse operation
  queueBulkExcuse(bulkData, token) {
    const action = {
      id: this.generateActionId(),
      type: 'bulk_excuse',
      data: bulkData,
      token: token,
      timestamp: Date.now(),
      description: `Bulk excuse for ${bulkData.userIds.length} users on ${bulkData.absenceDate}`
    };

    return this.queueAction(action);
  }

  // Generic action queuing
  queueAction(action) {
    if (this.queuedActions.length >= this.maxQueueSize) {
      throw new Error('Action queue is full. Please try again later.');
    }

    this.queuedActions.push(action);
    this.saveToStorage();
    
    console.log(`📦 Queued action: ${action.description}`);
    
    // If online, try to process immediately
    if (networkStatus.isOnline) {
      this.processQueue();
    }

    return Promise.reject(new Error('Action queued for when you reconnect'));
  }

  // Process all queued actions
  async processQueue() {
    if (this.queuedActions.length === 0) return;

    console.log(`🔄 Processing ${this.queuedActions.length} queued attendance actions`);
    
    const actionsToProcess = [...this.queuedActions];
    this.queuedActions = [];
    this.saveToStorage();

    const results = [];
    for (const action of actionsToProcess) {
      try {
        const result = await this.executeAction(action);
        results.push({ action, success: true, result });
        console.log(`✅ Successfully processed: ${action.description}`);
      } catch (error) {
        console.error(`❌ Failed to process: ${action.description}`, error);
        results.push({ action, success: false, error });
        
        // Re-queue if it's a network error and we're still online
        if (networkStatus.isNetworkError(error) && networkStatus.isOnline) {
          this.queuedActions.push(action);
        }
      }
    }

    this.saveToStorage();
    return results;
  }

  // Execute a specific action
  async executeAction(action) {
    const { adminApi } = await import('../services/adminApi');
    
    switch (action.type) {
      case 'excuse_submission':
        return adminApi.markBuilderExcused(action.data, action.token);
      
      case 'csv_export':
        return adminApi.exportAttendanceCSV(action.data, action.token);
      
      case 'bulk_excuse':
        return adminApi.bulkMarkExcused(action.data, action.token);
      
      default:
        throw new Error(`Unknown action type: ${action.type}`);
    }
  }

  // Get queued actions
  getQueuedActions() {
    return [...this.queuedActions];
  }

  // Get queue status
  getQueueStatus() {
    return {
      count: this.queuedActions.length,
      actions: this.queuedActions.map(action => ({
        id: action.id,
        type: action.type,
        description: action.description,
        timestamp: action.timestamp,
        age: Date.now() - action.timestamp
      }))
    };
  }

  // Clear all queued actions
  clearQueue() {
    this.queuedActions = [];
    this.saveToStorage();
    console.log('🗑️ Cleared all queued actions');
  }

  // Remove a specific action from queue
  removeAction(actionId) {
    const index = this.queuedActions.findIndex(action => action.id === actionId);
    if (index !== -1) {
      const removed = this.queuedActions.splice(index, 1)[0];
      this.saveToStorage();
      console.log(`🗑️ Removed queued action: ${removed.description}`);
      return removed;
    }
    return null;
  }

  // Generate unique action ID
  generateActionId() {
    return `action_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Save queue to localStorage
  saveToStorage() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.queuedActions));
    } catch (error) {
      console.error('Failed to save action queue to localStorage:', error);
    }
  }

  // Load queue from localStorage
  loadFromStorage() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        this.queuedActions = JSON.parse(stored);
        console.log(`📥 Loaded ${this.queuedActions.length} queued actions from storage`);
      }
    } catch (error) {
      console.error('Failed to load action queue from localStorage:', error);
      this.queuedActions = [];
    }
  }

  // Clean up old actions (older than 24 hours)
  cleanupOldActions() {
    const oneDayAgo = Date.now() - (24 * 60 * 60 * 1000);
    const initialCount = this.queuedActions.length;
    
    this.queuedActions = this.queuedActions.filter(action => action.timestamp > oneDayAgo);
    
    const removedCount = initialCount - this.queuedActions.length;
    if (removedCount > 0) {
      console.log(`🧹 Cleaned up ${removedCount} old queued actions`);
      this.saveToStorage();
    }
  }
}

// Create singleton instance
const attendanceActionQueue = new AttendanceActionQueue();

// Clean up old actions on page load
attendanceActionQueue.cleanupOldActions();

export default attendanceActionQueue;
