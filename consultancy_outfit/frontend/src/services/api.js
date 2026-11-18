import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT token to all requests automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;

export const endpoints = {
  auth: {
    register: '/auth/register',
    login: '/auth/login',
    logout: '/auth/logout',
    me: '/auth/me',
    profile: '/auth/profile',
    status: '/auth/status',
  },
  companies: {
    list: '/companies',
    detail: (id) => `/companies/${id}`,
    members: (id) => `/companies/${id}/members`,
  },
  teams: {
    list: '/teams',
    detail: (id) => `/teams/${id}`,
    members: (id) => `/teams/${id}/members`,
  },
  messages: {
    list: '/messages',
    conversations: '/messages/conversations',
    detail: (id) => `/messages/${id}`,
    read: (id) => `/messages/${id}/read`,
  },
  documents: {
    list: '/documents',
    upload: '/documents',
    detail: (id) => `/documents/${id}`,
    download: (id) => `/documents/${id}/download`,
  },
  users: {
    list: '/users',
    create: '/users',
    detail: (id) => `/users/${id}`,
    search: '/users/search',
  },
  work: {
    list: '/work',
    create: '/work',
    detail: (id) => `/work/${id}`,
  },
};