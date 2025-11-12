// API Base URL
export const API_BASE_URL = 'http://localhost:8000';

// API Endpoints
export const API_ENDPOINTS = {
  // Authentication
  register: `${API_BASE_URL}/api/auth/register`,
  login: `${API_BASE_URL}/api/auth/login`,
  getCurrentUser: `${API_BASE_URL}/api/auth/me`,
  
  // Goals
  goals: `${API_BASE_URL}/api/goals`,
  getGoal: (id) => `${API_BASE_URL}/api/goals/${id}`,
  updateGoal: (id) => `${API_BASE_URL}/api/goals/${id}`,
  deleteGoal: (id) => `${API_BASE_URL}/api/goals/${id}`,
};

// Helper function to get auth headers
export const getAuthHeaders = () => {
  const token = localStorage.getItem('access_token');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
  };
};