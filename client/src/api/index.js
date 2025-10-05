import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error.response?.data || error.message);
  }
);

// Auth API
export const authAPI = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  register: (userData) => api.post('/auth/register', userData),
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get('/auth/me'),
};

// Users API
export const usersAPI = {
  getAll: (params) => api.get('/users', { params }),
  getById: (id) => api.get(`/users/${id}`),
  update: (id, data) => api.put(`/users/${id}`, data),
  getConnections: (id) => api.get(`/users/${id}/connections`),
  getVacancies: (id) => api.get(`/users/${id}/vacancies`),
};

// Vacancies API
export const vacanciesAPI = {
  getAll: (params) => api.get('/vacancies', { params }),
  getById: (id) => api.get(`/vacancies/${id}`),
  create: (data) => api.post('/vacancies', data),
  update: (id, data) => api.put(`/vacancies/${id}`, data),
  delete: (id) => api.delete(`/vacancies/${id}`),
};

// Connections API
export const connectionsAPI = {
  getAll: (params) => api.get('/connections', { params }),
  sendRequest: (data) => api.post('/connections/send', data),
  accept: (id) => api.post(`/connections/accept/${id}`),
  reject: (id) => api.post(`/connections/reject/${id}`),
  remove: (id) => api.delete(`/connections/${id}`),
};

// Applications API
export const applicationsAPI = {
  apply: (data) => api.post('/applications', data),
  getMyApplications: (params) => api.get('/applications/my', { params }),
  getReceived: (params) => api.get('/applications/received', { params }),
  updateStatus: (id, status) => api.put(`/applications/${id}/status`, { status }),
  delete: (id) => api.delete(`/applications/${id}`),
};

// Notifications API
export const notificationsAPI = {
  getAll: (params) => api.get('/notifications', { params }),
  markAsRead: (id) => api.put(`/notifications/${id}/read`),
  markAllAsRead: () => api.put('/notifications/read-all'),
  delete: (id) => api.delete(`/notifications/${id}`),
  deleteAll: () => api.delete('/notifications/all'),
  getCount: () => api.get('/notifications/count'),
};

export default api;
