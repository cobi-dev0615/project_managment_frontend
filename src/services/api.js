import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Types API
export const typesAPI = {
  getAll: () => api.get('/types'),
  create: (data) => api.post('/types', data),
  update: (id, data) => api.put(`/types/${id}`, data),
  delete: (id) => api.delete(`/types/${id}`),
};

// Divisions API
export const divisionsAPI = {
  getAll: () => api.get('/divisions'),
  create: (data) => api.post('/divisions', data),
  update: (id, data) => api.put(`/divisions/${id}`, data),
  delete: (id) => api.delete(`/divisions/${id}`),
};

// Projects API
export const projectsAPI = {
  getAll: () => api.get('/projects'),
  getById: (id) => api.get(`/projects/${id}`),
  create: (data) => api.post('/projects', data),
  update: (id, data) => api.put(`/projects/${id}`, data),
  delete: (id) => api.delete(`/projects/${id}`),
};

export default api;
