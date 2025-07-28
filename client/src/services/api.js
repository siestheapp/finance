import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || '/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for logging
api.interceptors.request.use(
  (config) => {
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Response Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// Companies API
export const companiesApi = {
  // Get all companies with optional search/filter
  getAll: (params = {}) => api.get('/companies', { params }),
  
  // Get single company with financial data
  getById: (id) => api.get(`/companies/${id}`),
  
  // Create new company
  create: (data) => api.post('/companies', data),
  
  // Update company
  update: (id, data) => api.put(`/companies/${id}`, data),
  
  // Delete company
  delete: (id) => api.delete(`/companies/${id}`),
  
  // Get portfolio overview stats
  getOverviewStats: () => api.get('/companies/stats/overview'),
};

// Financial Metrics API
export const financialMetricsApi = {
  // Get financial metrics for a company
  getByCompanyId: (companyId) => api.get(`/financial-metrics/${companyId}`),
  
  // Add new financial metrics (automatically calculates ratios)
  create: (data) => api.post('/financial-metrics', data),
  
  // Update financial metrics
  update: (id, data) => api.put(`/financial-metrics/${id}`, data),
  
  // Delete financial metrics
  delete: (id) => api.delete(`/financial-metrics/${id}`),
  
  // Calculate ratios without saving (preview functionality)
  calculateRatios: (data) => api.post('/financial-metrics/calculate', data),
};

// Generic error handler for components
export const handleApiError = (error) => {
  if (error.response?.data?.errors) {
    // Validation errors
    return error.response.data.errors.map(err => err.msg || err.message).join(', ');
  } else if (error.response?.data?.error) {
    // General API error
    return error.response.data.error;
  } else if (error.message) {
    // Network or other errors
    return error.message;
  } else {
    // Fallback error message
    return 'An unexpected error occurred';
  }
};

// Utility functions for formatting
export const formatCurrency = (value) => {
  if (value === null || value === undefined) return 'N/A';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

export const formatNumber = (value, decimals = 2) => {
  if (value === null || value === undefined) return 'N/A';
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
};

export const formatPercentage = (value, decimals = 1) => {
  if (value === null || value === undefined) return 'N/A';
  return `${formatNumber(value, decimals)}%`;
};

export const formatRatio = (value, decimals = 2) => {
  if (value === null || value === undefined) return 'N/A';
  return `${formatNumber(value, decimals)}x`;
};

export default api; 