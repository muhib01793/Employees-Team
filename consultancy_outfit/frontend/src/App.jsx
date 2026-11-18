import { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useQueryClient } from 'react-query';
import { useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import { Toaster } from 'react-hot-toast';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Employees from './pages/Employees';
import WorkSharing from './pages/WorkSharing';
import Chat from './pages/Chat';
import Meeting from './pages/Meeting';
import Documents from './pages/Documents';
import Layout from './components/Layout';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="animate-spin h-8 w-8 border-4 border-indigo-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  return children;
}

function App() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const handleBeforeUnload = () => {
      queryClient.clear();
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [queryClient]);

  return (
    <SocketProvider>
      <Toaster position="top-right" />
      <div className="min-h-screen text-gray-900">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route path="/" element={<Dashboard />} />
            <Route path="employees" element={<Employees />} />
            <Route path="work" element={<WorkSharing />} />
            <Route path="chat" element={<Chat />} />
            <Route path="meeting" element={<Meeting />} />
            <Route path="documents" element={<Documents />} />
          </Route>
        </Routes>
        <div className="fixed bottom-0 right-0 p-4 pointer-events-none" />
      </div>
    </SocketProvider>
  );
}

export default App;
