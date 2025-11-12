import { API_ENDPOINTS, getAuthHeaders } from '../config/api';

function parseApiError(errorBody) {
  if (!errorBody) return 'Request failed';
  // If detail is a string, return it
  if (typeof errorBody.detail === 'string') return errorBody.detail;
  // If detail is an array (FastAPI validation errors), map to readable messages
  if (Array.isArray(errorBody.detail)) {
    try {
      return errorBody.detail
        .map((d) => {
          if (typeof d === 'string') return d;
          if (d.msg) return d.msg;
          // pydantic/fastapi validation error shape
          if (d.loc && d.msg) return `${d.loc.join('.')} ${d.msg}`;
          return JSON.stringify(d);
        })
        .join('; ');
    } catch (e) {
      return JSON.stringify(errorBody.detail);
    }
  }
  // If detail is an object, try to stringify a useful field
  if (typeof errorBody.detail === 'object') return JSON.stringify(errorBody.detail);
  // Fallback to message, error, or whole body
  return errorBody.message || errorBody.error || JSON.stringify(errorBody);
}

// Authentication Services
export const authService = {
  async register(email, username, password) {
    const response = await fetch(API_ENDPOINTS.register, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, username, password }),
    });
    
    if (!response.ok) {
      const error = await response.json().catch(() => null);
      throw new Error(parseApiError(error) || 'Registration failed');
    }
    
    return response.json();
  },

  async login(email, password) {
    const response = await fetch(API_ENDPOINTS.login, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      // backend expects `username` field (username or email)
      body: JSON.stringify({ username: email, password }),
    });
    
    if (!response.ok) {
      const error = await response.json().catch(() => null);
      throw new Error(parseApiError(error) || 'Login failed');
    }
    
    const data = await response.json();
    localStorage.setItem('access_token', data.access_token);
    return data;
  },

  async getCurrentUser(token) {
    const response = await fetch(`${API_ENDPOINTS.getCurrentUser}?token=${token}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    
    if (!response.ok) {
      throw new Error('Failed to get user info');
    }
    
    return response.json();
  },

  logout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user_id');
  },

  isAuthenticated() {
    return !!localStorage.getItem('access_token');
  },

  getToken() {
    return localStorage.getItem('access_token');
  }
};

// Goals Services
export const goalsService = {
  async createGoal(userId, goalData) {
    const response = await fetch(`${API_ENDPOINTS.goals}?user_id=${userId}`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(goalData),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to create goal');
    }
    
    return response.json();
  },

  async getGoals(userId) {
    const response = await fetch(`${API_ENDPOINTS.goals}?user_id=${userId}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch goals');
    }
    
    return response.json();
  },

  async getGoal(userId, goalId) {
    const response = await fetch(`${API_ENDPOINTS.getGoal(goalId)}?user_id=${userId}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch goal');
    }
    
    return response.json();
  },

  async updateGoal(userId, goalId, goalData) {
    const response = await fetch(`${API_ENDPOINTS.updateGoal(goalId)}?user_id=${userId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(goalData),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to update goal');
    }
    
    return response.json();
  },

  async deleteGoal(userId, goalId) {
    const response = await fetch(`${API_ENDPOINTS.deleteGoal(goalId)}?user_id=${userId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    
    if (!response.ok) {
      throw new Error('Failed to delete goal');
    }
    
    return true;
  }
};