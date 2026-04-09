import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthStore {
  token: string | null;
  userId: string | null;
  email: string | null;
  isAuthenticated: boolean;
  login: (token: string, userId: string, email: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      token: null,
      userId: null,
      email: null,
      isAuthenticated: false,

      login: (token, userId, email) => {
        localStorage.setItem('fc_token', token);
        localStorage.setItem('fc_user', JSON.stringify({ userId, email }));
        set({ token, userId, email, isAuthenticated: true });
      },

      logout: () => {
        localStorage.removeItem('fc_token');
        localStorage.removeItem('fc_user');
        set({ token: null, userId: null, email: null, isAuthenticated: false });
      },
    }),
    { name: 'fc-auth-storage' }
  )
);
