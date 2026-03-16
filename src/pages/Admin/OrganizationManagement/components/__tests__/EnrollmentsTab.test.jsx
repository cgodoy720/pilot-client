import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, within, act } from '@testing-library/react';
import axios from 'axios';
import Swal from 'sweetalert2';

// Mock axios
vi.mock('axios');

// Mock SweetAlert2
vi.mock('sweetalert2', () => ({
  default: {
    fire: vi.fn().mockResolvedValue({ isConfirmed: false }),
  },
}));

// Mock lucide-react
vi.mock('lucide-react', async (importOriginal) => {
  const actual = await importOriginal();
  return { ...actual };
});

// Mock Radix Select with simple testable elements
vi.mock('@/components/ui/select', () => {
  const React = require('react');
  return {
    Select: ({ children, value, onValueChange, disabled }) => {
      const ref = React.useRef(null);
      React.useEffect(() => {
        if (ref.current) {
          ref.current.__onValueChange = onValueChange;
        }
      }, [onValueChange]);
      return (
        <div data-testid="select-root" data-value={value} data-disabled={disabled} ref={ref}>
          {React.Children.map(children, child =>
            React.isValidElement(child) ? React.cloneElement(child, { _value: value, _onValueChange: onValueChange, _disabled: disabled }) : child
          )}
        </div>
      );
    },
    SelectTrigger: ({ children, className, _disabled }) => (
      <button className={className} disabled={_disabled} data-testid="select-trigger">
        {children}
      </button>
    ),
    SelectValue: ({ placeholder }) => <span>{placeholder}</span>,
    SelectContent: ({ children }) => <div data-testid="select-content">{children}</div>,
    SelectItem: ({ children, value, className }) => (
      <option value={value} className={className} data-testid={`select-item-${value}`}>
        {children}
      </option>
    ),
  };
});

// Mock Dialog with simple div rendering
vi.mock('@/components/ui/dialog', () => ({
  Dialog: ({ children, open }) => open ? <div data-testid="dialog">{children}</div> : null,
  DialogContent: ({ children, className }) => <div className={className}>{children}</div>,
  DialogHeader: ({ children }) => <div>{children}</div>,
  DialogTitle: ({ children, className }) => <h2 className={className}>{children}</h2>,
  DialogDescription: ({ children, className }) => <p className={className}>{children}</p>,
  DialogFooter: ({ children }) => <div data-testid="dialog-footer">{children}</div>,
}));

// Import component after mocks
import EnrollmentsTab from '../EnrollmentsTab';

// --- Test Data ---
const mockCohorts = [
  { cohort_id: 1, name: 'Cohort Alpha', organization_id: 10 },
  { cohort_id: 2, name: 'Cohort Beta', organization_id: 10 },
  { cohort_id: 3, name: 'Cohort Gamma', organization_id: 11 },
];

const mockEnrollments = [
  { enrollment_id: 101, user_id: 1, cohort_id: 1, first_name: 'Alice', last_name: 'Builder', user_email: 'alice@example.com', cohort_name: 'Cohort Alpha', organization_name: 'Org A', status: 'in_progress', is_active: true, enrolled_date: '2025-06-01' },
  { enrollment_id: 102, user_id: 2, cohort_id: 1, first_name: 'Bob', last_name: 'Smith', user_email: 'bob@example.com', cohort_name: 'Cohort Alpha', organization_name: 'Org A', status: 'in_progress', is_active: true, enrolled_date: '2025-06-01' },
  { enrollment_id: 103, user_id: 3, cohort_id: 1, first_name: 'Charlie', last_name: 'Jones', user_email: 'charlie@example.com', cohort_name: 'Cohort Alpha', organization_name: 'Org A', status: 'completed', is_active: false, enrolled_date: '2025-01-15' },
  { enrollment_id: 104, user_id: 4, cohort_id: 2, first_name: 'Diana', last_name: 'Lee', user_email: 'diana@example.com', cohort_name: 'Cohort Beta', organization_name: 'Org A', status: 'in_progress', is_active: true, enrolled_date: '2025-07-01' },
  // Alice is also enrolled in Cohort Beta (for duplicate detection)
  { enrollment_id: 105, user_id: 1, cohort_id: 2, first_name: 'Alice', last_name: 'Builder', user_email: 'alice@example.com', cohort_name: 'Cohort Beta', organization_name: 'Org A', status: 'in_progress', is_active: true, enrolled_date: '2025-07-01' },
];

