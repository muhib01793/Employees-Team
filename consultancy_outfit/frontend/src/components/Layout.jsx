import { useState } from 'react';
import { NavLink, useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  MessageSquare,
  Video,
  FileText,
  Users,
  Briefcase,
  LogOut,
  Menu,
  ChevronLeft,
  UserPlus,
} from 'lucide-react';

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const navItems = [
    { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/employees', icon: Users, label: 'Employees' },
    { path: '/work', icon: Briefcase, label: 'Work Sharing' },
    { path: '/chat', icon: MessageSquare, label: 'Messages' },
    { path: '/meeting', icon: Video, label: 'Video Meetings' },
    { path: '/documents', icon: FileText, label: 'Documents & PDFs' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-100">
      {/* Mobile Backdrop */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-full w-64 bg-[#0f172a] text-white z-50 transition-transform duration-300 transform ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } md:relative md:translate-x-0 flex flex-col justify-between`}
      >
        <div>
          {/* Logo */}
          <div className="flex items-center justify-between h-16 px-6 bg-[#1e293b]">
            <span className="text-lg font-bold flex items-center gap-2.5">
              <div className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center font-black text-xs text-white">
                CO
              </div>
              Consultancy Outfit
            </span>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="md:hidden text-gray-400 hover:text-white"
            >
              ✕
            </button>
          </div>

          {/* Navigation Items */}
          <nav className="mt-5 px-3 space-y-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <NavLink
                  key={item.label}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-gray-300 hover:bg-gray-800/80 hover:text-white'
                  }`}
                >
                  <item.icon className="w-5 h-5 shrink-0" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* User Card & Logout in Sidebar */}
        <div className="p-4 border-t border-gray-800 bg-[#0b1120]">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white font-bold flex items-center justify-center text-sm">
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-white truncate">{user?.name || 'User'}</p>
              <p className="text-[11px] text-gray-400 truncate">{user?.designation || 'Staff'}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-2 text-xs font-semibold text-red-400 hover:text-white hover:bg-red-600/20 rounded-lg transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        {/* Top Header */}
        <header className="h-16 border-b border-gray-200 bg-white flex items-center justify-between px-6 z-10">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" />
              <span className="text-xs font-semibold text-gray-600">Consultancy Platform Live</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/employees')}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-xs font-semibold transition-colors"
              title="Add Employee"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Add Employee</span>
            </button>
            <div className="w-8 h-8 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center">
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
          </div>
        </header>

        {/* Content Outlet */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
