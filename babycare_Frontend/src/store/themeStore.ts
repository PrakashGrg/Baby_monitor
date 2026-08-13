import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface ThemeState {
  isDark: boolean;
  toggleDark: () => void;
  loadTheme: () => Promise<void>;
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  isDark: false,

  toggleDark: () => {
    const newValue = !get().isDark;
    set({ isDark: newValue });
    AsyncStorage.setItem('dark_mode', newValue ? 'true' : 'false');
  },

  loadTheme: async () => {
    const stored = await AsyncStorage.getItem('dark_mode');
    set({ isDark: stored === 'true' });
  },
}));