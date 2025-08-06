// Authentication utilities for session management

// Get current user from localStorage
export const getCurrentUser = () => {
  try {
    const userStr = localStorage.getItem('adminUser');
    return userStr ? JSON.parse(userStr) : null;
  } catch (error) {
    console.error('Error parsing user from localStorage:', error);
    return null;
  }
};

// Set current user in localStorage
export const setCurrentUser = (user) => {
  try {
    localStorage.setItem('adminUser', JSON.stringify(user));
  } catch (error) {
    console.error('Error saving user to localStorage:', error);
  }
};

// Get auth token from localStorage
export const getAuthToken = () => {
  return localStorage.getItem('adminToken');
};

// Set auth token in localStorage
export const setAuthToken = (token) => {
  localStorage.setItem('adminToken', token);
};

// Check if user is authenticated
export const isAuthenticated = () => {
  const token = getAuthToken();
  const user = getCurrentUser();
  return token && user && user.isAdmin;
};

// Check if user is admin
export const isAdmin = () => {
  const user = getCurrentUser();
  return user && user.isAdmin;
};

// Clear authentication data
export const clearAuth = () => {
  localStorage.removeItem('adminToken');
  localStorage.removeItem('adminUser');
};

// Login helper function
export const loginUser = (userData, token) => {
  setCurrentUser(userData);
  setAuthToken(token);
};

// Logout helper function
export const logoutUser = () => {
  clearAuth();
};