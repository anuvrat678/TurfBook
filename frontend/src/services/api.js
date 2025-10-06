import axios from 'axios';

const api = axios.create({
  baseURL: '/api', // Use proxy path
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor for auth token
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response) {
      return Promise.reject({
        message: error.response.data.message || 'Request failed',
        status: error.response.status
      });
    }
    return Promise.reject(error);
  }
);

export const login = async (credentials) => {
  try {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Add other API functions similarly


export default api;