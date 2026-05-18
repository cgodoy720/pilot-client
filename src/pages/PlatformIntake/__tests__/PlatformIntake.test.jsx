import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import PlatformIntake from '../PlatformIntake';
import useAuthStore from '../../../stores/authStore';

vi.mock('../../../services/platformIntakeService', () => ({
  submitIntake: vi.fn(),
}));

vi.mock('../../../components/Layout/Layout', () => ({
  default: ({ children }) => <div data-testid="layout">{children}</div>,
}));

const { submitIntake } = await import('../../../services/platformIntakeService');

const renderComponent = () =>
  render(
    <BrowserRouter>
      <PlatformIntake />
    </BrowserRouter>
  );

describe('PlatformIntake', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuthStore.setState({
      user: { first_name: 'Test', last_name: 'User', email: 'test@pursuit.org' },
      token: 'test-token',
      isAuthenticated: true,
    });
  });

  afterEach(() => {
    useAuthStore.setState(useAuthStore.getInitialState());
  });

  it('renders the form with all required fields', () => {
    renderComponent();

    expect(screen.getByText('Platform Intake')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Your full name')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('you@example.com')).toBeInTheDocument();
    expect(screen.getByText('Title')).toBeInTheDocument();
    expect(screen.getByText('Description')).toBeInTheDocument();
    expect(screen.getByText('Platform component')).toBeInTheDocument();
    expect(screen.getByText('Recommended prioritization')).toBeInTheDocument();
    expect(screen.getByText('Prioritization justification')).toBeInTheDocument();
  });

  it('pre-fills reporter name and email from auth store', () => {
    renderComponent();

    expect(screen.getByPlaceholderText('Your full name')).toHaveValue('Test User');
    expect(screen.getByPlaceholderText('you@example.com')).toHaveValue('test@pursuit.org');
  });

  it('toggles between bug and feature type', () => {
    renderComponent();

    const bugBtn = screen.getByRole('button', { name: 'Bug' });
    const featureBtn = screen.getByRole('button', { name: 'Feature' });

    // Bug is default — file upload should be visible
    expect(screen.getByText(/Upload screenshot or video/)).toBeInTheDocument();

    // Switch to feature — file upload should disappear
    fireEvent.click(featureBtn);
    expect(screen.queryByText(/Upload screenshot or video/)).not.toBeInTheDocument();

    // Switch back to bug
    fireEvent.click(bugBtn);
    expect(screen.getByText(/Upload screenshot or video/)).toBeInTheDocument();
  });

  it('shows error when bug report submitted without file', async () => {
    renderComponent();

    // Fill all required fields but don't attach a file
    fireEvent.change(screen.getByPlaceholderText(/One-line summary/), { target: { value: 'Bug title' } });
    fireEvent.change(screen.getByPlaceholderText(/What is the expected/), { target: { value: 'Description' } });
    const selects = screen.getAllByRole('combobox');
    fireEvent.change(selects[0], { target: { value: 'Dashboard' } });
    fireEvent.change(selects[1], { target: { value: 'high' } });
    fireEvent.change(screen.getByPlaceholderText(/Why did you select/), { target: { value: 'Reason' } });

    fireEvent.submit(screen.getByRole('button', { name: /Submit bug report/i }).closest('form'));

    await waitFor(() => {
      expect(screen.getByText(/screenshot or video is required/i)).toBeInTheDocument();
    });
  });

  it('shows success screen after successful submission', async () => {
    submitIntake.mockResolvedValue({ id: '123' });
    renderComponent();

    // Switch to feature (no file required)
    fireEvent.click(screen.getByRole('button', { name: 'Feature' }));

    // Fill required fields
    fireEvent.change(screen.getByPlaceholderText(/One-line summary/), { target: { value: 'Add dark mode' } });
    fireEvent.change(screen.getByPlaceholderText(/What does the feature/), { target: { value: 'A dark mode toggle' } });

    const selects = screen.getAllByRole('combobox');
    // First select is platform_component, second is recommended_prioritization
    fireEvent.change(selects[0], { target: { value: 'Dashboard' } });
    fireEvent.change(selects[1], { target: { value: 'low' } });

    fireEvent.change(screen.getByPlaceholderText(/Why did you select/), { target: { value: 'Nice to have' } });

    fireEvent.click(screen.getByRole('button', { name: /Submit feature request/i }));

    await waitFor(() => {
      expect(screen.getByText('Request submitted!')).toBeInTheDocument();
    });
  });

  it('resets form when "Submit another" is clicked', async () => {
    submitIntake.mockResolvedValue({ id: '123' });
    renderComponent();

    // Switch to feature and submit
    fireEvent.click(screen.getByRole('button', { name: 'Feature' }));
    fireEvent.change(screen.getByPlaceholderText(/One-line summary/), { target: { value: 'Test' } });
    fireEvent.change(screen.getByPlaceholderText(/What does the feature/), { target: { value: 'Desc' } });
    const selects = screen.getAllByRole('combobox');
    fireEvent.change(selects[0], { target: { value: 'Dashboard' } });
    fireEvent.change(selects[1], { target: { value: 'low' } });
    fireEvent.change(screen.getByPlaceholderText(/Why did you select/), { target: { value: 'Reason' } });
    fireEvent.click(screen.getByRole('button', { name: /Submit feature request/i }));

    await waitFor(() => {
      expect(screen.getByText('Request submitted!')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Submit another'));

    await waitFor(() => {
      expect(screen.getByText('Platform Intake')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Your full name')).toHaveValue('Test User');
    });
  });

  it('shows error message on submission failure', async () => {
    submitIntake.mockRejectedValue(new Error('Server error'));
    renderComponent();

    fireEvent.click(screen.getByRole('button', { name: 'Feature' }));
    fireEvent.change(screen.getByPlaceholderText(/One-line summary/), { target: { value: 'Test' } });
    fireEvent.change(screen.getByPlaceholderText(/What does the feature/), { target: { value: 'Desc' } });
    const selects = screen.getAllByRole('combobox');
    fireEvent.change(selects[0], { target: { value: 'Dashboard' } });
    fireEvent.change(selects[1], { target: { value: 'low' } });
    fireEvent.change(screen.getByPlaceholderText(/Why did you select/), { target: { value: 'Reason' } });
    fireEvent.click(screen.getByRole('button', { name: /Submit feature request/i }));

    await waitFor(() => {
      expect(screen.getByText('Server error')).toBeInTheDocument();
    });
  });
});
