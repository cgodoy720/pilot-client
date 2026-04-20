import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';

vi.mock('../../../../stores/authStore', () => ({
  default: (selector) => selector({ token: 'test-token' }),
}));

vi.mock('lucide-react', async (importOriginal) => {
  const actual = await importOriginal();
  return { ...actual };
});

vi.mock('../AttendanceStatusDrawer', () => ({
  default: () => null,
}));

const mockGetStatus = vi.fn();
vi.mock('../../../../services/cachedAdminApi', () => ({
  cachedAdminApi: {
    getCachedDayBuilderStatus: (...args) => mockGetStatus(...args),
    invalidateAllAttendanceCaches: vi.fn(),
  },
}));

import AttendanceSection from '../AttendanceSection';

const holidayData = {
  data: {
    noClass: true,
    dayType: 'Holiday',
    builders: [],
    summary: { total: 0, present: 0, late: 0, absent: 0, excused: 0, pending: 0, noClass: 0, attendanceRate: null },
  },
};

const noEntryData = {
  data: {
    noClass: true,
    dayType: null,
    builders: [],
    summary: { total: 0, present: 0, late: 0, absent: 0, excused: 0, pending: 0, noClass: 0, attendanceRate: null },
  },
};

const weekendClassData = {
  data: {
    noClass: false,
    dayType: 'Weekend',
    builders: [
      { userId: 1, firstName: 'Alice', lastName: 'A', status: 'present' },
      { userId: 2, firstName: 'Bob', lastName: 'B', status: 'late' },
      { userId: 3, firstName: 'Carol', lastName: 'C', status: 'absent' },
    ],
    summary: { total: 3, present: 1, late: 1, absent: 1, excused: 0, pending: 0, noClass: 0, attendanceRate: 67 },
  },
};

describe('AttendanceSection — Holiday exclusion', () => {
  beforeEach(() => {
    mockGetStatus.mockReset();
  });

  it('renders "No Class — Holiday" banner for Holiday day', async () => {
    mockGetStatus.mockResolvedValue(holidayData);

    render(
      <AttendanceSection
        selectedDate="2026-04-05"
        cohortName="March 2026 L1"
        selectedCohortId="c1"
      />
    );

    await waitFor(() => {
      expect(screen.getByText(/No Class — Holiday/)).toBeInTheDocument();
    });
    expect(screen.getByText(/Attendance is not tracked for this day/)).toBeInTheDocument();
  });

  it('renders "No Class" without day type when curriculum entry is missing', async () => {
    mockGetStatus.mockResolvedValue(noEntryData);

    render(
      <AttendanceSection
        selectedDate="2026-12-25"
        cohortName="March 2026 L1"
        selectedCohortId="c1"
      />
    );

    await waitFor(() => {
      expect(screen.getByText('No Class')).toBeInTheDocument();
    });
    expect(screen.queryByText(/Weekend/)).not.toBeInTheDocument();
  });

  it('renders normal attendance cards for a Weekend class day', async () => {
    mockGetStatus.mockResolvedValue(weekendClassData);

    render(
      <AttendanceSection
        selectedDate="2026-04-19"
        cohortName="March 2026 L1"
        selectedCohortId="c1"
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Checked In')).toBeInTheDocument();
    });
    expect(screen.getByText('On Time')).toBeInTheDocument();
    expect(screen.getByText('Late')).toBeInTheDocument();
    expect(screen.getByText('Absent')).toBeInTheDocument();
    expect(screen.queryByText(/No Class/)).not.toBeInTheDocument();
  });

  it('never shows "Weekend" in the no-class banner text', async () => {
    mockGetStatus.mockResolvedValue(holidayData);

    const { container } = render(
      <AttendanceSection
        selectedDate="2026-04-05"
        cohortName="March 2026 L1"
        selectedCohortId="c1"
      />
    );

    await waitFor(() => {
      expect(screen.getByText(/No Class/)).toBeInTheDocument();
    });
    expect(container.textContent).not.toContain('Weekend');
  });
});
