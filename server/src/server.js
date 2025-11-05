import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import multer from 'multer';
import { connectDB } from './config/database.js';

// Import routes
import authRoutes from './routes/authRoutes.js';
import studentRoutes from './routes/studentRoutes.js';
import transcriptRoutes from './routes/transcriptRoutes.js';
import requestRoutes from './routes/requestRoutes.js';

// Load environment variables FIRST
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/transcripts', transcriptRoutes);
app.use('/api/requests', requestRoutes);

// Error handling middleware - must be before 404 handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  // Handle multer errors
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File too large. Maximum size is 10MB.',
      });
    }
    return res.status(400).json({
      success: false,
      message: err.message || 'File upload error',
    });
  }
  
  // Handle other errors
  if (err) {
    return res.status(err.status || 500).json({
      success: false,
      message: err.message || 'Internal Server Error',
    });
  }
  
  next();
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

// Connect to MongoDB and start server
const startServer = async () => {
  try {
    // Initialize Pinata after dotenv has loaded
    const { initializePinata } = await import('./config/pinata.js');
    const pinataInstance = initializePinata();
    if (pinataInstance) {
      console.log('✅ Pinata configured and ready for file uploads');
    } else {
      console.warn('⚠️ Pinata not configured - file uploads will use fallback mode');
    }
    
    // Try to connect to MongoDB, but don't block server startup
    connectDB().catch((err) => {
      console.warn('⚠️ MongoDB connection failed:', err.message);
      console.warn('⚠️ Server will continue running but database operations will fail.');
      console.warn('⚠️ Please check your MONGO_URI in .env file');
    });

    // Start server regardless of MongoDB connection
    const server = app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🌐 API available at: http://localhost:${PORT}/api`);
      console.log(`💚 Health check: http://localhost:${PORT}/api/health`);
    });

    // Handle server errors (like port already in use)
    server.on('error', (error) => {
      if (error.code === 'EADDRINUSE') {
        console.error(`❌ Port ${PORT} is already in use!`);
        console.error(`   Please either:`);
        console.error(`   1. Stop the process using port ${PORT}`);
        console.error(`   2. Change PORT in .env file to a different port`);
        console.error(`   3. Kill the process: netstat -ano | findstr :${PORT} then taskkill /PID <PID> /F`);
      } else {
        console.error('❌ Server error:', error);
      }
      process.exit(1);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

