import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { captureRequestData } from './middleware/errorRecovery';
import { notFound } from './middleware/notFound';
import { errorHandler } from './middleware/errorHandler';
import authRoutes from './routes/auth';
import noteRoutes from './routes/notes';
import fileRoutes from './routes/files';
import whiteboardRoutes from './routes/whiteboard';
import teacherRoutes from './routes/teacher';
import recoveryRoutes from './routes/recovery';
import forumRoutes from './routes/forumRoutes';

dotenv.config();

const app = express();

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// Middleware to capture request data for error recovery
app.use(captureRequestData);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'UP' });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/files', fileRoutes);
app.use('/api/whiteboards', whiteboardRoutes);
app.use('/api/teachers', teacherRoutes);
app.use('/api/recovery', recoveryRoutes);
app.use('/api/forum', forumRoutes);


// Error handling middleware
app.use(notFound);
app.use(errorHandler);

export default app;
