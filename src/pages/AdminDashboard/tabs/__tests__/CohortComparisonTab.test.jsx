import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CohortComparisonTab from '../CohortComparisonTab';

vi.mock('../../../../stores/authStore', () => ({
  default: (selector) => selector({ token: 'test-token' }),
}));

vi.mock('lucide-react', async (importOriginal) => {
  const actual = await importOriginal();
  return { ...actual };
});

const comparisonPayload = {
  success: true,
  active: [
    {
      cohort_id: 'c1',
      name: 'March 2026 L1',
      start_date: '2026-03-01',
      level: 'L1',
      original_enrolled: 20,
      enrolled: 18,
      current_week: 3,
      completed_weeks: 2,
      attendance: { current: 85, previous: 80, change: 5, all_time: 82 },
      task_completion: { current: 70, previous: 65, change: 5, all_time: 68 },
      deliverables: { current: 60, previous: 55, change: 5, all_time: 58 },
    },
  ],
  completed: [],
};

describe('CohortComparisonTab', () => {
  beforeEach(() => {
    global.fetch = vi.fn(async (url, options = {}) => {
      const u = String(url);
      if (u.includes('/cohort-comparison')) {
        return { ok: true, json: async () => comparisonPayload };
      }
      if (u.includes('/surveys/nps/weekly-by-cohort')) {
        expect(options.headers?.Authorization).toBe('Bearer test-token');
        expect(u).toContain('/api/admin/dashboard/surveys/nps/weekly-by-cohort');
        expect(u).not.toMatch(/run\.app|cloud\.run/);
        return { ok: true, json: async () => [] };
      }
      if (u.includes('/cohort-week-detail')) {
        return { ok: true, json: async () => ({ withdrawals: [], absences: null }) };
      }
      if (u.includes('/surveys/responses')) {
        expect(options.headers?.Authorization).toBe('Bearer test-token');
        expect(u).toContain('/api/admin/dashboard/surveys/responses');
        return { ok: true, json: async () => [] };
      }
      if (u.includes('/survey-insights')) {
        return { ok: true, json: async () => ({ concerns: [], strengths: [] }) };
      }
      return { ok: true, json: async () => ({}) };
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('loads cohort row and fetches NPS from main API with auth', async () => {
    render(<CohortComparisonTab programSlug="ai-native-builder" />);

    await waitFor(() => {
      expect(screen.getByText('March 2026 L1')).toBeInTheDocument();
    });

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/admin/dashboard/surveys/nps/weekly-by-cohort'),
      expect.objectContaining({
        headers: expect.objectContaining({ Authorization: 'Bearer test-token' }),
      }),
    );
  });

  it('expands row and requests survey responses from main API', async () => {
    const user = userEvent.setup();
    render(<CohortComparisonTab programSlug="ai-native-builder" />);

    await waitFor(() => expect(screen.getByText('March 2026 L1')).toBeInTheDocument());

    await user.click(screen.getByRole('button', { name: /March 2026 L1/i }));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/admin/dashboard/surveys/responses'),
        expect.objectContaining({
          headers: expect.objectContaining({ Authorization: 'Bearer test-token' }),
        }),
      );
    });
  });
});
