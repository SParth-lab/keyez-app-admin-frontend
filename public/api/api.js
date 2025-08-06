import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://keyez-dev.descube.in/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear invalid token and redirect to login
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminUser');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API methods
export const authAPI = {
  login: async (username, password) => {
    const response = await api.post('/auth/login', { username, password });
    return response.data;
  },
  
  getProfile: async () => {
    const response = await api.get('/auth/profile');
    return response.data;
  },
  
  logout: () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
  }
};

// Users API methods
export const usersAPI = {
  // Get all users with pagination and filters (admin only)
  getAllUsers: async (page = 1, limit = 10, filters = {}) => {
    const params = new URLSearchParams({ page, limit, ...filters });
    const response = await api.get(`/users?${params}`);
    return response.data;
  },
  
  // Get user by ID (admin only)
  getUserById: async (userId) => {
    const response = await api.get(`/users/${userId}`);
    return response.data;
  },
  
  // Update user (admin only)
  updateUser: async (userId, userData) => {
    const response = await api.put(`/users/${userId}`, userData);
    return response.data;
  },
  
  // Delete user (admin only)
  deleteUser: async (userId) => {
    const response = await api.delete(`/users/${userId}`);
    return response.data;
  },
  
  // Get user statistics (admin only)
  getStatistics: async () => {
    const response = await api.get('/users/stats/overview');
    return response.data;
  },
  
  // Bulk operations (admin only)
  bulkOperation: async (action, userIds) => {
    const response = await api.post('/users/bulk', { action, userIds });
    return response.data;
  }
};

// Chat API methods
export const chatAPI = {
  // Send message to a specific user
  sendMessage: async (to, text) => {
    const response = await api.post('/chat/send', { to, text });
    return response.data;
  },
  
  // Get conversation with a specific user
  getConversation: async (userId) => {
    const response = await api.get(`/chat/messages/${userId}`);
    return response.data;
  },
  
  // Get all conversations for current user
  getConversations: async () => {
    const response = await api.get('/chat/conversations');
    return response.data;
  },
  
  // Get sent messages
  getSentMessages: async () => {
    const response = await api.get('/chat/sent');
    return response.data;
  },
  
  // Get received messages
  getReceivedMessages: async () => {
    const response = await api.get('/chat/received');
    return response.data;
  }
};

export default api;