const mockUsers = [
  { user_id: 1, first_name: 'Alice', last_name: 'Builder', email: 'alice@example.com' },
  { user_id: 2, first_name: 'Bob', last_name: 'Smith', email: 'bob@example.com' },
  { user_id: 3, first_name: 'Charlie', last_name: 'Jones', email: 'charlie@example.com' },
  { user_id: 4, first_name: 'Diana', last_name: 'Lee', email: 'diana@example.com' },
];

const mockToken = 'test-token-123';
const mockSetLoading = vi.fn();

function setupAxiosMocks(overrides = {}) {
  const enrollments = overrides.enrollments ?? mockEnrollments;
  const cohorts = overrides.cohorts ?? mockCohorts;
  const users = overrides.users ?? mockUsers;

  axios.get.mockImplementation((url) => {
    if (url.includes('/enrollments')) {
      return Promise.resolve({ data: { enrollments } });
    }
    if (url.includes('/cohorts')) {
      return Promise.resolve({ data: { cohorts } });
    }
    if (url.includes('/users')) {
      return Promise.resolve({ data: { users } });
    }
    return Promise.resolve({ data: {} });
  });
}

function renderEnrollmentsTab(props = {}) {
  return render(
    <EnrollmentsTab
      token={mockToken}
      setLoading={mockSetLoading}
      {...props}
    />
  );
}

// Helper: get the bulk dialog element
function getBulkDialog() {
  // The bulk dialog is the one with "Bulk Add Enrollments" title
  const dialogs = screen.getAllByTestId('dialog');
  return dialogs.find(d => d.textContent.includes('Bulk Add Enrollments'));
}

// Helper to open the bulk dialog
async function openBulkDialog() {
  const bulkBtn = screen.getByRole('button', { name: /bulk add enrollments/i });
  fireEvent.click(bulkBtn);
  await waitFor(() => {
    expect(screen.getByText(/step 1/i)).toBeInTheDocument();
  });
}

// Helper to simulate selecting a value on a mocked Select
function triggerSelect(selectRoot, value) {
  const onValueChange = selectRoot.__onValueChange;
  if (onValueChange) {
    act(() => { onValueChange(value); });
  }
}

