import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
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

function loadLeads(): Lead[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as Lead[];
  } catch {
    return [];
  }
}

function persistLeads(leads: Lead[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(leads));
}

export const LeadsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [leads, setLeads] = useState<Lead[]>(loadLeads);

  // Sync to localStorage on every change
  useEffect(() => {
    persistLeads(leads);
  }, [leads]);

  const importLeads = useCallback((newLeads: Lead[]): { added: number; duplicates: number } => {
    const now = new Date().toISOString();
    let added = 0;
    let duplicates = 0;

    setLeads((prev) => {
      const existingKeys = new Set(prev.map(dedupeKey));
      const toAdd: Lead[] = [];

      for (const lead of newLeads) {
        const key = dedupeKey(lead);
        if (existingKeys.has(key)) {
          duplicates++;
        } else {
          existingKeys.add(key);
          toAdd.push({
            ...lead,
            status: lead.status || 'new',
            priority: lead.priority || 'medium',
            created_at: lead.created_at || now,
            updated_at: lead.updated_at || now,
          });
          added++;
        }
      }

      return [...prev, ...toAdd];
    });

    return { added, duplicates };
  }, []);

  const updateLead = useCallback((id: string, updates: Partial<Lead>) => {
    setLeads((prev) =>
      prev.map((lead) =>
        lead.id === id
          ? { ...lead, ...updates, updated_at: new Date().toISOString() }
          : lead
      )
    );
  }, []);

  const deleteLead = useCallback((id: string) => {
    setLeads((prev) => prev.filter((lead) => lead.id !== id));
  }, []);

  const deleteLeads = useCallback((ids: string[]) => {
    const idSet = new Set(ids);
    setLeads((prev) => prev.filter((lead) => !idSet.has(lead.id)));
  }, []);

  const clearLeads = useCallback(() => {
    setLeads([]);
  }, []);

  return (
    <LeadsContext.Provider value={{ leads, importLeads, updateLead, deleteLead, deleteLeads, clearLeads }}>
      {children}
    </LeadsContext.Provider>
  );
};
