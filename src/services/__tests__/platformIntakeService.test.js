import { describe, it, expect, beforeEach, vi } from 'vitest';
import { submitIntake, fetchAllSubmissions } from '../platformIntakeService';

const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('platformIntakeService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('submitIntake', () => {
    it('sends POST with FormData and auth header', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ id: '123', title: 'Bug report' }),
      });

      const formData = new FormData();
      formData.append('title', 'Bug report');
      const result = await submitIntake(formData, 'test-token');

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/platform-intake'),
        expect.objectContaining({
          method: 'POST',
          headers: { Authorization: 'Bearer test-token' },
          body: formData,
        })
      );
      expect(result.id).toBe('123');
    });

    it('throws on error response with server message', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        json: () => Promise.resolve({ error: 'Missing required fields: title' }),
      });

      await expect(submitIntake(new FormData(), 'token'))
        .rejects.toThrow('Missing required fields: title');
    });

    it('throws generic message when error response has no body', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        json: () => Promise.reject(new Error('no json')),
      });

      await expect(submitIntake(new FormData(), 'token'))
        .rejects.toThrow('Failed to submit request');
    });
  });

  describe('fetchAllSubmissions', () => {
    it('sends GET with auth header', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve([{ id: '1' }, { id: '2' }]),
      });

      const result = await fetchAllSubmissions('test-token');

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/platform-intake'),
        expect.objectContaining({
          headers: { Authorization: 'Bearer test-token' },
        })
      );
      expect(result).toHaveLength(2);
    });

    it('throws on error response', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        json: () => Promise.resolve({ error: 'Access denied' }),
      });

      await expect(fetchAllSubmissions('token'))
        .rejects.toThrow('Access denied');
    });
  });
});
