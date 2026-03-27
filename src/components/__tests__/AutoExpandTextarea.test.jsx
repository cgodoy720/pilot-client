import { describe, test, expect, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { createRef } from 'react';
import AutoExpandTextarea from '../AutoExpandTextarea';

// Mock Radix UI Select components
vi.mock('../ui/select', () => ({
  Select: ({ children }) => <div data-testid="select">{children}</div>,
  SelectContent: ({ children }) => <div>{children}</div>,
  SelectItem: ({ children }) => <div>{children}</div>,
  SelectTrigger: ({ children }) => <div>{children}</div>,
  SelectValue: ({ children }) => <div>{children}</div>,
}));

// Mock ArrowButton
vi.mock('../ArrowButton/ArrowButton', () => ({
  default: ({ onClick, disabled }) => (
    <button data-testid="send-button" onClick={onClick} disabled={disabled}>
      Send
    </button>
  ),
}));

describe('AutoExpandTextarea', () => {
  test('renders with placeholder', () => {
    render(<AutoExpandTextarea onSubmit={vi.fn()} />);
    expect(screen.getByPlaceholderText('Reply to coach...')).toBeInTheDocument();
  });

  test('exposes focus() via ref', () => {
    const ref = createRef();
    render(<AutoExpandTextarea ref={ref} onSubmit={vi.fn()} />);
    expect(ref.current).toHaveProperty('focus');
    expect(typeof ref.current.focus).toBe('function');
  });

  test('exposes setValue() via ref', () => {
    const ref = createRef();
    render(<AutoExpandTextarea ref={ref} onSubmit={vi.fn()} />);
    expect(ref.current).toHaveProperty('setValue');
    expect(typeof ref.current.setValue).toBe('function');
  });

  test('setValue() populates the textarea with the given text', () => {
    const ref = createRef();
    render(<AutoExpandTextarea ref={ref} onSubmit={vi.fn()} />);

    act(() => {
      ref.current.setValue('My restored message');
    });

    const textarea = screen.getByPlaceholderText('Reply to coach...');
    expect(textarea.value).toBe('My restored message');
  });

  test('setValue() enables the send button after setting content', () => {
    const ref = createRef();
    render(<AutoExpandTextarea ref={ref} onSubmit={vi.fn()} />);

    // Send button should be disabled when empty
    expect(screen.getByTestId('send-button')).toBeDisabled();

    act(() => {
      ref.current.setValue('Some content');
    });

    // Send button should now be enabled
    expect(screen.getByTestId('send-button')).not.toBeDisabled();
  });

  test('setValue() with empty string disables the send button', () => {
    const ref = createRef();
    render(<AutoExpandTextarea ref={ref} onSubmit={vi.fn()} />);

    act(() => {
      ref.current.setValue('Some content');
    });
    expect(screen.getByTestId('send-button')).not.toBeDisabled();

    act(() => {
      ref.current.setValue('');
    });
    expect(screen.getByTestId('send-button')).toBeDisabled();
  });

  test('setValue() content can be submitted via send button', () => {
    const onSubmit = vi.fn();
    const ref = createRef();
    render(<AutoExpandTextarea ref={ref} onSubmit={onSubmit} />);

    act(() => {
      ref.current.setValue('Restored message');
    });

    fireEvent.click(screen.getByTestId('send-button'));

    expect(onSubmit).toHaveBeenCalledWith('Restored message', expect.any(String));
  });

  test('submitting clears the textarea', () => {
    const ref = createRef();
    render(<AutoExpandTextarea ref={ref} onSubmit={vi.fn()} />);

    act(() => {
      ref.current.setValue('Will be cleared');
    });
    fireEvent.click(screen.getByTestId('send-button'));

    const textarea = screen.getByPlaceholderText('Reply to coach...');
    expect(textarea.value).toBe('');
  });

  test('Enter key submits the message', () => {
    const onSubmit = vi.fn();
    render(<AutoExpandTextarea onSubmit={onSubmit} />);

    const textarea = screen.getByPlaceholderText('Reply to coach...');
    // Set value directly on the DOM element (uncontrolled component)
    textarea.value = 'Enter key test';
    fireEvent.keyPress(textarea, { key: 'Enter', charCode: 13 });

    expect(onSubmit).toHaveBeenCalledWith('Enter key test', expect.any(String));
  });

  test('disabled textarea prevents send button click', () => {
    const onSubmit = vi.fn();
    const ref = createRef();
    render(<AutoExpandTextarea ref={ref} onSubmit={onSubmit} disabled={true} />);

    act(() => {
      ref.current.setValue('Cannot send');
    });

    expect(screen.getByTestId('send-button')).toBeDisabled();
  });
});
