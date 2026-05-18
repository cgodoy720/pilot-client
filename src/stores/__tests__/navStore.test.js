import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';

let useNavStore;

describe('navStore', () => {
  beforeEach(async () => {
    vi.resetModules();
    const mod = await import('../navStore.js');
    useNavStore = mod.default;

    // Reset to initial state
    useNavStore.setState({ isSecondaryNavPage: false });
  });

  describe('initial state', () => {
    it('has isSecondaryNavPage set to false', () => {
      const state = useNavStore.getState();
      expect(state.isSecondaryNavPage).toBe(false);
    });
  });

  describe('setIsSecondaryNavPage', () => {
    it('sets isSecondaryNavPage to true', () => {
      useNavStore.getState().setIsSecondaryNavPage(true);

      expect(useNavStore.getState().isSecondaryNavPage).toBe(true);
    });

    it('sets isSecondaryNavPage back to false after being set to true', () => {
      useNavStore.getState().setIsSecondaryNavPage(true);
      expect(useNavStore.getState().isSecondaryNavPage).toBe(true);

      useNavStore.getState().setIsSecondaryNavPage(false);
      expect(useNavStore.getState().isSecondaryNavPage).toBe(false);
    });
  });

  describe('used as a React hook', () => {
    it('provides reactive state to components via renderHook', () => {
      const { result } = renderHook(() => useNavStore((s) => s.isSecondaryNavPage));
      expect(result.current).toBe(false);

      act(() => {
        useNavStore.getState().setIsSecondaryNavPage(true);
      });

      expect(result.current).toBe(true);
    });
  });
});
