import { renderHook, act } from '@testing-library/react';
import React from 'react';
import { LeadsProvider, useLeads } from './LeadsContext';
import type { Lead } from '../types/weeklyPriorities';

// ---------------------------------------------------------------------------
// Helper: wrap hooks in LeadsProvider
// ---------------------------------------------------------------------------

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <LeadsProvider>{children}</LeadsProvider>
);

// ---------------------------------------------------------------------------
// Helper: build a Lead with sensible defaults
// ---------------------------------------------------------------------------

function makeLead(overrides: Partial<Lead> = {}): Lead {
  return {
    id: 'test-1',
    first_name: 'Jane',
    last_name: 'Donor',
    organization: 'Test Foundation',
    source: 'csv',
    status: 'new',
    priority: 'medium',
    created_at: '2026-01-01T00:00:00.000Z',
    updated_at: '2026-01-01T00:00:00.000Z',
    ...overrides,
  } as Lead;
}

// ---------------------------------------------------------------------------
// Setup
// ---------------------------------------------------------------------------

beforeEach(() => {
  localStorage.clear();
});

// ---------------------------------------------------------------------------
// 1. useLeads guard
// ---------------------------------------------------------------------------
describe('useLeads', () => {
  it('throws when used outside LeadsProvider', () => {
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => renderHook(() => useLeads())).toThrow(
      'useLeads must be used within a LeadsProvider',
    );
    spy.mockRestore();
  });
});

// ---------------------------------------------------------------------------
// 2-3. importLeads
// ---------------------------------------------------------------------------
describe('LeadsProvider — importLeads', () => {
  it('adds leads with default status, priority, and timestamps', () => {
    const { result } = renderHook(() => useLeads(), { wrapper });

    const bare = makeLead({
      id: 'lead-1',
      status: undefined as any,
      priority: undefined as any,
      created_at: undefined as any,
      updated_at: undefined as any,
    });

    act(() => {
      result.current.importLeads([bare]);
    });

    const imported = result.current.leads[0];
    expect(imported.status).toBe('new');
    expect(imported.priority).toBe('medium');
    expect(imported.created_at).toBeTruthy();
    expect(imported.updated_at).toBeTruthy();
  });

  it('deduplicates by first_name|last_name|source (case-insensitive)', () => {
    const { result } = renderHook(() => useLeads(), { wrapper });

    const leadA = makeLead({ id: 'lead-1', first_name: 'Jane', last_name: 'Donor', source: 'csv' });
    const leadB = makeLead({ id: 'lead-2', first_name: 'JANE', last_name: 'DONOR', source: 'CSV' });
    const leadC = makeLead({ id: 'lead-3', first_name: 'John', last_name: 'Smith', source: 'csv' });

    act(() => {
      result.current.importLeads([leadA, leadB, leadC]);
    });

    // leadB is a duplicate of leadA (case-insensitive match)
    expect(result.current.leads).toHaveLength(2);
    expect(result.current.leads.map((l) => l.id)).toEqual(['lead-1', 'lead-3']);
  });
});

// ---------------------------------------------------------------------------
// 4. updateLead
// ---------------------------------------------------------------------------
describe('LeadsProvider — updateLead', () => {
  it('updates a specific lead by id', () => {
    const { result } = renderHook(() => useLeads(), { wrapper });

    act(() => {
      result.current.importLeads([
        makeLead({ id: 'lead-1', first_name: 'Jane' }),
        makeLead({ id: 'lead-2', first_name: 'John', last_name: 'Smith' }),
      ]);
    });

    act(() => {
      result.current.updateLead('lead-1', { status: 'contacted' });
    });

    const updated = result.current.leads.find((l) => l.id === 'lead-1');
    expect(updated?.status).toBe('contacted');
    expect(updated?.updated_at).toBeTruthy();
  });
});

// ---------------------------------------------------------------------------
// 5-7. CAPACITY_GATE
// ---------------------------------------------------------------------------
describe('LeadsProvider — CAPACITY_GATE', () => {
  it('throws when converting without capacity_score', () => {
    const { result } = renderHook(() => useLeads(), { wrapper });

    act(() => {
      result.current.importLeads([
        makeLead({ id: 'lead-1', capacity_score: undefined }),
      ]);
    });

    expect(() => {
      act(() => {
        result.current.updateLead('lead-1', { status: 'converted' });
      });
    }).toThrow('CAPACITY_GATE');
  });

  it('conversion succeeds when capacity_score is provided in updates', () => {
    const { result } = renderHook(() => useLeads(), { wrapper });

    act(() => {
      result.current.importLeads([
        makeLead({ id: 'lead-1', capacity_score: undefined }),
      ]);
    });

    act(() => {
      result.current.updateLead('lead-1', { status: 'converted', capacity_score: 75 });
    });

    const converted = result.current.leads.find((l) => l.id === 'lead-1');
    expect(converted?.status).toBe('converted');
  });

  it('conversion succeeds when existing lead already has capacity_score', () => {
    const { result } = renderHook(() => useLeads(), { wrapper });

    act(() => {
      result.current.importLeads([
        makeLead({ id: 'lead-1', capacity_score: 80 }),
      ]);
    });

    act(() => {
      result.current.updateLead('lead-1', { status: 'converted' });
    });

    const converted = result.current.leads.find((l) => l.id === 'lead-1');
    expect(converted?.status).toBe('converted');
  });
});

// ---------------------------------------------------------------------------
// 8. deleteLead
// ---------------------------------------------------------------------------
describe('LeadsProvider — deleteLead', () => {
  it('removes one lead', () => {
    const { result } = renderHook(() => useLeads(), { wrapper });

    act(() => {
      result.current.importLeads([
        makeLead({ id: 'lead-1', first_name: 'Jane' }),
        makeLead({ id: 'lead-2', first_name: 'John', last_name: 'Smith' }),
      ]);
    });

    act(() => {
      result.current.deleteLead('lead-1');
    });

    expect(result.current.leads).toHaveLength(1);
    expect(result.current.leads[0].id).toBe('lead-2');
  });
});

// ---------------------------------------------------------------------------
// 9. deleteLeads
// ---------------------------------------------------------------------------
describe('LeadsProvider — deleteLeads', () => {
  it('removes multiple leads by id set', () => {
    const { result } = renderHook(() => useLeads(), { wrapper });

    act(() => {
      result.current.importLeads([
        makeLead({ id: 'lead-1', first_name: 'Jane' }),
        makeLead({ id: 'lead-2', first_name: 'John', last_name: 'Smith' }),
        makeLead({ id: 'lead-3', first_name: 'Alice', last_name: 'Green' }),
      ]);
    });

    act(() => {
      result.current.deleteLeads(['lead-1', 'lead-3']);
    });

    expect(result.current.leads).toHaveLength(1);
    expect(result.current.leads[0].id).toBe('lead-2');
  });
});

// ---------------------------------------------------------------------------
// 10. clearLeads
// ---------------------------------------------------------------------------
describe('LeadsProvider — clearLeads', () => {
  it('removes all leads', () => {
    const { result } = renderHook(() => useLeads(), { wrapper });

    act(() => {
      result.current.importLeads([
        makeLead({ id: 'lead-1', first_name: 'Jane' }),
        makeLead({ id: 'lead-2', first_name: 'John', last_name: 'Smith' }),
      ]);
    });

    expect(result.current.leads).toHaveLength(2);

    act(() => {
      result.current.clearLeads();
    });

    expect(result.current.leads).toEqual([]);
  });
});