describe('EnrollmentsTab — Bulk Add Enrollments', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setupAxiosMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Bulk Add button', () => {
    it('renders the Bulk Add Enrollments button', async () => {
      renderEnrollmentsTab();
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /bulk add enrollments/i })).toBeInTheDocument();
      });
    });

    it('opens the bulk dialog when clicked', async () => {
      renderEnrollmentsTab();
      await waitFor(() => expect(axios.get).toHaveBeenCalled());
      await openBulkDialog();
      expect(screen.getByText(/step 1/i)).toBeInTheDocument();
    });
  });

  describe('Step 1 — Select Source Cohort & Builders', () => {
    it('shows source cohort selection on step 1', async () => {
      renderEnrollmentsTab();
      await waitFor(() => expect(axios.get).toHaveBeenCalled());
      await openBulkDialog();
      const dialog = getBulkDialog();
      expect(within(dialog).getByText(/select source cohort/i)).toBeInTheDocument();
    });

    it('shows only active builders from the selected source cohort', async () => {
      renderEnrollmentsTab();
      await waitFor(() => expect(axios.get).toHaveBeenCalled());
      await openBulkDialog();

      const dialog = getBulkDialog();
      const selectRoots = dialog.querySelectorAll('[data-testid="select-root"]');
      triggerSelect(selectRoots[0], '1');

      await waitFor(() => {
        expect(within(dialog).getByText(/0 of 2 selected/i)).toBeInTheDocument();
      });

      // Charlie has is_active: false, should NOT appear
      const tableBody = dialog.querySelector('tbody');
      const rowTexts = tableBody.textContent;
      expect(rowTexts).not.toContain('Charlie');
      expect(rowTexts).toContain('Alice');
      expect(rowTexts).toContain('Bob');
    });

    it('allows selecting individual builders via checkbox', async () => {
      renderEnrollmentsTab();
      await waitFor(() => expect(axios.get).toHaveBeenCalled());
      await openBulkDialog();

      const dialog = getBulkDialog();
      const selectRoots = dialog.querySelectorAll('[data-testid="select-root"]');
      triggerSelect(selectRoots[0], '1');

      await waitFor(() => {
        expect(within(dialog).getByText(/0 of 2 selected/i)).toBeInTheDocument();
      });

      // First checkbox inside dialog table is "Select All", second is first builder
      const checkboxes = within(dialog).getAllByRole('checkbox');
      fireEvent.click(checkboxes[1]);

      await waitFor(() => {
        expect(within(dialog).getByText(/1 of 2 selected/i)).toBeInTheDocument();
      });
    });

    it('select all toggles all visible builders', async () => {
      renderEnrollmentsTab();
      await waitFor(() => expect(axios.get).toHaveBeenCalled());
      await openBulkDialog();

      const dialog = getBulkDialog();
      const selectRoots = dialog.querySelectorAll('[data-testid="select-root"]');
      triggerSelect(selectRoots[0], '1');

      await waitFor(() => {
        expect(within(dialog).getByText(/0 of 2 selected/i)).toBeInTheDocument();
      });

      const checkboxes = within(dialog).getAllByRole('checkbox');
      // Select All
      fireEvent.click(checkboxes[0]);
      await waitFor(() => {
        expect(within(dialog).getByText(/2 of 2 selected/i)).toBeInTheDocument();
      });

      // Deselect All
      fireEvent.click(checkboxes[0]);
      await waitFor(() => {
        expect(within(dialog).getByText(/0 of 2 selected/i)).toBeInTheDocument();
      });
    });

    it('search filters builders by name', async () => {
      renderEnrollmentsTab();
      await waitFor(() => expect(axios.get).toHaveBeenCalled());
      await openBulkDialog();

      const dialog = getBulkDialog();
      const selectRoots = dialog.querySelectorAll('[data-testid="select-root"]');
      triggerSelect(selectRoots[0], '1');

      await waitFor(() => {
        expect(within(dialog).getByText(/0 of 2 selected/i)).toBeInTheDocument();
      });

      const searchInput = within(dialog).getByPlaceholderText(/search builders/i);
      fireEvent.change(searchInput, { target: { value: 'alice' } });

      await waitFor(() => {
        const dataRows = dialog.querySelectorAll('tbody tr');
        expect(dataRows.length).toBe(1);
        expect(dataRows[0].textContent).toContain('Alice');
      });
    });

    it('Next button is disabled when no builders are selected', async () => {
      renderEnrollmentsTab();
      await waitFor(() => expect(axios.get).toHaveBeenCalled());
      await openBulkDialog();

      const dialog = getBulkDialog();
      const nextBtn = within(dialog).getByRole('button', { name: /next/i });
      expect(nextBtn).toBeDisabled();
    });

    it('Next button is enabled when builders are selected', async () => {
      renderEnrollmentsTab();
      await waitFor(() => expect(axios.get).toHaveBeenCalled());
      await openBulkDialog();

      const dialog = getBulkDialog();
      const selectRoots = dialog.querySelectorAll('[data-testid="select-root"]');
      triggerSelect(selectRoots[0], '1');

      await waitFor(() => {
        expect(within(dialog).getByText(/0 of 2 selected/i)).toBeInTheDocument();
      });

      const checkboxes = within(dialog).getAllByRole('checkbox');
      fireEvent.click(checkboxes[0]);

      await waitFor(() => {
        const nextBtn = within(dialog).getByRole('button', { name: /next/i });
        expect(nextBtn).not.toBeDisabled();
      });
    });
  });

  describe('Step 2 — Select Destination & Confirm', () => {
    async function goToStep2() {
      renderEnrollmentsTab();
      await waitFor(() => expect(axios.get).toHaveBeenCalled());
      await openBulkDialog();

      let dialog = getBulkDialog();
      const selectRoots = dialog.querySelectorAll('[data-testid="select-root"]');
      triggerSelect(selectRoots[0], '1');

      await waitFor(() => {
        expect(within(dialog).getByText(/0 of 2 selected/i)).toBeInTheDocument();
      });

      const checkboxes = within(dialog).getAllByRole('checkbox');
      fireEvent.click(checkboxes[0]); // Select All

      await waitFor(() => {
        expect(within(dialog).getByText(/2 of 2 selected/i)).toBeInTheDocument();
      });

      fireEvent.click(within(dialog).getByRole('button', { name: /next/i }));

      await waitFor(() => {
        expect(screen.getByText(/step 2/i)).toBeInTheDocument();
      });
    }

    it('navigates to step 2 when Next is clicked', async () => {
      await goToStep2();
      const dialog = getBulkDialog();
      expect(within(dialog).getByText(/select destination cohort/i)).toBeInTheDocument();
    });

    it('excludes the source cohort from the destination list', async () => {
      await goToStep2();
      const dialog = getBulkDialog();
      // Source is Cohort Alpha (id=1)
      expect(dialog.querySelector('[data-testid="select-item-1"]')).toBeNull();
      expect(dialog.querySelector('[data-testid="select-item-2"]')).toBeInTheDocument();
      expect(dialog.querySelector('[data-testid="select-item-3"]')).toBeInTheDocument();
    });

    it('shows enrollment form fields (date, status, active, notes)', async () => {
      await goToStep2();
      const dialog = getBulkDialog();
      const dialogScope = within(dialog);
      expect(dialogScope.getByText('Enrolled Date')).toBeInTheDocument();
      expect(dialogScope.getByLabelText(/active enrollment/i)).toBeInTheDocument();
      expect(dialogScope.getByPlaceholderText(/additional notes/i)).toBeInTheDocument();
    });

    it('shows summary when destination cohort is selected', async () => {
      await goToStep2();
      const dialog = getBulkDialog();
      const selectRoots = dialog.querySelectorAll('[data-testid="select-root"]');
      triggerSelect(selectRoots[0], '2');

      await waitFor(() => {
        expect(within(dialog).getByText(/enrolling 2 builders into/i)).toBeInTheDocument();
      });
    });

    it('warns about already-enrolled builders in destination', async () => {
      await goToStep2();
      const dialog = getBulkDialog();
      const selectRoots = dialog.querySelectorAll('[data-testid="select-root"]');
      triggerSelect(selectRoots[0], '2');

      await waitFor(() => {
        expect(within(dialog).getByText(/1 builder\(s\) are already enrolled/i)).toBeInTheDocument();
      });
    });

    it('Back button returns to step 1', async () => {
      await goToStep2();
      const dialog = getBulkDialog();
      fireEvent.click(within(dialog).getByRole('button', { name: /back/i }));

      await waitFor(() => {
        expect(screen.getByText(/step 1/i)).toBeInTheDocument();
      });
    });

    it('submit button is disabled without destination cohort', async () => {
      await goToStep2();
      const dialog = getBulkDialog();
      const submitBtn = within(dialog).getByRole('button', { name: /create 2 enrollment/i });
      expect(submitBtn).toBeDisabled();
    });
  });

  describe('Bulk submit', () => {
    async function navigateToStep2AndSelectDest(destCohortId = '3') {
      renderEnrollmentsTab();
      await waitFor(() => expect(axios.get).toHaveBeenCalled());
      await openBulkDialog();

      let dialog = getBulkDialog();
      let selectRoots = dialog.querySelectorAll('[data-testid="select-root"]');
      triggerSelect(selectRoots[0], '1');

      await waitFor(() => {
        expect(within(dialog).getByText(/0 of 2 selected/i)).toBeInTheDocument();
      });

      const checkboxes = within(dialog).getAllByRole('checkbox');
      fireEvent.click(checkboxes[0]); // Select All

      await waitFor(() => {
        expect(within(dialog).getByText(/2 of 2 selected/i)).toBeInTheDocument();
      });

      fireEvent.click(within(dialog).getByRole('button', { name: /next/i }));

      await waitFor(() => {
        expect(screen.getByText(/step 2/i)).toBeInTheDocument();
      });

      dialog = getBulkDialog();
      selectRoots = dialog.querySelectorAll('[data-testid="select-root"]');
      triggerSelect(selectRoots[0], destCohortId);

      await waitFor(() => {
        expect(within(dialog).getByText(/enrolling 2 builders into/i)).toBeInTheDocument();
      });

      return dialog;
    }

    it('calls bulk-create API with correct payload on submit', async () => {
      axios.post.mockResolvedValueOnce({ data: { created: 2 } });

      const dialog = await navigateToStep2AndSelectDest('3');

      const submitBtn = within(dialog).getByRole('button', { name: /create 2 enrollment/i });
      fireEvent.click(submitBtn);

      await waitFor(() => {
        expect(axios.post).toHaveBeenCalledWith(
          expect.stringContaining('/enrollments/bulk-create'),
          expect.objectContaining({
            user_ids: expect.arrayContaining([1, 2]),
            cohort_id: '3',
            status: 'in_progress',
            is_active: false,
          }),
          expect.objectContaining({
            headers: { Authorization: `Bearer ${mockToken}` },
          })
        );
      });

      expect(Swal.fire).toHaveBeenCalledWith('Success', '2 enrollment(s) created successfully', 'success');
    });

    it('shows error from API on failure', async () => {
      axios.post.mockRejectedValueOnce({
        response: { data: { error: 'Duplicate enrollment detected' } },
      });

      const dialog = await navigateToStep2AndSelectDest('3');

      fireEvent.click(within(dialog).getByRole('button', { name: /create 2 enrollment/i }));

      await waitFor(() => {
        expect(Swal.fire).toHaveBeenCalledWith('Error', 'Duplicate enrollment detected', 'error');
      });
    });

    it('refreshes enrollments after successful submit', async () => {
      axios.post.mockResolvedValueOnce({ data: { created: 2 } });

      const dialog = await navigateToStep2AndSelectDest('3');

      const getCallsBefore = axios.get.mock.calls.length;

      fireEvent.click(within(dialog).getByRole('button', { name: /create 2 enrollment/i }));

      await waitFor(() => {
        // Should have re-fetched enrollments
        expect(axios.get.mock.calls.length).toBeGreaterThan(getCallsBefore);
      });
    });
  });

  describe('Active-only filter', () => {
    it('does not show inactive enrollments in source builder list', async () => {
      renderEnrollmentsTab();
      await waitFor(() => expect(axios.get).toHaveBeenCalled());
      await openBulkDialog();

      const dialog = getBulkDialog();
      const selectRoots = dialog.querySelectorAll('[data-testid="select-root"]');
      triggerSelect(selectRoots[0], '1');

      await waitFor(() => {
        expect(within(dialog).getByText(/0 of 2 selected/i)).toBeInTheDocument();
      });

      const tableBody = dialog.querySelector('tbody');
      const rowText = tableBody.textContent;
      expect(rowText).not.toContain('Charlie');
      expect(rowText).toContain('Alice');
      expect(rowText).toContain('Bob');
    });
  });
});
