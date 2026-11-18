import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer } from 'http';
import connectDB from './config/db.js';
import initSocket from './config/socket.js';

// Routes
import authRoutes from './routes/authRoutes.js';
import companyRoutes from './routes/companyRoutes.js';
import teamRoutes from './routes/teamRoutes.js';
import messageRoutes from './routes/messageRoutes.js';
import documentRoutes from './routes/documentRoutes.js';
import userRoutes from './routes/userRoutes.js';
import workRoutes from './routes/workRoutes.js';

// Middleware
import errorHandler from './middleware/errorMiddleware.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Connect Database
connectDB();

const app = express();
// -------------------------------------------------------------------
// The following block creates an HTTP server and Socket.io **only** when the
// code is running locally or on a traditional VM. Vercel deploys the app as a
// serverless function, which cannot keep long‑living socket connections. In that
// environment we skip the server and socket creation and simply export the
// Express app.
// -------------------------------------------------------------------
let httpServer;
let io;
if (!process.env.VERCEL) {
  httpServer = createServer(app);
  io = initSocket(httpServer, {
    cors: {
      origin: (origin, callback) => callback(null, true),
      credentials: true,
    },
  });
  // Make io accessible in routes
  app.set('io', io);
}

// Body parsers
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(cookieParser());

// Static uploads folder
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// CORS
app.use(
  cors({
    origin: (origin, callback) => callback(null, true),
    credentials: true,
  })
);


// Health check
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'consultancy_outfit API is running',
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/companies', companyRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/users', userRoutes);
app.use('/api/work', workRoutes);

// Error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5001;

if (!process.env.VERCEL) {
  httpServer.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
  });
}

export default app;
