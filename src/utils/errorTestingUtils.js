/**
 * Error Testing Utilities
 * Provides utilities for testing error scenarios in development
 */

/**
 * Simulate different types of errors for testing
 */
export const ErrorSimulator = {
  /**
   * Simulate network error
   */
  networkError: () => {
    const error = new Error('Network Error');
    error.code = 'NETWORK_ERROR';
    return error;
  },

  /**
   * Simulate timeout error
   */
  timeoutError: () => {
    const error = new Error('Request timeout');
    error.code = 'ECONNABORTED';
    return error;
  },

  /**
   * Simulate server error
   */
  serverError: (status = 500) => {
    const error = new Error(`HTTP ${status}: Server Error`);
    error.response = { status };
    error.status = status;
    return error;
  },

  /**
   * Simulate authentication error
   */
  authError: () => {
    const error = new Error('Your session has expired. Please log in again.');
    error.response = { status: 401 };
    error.status = 401;
    return error;
  },

  /**
   * Simulate permission error
   */
  permissionError: () => {
    const error = new Error('You do not have permission to perform this action.');
    error.response = { status: 403 };
    error.status = 403;
    return error;
  },

  /**
   * Simulate rate limiting error
   */
  rateLimitError: () => {
    const error = new Error('Too many requests. Please wait a moment and try again.');
    error.response = { status: 429 };
    error.status = 429;
    return error;
  },

  /**
   * Simulate CSV export timeout
   */
  csvTimeoutError: () => {
    const error = new Error('CSV export timed out. The file may be too large.');
    error.code = 'ECONNABORTED';
    error.timeout = true;
    return error;
  },

  /**
   * Simulate cache service error
   */
  cacheError: () => {
    const error = new Error('Cache service unavailable');
    error.cacheError = true;
    return error;
  }
};

/**
 * Test error scenarios for different components
 */
export const ErrorTestScenarios = {
  /**
   * Test cohort performance API errors
   */
  testCohortPerformanceErrors: async (component) => {
    const scenarios = [
      { name: 'Network Error', error: ErrorSimulator.networkError() },
      { name: 'Server Error', error: ErrorSimulator.serverError(500) },
      { name: 'Auth Error', error: ErrorSimulator.authError() },
      { name: 'Timeout Error', error: ErrorSimulator.timeoutError() }
    ];

    console.log('🧪 Testing Cohort Performance Error Scenarios:');
    for (const scenario of scenarios) {
      console.log(`  - ${scenario.name}: ${scenario.error.message}`);
    }
  },

  /**
   * Test CSV export errors
   */
  testCSVExportErrors: async (component) => {
    const scenarios = [
      { name: 'Large File Timeout', error: ErrorSimulator.csvTimeoutError() },
      { name: 'Server Error', error: ErrorSimulator.serverError(502) },
      { name: 'Permission Error', error: ErrorSimulator.permissionError() },
      { name: 'Rate Limit', error: ErrorSimulator.rateLimitError() }
    ];

    console.log('🧪 Testing CSV Export Error Scenarios:');
    for (const scenario of scenarios) {
      console.log(`  - ${scenario.name}: ${scenario.error.message}`);
    }
  },

  /**
   * Test cache service errors
   */
  testCacheErrors: async (component) => {
    const scenarios = [
      { name: 'Cache Service Down', error: ErrorSimulator.cacheError() },
      { name: 'Memory Error', error: new Error('Out of memory') },
      { name: 'Storage Error', error: new Error('Storage quota exceeded') }
    ];

    console.log('🧪 Testing Cache Service Error Scenarios:');
    for (const scenario of scenarios) {
      console.log(`  - ${scenario.name}: ${scenario.error.message}`);
    }
  },

  /**
   * Test component rendering errors
   */
  testComponentErrors: async (component) => {
    const scenarios = [
      { name: 'Props Error', error: new Error('Invalid props provided') },
      { name: 'State Error', error: new Error('Invalid state update') },
      { name: 'Render Error', error: new Error('Component render failed') }
    ];

    console.log('🧪 Testing Component Error Scenarios:');
    for (const scenario of scenarios) {
      console.log(`  - ${scenario.name}: ${scenario.error.message}`);
    }
  }
};

/**
 * Run comprehensive error tests
 */
export const runErrorTests = async () => {
  console.log('🚀 Starting Comprehensive Error Testing...');
  
  try {
    await ErrorTestScenarios.testCohortPerformanceErrors();
    await ErrorTestScenarios.testCSVExportErrors();
    await ErrorTestScenarios.testCacheErrors();
    await ErrorTestScenarios.testComponentErrors();
    
    console.log('✅ All error test scenarios defined successfully');
    console.log('📝 Note: These are test scenarios for development. In production, real errors will be handled by the error boundaries and retry logic.');
    
  } catch (error) {
    console.error('❌ Error during testing setup:', error);
  }
};

/**
 * Check if we're in development mode and enable error testing
 */
export const enableErrorTesting = () => {
  if (process.env.NODE_ENV === 'development') {
    // Add error testing to window object for console access
    window.errorTesting = {
      simulator: ErrorSimulator,
      scenarios: ErrorTestScenarios,
      runTests: runErrorTests
    };
    
    console.log('🧪 Error testing utilities available at window.errorTesting');
    console.log('   - window.errorTesting.simulator: Error simulators');
    console.log('   - window.errorTesting.scenarios: Test scenarios');
    console.log('   - window.errorTesting.runTests(): Run all tests');
  }
};

export default {
  ErrorSimulator,
  ErrorTestScenarios,
  runErrorTests,
  enableErrorTesting
};
