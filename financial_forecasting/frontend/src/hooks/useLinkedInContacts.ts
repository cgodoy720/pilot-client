import { useState, useEffect, useCallback } from 'react';
import type { LinkedInContact } from '../types/networkGraph';

const STORAGE_KEY = 'pursuit-linkedin-contacts';

function dedupeKey(c: Pick<LinkedInContact, 'first_name' | 'last_name' | 'organization'>): string {
  return `${(c.first_name || '').toLowerCase().trim()}|${(c.last_name || '').toLowerCase().trim()}|${(c.organization || '').toLowerCase().trim()}`;
}

function load(): LinkedInContact[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as LinkedInContact[]) : [];
  } catch {
    return [];
  }
}

export function useLinkedInContacts() {
  const [contacts, setContacts] = useState<LinkedInContact[]>(load);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(contacts));
  }, [contacts]);

  const importContacts = useCallback(
    (newContacts: LinkedInContact[]): { added: number; duplicates: number } => {
      let added = 0;
      let duplicates = 0;

      setContacts((prev) => {
        const existing = new Set(prev.map(dedupeKey));
        const toAdd: LinkedInContact[] = [];

        for (const c of newContacts) {
          if (existing.has(dedupeKey(c))) {
            duplicates++;
          } else {
            existing.add(dedupeKey(c));
            toAdd.push(c);
            added++;
          }
        }

        return [...prev, ...toAdd];
      });

      return { added, duplicates };
    },
    []
  );

  const clearContacts = useCallback(() => setContacts([]), []);

  return { contacts, importContacts, clearContacts };
}
