import axios from 'axios';

// Use relative URL to leverage Vite proxy in development
const API_BASE_URL = import.meta.env.PROD 
  ? (import.meta.env.VITE_API_URL || 'http://localhost:3001')
  : '';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
      // Server responded with error status
      console.error('API Error:', error.response.data);
    } else if (error.request) {
      // Network error
      console.error('Network Error:', error.message);
    } else {
      console.error('Request Error:', error.message);
    }
    return Promise.reject(error);
  }
);

// Issue API methods
export const issueAPI = {
  // Get all issues with pagination and filtering
  getIssues: async (params = {}) => {
    const response = await api.get('/issues', { params });
    return response.data;
  },

  // Get specific issue
  getIssue: async (id) => {
    const response = await api.get(`/issues/${id}`);
    return response.data;
  },

  // Create new issue
  createIssue: async (issueData) => {
    const response = await api.post('/issues', issueData);
    return response.data;
  },

  // Update entire issue
  updateIssue: async (id, issueData) => {
    const response = await api.put(`/issues/${id}`, issueData);
    return response.data;
  },

  // Update only technician fields
  updateTechnicianFields: async (id, techData) => {
    const response = await api.patch(`/issues/${id}/tech`, techData);
    return response.data;
  },

  // Delete issue
  deleteIssue: async (id) => {
    const response = await api.delete(`/issues/${id}`);
    return response.data;
  },
};

// Health check
export const healthAPI = {
  check: async () => {
    const response = await api.get('/health');
    return response.data;
  },
};

export default api;