import { renderHook, act } from '@testing-library/react';
import { useLinkedInContacts } from './useLinkedInContacts';
import type { LinkedInContact } from '../types/networkGraph';

const STORAGE_KEY = 'pursuit-linkedin-contacts';

function makeContact(overrides: Partial<LinkedInContact> = {}): LinkedInContact {
  return {
    id: 'li-1',
    first_name: 'Alice',
    last_name: 'Smith',
    ...overrides,
  };
}

beforeEach(() => {
  localStorage.clear();
});

describe('useLinkedInContacts', () => {
  it('starts with an empty contacts list', () => {
    const { result } = renderHook(() => useLinkedInContacts());
    expect(result.current.contacts).toEqual([]);
  });

  it('imports contacts and persists to localStorage', () => {
    const { result } = renderHook(() => useLinkedInContacts());

    act(() => {
      result.current.importContacts([
        makeContact({ id: 'li-1', first_name: 'Alice', last_name: 'Smith' }),
        makeContact({ id: 'li-2', first_name: 'Bob', last_name: 'Jones' }),
      ]);
    });

    expect(result.current.contacts).toHaveLength(2);
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY)!);
    expect(stored).toHaveLength(2);
  });

  it('deduplicates by first_name + last_name + organization (case-insensitive)', () => {
    const { result } = renderHook(() => useLinkedInContacts());

    act(() => {
      result.current.importContacts([
        makeContact({ id: 'li-1', first_name: 'Alice', last_name: 'Smith', organization: 'Acme' }),
      ]);
    });

    act(() => {
      result.current.importContacts([
        makeContact({ id: 'li-2', first_name: 'alice', last_name: 'smith', organization: 'acme' }), // dupe
        makeContact({ id: 'li-3', first_name: 'Alice', last_name: 'Smith', organization: 'Other' }), // different org → new
      ]);
    });

    // Verify via state: original + new (different org), duplicate excluded
    expect(result.current.contacts).toHaveLength(2);
    expect(result.current.contacts[0].organization).toBe('Acme');
    expect(result.current.contacts[1].organization).toBe('Other');
  });

  it('clearContacts empties the list', () => {
    const { result } = renderHook(() => useLinkedInContacts());

    act(() => {
      result.current.importContacts([makeContact()]);
    });
    expect(result.current.contacts).toHaveLength(1);

    act(() => {
      result.current.clearContacts();
    });
    expect(result.current.contacts).toEqual([]);
  });
});
