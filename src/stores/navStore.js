import { create } from 'zustand';

const useNavStore = create((set) => ({
  isSecondaryNavPage: false,
  setIsSecondaryNavPage: (value) => set({ isSecondaryNavPage: value }),
}));

export { useNavStore };
export default useNavStore;
