import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || '/api/v1';

export const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: false,
});

// ── Request interceptor: attach access token ──────────────────────────────
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ── Response interceptor: auto-refresh on 401 ────────────────────────────
let isRefreshing = false;
let queue: Array<{ resolve: (v: string) => void; reject: (e: any) => void }> = [];

const processQueue = (error: any, token: string | null) => {
  queue.forEach(({ resolve, reject }) => (token ? resolve(token) : reject(error)));
  queue = [];
};

const getCacheKey = (config: any) => {
  if (!config?.url) return null;
  const url = config.url;
  const params = config.params ? JSON.stringify(config.params) : '';
  return `educandes_cache_${url}_${params}`;
};

api.interceptors.response.use(
  (res) => {
    // Auto-cache GET requests
    if (res.config.method?.toLowerCase() === 'get') {
      const key = getCacheKey(res.config);
      if (key) {
        try {
          localStorage.setItem(key, JSON.stringify(res.data));
        } catch (e) {
          console.warn('Could not cache API response, localStorage might be full');
        }
      }
    }
    return res;
  },
  async (error) => {
    const original = error.config;
    
    // If it's a network error (no response) and a GET request, try to serve from cache
    if (!error.response && original?.method?.toLowerCase() === 'get') {
      const key = getCacheKey(original);
      if (key) {
        try {
          const cached = localStorage.getItem(key);
          if (cached) {
            console.log('[Offline Cache] Serving from cache:', original.url);
            return Promise.resolve({
              data: JSON.parse(cached),
              status: 200,
              statusText: 'OK',
              headers: {},
              config: original,
              isOfflineFallback: true
            });
          }
        } catch (e) {
          // ignore cache parse errors
        }
      }
    }

    if (error.response?.status !== 401 || original._retry) {
      return Promise.reject(error);
    }

    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) {
      localStorage.clear();
      window.location.href = '/auth';
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        queue.push({ resolve, reject });
      }).then((token) => {
        original.headers.Authorization = `Bearer ${token}`;
        return api(original);
      });
    }

    original._retry = true;
    isRefreshing = true;

    try {
      const { data } = await axios.post(`${BASE_URL}/auth/refresh`, { refreshToken });
      const { accessToken, refreshToken: newRefreshToken } = data.data;
      localStorage.setItem('access_token', accessToken);
      localStorage.setItem('refresh_token', newRefreshToken);
      api.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
      processQueue(null, accessToken);
      original.headers.Authorization = `Bearer ${accessToken}`;
      return api(original);
    } catch (refreshError) {
      processQueue(refreshError, null);
      localStorage.clear();
      window.location.href = '/auth';
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  },
);

export default api;
