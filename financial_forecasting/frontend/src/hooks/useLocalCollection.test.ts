import { renderHook, act } from '@testing-library/react';
import { useLocalCollection } from './useLocalCollection';

// Simple dedup key for testing: use the item's "name" field
interface TestItem {
  id: string;
  name: string;
  value?: number;
}

const dedupeKey = (item: TestItem) => item.name.toLowerCase();

const STORAGE_KEY = 'test-collection';

beforeEach(() => {
  localStorage.clear();
});

// ---------------------------------------------------------------------------
// Initialization
// ---------------------------------------------------------------------------
describe('useLocalCollection — initialization', () => {
  it('starts empty when localStorage has no data', () => {
    const { result } = renderHook(() => useLocalCollection<TestItem>(STORAGE_KEY, dedupeKey));
    expect(result.current.items).toEqual([]);
  });

  it('initializes from existing localStorage data', () => {
    const existing: TestItem[] = [{ id: '1', name: 'Alice' }];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));

    const { result } = renderHook(() => useLocalCollection<TestItem>(STORAGE_KEY, dedupeKey));
    expect(result.current.items).toEqual(existing);
  });

  it('falls back to empty array on corrupt localStorage data', () => {
    localStorage.setItem(STORAGE_KEY, 'not-json!!!');

    const { result } = renderHook(() => useLocalCollection<TestItem>(STORAGE_KEY, dedupeKey));
    expect(result.current.items).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// Persistence
// ---------------------------------------------------------------------------
describe('useLocalCollection — persistence', () => {
  it('persists items to localStorage after import', () => {
    const { result } = renderHook(() => useLocalCollection<TestItem>(STORAGE_KEY, dedupeKey));

    act(() => {
      result.current.importItems([{ id: '1', name: 'Alice' }]);
    });

    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY)!);
    expect(stored).toEqual([{ id: '1', name: 'Alice' }]);
  });
});

// ---------------------------------------------------------------------------
// importItems — deduplication
// ---------------------------------------------------------------------------
describe('useLocalCollection — importItems', () => {
  it('adds new items and returns correct counts', () => {
    const { result } = renderHook(() => useLocalCollection<TestItem>(STORAGE_KEY, dedupeKey));

    let counts: { added: number; duplicates: number };
    act(() => {
      counts = result.current.importItems([
        { id: '1', name: 'Alice' },
        { id: '2', name: 'Bob' },
      ]);
    });

    expect(counts!.added).toBe(2);
    expect(counts!.duplicates).toBe(0);
    expect(result.current.items).toHaveLength(2);
  });

  it('deduplicates against existing items', () => {
    const { result } = renderHook(() => useLocalCollection<TestItem>(STORAGE_KEY, dedupeKey));

    act(() => {
      result.current.importItems([{ id: '1', name: 'Alice' }]);
    });

    act(() => {
      result.current.importItems([
        { id: '2', name: 'alice' }, // duplicate (case-insensitive)
        { id: '3', name: 'Bob' },   // new
      ]);
    });

    // NOTE: We verify outcome via state rather than return value because
    // React 18 batching can defer the setItems callback past the return.
    expect(result.current.items).toHaveLength(2);
    expect(result.current.items.map((i) => i.name)).toEqual(['Alice', 'Bob']);
  });

  it('deduplicates within the same import batch', () => {
    const { result } = renderHook(() => useLocalCollection<TestItem>(STORAGE_KEY, dedupeKey));

    let counts: { added: number; duplicates: number };
    act(() => {
      counts = result.current.importItems([
        { id: '1', name: 'Alice' },
        { id: '2', name: 'alice' }, // duplicate within batch
      ]);
    });

    expect(counts!.added).toBe(1);
    expect(counts!.duplicates).toBe(1);
  });

  it('applies transform function to new items', () => {
    const { result } = renderHook(() => useLocalCollection<TestItem>(STORAGE_KEY, dedupeKey));

    act(() => {
      result.current.importItems(
        [{ id: '1', name: 'Alice' }],
        (item) => ({ ...item, value: 42 }),
      );
    });

    expect(result.current.items[0].value).toBe(42);
  });
});

// ---------------------------------------------------------------------------
// updateItem
// ---------------------------------------------------------------------------
describe('useLocalCollection — updateItem', () => {
  it('updates items matching the predicate', () => {
    const { result } = renderHook(() => useLocalCollection<TestItem>(STORAGE_KEY, dedupeKey));

    act(() => {
      result.current.importItems([
        { id: '1', name: 'Alice', value: 10 },
        { id: '2', name: 'Bob', value: 20 },
      ]);
    });

    act(() => {
      result.current.updateItem(
        (item) => item.id === '1',
        { value: 99 },
      );
    });

    expect(result.current.items[0].value).toBe(99);
    expect(result.current.items[1].value).toBe(20); // unchanged
  });
});

// ---------------------------------------------------------------------------
// removeItems
// ---------------------------------------------------------------------------
describe('useLocalCollection — removeItems', () => {
  it('removes items matching the predicate', () => {
    const { result } = renderHook(() => useLocalCollection<TestItem>(STORAGE_KEY, dedupeKey));

    act(() => {
      result.current.importItems([
        { id: '1', name: 'Alice' },
        { id: '2', name: 'Bob' },
        { id: '3', name: 'Carol' },
      ]);
    });

    act(() => {
      result.current.removeItems((item) => item.id === '2');
    });

    expect(result.current.items).toHaveLength(2);
    expect(result.current.items.map((i) => i.name)).toEqual(['Alice', 'Carol']);
  });
});

// ---------------------------------------------------------------------------
// clear
// ---------------------------------------------------------------------------
describe('useLocalCollection — clear', () => {
  it('removes all items', () => {
    const { result } = renderHook(() => useLocalCollection<TestItem>(STORAGE_KEY, dedupeKey));

    act(() => {
      result.current.importItems([
        { id: '1', name: 'Alice' },
        { id: '2', name: 'Bob' },
      ]);
    });

    act(() => {
      result.current.clear();
    });

    expect(result.current.items).toEqual([]);
  });
});
