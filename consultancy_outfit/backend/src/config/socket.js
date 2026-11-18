import { Server } from 'socket.io';

let io;

const initSocket = (httpServer, options) => {
  io = new Server(httpServer, options);

  // Permissive auth middleware so connection doesn't reject abruptly
  io.use((socket, next) => {
    next();
  });

  io.on('connection', (socket) => {
    console.log(`⚡ Socket connected: ${socket.id}`);

    // Join personal user room
    socket.on('join_user', (userId) => {
      if (userId) {
        socket.join(`user_${userId}`);
        console.log(`👤 User ${userId} joined room user_${userId}`);
      }
    });

    // Join meeting / video room
    socket.on('join_room', (roomId) => {
      if (roomId) {
        socket.join(roomId);
        socket.to(roomId).emit('user_joined', { socketId: socket.id });
        console.log(`📹 Socket ${socket.id} joined meeting room: ${roomId}`);
      }
    });

    // Call signaling (offer, answer, ice candidates)
    socket.on('call_signal', (data) => {
      if (data && data.room) {
        socket.to(data.room).emit('call_signal', data);
      }
    });

    // Join company room
    socket.on('join_company', (companyId) => {
      socket.join(`company_${companyId}`);
    });

    // Join direct message room
    socket.on('join_dm', (dmId) => {
      socket.join(`dm_${dmId}`);
    });

    // Typing indicator
    socket.on('typing', ({ room, user }) => {
      socket.to(room).emit('typing', { user });
    });

    socket.on('stop_typing', ({ room }) => {
      socket.to(room).emit('stop_typing');
    });

    // New message
    socket.on('send_message', (data) => {
      if (data.room) {
        io.to(data.room).emit('receive_message', data);
      }
    });

    socket.on('disconnect', () => {
      console.log(`⚡ Socket disconnected: ${socket.id}`);
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }
  return io;
};

export default initSocket;
