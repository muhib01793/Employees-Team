import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useNavigate } from 'react-router-dom';
import api, { endpoints } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Users,
  UserPlus,
  Mail,
  Briefcase,
  Phone,
  MessageSquare,
  Video,
  Trash2,
  Search,
  CheckCircle,
  Clock,
  Shield,
} from 'lucide-react';
import toast from 'react-hot-toast';

const Employees = () => {
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    designation: '',
    role: 'member',
  });

  // Fetch employees
  const { data: users, isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const res = await api.get(endpoints.users.list);
      return res.data.users || [];
    },
  });

  // Create employee
  const createMutation = useMutation({
    mutationFn: async (newUserData) => {
      const res = await api.post(endpoints.users.create, newUserData);
      return res.data;
    },
    onSuccess: () => {
      toast.success('Employee added successfully!');
      queryClient.invalidateQueries(['users']);
      setIsModalOpen(false);
      setFormData({
        name: '',
        email: '',
        password: '',
        phone: '',
        designation: '',
        role: 'member',
      });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to add employee');
    },
  });

  // Delete employee
  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      await api.delete(`${endpoints.users.list}/${id}`);
    },
    onSuccess: () => {
      toast.success('Employee removed');
      queryClient.invalidateQueries(['users']);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to delete employee');
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.password) {
      toast.error('Please fill in name, email and password');
      return;
    }
    createMutation.mutate(formData);
  };

  const filteredUsers = (users || []).filter(
    (u) =>
      u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.designation?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Employees & Team Members</h1>
          <p className="text-sm text-gray-600 mt-1">
            Manage your company's staff, add new employees, message or call them directly.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-lg font-medium shadow-sm transition-colors text-sm"
        >
          <UserPlus className="w-4 h-4" />
          Add Employee
        </button>
      </div>

      {/* Search & Stats Bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white p-4 rounded-xl border border-gray-200">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by name, email, role..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>
        <div className="text-xs text-gray-500 font-medium">
          Total Employees: <span className="font-bold text-indigo-600">{filteredUsers.length}</span>
        </div>
      </div>

      {/* Employees Grid */}
      {isLoading ? (
        <div className="text-center py-16">
          <div className="animate-spin h-8 w-8 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto mb-3" />
          <p className="text-gray-500 text-sm">Loading employees...</p>
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
          <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-gray-800">No Employees Found</h3>
          <p className="text-xs text-gray-500 mt-1">Click "Add Employee" above to register your team members.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredUsers.map((emp) => (
            <div
              key={emp._id}
              className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow p-5 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 font-bold text-lg flex items-center justify-center">
                      {emp.name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 text-base leading-tight">
                        {emp.name} {emp._id === currentUser?._id && <span className="text-xs text-indigo-600">(You)</span>}
                      </h3>
                      <p className="text-xs text-gray-500 mt-0.5">{emp.designation || 'Team Member'}</p>
                    </div>
                  </div>
                  <span
                    className={`text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full ${
                      emp.role === 'admin'
                        ? 'bg-purple-100 text-purple-700'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {emp.role}
                  </span>
                </div>

                <div className="mt-4 space-y-2 text-xs text-gray-600">
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-gray-400" />
                    <span className="truncate">{emp.email}</span>
                  </div>
                  {emp.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-gray-400" />
                      <span>{emp.phone}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        emp.status === 'online' ? 'bg-green-500' : 'bg-gray-300'
                      }`}
                    />
                    <span className="capitalize">{emp.status || 'Offline'}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-5 pt-4 border-t border-gray-100 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => navigate(`/chat?user=${emp._id}`)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-xs font-medium transition-colors"
                    title="Send Message"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    Chat
                  </button>
                  <button
                    onClick={() => navigate(`/meeting?to=${emp._id}&name=${encodeURIComponent(emp.name)}&email=${encodeURIComponent(emp.email)}`)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 hover:bg-green-100 text-green-700 rounded-lg text-xs font-medium transition-colors"
                    title="Start Direct Call"
                  >
                    <Video className="w-3.5 h-3.5" />
                    Call
                  </button>
                </div>
                {emp._id !== currentUser?._id && (
                  <button
                    onClick={() => {
                      if (window.confirm(`Are you sure you want to remove ${emp.name}?`)) {
                        deleteMutation.mutate(emp._id);
                      }
                    }}
                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Remove Employee"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Employee Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl animate-fade-in">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-indigo-600" />
                Add New Employee
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 text-sm font-semibold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-4 space-y-3.5">
              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. John Doe"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. employee@company.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">Password *</label>
                <input
                  type="password"
                  required
                  placeholder="At least 6 characters"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">Designation / Role in Company</label>
                <input
                  type="text"
                  placeholder="e.g. Frontend Developer, Consultant, Designer"
                  value={formData.designation}
                  onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                  className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">Phone Number</label>
                <input
                  type="text"
                  placeholder="e.g. +92 300 1234567"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isLoading}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white rounded-lg text-sm font-semibold transition-colors"
                >
                  {createMutation.isLoading ? 'Adding...' : 'Add Employee'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Employees;
