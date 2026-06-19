import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // Crucial for securing and sending HTTP-only JWT cookies
  headers: {
    'Content-Type': 'application/json',
  }
});

// Response interceptor to catch unauthorized calls
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Session expired or unauthorized, trigger a redirect to login if we are in admin space
      if (window.location.pathname.startsWith('/journal') || window.location.pathname.startsWith('/admin')) {
        console.warn('Unauthorized request. Redirecting to authentication portal...');
        // Clear local state if necessary and redirect
      }
    }
    return Promise.reject(error);
  }
);

export default api;
