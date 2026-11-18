import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import api, { endpoints } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { downloadDocumentFile } from '../utils/downloadFile';
import {
  FileText,
  Upload,
  Download,
  Trash2,
  Search,
  Plus,
  FileCheck,
  FileCode,
  FileSpreadsheet,
  AlertCircle,
} from 'lucide-react';
import toast from 'react-hot-toast';

const Documents = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const fileInputRef = useRef(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [docTitle, setDocTitle] = useState('');
  const [docDescription, setDocDescription] = useState('');

  // Fetch real documents from API
  const { data: documents, isLoading } = useQuery({
    queryKey: ['documents'],
    queryFn: async () => {
      const res = await api.get(endpoints.documents.list);
      return res.data.documents || [];
    },
  });

  // Upload mutation
  const uploadMutation = useMutation({
    mutationFn: async (formData) => {
      const res = await api.post(endpoints.documents.upload, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return res.data;
    },
    onSuccess: () => {
      toast.success('PDF/Document uploaded successfully!');
      queryClient.invalidateQueries(['documents']);
      setIsModalOpen(false);
      setSelectedFile(null);
      setDocTitle('');
      setDocDescription('');
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to upload document');
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      await api.delete(`${endpoints.documents.list}/${id}`);
    },
    onSuccess: () => {
      toast.success('Document deleted');
      queryClient.invalidateQueries(['documents']);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to delete document');
    },
  });

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      if (!docTitle) {
        setDocTitle(file.name.replace(/\.[^/.]+$/, ''));
      }
    }
  };

  const handleUploadSubmit = (e) => {
    e.preventDefault();
    if (!selectedFile) {
      toast.error('Please select a file to upload');
      return;
    }

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('title', docTitle || selectedFile.name);
    formData.append('description', docDescription);

    uploadMutation.mutate(formData);
  };

  const handleDownload = (doc) => {
    downloadDocumentFile(doc);
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const getFileIcon = (fileType) => {
    if (fileType?.includes('pdf')) {
      return <FileText className="w-5 h-5 text-red-500" />;
    }
    if (fileType?.includes('sheet') || fileType?.includes('excel')) {
      return <FileSpreadsheet className="w-5 h-5 text-green-600" />;
    }
    return <FileCode className="w-5 h-5 text-indigo-500" />;
  };

  const filteredDocs = (documents || []).filter(
    (d) =>
      d.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.fileName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.uploadedBy?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Documents & PDF Center</h1>
          <p className="text-sm text-gray-600 mt-1">
            Upload PDFs, reports, presentations, and team files. Download anytime with 1-click.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-lg font-medium shadow-sm transition-colors text-sm"
        >
          <Upload className="w-4 h-4" />
          Upload Document / PDF
        </button>
      </div>

      {/* Search & Stats Bar */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search documents by name or uploader..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
          <span className="text-xs text-gray-500 font-medium">
            Total Files: <strong className="text-indigo-600">{filteredDocs.length}</strong>
          </span>
        </div>

        {/* Documents Table */}
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="text-center py-16">
              <div className="animate-spin h-8 w-8 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto mb-3" />
              <p className="text-gray-500 text-sm">Loading documents...</p>
            </div>
          ) : filteredDocs.length === 0 ? (
            <div className="text-center py-16 px-4">
              <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <h3 className="text-base font-semibold text-gray-800">No Documents Uploaded Yet</h3>
              <p className="text-xs text-gray-500 mt-1">Click "Upload Document / PDF" above to upload your first file.</p>
            </div>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  <th className="px-6 py-3">Document Title</th>
                  <th className="px-6 py-3">Original File</th>
                  <th className="px-6 py-3">Size</th>
                  <th className="px-6 py-3">Uploaded By</th>
                  <th className="px-6 py-3">Date</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 text-sm">
                {filteredDocs.map((doc) => (
                  <tr key={doc._id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center shrink-0">
                          {getFileIcon(doc.fileType)}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 text-sm">{doc.title}</p>
                          {doc.description && (
                            <p className="text-xs text-gray-500 line-clamp-1">{doc.description}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs font-mono text-gray-600 truncate max-w-[180px]">
                      {doc.fileName}
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-600 font-medium">
                      {formatFileSize(doc.fileSize)}
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-700">
                      <div className="font-medium">{doc.uploadedBy?.name || 'User'}</div>
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-500">
                      {new Date(doc.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleDownload(doc)}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-xs font-semibold transition-colors"
                          title="Download PDF/File"
                        >
                          <Download className="w-3.5 h-3.5" />
                          Download
                        </button>
                        {(doc.uploadedBy?._id === user?._id || user?.role === 'admin') && (
                          <button
                            onClick={() => {
                              if (window.confirm(`Delete "${doc.title}"?`)) {
                                deleteMutation.mutate(doc._id);
                              }
                            }}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete file"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Upload Document Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl animate-fade-in">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Upload className="w-5 h-5 text-indigo-600" />
                Upload PDF / Document
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 text-sm font-semibold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="mt-4 space-y-3.5">
              {/* File Drop / Select Area */}
              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">Select File *</label>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-gray-300 hover:border-indigo-500 rounded-xl p-6 text-center cursor-pointer transition-colors bg-gray-50/50"
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    required
                    onChange={handleFileChange}
                    className="hidden"
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.png,.jpg,.jpeg"
                  />
                  {selectedFile ? (
                    <div>
                      <FileCheck className="w-8 h-8 text-green-600 mx-auto mb-2" />
                      <p className="text-sm font-semibold text-gray-800">{selectedFile.name}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{formatFileSize(selectedFile.size)}</p>
                      <span className="text-[11px] text-indigo-600 font-semibold mt-2 inline-block">
                        Click to change file
                      </span>
                    </div>
                  ) : (
                    <div>
                      <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm font-semibold text-gray-700">Click to choose a PDF or file</p>
                      <p className="text-xs text-gray-500 mt-1">PDF, Word, Excel, Images up to 50MB</p>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">Document Title</label>
                <input
                  type="text"
                  placeholder="e.g. Q3 Consultancy Audit Report"
                  value={docTitle}
                  onChange={(e) => setDocTitle(e.target.value)}
                  className="w-full px-3.5 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">Description (Optional)</label>
                <textarea
                  rows={2}
                  placeholder="Notes about this document..."
                  value={docDescription}
                  onChange={(e) => setDocDescription(e.target.value)}
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
                  disabled={uploadMutation.isLoading || !selectedFile}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white rounded-lg text-sm font-semibold transition-colors flex items-center gap-2"
                >
                  {uploadMutation.isLoading ? 'Uploading...' : 'Upload Now'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Documents;
