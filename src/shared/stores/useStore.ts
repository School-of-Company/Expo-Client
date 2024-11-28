import { create } from 'zustand';

interface StoreState {
  role: 'user' | 'manage';
  setRole: (newRole: 'user' | 'manage') => void;
}

const useStore = create<StoreState>((set) => ({
  role: 'user',

  setRole: (newRole: 'user' | 'manage') => set({ role: newRole }),
}));

export default useStore;
