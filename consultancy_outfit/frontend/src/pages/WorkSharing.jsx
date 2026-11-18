import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import api, { endpoints } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Briefcase,
  PlusCircle,
  Clock,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Trash2,
  Search,
  Filter,
} from 'lucide-react';
import toast from 'react-hot-toast';

const WorkSharing = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Development',
    status: 'In Progress',
    link: '',
  });

  // Fetch work updates
  const { data: updates, isLoading } = useQuery({
    queryKey: ['workUpdates'],
    queryFn: async () => {
      const res = await api.get(endpoints.work.list);
      return res.data.updates || [];
    },
  });

  // Create work update
  const createMutation = useMutation({
    mutationFn: async (data) => {
      const res = await api.post(endpoints.work.create, data);
      return res.data;
    },
    onSuccess: () => {
      toast.success('Work update shared with team!');
      queryClient.invalidateQueries(['workUpdates']);
      setIsModalOpen(false);
      setFormData({
        title: '',
        description: '',
        category: 'Development',
        status: 'In Progress',
        link: '',
      });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to post work update');
    },
  });

  // Delete update
  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      await api.delete(`${endpoints.work.list}/${id}`);
    },
    onSuccess: () => {
      toast.success('Update removed');
      queryClient.invalidateQueries(['workUpdates']);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to remove update');
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title || !formData.description) {
      toast.error('Title and description are required');
      return;
    }
    createMutation.mutate(formData);
  };

  const filteredUpdates = (updates || []).filter((item) => {
    if (filterStatus === 'ALL') return true;
    return item.status === filterStatus;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Completed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Completed
          </span>
        );
      case 'In Progress':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
            <Clock className="w-3.5 h-3.5" />
            In Progress
          </span>
        );
      case 'Under Review':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-700">
            <AlertCircle className="w-3.5 h-3.5" />
            Under Review
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Work & Task Updates</h1>
          <p className="text-sm text-gray-600 mt-1">
            Share what you are working on, track progress, and collaborate across the team.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-lg font-medium shadow-sm transition-colors text-sm"
        >
          <PlusCircle className="w-4 h-4" />
          Share My Work
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-gray-200 pb-3 overflow-x-auto text-sm">
        {['ALL', 'In Progress', 'Completed', 'Under Review'].map((st) => (
          <button
            key={st}
            onClick={() => setFilterStatus(st)}
            className={`px-3.5 py-1.5 rounded-lg font-medium transition-colors text-xs whitespace-nowrap ${
              filterStatus === st
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            {st === 'ALL' ? 'All Updates' : st}
          </button>
        ))}
      </div>

      {/* Feed list */}
      {isLoading ? (
        <div className="text-center py-16">
          <div className="animate-spin h-8 w-8 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto mb-3" />
          <p className="text-gray-500 text-sm">Loading work updates...</p>
        </div>
      ) : filteredUpdates.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
          <Briefcase className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-gray-800">No Work Updates Yet</h3>
          <p className="text-xs text-gray-500 mt-1">Click "Share My Work" to post your first task update.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredUpdates.map((item) => (
            <div
              key={item._id}
              className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 font-bold flex items-center justify-center shrink-0">
                    {item.employee?.name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-gray-900 text-base">{item.title}</h3>
                      <span className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded font-medium">
                        {item.category}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      By <span className="font-medium text-gray-700">{item.employee?.name || 'Employee'}</span>
                      {item.employee?.designation && ` • ${item.employee.designation}`} •{' '}
                      {new Date(item.createdAt).toLocaleDateString()} at{' '}
                      {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {getStatusBadge(item.status)}
                  {(item.employee?._id === user?._id || user?.role === 'admin') && (
                    <button
                      onClick={() => {
                        if (window.confirm('Delete this work update?')) {
                          deleteMutation.mutate(item._id);
                        }
                      }}
                      className="p-1 text-gray-400 hover:text-red-600 rounded"
                      title="Delete Update"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              <div className="mt-3 pl-0 sm:pl-13 text-sm text-gray-700 whitespace-pre-line leading-relaxed">
                {item.description}
              </div>

              {item.link && (
                <div className="mt-3 pl-0 sm:pl-13">
                  <a
                    href={item.link.startsWith('http') ? item.link : `https://${item.link}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-indigo-600 hover:underline font-medium"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    Attached Project Link / Resource
                  </a>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Share Work Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-xl animate-fade-in">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-indigo-600" />
                Share Work Update
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
                <label className="text-xs font-semibold text-gray-700 block mb-1">Task / Work Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Completed Client Dashboard UI Design"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-700 block mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                  >
                    <option value="Development">Development</option>
                    <option value="Design">UI/UX Design</option>
                    <option value="Consulting">Consulting</option>
                    <option value="Research">Research & Analysis</option>
                    <option value="Testing & QA">Testing & QA</option>
                    <option value="Management">Management</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-700 block mb-1">Current Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                  >
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                    <option value="Under Review">Under Review</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">Description / Details *</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Describe what you worked on, milestones achieved, or blockers..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">Project Link / Repo / Document (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. github.com/my-repo or figma.com/file/..."
                  value={formData.link}
                  onChange={(e) => setFormData({ ...formData, link: e.target.value })}
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
                  {createMutation.isLoading ? 'Sharing...' : 'Share Work Update'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkSharing;
