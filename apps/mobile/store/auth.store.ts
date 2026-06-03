import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';

interface AuthState {
  token: string | null;
  user: any | null;
  setAuth: (token: string, user: any) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  user: null,
  setAuth: async (token, user) => {
    await SecureStore.setItemAsync('token', token);
    set({ token, user });
  },
  logout: async () => {
    await SecureStore.deleteItemAsync('token');
    set({ token: null, user: null });
  },
}));
