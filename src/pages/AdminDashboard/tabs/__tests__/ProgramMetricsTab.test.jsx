import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import ProgramMetricsTab from '../ProgramMetricsTab';

vi.mock('../../../../stores/authStore', () => ({
  default: (selector) => selector({ token: 'test-token' }),
}));

vi.mock('lucide-react', async (importOriginal) => {
  const actual = await importOriginal();
  return { ...actual };
});

/** Radix Select → native selects so filter interactions are stable in tests */
vi.mock('../../../../components/ui/select', () => {
  const React = require('react');

  const collectItems = (nodes) => {
    const out = [];
    const walk = (n) => {
      if (!n) return;
      if (Array.isArray(n)) {
        n.forEach(walk);
        return;
      }
      if (!React.isValidElement(n)) return;
      const { value, children } = n.props || {};
      if (value !== undefined && children !== undefined && typeof children !== 'object') {
        out.push({ value, label: children });
      }
      if (n.props?.children) walk(n.props.children);
    };
    walk(nodes);
    return out;
  };

  return {
    Select: ({ value, onValueChange, children }) => {
      const items = collectItems(children);
      const v = value === '__none' || value === undefined || value === '' ? '' : value;
      return (
        <select
          className="mock-filter-select"
          value={v}
          onChange={(e) => onValueChange?.(e.target.value)}
        >
          {items.map((o) => (
            <option key={String(o.value)} value={o.value === '__none' ? '' : o.value}>
              {o.label}
            </option>
          ))}
        </select>
      );
    },
    SelectTrigger: () => null,
    SelectValue: () => null,
    SelectContent: ({ children }) => <>{children}</>,
    SelectItem: () => null,
  };
});

const MOCK_STAGES = [
  { id: 'leads', label: 'Leads', count: 100 },
  { id: 'applicants', label: 'Registered', count: 80 },
  { id: 'submitted', label: 'Applied', count: 60 },
  { id: 'admitted', label: 'Admitted', count: 40 },
  { id: 'enrolled', label: 'Enrolled', count: 30 },
  { id: 'l1_completed', label: 'L1 Completed', count: 20 },
  { id: 'l2_completed', label: 'L2 Completed', count: 10 },
  { id: 'l3_completed', label: 'L3 Completed', count: 5 },
  { id: 'any_employment', label: 'Any Employment', count: 2 },
  { id: 'ft_employed', label: 'FT Employed', count: 1 },
  { id: 'bond_eligible', label: 'Bond Eligible', count: 0 },
];

function setupFetchMock() {
  global.fetch = vi.fn(async (url) => {
    const u = String(url);
    if (u.includes('/api/permissions/cohorts')) {
      return { ok: true, json: async () => ({ success: true, data: [] }) };
    }
    if (u.includes('/program-cohorts')) {
      return {
        ok: true,
        json: async () => ({
          success: true,
          cohorts: [{ cohort_id: 'l1a', name: 'March 2026', level: 'L1' }],
        }),
      };
    }
    if (u.includes('/referral-filters')) {
      return {
        ok: true,
        json: async () => ({ success: true, channels: ['Email/Mail'], sources: ['Pursuit'] }),
      };
    }
    if (u.includes('/program-funnel')) {
      return {
        ok: true,
        json: async () => ({ success: true, stages: MOCK_STAGES, avgSalary: null }),
      };
    }
    if (u.includes('/stage-detail')) {
      return { ok: true, json: async () => ({ success: true, data: [], total: 0 }) };
    }
    return { ok: true, json: async () => ({ success: false }) };
  });
}

describe('ProgramMetricsTab', () => {
  beforeEach(() => {
    setupFetchMock();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('shows pipeline scope note after funnel loads', async () => {
    render(<ProgramMetricsTab programSlug="ai-native-builder" />);

    await waitFor(() => {
      expect(screen.getByText('Stage Breakdown')).toBeInTheDocument();
    });

    expect(screen.getByText(/Scope:/)).toBeInTheDocument();
    expect(screen.getByText(/organization-wide/)).toBeInTheDocument();
    expect(
      screen.getByText(/Enrolled and all stages to the right count only people enrolled in the selected program/),
    ).toBeInTheDocument();
  });

  it('shows filter warning when a demographic filter is active', async () => {
    const user = userEvent.setup();
    render(<ProgramMetricsTab programSlug="ai-native-builder" />);

    await waitFor(() => expect(screen.getByText('Stage Breakdown')).toBeInTheDocument());

    await user.click(screen.getByRole('button', { name: /Filters/i }));

    const panel = screen.getByText('Starting Cohort').closest('.absolute');
    expect(panel).toBeTruthy();

    const selects = within(panel).getAllByRole('combobox');
    const genderSelect = selects[1];
    await user.selectOptions(genderSelect, 'male');

    expect(
      await screen.findByText(/Active demographic or referral filters narrow applicant-based stages/),
    ).toBeInTheDocument();
  });

  it('does not show demographic filter warning when only starting cohort is selected', async () => {
    const user = userEvent.setup();
    render(<ProgramMetricsTab programSlug="ai-native-builder" />);

    await waitFor(() => expect(screen.getByText('Stage Breakdown')).toBeInTheDocument());

    await user.click(screen.getByRole('button', { name: /Filters/i }));

    const march = screen.getByRole('checkbox', { name: /March 2026/i });
    await user.click(march);

    expect(
      screen.queryByText(/Active demographic or referral filters narrow applicant-based stages/),
    ).not.toBeInTheDocument();
  });
});
