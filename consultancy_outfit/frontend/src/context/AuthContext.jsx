import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);

  // Load user from localStorage or API on init
  useEffect(() => {
    let isMounted = true;

    const loadUser = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const res = await api.get('/auth/me');
          if (isMounted && res.data?.user) {
            setUser(res.data.user);
            localStorage.setItem('user', JSON.stringify(res.data.user));
          }
        } catch (err) {
          // If token invalid and no cached user, clean up
          const cached = localStorage.getItem('user');
          if (!cached && isMounted) {
            localStorage.removeItem('token');
            setUser(null);
          }
        }
      }
      if (isMounted) setLoading(false);
    };

    loadUser();

    return () => {
      isMounted = false;
    };
  }, []);

  const register = async (userData) => {
    try {
      const res = await api.post('/auth/register', userData);
      const token = res.data.token;
      const newUser = res.data.user;

      if (token) localStorage.setItem('token', token);
      if (newUser) {
        localStorage.setItem('user', JSON.stringify(newUser));
        setUser(newUser);
      }

      toast.success(res.data.isDemo ? 'Registration successful (Demo Mode)!' : 'Registration successful!');
      return res.data;
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
      throw err;
    }
  };

  const login = async (credentials) => {
    try {
      const res = await api.post('/auth/login', credentials);
      const token = res.data.token;
      const loggedInUser = res.data.user;

      if (token) localStorage.setItem('token', token);
      if (loggedInUser) {
        localStorage.setItem('user', JSON.stringify(loggedInUser));
        setUser(loggedInUser);
      }

      const welcomeMsg = loggedInUser?.name
        ? `Welcome back, ${loggedInUser.name}!`
        : 'Welcome back!';
      toast.success(welcomeMsg);
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
    localStorage.removeItem('user');
    setUser(null);
    toast.success('Logged out');
  }, []);

  const updateStatus = async (status) => {
    try {
      const res = await api.put('/auth/status', { status });
      if (res.data?.user) {
        setUser(res.data.user);
        localStorage.setItem('user', JSON.stringify(res.data.user));
      }
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
