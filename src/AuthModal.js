import React, { useState } from 'react';
import { X, Mail, Lock, User, AlertCircle } from 'lucide-react';
import { authService } from './services/api';

const AuthModal = ({ onClose, onSuccess, theme }) => {
  const [authMode, setAuthMode] = useState('login');
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const themeColors = theme === 'dark' ? {
    cardBg: 'bg-black/30',
    text: 'text-white',
    textSecondary: 'text-gray-400',
    border: 'border-purple-500/30',
    inputBg: 'bg-black/20',
  } : {
    cardBg: 'bg-white/80',
    text: 'text-gray-900',
    textSecondary: 'text-gray-600',
    border: 'border-purple-300/50',
    inputBg: 'bg-white/50',
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (authMode === 'login') {
        const response = await authService.login(formData.email, formData.password);
        const user = await authService.getCurrentUser(response.access_token);
        localStorage.setItem('user_id', user.id);
        onSuccess(user);
      } else {
        const user = await authService.register(
          formData.email,
          formData.username,
          formData.password
        );
        // Auto login after registration
        const loginResponse = await authService.login(formData.email, formData.password);
        const loggedInUser = await authService.getCurrentUser(loginResponse.access_token);
        localStorage.setItem('user_id', loggedInUser.id);
        onSuccess(loggedInUser);
      }
    } catch (err) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose}></div>
      <div className={`${themeColors.cardBg} backdrop-blur-xl rounded-2xl p-8 border ${themeColors.border} shadow-2xl max-w-md w-full relative z-10`}>
        <div className="flex items-center justify-between mb-6">
          <h2 className={`text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent`}>
            {authMode === 'login' ? 'Welcome Back' : 'Create Account'}
          </h2>
          <button onClick={onClose} className={`${themeColors.textSecondary} hover:text-purple-400 transition-colors`}>
            <X className="w-6 h-6" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-500/20 border border-red-500/50 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-400" />
            <span className="text-red-400 text-sm">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={`block text-sm font-medium ${themeColors.text} mb-2`}>
              <Mail className="w-4 h-4 inline mr-2" />
              Email or Username
            </label>
            <input
              type="text"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className={`w-full px-4 py-3 rounded-xl ${themeColors.inputBg} border ${themeColors.border} ${themeColors.text} placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500`}
              placeholder={authMode === 'login' ? 'email or username' : 'your@email.com'}
              required
            />
          </div>

          {authMode === 'register' && (
            <div>
              <label className={`block text-sm font-medium ${themeColors.text} mb-2`}>
                <User className="w-4 h-4 inline mr-2" />
                Username
              </label>
              <input
                type="text"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                className={`w-full px-4 py-3 rounded-xl ${themeColors.inputBg} border ${themeColors.border} ${themeColors.text} placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500`}
                placeholder="username"
                required
              />
            </div>
          )}

          <div>
            <label className={`block text-sm font-medium ${themeColors.text} mb-2`}>
              <Lock className="w-4 h-4 inline mr-2" />
              Password
            </label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className={`w-full px-4 py-3 rounded-xl ${themeColors.inputBg} border ${themeColors.border} ${themeColors.text} placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500`}
              placeholder="••••••••"
              required
              minLength={6}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Processing...' : authMode === 'login' ? 'Login' : 'Sign Up'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => {
              setAuthMode(authMode === 'login' ? 'register' : 'login');
              setError('');
              setFormData({ email: '', username: '', password: '' });
            }}
            className={`${themeColors.textSecondary} hover:text-purple-400 transition-colors text-sm`}
          >
            {authMode === 'login' ? "Don't have an account? Sign up" : 'Already have an account? Login'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;