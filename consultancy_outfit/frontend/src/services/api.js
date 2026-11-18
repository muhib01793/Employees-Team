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

const LIVE_BACKEND_URL = import.meta.env.VITE_API_URL;
const hasLiveBackend = Boolean(LIVE_BACKEND_URL);

// Underlying real Axios instance for live backend requests
const realHttp = axios.create({
  baseURL: LIVE_BACKEND_URL || '',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Helper: Safely parse request body from Object, JSON string, or FormData
function parseRequestBody(data) {
  if (!data) return {};
  if (typeof data === 'string') {
    try {
      return JSON.parse(data);
    } catch {
      return {};
    }
  }

  // Handle FormData in browser
  if (typeof FormData !== 'undefined' && data instanceof FormData) {
    const obj = {};
    try {
      if (typeof data.entries === 'function') {
        for (const [key, val] of data.entries()) {
          if (typeof File !== 'undefined' && val instanceof File) {
            obj[key] = val.name;
            obj.fileName = val.name;
            obj.fileSize = val.size;
            obj.fileType = val.type || 'application/pdf';
          } else {
            obj[key] = val;
          }
        }
      }
    } catch (e) {
      console.warn('FormData iteration error:', e);
    }

    const title = data.get('title');
    const description = data.get('description');
    const file = data.get('file') || data.get('document');

    if (title) obj.title = String(title);
    if (description) obj.description = String(description);

    if (file && typeof file === 'object') {
      obj.fileName = file.name || 'document.pdf';
      obj.fileSize = file.size || 1024 * 512;
      obj.fileType = file.type || 'application/pdf';
      if (!obj.title) obj.title = file.name;
    } else if (typeof file === 'string' && !obj.fileName) {
      obj.fileName = file;
    }
    return obj;
  }

  return data;
}

// Mock Engine Fallback Router
export async function handleMockFallback(config) {
  if (!config) return null;
  const method = (config.method || 'get').toLowerCase();
  let rawUrl = config.url || '';

  // Extract path without domain, /api prefix, or query params
  if (rawUrl.startsWith('http://') || rawUrl.startsWith('https://')) {
    try {
      const parsed = new URL(rawUrl);
      rawUrl = parsed.pathname;
    } catch (e) {}
  }

  rawUrl = rawUrl.replace(/^\/?api/, '');
  if (!rawUrl.startsWith('/')) rawUrl = '/' + rawUrl;
  const cleanPath = rawUrl.split('?')[0].replace(/\/+$/, '') || '/';

  const body = parseRequestBody(config.data);
  const currentUser = getCurrentMockUser();

  console.log(`[Storage/Mock Router] ${method.toUpperCase()} ${cleanPath}`);

  try {
    // 1. AUTH: Login
    if (cleanPath === '/auth/login' && method === 'post') {
      const res = mockLogin(body.email, body.password);
      return { data: { success: true, ...res }, status: 200, statusText: 'OK', headers: {}, config };
    }

    // 2. AUTH: Register
    if (cleanPath === '/auth/register' && method === 'post') {
      const res = mockRegister(body);
      return { data: { success: true, ...res }, status: 201, statusText: 'Created', headers: {}, config };
    }

    // 3. AUTH: Me
    if (cleanPath === '/auth/me' && method === 'get') {
      const user = currentUser || {
        _id: 'usr_admin_1',
        name: 'Admin User',
        email: 'admin@example.com',
        role: 'admin',
        designation: 'Platform Admin',
      };
      return { data: { success: true, user }, status: 200, statusText: 'OK', headers: {}, config };
    }

    // 4. AUTH: Logout
    if (cleanPath === '/auth/logout' && method === 'post') {
      return { data: { success: true, message: 'Logged out successfully' }, status: 200, statusText: 'OK', headers: {}, config };
    }

    // 5. AUTH: Status
    if (cleanPath === '/auth/status' && method === 'put') {
      if (currentUser) {
        currentUser.status = body.status || 'online';
        localStorage.setItem('user', JSON.stringify(currentUser));
      }
      return { data: { success: true, user: currentUser }, status: 200, statusText: 'OK', headers: {}, config };
    }

    // 6. USERS: List
    if (cleanPath === '/users' && method === 'get') {
      return { data: { success: true, users: getMockUsers() }, status: 200, statusText: 'OK', headers: {}, config };
    }

    // 7. USERS: Create (Add Employee)
    if (cleanPath === '/users' && method === 'post') {
      const newUser = createMockUser(body);
      return { data: { success: true, user: newUser }, status: 201, statusText: 'Created', headers: {}, config };
    }

    // 8. USERS: Delete
    if (cleanPath.startsWith('/users/') && method === 'delete') {
      const id = cleanPath.replace('/users/', '');
      deleteMockUser(id);
      return { data: { success: true, message: 'User deleted' }, status: 200, statusText: 'OK', headers: {}, config };
    }

    // 9. USERS: Get Single
    if (cleanPath.startsWith('/users/') && method === 'get') {
      const id = cleanPath.replace('/users/', '');
      const user = getMockUsers().find((u) => u._id === id) || currentUser;
      return { data: { success: true, user }, status: 200, statusText: 'OK', headers: {}, config };
    }

    // 10. DOCUMENTS: List
    if (cleanPath === '/documents' && method === 'get') {
      return { data: { success: true, documents: getMockDocuments() }, status: 200, statusText: 'OK', headers: {}, config };
    }

    // 11. DOCUMENTS: Upload
    if (cleanPath === '/documents' && method === 'post') {
      const newDoc = createMockDocument(body, currentUser);
      return { data: { success: true, document: newDoc }, status: 201, statusText: 'Created', headers: {}, config };
    }

    // 12. DOCUMENTS: Delete
    if (cleanPath.startsWith('/documents/') && method === 'delete') {
      const id = cleanPath.replace('/documents/', '');
      deleteMockDocument(id);
      return { data: { success: true, message: 'Document deleted' }, status: 200, statusText: 'OK', headers: {}, config };
    }

    // 13. WORK: List
    if (cleanPath === '/work' && method === 'get') {
      return { data: { success: true, updates: getMockWorkUpdates() }, status: 200, statusText: 'OK', headers: {}, config };
    }

    // 14. WORK: Create
    if (cleanPath === '/work' && method === 'post') {
      const newUpdate = createMockWorkUpdate(body, currentUser);
      return { data: { success: true, update: newUpdate }, status: 201, statusText: 'Created', headers: {}, config };
    }

    // 15. WORK: Delete
    if (cleanPath.startsWith('/work/') && method === 'delete') {
      const id = cleanPath.replace('/work/', '');
      deleteMockWorkUpdate(id);
      return { data: { success: true, message: 'Work update removed' }, status: 200, statusText: 'OK', headers: {}, config };
    }

    // 16. MESSAGES: List
    if (cleanPath === '/messages' && method === 'get') {
      const receiverId = config.params?.receiverId;
      const msgs = getMockMessages(receiverId, currentUser?._id);
      return { data: { success: true, messages: msgs }, status: 200, statusText: 'OK', headers: {}, config };
    }

    // 17. MESSAGES: Send
    if (cleanPath === '/messages' && method === 'post') {
      const newMsg = createMockMessage(body.content, body.receiverId, currentUser);
      return { data: { success: true, message: newMsg }, status: 201, statusText: 'Created', headers: {}, config };
    }

    // 18. MESSAGES: Conversations
    if (cleanPath === '/messages/conversations' && method === 'get') {
      const convs = getMockUsers().filter((u) => u._id !== currentUser?._id);
      return { data: { success: true, conversations: convs }, status: 200, statusText: 'OK', headers: {}, config };
    }

    // 19. COMPANIES
    if (cleanPath === '/companies' && method === 'get') {
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

    // 20. TEAMS
    if (cleanPath === '/teams' && method === 'get') {
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

    return { data: { success: true }, status: 200, statusText: 'OK', headers: {}, config };
  } catch (err) {
    const errorObj = new Error(err.message || 'Action failed');
    errorObj.response = {
      status: 400,
      data: { success: false, message: err.message || 'Action failed' },
    };
    return Promise.reject(errorObj);
  }
}

// Request Executor: Dual Mode (Live Backend + Offline Mock Engine)
async function executeRequest(config) {
  const token = localStorage.getItem('token');
  const headers = { ...config.headers };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  const mergedConfig = { ...config, headers };

  // If live backend URL is configured, try sending network request
  if (hasLiveBackend) {
    try {
      const res = await realHttp.request(mergedConfig);
      // If server returned HTML (e.g. 404 page rewritten as HTML with 200 OK)
      if (typeof res.data === 'string' && res.data.toLowerCase().includes('<html')) {
        return handleMockFallback(mergedConfig);
      }
      return res;
    } catch (err) {
      // If server offline, network down, 404 or 405, fallback gracefully
      const isNetworkErr = !err.response || err.code === 'ERR_NETWORK' || err.code === 'ECONNREFUSED';
      const isNotFound = err.response && (err.response.status === 404 || err.response.status === 405);
      if (isNetworkErr || isNotFound) {
        return handleMockFallback(mergedConfig);
      }
      throw err;
    }
  }

  // Pure Client / Netlify Demo Mode (no backend URL attached):
  // Resolve immediately from client storage engine (no network latency or 405s)
  return handleMockFallback(mergedConfig);
}

const api = {
  get: (url, config = {}) => executeRequest({ ...config, method: 'get', url }),
  post: (url, data, config = {}) => executeRequest({ ...config, method: 'post', url, data }),
  put: (url, data, config = {}) => executeRequest({ ...config, method: 'put', url, data }),
  delete: (url, config = {}) => executeRequest({ ...config, method: 'delete', url }),
  request: (config) => executeRequest(config),
  interceptors: {
    request: { use: () => {} },
    response: { use: () => {} },
  },
  defaults: {
    headers: { common: {} },
  },
};

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
