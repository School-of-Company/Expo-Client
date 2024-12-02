import { create } from 'zustand';

type NavigationStore = {
  navigation: string;
  setNavigation: (value: string) => void;
};

export const useNavigationStore = create<NavigationStore>((set) => ({
  navigation: 'standard',
  setNavigation: (value) => set({ navigation: value }),
}));
