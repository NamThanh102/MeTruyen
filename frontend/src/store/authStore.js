import { create } from 'zustand';
import api, { TOKEN_KEY } from '../services/api';

const getStoredToken = () => {
  if (typeof window === 'undefined') {
    return null;
  }
  return localStorage.getItem(TOKEN_KEY);
};

const useAuthStore = create((set) => ({
  user: null,
  token: getStoredToken(),
  isLoading: false,
  initialized: false,
  error: null,

  clearError: () => set({ error: null }),

  updateUser: (user) => set({ user }),

  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(TOKEN_KEY);
    }
    set({ user: null, token: null, error: null });
  },

  initAuth: async () => {
    const token = getStoredToken();

    if (!token) {
      set({ token: null, user: null, initialized: true, isLoading: false });
      return;
    }

    set({ token, isLoading: true, error: null });

    try {
      const response = await api.get('/auth/me');
      const user = response?.data?.data?.user || null;

      set({ user, token, isLoading: false, initialized: true, error: null });
    } catch (error) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem(TOKEN_KEY);
      }

      set({
        user: null,
        token: null,
        isLoading: false,
        initialized: true,
        error: null,
      });
    }
  },

  login: async ({ email, password }) => {
    set({ isLoading: true, error: null });

    try {
      const response = await api.post('/auth/login', { email, password });
      const data = response?.data?.data || {};
      const token = data.token;
      const user = data.user;

      if (!token || !user) {
        throw new Error('Phản hồi đăng nhập không hợp lệ');
      }

      if (typeof window !== 'undefined') {
        localStorage.setItem(TOKEN_KEY, token);
      }

      set({
        user,
        token,
        isLoading: false,
        initialized: true,
        error: null,
      });

      return { success: true };
    } catch (error) {
      const message = error?.response?.data?.message || 'Đăng nhập thất bại';
      set({ isLoading: false, error: message });
      return { success: false, message };
    }
  },

  register: async ({ username, email, password }) => {
    set({ isLoading: true, error: null });

    try {
      await api.post('/auth/register', { username, email, password });
      set({ isLoading: false, error: null, initialized: true });
      return { success: true };
    } catch (error) {
      const message = error?.response?.data?.message || 'Đăng ký thất bại';
      set({ isLoading: false, error: message });
      return { success: false, message };
    }
  },
}));

export default useAuthStore;
