// Demo & LocalStorage Persistence Engine for Consultancy Outfit
// Ensures 100% functionality on Netlify (Static Hosting) without requiring live backend

const STORAGE_KEYS = {
  USERS: 'co_mock_users',
  WORK: 'co_mock_work_updates',
  DOCUMENTS: 'co_mock_documents',
  MESSAGES: 'co_mock_messages',
};

export const INITIAL_USERS = [
  {
    _id: 'usr_admin_1',
    name: 'Admin User',
    email: 'admin@example.com',
    password: 'password123',
    role: 'admin',
    designation: 'Platform Admin',
    phone: '+92 300 1234567',
    status: 'online',
    avatar: '',
    createdAt: new Date().toISOString(),
  },
  {
    _id: 'usr_2',
    name: 'Sarah Connor',
    email: 'sarah.c@consultancy.com',
    password: 'password123',
    role: 'member',
    designation: 'Senior Strategy Consultant',
    phone: '+1 555 234 5678',
    status: 'online',
    avatar: '',
    createdAt: new Date(Date.now() - 86400000 * 20).toISOString(),
  },
  {
    _id: 'usr_3',
    name: 'Alex Rivera',
    email: 'alex.r@consultancy.com',
    password: 'password123',
    role: 'member',
    designation: 'Lead Cloud Architect',
    phone: '+1 555 345 6789',
    status: 'away',
    avatar: '',
    createdAt: new Date(Date.now() - 86400000 * 15).toISOString(),
  },
  {
    _id: 'usr_4',
    name: 'Emily Chen',
    email: 'emily.chen@consultancy.com',
    password: 'password123',
    role: 'member',
    designation: 'Product & UX Designer',
    phone: '+1 555 456 7890',
    status: 'online',
    avatar: '',
    createdAt: new Date(Date.now() - 86400000 * 10).toISOString(),
  },
  {
    _id: 'usr_5',
    name: 'Michael Brown',
    email: 'michael.b@consultancy.com',
    password: 'password123',
    role: 'member',
    designation: 'Senior Fullstack Engineer',
    phone: '+1 555 567 8901',
    status: 'busy',
    avatar: '',
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
  },
];

export const INITIAL_WORK_UPDATES = [
  {
    _id: 'work_1',
    title: 'Client Financial Audit Completed',
    description: 'Finished Q3 financial compliance audit report for enterprise client Acme Corp with 0 discrepancies found.',
    category: 'Finance',
    status: 'Completed',
    link: 'https://employees-team.netlify.app',
    employee: {
      _id: 'usr_2',
      name: 'Sarah Connor',
      email: 'sarah.c@consultancy.com',
      designation: 'Senior Strategy Consultant',
      avatar: '',
    },
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    _id: 'work_2',
    title: 'Migrated Kubernetes Cluster to Multi-Region',
    description: 'Completed multi-zone failover cluster deployment with zero downtime during live cutover.',
    category: 'Development',
    status: 'In Progress',
    link: 'https://employees-team.netlify.app',
    employee: {
      _id: 'usr_3',
      name: 'Alex Rivera',
      email: 'alex.r@consultancy.com',
      designation: 'Lead Cloud Architect',
      avatar: '',
    },
    createdAt: new Date(Date.now() - 3600000 * 6).toISOString(),
  },
  {
    _id: 'work_3',
    title: 'New Client Portal UI System Review',
    description: 'Finalized the design kit, color palette and responsive prototypes for client dashboard v2.',
    category: 'Design',
    status: 'Under Review',
    link: 'https://employees-team.netlify.app',
    employee: {
      _id: 'usr_4',
      name: 'Emily Chen',
      email: 'emily.chen@consultancy.com',
      designation: 'Product & UX Designer',
      avatar: '',
    },
    createdAt: new Date(Date.now() - 3600000 * 18).toISOString(),
  },
];

