import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { loginUser, registerUser, RegisterPayload } from '../api/auth';

interface User {
  id: number;
  username: string;
  email: string;
  phone?: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => Promise<void>;
  restoreSession: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  login: async (username, password) => {
    const data = await loginUser({ username, password });
    await AsyncStorage.setItem('access_token', data.access);
    await AsyncStorage.setItem('refresh_token', data.refresh);
    set({ isAuthenticated: true });
  },

  register: async (payload) => {
    const data = await registerUser(payload);
    await AsyncStorage.setItem('access_token', data.access);
    await AsyncStorage.setItem('refresh_token', data.refresh);
    set({ user: data.user, isAuthenticated: true });
  },

  logout: async () => {
    await AsyncStorage.multiRemove(['access_token', 'refresh_token']);
    set({ user: null, isAuthenticated: false });
  },

  restoreSession: async () => {
    const token = await AsyncStorage.getItem('access_token');
    set({ isAuthenticated: !!token, isLoading: false });
  },
}));