import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const api = axios.create({
    baseURL: '/api',
    withCredentials: true,
  });

  // Load user from localStorage on init
  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        try {
          const res = await api.get('/auth/me');
          setUser(res.data.user);
        } catch (err) {
          localStorage.removeItem('token');
          delete api.defaults.headers.common['Authorization'];
        }
      }
      setLoading(false);
    };
    loadUser();
  }, []);

  const register = async (userData) => {
    try {
      const res = await api.post('/auth/register', userData);
      localStorage.setItem('token', res.data.token);
      api.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
      setUser(res.data.user);
      toast.success('Registration successful!');
      return res.data;
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
      throw err;
    }
  };

  const login = async (credentials) => {
    try {
      const res = await api.post('/auth/login', credentials);
      localStorage.setItem('token', res.data.token);
      api.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
      setUser(res.data.user);
      toast.success('Welcome back!');
      return res.data;
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
      throw err;
    }
  };

  const logout = useCallback(async () => {
    try {
      await api.post('/auth/logout');
    } catch (err) {
      // ignore errors
    }
    localStorage.removeItem('token');
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
    toast.success('Logged out');
  }, [api]);

  const updateStatus = async (status) => {
    try {
      const res = await api.put('/auth/status', { status });
      setUser(res.data.user);
      return res.data;
    } catch (err) {
      toast.error('Failed to update status');
      throw err;
    }
  };

  const value = {
    user,
    loading,
    register,
    login,
    logout,
    updateStatus,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};