export const INITIAL_DOCUMENTS = [
  {
    _id: 'doc_1',
    title: 'Consultancy Master Services Agreement (MSA)',
    description: 'Standard enterprise terms, SLA benchmarks, and NDA clause templates for client engagements.',
    fileName: 'Consultancy_MSA_2026.pdf',
    fileType: 'application/pdf',
    fileSize: 2450000,
    downloadCount: 14,
    uploadedBy: {
      _id: 'usr_admin_1',
      name: 'Admin User',
      email: 'admin@example.com',
      avatar: '',
    },
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
  {
    _id: 'doc_2',
    title: 'Q4 Team Architecture & Strategy Roadmap',
    description: 'Technical strategy outlining cloud architecture transitions, team hiring targets, and tooling standards.',
    fileName: 'Team_Roadmap_Q4.pdf',
    fileType: 'application/pdf',
    fileSize: 1820000,
    downloadCount: 8,
    uploadedBy: {
      _id: 'usr_3',
      name: 'Alex Rivera',
      email: 'alex.r@consultancy.com',
      avatar: '',
    },
    createdAt: new Date(Date.now() - 86400000 * 7).toISOString(),
  },
];

export const INITIAL_MESSAGES = [
  {
    _id: 'msg_1',
    sender: { _id: 'usr_2', name: 'Sarah Connor', designation: 'Senior Strategy Consultant', avatar: '' },
    receiver: { _id: 'usr_admin_1', name: 'Admin User', designation: 'Platform Admin', avatar: '' },
    content: 'Hi Admin! The client proposal for the new project is ready for your review.',
    createdAt: new Date(Date.now() - 1800000).toISOString(),
  },
  {
    _id: 'msg_2',
    sender: { _id: 'usr_admin_1', name: 'Admin User', designation: 'Platform Admin', avatar: '' },
    receiver: { _id: 'usr_2', name: 'Sarah Connor', designation: 'Senior Strategy Consultant', avatar: '' },
    content: 'Great work Sarah! Let me inspect the documents and we can jump on a quick video call.',
    createdAt: new Date(Date.now() - 900000).toISOString(),
  },
];

// LocalStorage Persistence Helpers
function loadStorage(key, defaultData) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      localStorage.setItem(key, JSON.stringify(defaultData));
      return defaultData;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : defaultData;
  } catch (err) {
    return defaultData;
  }
}

function saveStorage(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (err) {
    console.warn('LocalStorage save failed:', err);
  }
}

