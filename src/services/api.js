// API service layer using axios
import axios from 'axios';
import { API_BASE_URL } from '../utils/constants';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - attach auth token
api.interceptors.request.use(
  (config) => {
    try {
      const token = localStorage.getItem('om_auth_token') || localStorage.getItem('authToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (e) {
      console.warn('Unable to read auth token', e);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle expired session without disrupting public views or role-forbidden requests
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    if (status === 403) {
      // 403 Forbidden means the user is authenticated but lacks permission for this specific action/tab.
      // Do NOT purge auth tokens or redirect to login.
      console.warn('Access forbidden for current user role:', error.config?.url);
    } else if (status === 401) {
      // 401 Unauthorized means session expired or token is invalid.
      try {
        localStorage.removeItem('om_auth_token');
        localStorage.removeItem('authToken');
        localStorage.removeItem('om_user');
      } catch (e) {
        console.warn('Failed to clear token', e);
      }
      // Only redirect to login if currently on a protected route
      const path = typeof window !== 'undefined' ? window.location.pathname : '';
      if (path && path !== '/login' && (path.startsWith('/admin') || path.startsWith('/moderator') || path.startsWith('/profile'))) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
