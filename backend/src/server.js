import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import connectDB from './config/database.js';

import comicRoutes from './routes/comicRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import chapterRoutes from './routes/chapterRoutes.js';
import commentRouter from './routes/commentRoutes.js';
import userRoutes from './routes/userRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import authRoutes from './routes/authRoutes.js';
import { errorHandler } from './middlewares/errorHandler.js';

const app = express();

// Connect to Database
connectDB();

// Security HTTP headers
app.use(helmet({
  crossOriginResourcePolicy: false,
}));

// CORS Configuration
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true,
}));

// Rate limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  message: {
    success: false,
    message: 'Quá nhiều yêu cầu từ địa chỉ IP này, vui lòng thử lại sau 15 phút.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: {
    success: false,
    message: 'Quá nhiều lượt đăng nhập/đăng ký từ IP này, vui lòng thử lại sau 15 phút.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api', apiLimiter);
app.use('/api/auth', authLimiter);

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    service: 'metruyen-backend-api'
  });
});

// Application API routes
app.use('/api/comics', comicRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/chapters', chapterRoutes);
app.use('/api/comics/:comicId/comments', commentRouter);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/auth', authRoutes);

// Global Error Handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

export default app;