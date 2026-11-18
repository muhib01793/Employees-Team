import axios from 'axios';
import {
  mockLogin,
  mockRegister,
  getCurrentMockUser,
  getMockUsers,
  createMockUser,
  deleteMockUser,
  getMockWorkUpdates,
  createMockWorkUpdate,
  deleteMockWorkUpdate,
  getMockDocuments,
  createMockDocument,
  deleteMockDocument,
  getMockMessages,
  createMockMessage,
} from './mockData';

// If VITE_API_URL is configured (e.g. Render backend), use that.
// Otherwise fallback to relative /api or direct path.
const API_BASE_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '' : '/api');

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Attach JWT token to all requests automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Helper: Safely parse JSON request body
function parseRequestBody(data) {
  if (!data) return {};
  if (typeof data === 'string') {
    try {
      return JSON.parse(data);
    } catch {
      return {};
    }
  }
  if (data instanceof FormData) {
    const obj = {};
    data.forEach((val, key) => {
      if (val instanceof File) {
        obj[key] = val.name;
        obj.fileName = val.name;
        obj.fileSize = val.size;
        obj.fileType = val.type;
      } else {
        obj[key] = val;
      }
    });
    return obj;
  }
  return data;
}

// Mock fallback router for Netlify / offline / disconnected backend preview
async function handleMockFallback(config) {
  if (!config) return null;
  const method = (config.method || 'get').toLowerCase();
  let url = config.url || '';

  // Clean url: remove baseURL and leading /api
  url = url.replace(/^https?:\/\/[^/]+/, '');
  url = url.replace(/^\/?api\/?/, '/');
  if (!url.startsWith('/')) url = '/' + url;
  const path = url.split('?')[0];
  const body = parseRequestBody(config.data);
  const currentUser = getCurrentMockUser();

  console.log(`[Demo/Fallback Engine] Handling ${method.toUpperCase()} ${path}`);

  try {
    // 1. Auth Login
    if (path === '/auth/login' && method === 'post') {
      const res = mockLogin(body.email, body.password);
      return {
        data: { success: true, ...res },
        status: 200,
        statusText: 'OK',
        headers: {},
        config,
      };
    }

    // 2. Auth Register
    if (path === '/auth/register' && method === 'post') {
      const res = mockRegister(body);
      return {
        data: { success: true, ...res },
        status: 201,
        statusText: 'Created',
        headers: {},
        config,
      };
    }

    // 3. Auth Me
    if (path === '/auth/me' && method === 'get') {
      const user = currentUser || {
        _id: 'usr_admin_1',
        name: 'Admin User',
        email: 'admin@example.com',
        role: 'admin',
        designation: 'Platform Admin',
      };
      return {
        data: { success: true, user },
        status: 200,
        statusText: 'OK',
        headers: {},
        config,
      };
    }

    // 4. Auth Logout
    if (path === '/auth/logout' && method === 'post') {
      return {
        data: { success: true, message: 'Logged out successfully' },
        status: 200,
        statusText: 'OK',
        headers: {},
        config,
      };
    }

    // 5. Auth Status
    if (path === '/auth/status' && method === 'put') {
      if (currentUser) {
        currentUser.status = body.status || 'online';
        localStorage.setItem('user', JSON.stringify(currentUser));
      }
      return {
        data: { success: true, user: currentUser },
        status: 200,
        statusText: 'OK',
        headers: {},
        config,
      };
    }

    // 6. Users List
    if (path === '/users' && method === 'get') {
      return {
        data: { success: true, users: getMockUsers() },
        status: 200,
        statusText: 'OK',
        headers: {},
        config,
      };
    }

    // 7. Users Create (Add Employee)
    if (path === '/users' && method === 'post') {
      const newUser = createMockUser(body);
      return {
        data: { success: true, user: newUser },
        status: 201,
        statusText: 'Created',
        headers: {},
        config,
      };
    }

    // 8. Users Delete
    if (path.startsWith('/users/') && method === 'delete') {
      const id = path.replace('/users/', '');
      deleteMockUser(id);
      return {
        data: { success: true, message: 'User deleted' },
        status: 200,
        statusText: 'OK',
        headers: {},
        config,
      };
    }

    // 9. Work Updates List
    if (path === '/work' && method === 'get') {
      return {
        data: { success: true, updates: getMockWorkUpdates() },
        status: 200,
        statusText: 'OK',
        headers: {},
        config,
      };
    }

    // 10. Work Updates Create
    if (path === '/work' && method === 'post') {
      const newUpdate = createMockWorkUpdate(body, currentUser);
      return {
        data: { success: true, update: newUpdate },
        status: 201,
        statusText: 'Created',
        headers: {},
        config,
      };
    }

    // 11. Work Updates Delete
    if (path.startsWith('/work/') && method === 'delete') {
      const id = path.replace('/work/', '');
      deleteMockWorkUpdate(id);
      return {
        data: { success: true, message: 'Work update removed' },
        status: 200,
        statusText: 'OK',
        headers: {},
        config,
      };
    }

    // 12. Documents List
    if (path === '/documents' && method === 'get') {
      return {
        data: { success: true, documents: getMockDocuments() },
        status: 200,
        statusText: 'OK',
        headers: {},
        config,
      };
    }

    // 13. Documents Upload
    if (path === '/documents' && method === 'post') {
      const newDoc = createMockDocument(body, currentUser);
      return {
        data: { success: true, document: newDoc },
        status: 201,
        statusText: 'Created',
        headers: {},
        config,
      };
    }

    // 14. Documents Delete
    if (path.startsWith('/documents/') && method === 'delete') {
      const id = path.replace('/documents/', '');
      deleteMockDocument(id);
      return {
        data: { success: true, message: 'Document deleted' },
        status: 200,
        statusText: 'OK',
        headers: {},
        config,
      };
    }

    // 15. Messages List
    if (path === '/messages' && method === 'get') {
      const receiverId = config.params?.receiverId;
      const msgs = getMockMessages(receiverId, currentUser?._id);
      return {
        data: { success: true, messages: msgs },
        status: 200,
        statusText: 'OK',
        headers: {},
        config,
      };
    }

    // 16. Messages Send
    if (path === '/messages' && method === 'post') {
      const newMsg = createMockMessage(body.content, body.receiverId, currentUser);
      return {
        data: { success: true, message: newMsg },
        status: 201,
        statusText: 'Created',
        headers: {},
        config,
      };
    }

    // 17. Companies
    if (path === '/companies' && method === 'get') {
      return {
        data: {
          success: true,
          companies: [
            {
              _id: 'cmp_1',
              name: 'Acme Consultancy',
              slug: 'acme-consultancy',
              description: 'Professional Tech & Strategy Consultancy',
            },
          ],
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config,
      };
    }

    // 18. Teams
    if (path === '/teams' && method === 'get') {
      return {
        data: {
          success: true,
          teams: [
            { _id: 'team_1', name: 'Engineering & Strategy' },
            { _id: 'team_2', name: 'Design & Product' },
          ],
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config,
      };
    }

    return null;
  } catch (err) {
    const errorObj = new Error(err.message || 'Action failed');
    errorObj.response = {
      status: 400,
      data: { success: false, message: err.message || 'Action failed' },
    };
    return Promise.reject(errorObj);
  }
}

// Response interceptor: Handles Netlify SPA html redirects and server connection failures
api.interceptors.response.use(
  async (response) => {
    // If Netlify returned index.html for a missing API route (status 200 with HTML body)
    if (typeof response.data === 'string' && response.data.trim().startsWith('<!DOCTYPE html')) {
      const mockResult = await handleMockFallback(response.config);
      if (mockResult) return mockResult;
    }
    return response;
  },
  async (error) => {
    // Check if network error, 404, 405, 500, or server offline
    const isNetworkErr = !error.response || error.code === 'ERR_NETWORK' || error.code === 'ECONNREFUSED';
    const isNotFound = error.response && (error.response.status === 404 || error.response.status === 405);

    if (isNetworkErr || isNotFound) {
      try {
        const mockResult = await handleMockFallback(error.config);
        if (mockResult) return mockResult;
      } catch (mockErr) {
        return Promise.reject(mockErr);
      }
    }
    return Promise.reject(error);
  }
);

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
