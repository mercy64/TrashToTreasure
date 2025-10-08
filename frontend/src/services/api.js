import axios from 'axios';

// Base API configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8001';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        try {
          const response = await axios.post(`${API_BASE_URL}/api/auth/token/refresh/`, {
            refresh: refreshToken,
          });
          
          const { access } = response.data;
          localStorage.setItem('token', access);
          
          // Retry the original request with new token
          originalRequest.headers.Authorization = `Bearer ${access}`;
          return api(originalRequest);
        } catch (refreshError) {
          // Refresh failed, logout user
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
          if (typeof window !== 'undefined') {
            window.location.href = '/login';
          }
        }
      }
    }
    
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (credentials) =>
    api.post('/api/auth/login/', credentials),
  
  register: (userData) =>
    api.post('/api/auth/register/', userData),
  
  getProfile: () =>
    api.get('/api/auth/profile/'),
  
  getUserStats: () =>
    api.get('/api/auth/stats/'),
  
  updateProfile: (profileData) =>
    api.put('/api/auth/profile/', profileData),
};

// Waste Management API
export const wasteAPI = {
  getListings: (params = {}) =>
    api.get('/api/waste/listings/', { params }),
  
  createListing: (listingData) =>
    // If we're sending a FormData instance (with images), let the
    // browser/set axios determine the Content-Type (including boundary).
    (listingData instanceof FormData
      ? api.post('/api/waste/listings/create/', listingData)
      : api.post('/api/waste/listings/create/', listingData)),
  
  getMyListings: () =>
    api.get('/api/waste/listings/my/'),
  
  getMyTransactions: () =>
    api.get('/api/waste/transactions/my/'),
  
  getUserStats: () =>
    api.get('/api/waste/stats/'),
};

// Messaging API
export const messageAPI = {
  getConversations: () =>
    api.get('/api/messaging/conversations/'),
  
  getMessages: (conversationId) =>
    api.get(`/api/messaging/conversations/${conversationId}/messages/`),
  
  sendMessage: (messageData) =>
    api.post('/api/messaging/messages/send/', messageData),
  
  getNotifications: () =>
    api.get('/api/messaging/notifications/'),
  
  markNotificationRead: (notificationId) =>
    api.post(`/api/messaging/notifications/${notificationId}/read/`),
};

// File upload API
export const uploadAPI = {
  uploadWasteImage: (file, listingId) => {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('listing', listingId.toString());
    
    return api.post('/api/waste/images/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
};

export default api;