// Current User
export function getCurrentMockUser() {
  try {
    const raw = localStorage.getItem('user');
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return INITIAL_USERS[0];
}

// USERS CRUD
export function getMockUsers() {
  const users = loadStorage(STORAGE_KEYS.USERS, INITIAL_USERS);
  return users.map(({ password, ...u }) => u);
}

export function createMockUser(data) {
  if (!data || !data.name || !data.email) {
    throw new Error('Name and email are required to add employee');
  }
  const users = loadStorage(STORAGE_KEYS.USERS, INITIAL_USERS);
  const cleanEmail = data.email.trim().toLowerCase();

  const existing = users.find((u) => u.email.toLowerCase() === cleanEmail);
  if (existing) {
    throw new Error(`An employee with email "${cleanEmail}" already exists`);
  }

  const newUser = {
    _id: 'usr_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6),
    name: data.name.trim(),
    email: cleanEmail,
    password: data.password || 'password123',
    phone: data.phone || '',
    designation: data.designation || 'Team Member',
    role: data.role || 'member',
    status: 'online',
    avatar: '',
    createdAt: new Date().toISOString(),
  };

  users.unshift(newUser);
  saveStorage(STORAGE_KEYS.USERS, users);

  const { password, ...safeUser } = newUser;
  return safeUser;
}

export function deleteMockUser(id) {
  let users = loadStorage(STORAGE_KEYS.USERS, INITIAL_USERS);
  users = users.filter((u) => u._id !== id);
  saveStorage(STORAGE_KEYS.USERS, users);
  return { success: true };
}

// DOCUMENTS CRUD
export function getMockDocuments() {
  return loadStorage(STORAGE_KEYS.DOCUMENTS, INITIAL_DOCUMENTS);
}

export function createMockDocument(data, currentUser) {
  const docs = loadStorage(STORAGE_KEYS.DOCUMENTS, INITIAL_DOCUMENTS);
  const fileName = data.fileName || 'document.pdf';
  const title = data.title || fileName.replace(/\.[^/.]+$/, '') || 'Untitled Document';

  const newDoc = {
    _id: 'doc_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6),
    title,
    description: data.description || '',
    fileName,
    fileType: data.fileType || (fileName.endsWith('.pdf') ? 'application/pdf' : 'application/octet-stream'),
    fileSize: data.fileSize || 1024 * 512,
    downloadCount: 0,
    uploadedBy: {
      _id: currentUser?._id || 'usr_admin_1',
      name: currentUser?.name || 'Admin User',
      email: currentUser?.email || 'admin@example.com',
      avatar: currentUser?.avatar || '',
    },
    createdAt: new Date().toISOString(),
  };

  docs.unshift(newDoc);
  saveStorage(STORAGE_KEYS.DOCUMENTS, docs);
  return newDoc;
}

export function deleteMockDocument(id) {
  let docs = loadStorage(STORAGE_KEYS.DOCUMENTS, INITIAL_DOCUMENTS);
  docs = docs.filter((d) => d._id !== id);
  saveStorage(STORAGE_KEYS.DOCUMENTS, docs);
  return { success: true };
}

// WORK UPDATES CRUD
export function getMockWorkUpdates() {
  return loadStorage(STORAGE_KEYS.WORK, INITIAL_WORK_UPDATES);
}

export function createMockWorkUpdate(data, currentUser) {
  if (!data || !data.title) {
    throw new Error('Title is required for work update');
  }
  const updates = loadStorage(STORAGE_KEYS.WORK, INITIAL_WORK_UPDATES);
  const newUpdate = {
    _id: 'work_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6),
    title: data.title.trim(),
    description: data.description || '',
    status: data.status || 'In Progress',
    category: data.category || 'General Work',
    link: data.link || '',
    employee: {
      _id: currentUser?._id || 'usr_admin_1',
      name: currentUser?.name || 'Admin User',
      email: currentUser?.email || 'admin@example.com',
      designation: currentUser?.designation || 'Platform Admin',
      avatar: currentUser?.avatar || '',
    },
    createdAt: new Date().toISOString(),
  };

  updates.unshift(newUpdate);
  saveStorage(STORAGE_KEYS.WORK, updates);
  return newUpdate;
}

export function deleteMockWorkUpdate(id) {
  let updates = loadStorage(STORAGE_KEYS.WORK, INITIAL_WORK_UPDATES);
  updates = updates.filter((u) => u._id !== id);
  saveStorage(STORAGE_KEYS.WORK, updates);
  return { success: true };
}

// MESSAGES CRUD
export function getMockMessages(receiverId, currentUserId) {
  const allMessages = loadStorage(STORAGE_KEYS.MESSAGES, INITIAL_MESSAGES);
  if (!receiverId) return allMessages;
  return allMessages.filter(
    (m) =>
      (m.sender?._id === currentUserId && m.receiver?._id === receiverId) ||
      (m.sender?._id === receiverId && m.receiver?._id === currentUserId) ||
      m.receiver === receiverId ||
      m.receiver === currentUserId
  );
}

export function createMockMessage(content, receiverId, currentUser) {
  if (!content) throw new Error('Message content is required');
  const messages = loadStorage(STORAGE_KEYS.MESSAGES, INITIAL_MESSAGES);
  const users = getMockUsers();
  const receiverUser = users.find((u) => u._id === receiverId) || { _id: receiverId, name: 'Team Member' };

  const newMsg = {
    _id: 'msg_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6),
    sender: {
      _id: currentUser?._id || 'usr_admin_1',
      name: currentUser?.name || 'Admin User',
      designation: currentUser?.designation || 'Platform Admin',
      avatar: currentUser?.avatar || '',
    },
    receiver: receiverUser,
    content,
    createdAt: new Date().toISOString(),
  };

  messages.push(newMsg);
  saveStorage(STORAGE_KEYS.MESSAGES, messages);
  return newMsg;
}

// AUTH LOGIN & REGISTER
export function mockLogin(email, password) {
  const users = loadStorage(STORAGE_KEYS.USERS, INITIAL_USERS);
  const cleanEmail = (email || '').trim().toLowerCase();

  if (cleanEmail === 'admin@example.com' && password === 'password123') {
    let admin = users.find((u) => u.email.toLowerCase() === 'admin@example.com');
    if (!admin) {
      admin = INITIAL_USERS[0];
      users.unshift(admin);
      saveStorage(STORAGE_KEYS.USERS, users);
    }
    const token = 'demo-jwt-token-' + btoa(admin._id + ':' + Date.now());
    const { password: _, ...safeUser } = admin;
    safeUser.status = 'online';
    return { token, user: safeUser, isDemo: true };
  }

  const user = users.find(
    (u) => u.email.toLowerCase() === cleanEmail && (u.password === password || password === 'password123')
  );

  if (!user) {
    throw new Error('Invalid email or password');
  }

  const token = 'demo-jwt-token-' + btoa(user._id + ':' + Date.now());
  const { password: _, ...safeUser } = user;
  safeUser.status = 'online';
  return { token, user: safeUser, isDemo: true };
}

export function mockRegister(userData) {
  const safeUser = createMockUser(userData);
  const token = 'demo-jwt-token-' + btoa(safeUser._id + ':' + Date.now());
  return { token, user: safeUser, isDemo: true };
}
