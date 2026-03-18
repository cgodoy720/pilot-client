/**
 * Tests for apiService — focused on the custom logic, not boilerplate wrappers.
 *
 * What we test:
 *   1. paramsSerializer in getOpportunities (array handling, null filtering)
 *   2. updateOpportunity payload shape (adds reason, wraps correctly)
 *   3. bulkUpdateOpportunities payload shape
 *   4. URL encoding for account-name-based endpoints
 *
 * What we intentionally skip:
 *   Thin one-liner methods that are just `api.get('/path')` —
 *   those are axios's responsibility, not ours.
 */

import axios from 'axios';
import { apiService } from './api';

// Mock axios.create to return a mock instance with interceptors
jest.mock('axios', () => {
  const mockInstance = {
    get: jest.fn().mockResolvedValue({ data: {} }),
    post: jest.fn().mockResolvedValue({ data: {} }),
    put: jest.fn().mockResolvedValue({ data: {} }),
    delete: jest.fn().mockResolvedValue({ data: {} }),
    interceptors: {
      request: { use: jest.fn() },
      response: { use: jest.fn() },
    },
  };
  return {
    __esModule: true,
    default: {
      create: jest.fn(() => mockInstance),
    },
  };
});

// Get the mock instance that apiService uses
const mockAxiosInstance = (axios.create as jest.Mock).mock.results[0]?.value;

beforeEach(() => {
  jest.clearAllMocks();
});

// ---------------------------------------------------------------------------
// getOpportunities — paramsSerializer
// ---------------------------------------------------------------------------
describe('apiService.getOpportunities', () => {
  it('passes params to axios.get with a custom paramsSerializer', async () => {
    await apiService.getOpportunities({ stage: 'Qualifying', limit: 10 });

    expect(mockAxiosInstance.get).toHaveBeenCalledWith(
      '/api/salesforce/opportunities',
      expect.objectContaining({
        params: { stage: 'Qualifying', limit: 10 },
        paramsSerializer: expect.any(Function),
      }),
    );
  });

  it('paramsSerializer serializes array values as repeated keys', async () => {
    await apiService.getOpportunities({
      stages: ['Qualifying', 'Lead Gen'] as unknown as readonly string[],
    });

    const call = mockAxiosInstance.get.mock.calls[0];
    const serializer = call[1].paramsSerializer;
    const result = serializer({ stages: ['Qualifying', 'Lead Gen'] });

    expect(result).toBe('stages=Qualifying&stages=Lead+Gen');
  });

  it('paramsSerializer omits null and undefined values', async () => {
    await apiService.getOpportunities({ stage: undefined, limit: 5 });

    const call = mockAxiosInstance.get.mock.calls[0];
    const serializer = call[1].paramsSerializer;
    const result = serializer({ stage: undefined, limit: 5, active_only: null });

    expect(result).toBe('limit=5');
  });
});

// ---------------------------------------------------------------------------
// updateOpportunity — payload construction
// ---------------------------------------------------------------------------
describe('apiService.updateOpportunity', () => {
  it('wraps updates with opportunity_id and reason', async () => {
    await apiService.updateOpportunity('OPP123', { Amount: 50000 });

    expect(mockAxiosInstance.put).toHaveBeenCalledWith(
      '/api/salesforce/opportunities/OPP123',
      {
        opportunity_id: 'OPP123',
        updates: { Amount: 50000 },
        reason: 'Updated via Revenue Hub',
      },
    );
  });
});

// ---------------------------------------------------------------------------
// bulkUpdateOpportunities — payload construction
// ---------------------------------------------------------------------------
describe('apiService.bulkUpdateOpportunities', () => {
  it('sends opportunity_ids and updates in the request body', async () => {
    await apiService.bulkUpdateOpportunities(
      ['OPP1', 'OPP2'],
      { StageName: 'Qualifying' },
    );

    expect(mockAxiosInstance.put).toHaveBeenCalledWith(
      '/api/salesforce/opportunities/bulk-update',
      {
        opportunity_ids: ['OPP1', 'OPP2'],
        updates: { StageName: 'Qualifying' },
      },
    );
  });
});

// ---------------------------------------------------------------------------
// URL encoding for account-name endpoints
// ---------------------------------------------------------------------------
describe('account-name URL encoding', () => {
  it('encodes account names with special characters in Slack endpoint', async () => {
    await apiService.getAccountSlackActivity('Acme & Co');

    expect(mockAxiosInstance.get).toHaveBeenCalledWith(
      '/api/slack/account-activity/Acme%20%26%20Co',
      expect.objectContaining({ params: { limit: 50 } }),
    );
  });

  it('encodes account names in Fireflies endpoint', async () => {
    await apiService.getAccountFirefliesMeetings('Test/Org', 10);

    expect(mockAxiosInstance.get).toHaveBeenCalledWith(
      '/api/fireflies/account-meetings/Test%2FOrg',
      expect.objectContaining({ params: { limit: 10 } }),
    );
  });
});

// ---------------------------------------------------------------------------
// triggerSync — query param construction
// ---------------------------------------------------------------------------
describe('apiService.triggerSync', () => {
  it('defaults to "all" sync type', async () => {
    await apiService.triggerSync();
    expect(mockAxiosInstance.post).toHaveBeenCalledWith('/api/sync/trigger?sync_type=all');
  });

  it('accepts a specific sync type', async () => {
    await apiService.triggerSync('salesforce');
    expect(mockAxiosInstance.post).toHaveBeenCalledWith('/api/sync/trigger?sync_type=salesforce');
  });
});
