import { useQuery } from 'react-query';
import { useNavigate } from 'react-router-dom';
import api, { endpoints } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { downloadDocumentFile } from '../utils/downloadFile';
import {
  Users,
  Briefcase,
  MessageSquare,
  FileText,
  Video,
  ArrowRight,
  Upload,
  UserPlus,
  Clock,
  Download,
} from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Load real employees count
  const { data: users } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const res = await api.get(endpoints.users.list);
      return res.data.users || [];
    },
  });

  // Load real documents count
  const { data: documents } = useQuery({
    queryKey: ['documents'],
    queryFn: async () => {
      const res = await api.get(endpoints.documents.list);
      return res.data.documents || [];
    },
  });

  // Load real work updates
  const { data: workUpdates } = useQuery({
    queryKey: ['workUpdates'],
    queryFn: async () => {
      const res = await api.get(endpoints.work.list);
      return res.data.updates || [];
    },
  });

  const statCards = [
    {
      title: 'Total Employees',
      value: users?.length || 0,
      icon: Users,
      color: 'bg-indigo-50 text-indigo-600',
      actionText: 'View Employees',
      onClick: () => navigate('/employees'),
    },
    {
      title: 'Work Updates',
      value: workUpdates?.length || 0,
      icon: Briefcase,
      color: 'bg-blue-50 text-blue-600',
      actionText: 'View Work Feed',
      onClick: () => navigate('/work'),
    },
    {
      title: 'Shared Documents',
      value: documents?.length || 0,
      icon: FileText,
      color: 'bg-green-50 text-green-600',
      actionText: 'Open Documents',
      onClick: () => navigate('/documents'),
    },
    {
      title: 'Team Video Call',
      value: 'Live',
      icon: Video,
      color: 'bg-purple-50 text-purple-600',
      actionText: 'Start Meeting',
      onClick: () => navigate('/meeting'),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome back, {user?.name || 'User'} 👋
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Consultancy Outfit workspace is active. Manage your employees, track tasks, and collaborate.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => navigate('/employees')}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors"
          >
            <UserPlus className="w-3.5 h-3.5" />
            Add Employee
          </button>
          <button
            onClick={() => navigate('/work')}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg text-xs font-semibold transition-colors"
          >
            <Briefcase className="w-3.5 h-3.5" />
            Share Work
          </button>
          <button
            onClick={() => navigate('/documents')}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg text-xs font-semibold transition-colors"
          >
            <Upload className="w-3.5 h-3.5" />
            Upload PDF
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {statCards.map((stat) => (
          <div
            key={stat.title}
            onClick={stat.onClick}
            className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-500 uppercase">{stat.title}</span>
                <div className={`w-10 h-10 rounded-xl ${stat.color} flex items-center justify-center`}>
                  <stat.icon className="w-5 h-5" />
                </div>
              </div>
              <div className="text-3xl font-bold text-gray-900 mt-3">{stat.value}</div>
            </div>
            <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-indigo-600 font-semibold">
              <span>{stat.actionText}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>
        ))}
      </div>

      {/* Two Column Layout: Recent Work & Recent Documents */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Work Updates */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <h2 className="font-bold text-gray-900 text-base flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-indigo-600" />
                Recent Work Updates
              </h2>
              <button
                onClick={() => navigate('/work')}
                className="text-xs text-indigo-600 hover:underline font-semibold"
              >
                View All
              </button>
            </div>

            <div className="mt-4 space-y-3">
              {!workUpdates || workUpdates.length === 0 ? (
                <div className="text-center py-8 text-gray-400 text-xs">
                  No work updates posted yet.
                  <button
                    onClick={() => navigate('/work')}
                    className="block mx-auto mt-2 text-indigo-600 font-semibold"
                  >
                    + Share First Update
                  </button>
                </div>
              ) : (
                workUpdates.slice(0, 4).map((w) => (
                  <div key={w._id} className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-gray-900 text-xs truncate max-w-[200px]">
                        {w.title}
                      </h4>
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-indigo-50 text-indigo-700">
                        {w.status}
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-500 mt-1 line-clamp-1">{w.description}</p>
                    <p className="text-[10px] text-gray-400 mt-1">
                      By {w.employee?.name || 'Employee'} • {new Date(w.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Recent Documents */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <h2 className="font-bold text-gray-900 text-base flex items-center gap-2">
                <FileText className="w-4 h-4 text-green-600" />
                Latest Uploaded Documents & PDFs
              </h2>
              <button
                onClick={() => navigate('/documents')}
                className="text-xs text-indigo-600 hover:underline font-semibold"
              >
                View All
              </button>
            </div>

            <div className="mt-4 space-y-3">
              {!documents || documents.length === 0 ? (
                <div className="text-center py-8 text-gray-400 text-xs">
                  No documents uploaded yet.
                  <button
                    onClick={() => navigate('/documents')}
                    className="block mx-auto mt-2 text-indigo-600 font-semibold"
                  >
                    + Upload PDF
                  </button>
                </div>
              ) : (
                documents.slice(0, 4).map((doc) => (
                  <div
                    key={doc._id}
                    className="p-3 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <FileText className="w-4 h-4 text-red-500 shrink-0" />
                      <div className="truncate">
                        <p className="font-semibold text-gray-900 text-xs truncate">{doc.title}</p>
                        <p className="text-[10px] text-gray-500 truncate">
                          {doc.fileName} • {doc.uploadedBy?.name || 'User'}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => downloadDocumentFile(doc)}
                      className="px-2.5 py-1 bg-white hover:bg-gray-100 border border-gray-200 rounded text-xs text-indigo-600 font-medium shrink-0 flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <Download className="w-3 h-3" />
                      Download
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
