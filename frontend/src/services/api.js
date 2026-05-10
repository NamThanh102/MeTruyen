import axios from 'axios';

const TOKEN_KEY = 'metruyen_token';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 15000,
});

api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem(TOKEN_KEY);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem(TOKEN_KEY);

      // Only redirect to login if currently on a protected route
      const protectedPrefixes = ['/admin', '/profile', '/library', '/history', '/recharge'];
      const currentPath = window.location.pathname;
      const isProtected = protectedPrefixes.some((prefix) => currentPath.startsWith(prefix));

      if (isProtected) {
        window.location.href = `/login?redirect=${encodeURIComponent(currentPath)}`;
      }
    }

    return Promise.reject(error);
  }
);

export { TOKEN_KEY };
export default api;
