import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Auth API
export const authAPI = {
  login: (data) => api.post('/auth/login', data),
};

// Student API
export const studentAPI = {
  create: (data) => api.post('/students', data),
  getByPRN: (prn) => api.get(`/students/${prn}`),
  getByWallet: (walletId) => api.get('/students', { params: { walletId } }),
  getAll: () => api.get('/students/all'),
};

// Transcript API
export const transcriptAPI = {
  upload: (formData) => api.post('/transcripts/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }),
  getById: (id) => api.get(`/transcripts/${id}`),
  getByStudent: (prn) => api.get(`/transcripts/student/${prn}`),
  getByWallet: (walletId) => api.get('/transcripts', { params: { walletId } }),
  getAll: () => api.get('/transcripts/all'),
  verify: (id, data) => api.post(`/transcripts/${id}/verify`, data),
};

// Request API
export const requestAPI = {
  create: (data) => api.post('/requests', data),
  getAll: (status) => api.get('/requests/all', { params: { status } }),
  getByStudent: (prn) => api.get(`/requests/student/${prn}`),
  updateStatus: (id, data) => api.put(`/requests/${id}/status`, data),
};

export default api;

