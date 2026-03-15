import { useLocalCollection } from './useLocalCollection';
import type { LinkedInContact } from '../types/networkGraph';

const STORAGE_KEY = 'pursuit-linkedin-contacts';

function dedupeKey(c: LinkedInContact): string {
  return `${(c.first_name || '').toLowerCase().trim()}|${(c.last_name || '').toLowerCase().trim()}|${(c.organization || '').toLowerCase().trim()}`;
}

export function useLinkedInContacts() {
  const { items: contacts, importItems, clear: clearContacts } =
    useLocalCollection<LinkedInContact>(STORAGE_KEY, dedupeKey);

  const importContacts = (newContacts: LinkedInContact[]) =>
    importItems(newContacts);

  return { contacts, importContacts, clearContacts };
}
