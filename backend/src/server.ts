import dotenv from 'dotenv';
dotenv.config();

import { connectDB } from './config/db';
import app from './app';

// Add these handlers at the top of the file
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // Application specific logging, throwing an error, or other logic here
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  // Application specific logging, throwing an error, or other logic here
});

dotenv.config();

const PORT = parseInt(process.env.PORT || '5003', 10);

export const startServer = async () => {
  process.on('exit', (code) => {
    console.log(`[Process Exit] Code: ${code}`);
  });

  // Only handle SIGINT in production
  if (process.env.NODE_ENV === 'production') {
    process.on('SIGINT', () => {
      console.log('Received SIGINT, shutting down');
      process.exit(0);
    });
  }

  try {
    await connectDB();
    const server = app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server is running on http://localhost:${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    });

    server.on('error', (error: any) => {
      console.error('Server listen error:', error);
      process.exit(1);
    });

    server.on('close', () => {
      console.log('HTTP server closed');
    });

  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
