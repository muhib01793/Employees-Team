import { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const isLocalhost =
      window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    const backendUrl = import.meta.env.VITE_BACKEND_URL;

    // Only connect if explicit backend URL is provided, or running locally
    const socketUrl = backendUrl || (isLocalhost ? 'http://localhost:5001' : null);

    if (!socketUrl) {
      // Safe no-op mock socket for preview/demo deployment
      const mockSocket = {
        id: 'mock-socket-' + Math.random().toString(36).substring(2, 7),
        connected: false,
        on: (event, callback) => {},
        off: (event, callback) => {},
        emit: (event, data) => {},
        disconnect: () => {},
      };
      setSocket(mockSocket);
      return;
    }

    const token = localStorage.getItem('token');
    const newSocket = io(socketUrl, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 3,
      timeout: 5000,
    });

    newSocket.on('connect', () => {
      console.log('Socket connected:', newSocket.id);
    });

    newSocket.on('disconnect', () => {
      console.log('Socket disconnected');
    });

    newSocket.on('connect_error', () => {
      // Suppress spam
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []);

  const value = { socket };

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within SocketProvider');
  }
  return context;
};
