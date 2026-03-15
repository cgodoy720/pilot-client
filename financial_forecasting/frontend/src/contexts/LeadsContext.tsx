import React, { createContext, useContext, useCallback, ReactNode } from 'react';
import { useLocalCollection } from '../hooks/useLocalCollection';
import type { Lead } from '../types/weeklyPriorities';

const STORAGE_KEY = 'pursuit-leads';

interface LeadsContextType {
  leads: Lead[];
  importLeads: (newLeads: Lead[]) => { added: number; duplicates: number };
  updateLead: (id: string, updates: Partial<Lead>) => void;
  deleteLead: (id: string) => void;
  deleteLeads: (ids: string[]) => void;
  clearLeads: () => void;
}

const LeadsContext = createContext<LeadsContextType | undefined>(undefined);

export const useLeads = () => {
  const context = useContext(LeadsContext);
  if (!context) {
    throw new Error('useLeads must be used within a LeadsProvider');
  }
  return context;
};

function dedupeKey(lead: Pick<Lead, 'first_name' | 'last_name' | 'source'>): string {
  return `${lead.first_name.toLowerCase().trim()}|${lead.last_name.toLowerCase().trim()}|${lead.source.toLowerCase().trim()}`;
}

export const LeadsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { items: leads, importItems, updateItem, removeItems, clear } =
    useLocalCollection<Lead>(STORAGE_KEY, dedupeKey);

  const importLeads = useCallback(
    (newLeads: Lead[]) => {
      const now = new Date().toISOString();
      return importItems(newLeads, (lead) => ({
        ...lead,
        status: lead.status || 'new',
        priority: lead.priority || 'medium',
        created_at: lead.created_at || now,
        updated_at: lead.updated_at || now,
      }));
    },
    [importItems],
  );

  const updateLead = useCallback(
    (id: string, updates: Partial<Lead>) => {
      updateItem(
        (lead) => lead.id === id,
        { ...updates, updated_at: new Date().toISOString() },
      );
    },
    [updateItem],
  );

  const deleteLead = useCallback(
    (id: string) => removeItems((lead) => lead.id === id),
    [removeItems],
  );

  const deleteLeads = useCallback(
    (ids: string[]) => {
      const idSet = new Set(ids);
      removeItems((lead) => idSet.has(lead.id));
    },
    [removeItems],
  );

  return (
    <LeadsContext.Provider value={{ leads, importLeads, updateLead, deleteLead, deleteLeads, clearLeads: clear }}>
      {children}
    </LeadsContext.Provider>
  );
};
