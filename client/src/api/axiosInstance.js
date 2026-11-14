import axios from 'axios';

export const TOKEN_STORAGE_KEY = 'codeanova_token';
export const USER_STORAGE_KEY = 'codeanova_user';

// Automatically normalize baseURL so either "https://...onrender.com" or "https://...onrender.com/api" works seamlessly
const rawBaseURL = import.meta.env.VITE_API_URL?.trim();
let baseURL = '/api';

if (rawBaseURL) {
  const cleanUrl = rawBaseURL.replace(/\/+$/, '');
  baseURL = cleanUrl.endsWith('/api') ? cleanUrl : `${cleanUrl}/api`;
}

const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Attach JWT Bearer token to every outgoing request if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(TOKEN_STORAGE_KEY);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Clear stale token on unauthorized responses from protected endpoints
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const requestUrl = error.config?.url || '';
    const isAuthEndpoint = requestUrl.includes('/auth/');

    if (status === 401 && !isAuthEndpoint && localStorage.getItem(TOKEN_STORAGE_KEY)) {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
      localStorage.removeItem(USER_STORAGE_KEY);
      window.dispatchEvent(new Event('codeanova:unauthorized'));
    }
    return Promise.reject(error);
  }
);

export default api;

