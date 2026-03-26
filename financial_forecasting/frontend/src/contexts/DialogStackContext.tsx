/**
 * Stackable edit-dialog manager for the Pipeline page.
 *
 * Allows users to open a related entity's edit dialog from inside another
 * dialog (e.g., Opportunity → Account → Contact). Max depth capped at 3
 * to prevent runaway stacking.
 *
 * Usage:
 *   <DialogStackProvider>
 *     <YourPage />
 *     <DialogStackRenderer />
 *   </DialogStackProvider>
 *
 *   // Inside any child component:
 *   const { pushDialog } = useDialogStack();
 *   pushDialog({ type: 'account', id: '001...' });
 */
import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { useQueryClient } from 'react-query';
import toast from 'react-hot-toast';

import OpportunityEditDialog from '../components/OpportunityEditDialog';
import AccountEditDialog from '../components/AccountEditDialog';
import ContactEditDialog from '../components/ContactEditDialog';

// ── Types ───────────────────────────────────────────────────────────────────

export type DialogEntityType = 'opportunity' | 'account' | 'contact';

export interface DialogStackEntry {
  type: DialogEntityType;
  id: string;
  initialData?: Record<string, any>;
}

interface DialogStackContextValue {
  stack: DialogStackEntry[];
  pushDialog: (entry: DialogStackEntry) => void;
  popDialog: () => void;
  closeAll: () => void;
  depth: number;
  canPush: boolean;
}

const MAX_DEPTH = 3;

const DialogStackContext = createContext<DialogStackContextValue>({
  stack: [],
  pushDialog: () => {},
  popDialog: () => {},
  closeAll: () => {},
  depth: 0,
  canPush: true,
});

// ── Provider ────────────────────────────────────────────────────────────────

export const DialogStackProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [stack, setStack] = useState<DialogStackEntry[]>([]);

  const pushDialog = useCallback((entry: DialogStackEntry) => {
    setStack((prev) => {
      if (prev.length >= MAX_DEPTH) {
        toast.error('Maximum dialog depth reached');
        return prev;
      }
      return [...prev, entry];
    });
  }, []);

  const popDialog = useCallback(() => {
    setStack((prev) => prev.slice(0, -1));
  }, []);

  const closeAll = useCallback(() => {
    setStack([]);
  }, []);

  const value = useMemo<DialogStackContextValue>(
    () => ({
      stack,
      pushDialog,
      popDialog,
      closeAll,
      depth: stack.length,
      canPush: stack.length < MAX_DEPTH,
    }),
    [stack, pushDialog, popDialog, closeAll],
  );

  return (
    <DialogStackContext.Provider value={value}>
      {children}
    </DialogStackContext.Provider>
  );
};

// ── Hook ────────────────────────────────────────────────────────────────────

export function useDialogStack() {
  return useContext(DialogStackContext);
}

// ── Renderer ────────────────────────────────────────────────────────────────

export const DialogStackRenderer: React.FC = () => {
  const { stack, popDialog, pushDialog } = useContext(DialogStackContext);
  const queryClient = useQueryClient();

  if (stack.length === 0) return null;

  const handleOpenRelated = (type: DialogEntityType, id: string) => {
    pushDialog({ type, id });
  };

  return (
    <>
      {stack.map((entry, index) => {
        const handleClose = () => popDialog();

        switch (entry.type) {
          case 'opportunity':
            return (
              <OpportunityEditDialog
                key={`opp-${entry.id}-${index}`}
                open
                onClose={handleClose}
                opportunityId={entry.id}
                initialData={entry.initialData}
                onSaved={() => {
                  queryClient.invalidateQueries('opportunities');
                  popDialog();
                }}
                onOpenRelated={handleOpenRelated}
              />
            );

          case 'account':
            return (
              <AccountEditDialog
                key={`acct-${entry.id}-${index}`}
                open
                onClose={handleClose}
                accountId={entry.id}
                initialData={entry.initialData}
                onSaved={() => {
                  queryClient.invalidateQueries('accounts');
                  queryClient.invalidateQueries('opportunities-for-accounts');
                  popDialog();
                }}
              />
            );

          case 'contact':
            return (
              <ContactEditDialog
                key={`ctct-${entry.id}-${index}`}
                open
                onClose={handleClose}
                contactId={entry.id}
                initialData={entry.initialData}
                onSaved={() => {
                  queryClient.invalidateQueries('all-contacts');
                  popDialog();
                }}
                onOpenRelated={handleOpenRelated}
              />
            );

          default:
            return null;
        }
      })}
    </>
  );
};
