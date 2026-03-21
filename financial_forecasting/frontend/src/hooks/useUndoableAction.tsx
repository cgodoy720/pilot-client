import { useCallback, useRef } from 'react';
import toast from 'react-hot-toast';

interface UseUndoableActionOptions<T> {
  /** The action to execute immediately */
  action: (args: T) => Promise<void>;
  /** The action to revert (called when user clicks Undo) */
  undoAction: (args: T) => Promise<void>;
  /** Format the toast message from the action args */
  formatMessage: (args: T) => string;
  /** Undo window in ms. Default: 5000 */
  undoWindowMs?: number;
}

/**
 * Gmail-style undoable action hook.
 *
 * Fires the action immediately, then shows a toast with an Undo button.
 * If the user clicks Undo within the window, the undoAction is called.
 * If the window expires, the toast dismisses and the action sticks.
 */
export function useUndoableAction<T>({
  action,
  undoAction,
  formatMessage,
  undoWindowMs = 5000,
}: UseUndoableActionOptions<T>) {
  const toastIdRef = useRef<string | null>(null);

  const execute = useCallback(
    async (args: T) => {
      // Fire the action immediately
      try {
        await action(args);
      } catch (err: any) {
        toast.error(`Failed: ${err.message || 'Unknown error'}`);
        return;
      }

      // Dismiss any existing undo toast
      if (toastIdRef.current) {
        toast.dismiss(toastIdRef.current);
      }

      const message = formatMessage(args);

      // Show undo toast
      toastIdRef.current = toast(
        (t) => {
          const handleUndo = async () => {
            toast.dismiss(t.id);
            try {
              await undoAction(args);
              toast.success('Reverted');
            } catch (err: any) {
              toast.error(`Failed to undo: ${err.message || 'Unknown error'}`);
            }
          };

          return (
            <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span>{message}</span>
              <button
                onClick={handleUndo}
                style={{
                  background: 'none',
                  border: '1px solid #1976d2',
                  borderRadius: 4,
                  color: '#1976d2',
                  cursor: 'pointer',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  padding: '2px 8px',
                  whiteSpace: 'nowrap',
                }}
              >
                Undo
              </button>
            </span>
          );
        },
        { duration: undoWindowMs, position: 'bottom-center' }
      );
    },
    [action, undoAction, formatMessage, undoWindowMs]
  );

  return { execute };
}
