import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';

// Modular Route imports
import authRoutes from './modules/auth/auth.route.js';
import otpRoutes from './modules/otp/otp.route.js';
import ownerRoutes from './modules/owner/owner.routes.js';
import userRoutes from './modules/user/user.routes.js';

import { notFound, errorHandler } from './middlewares/errorHandler.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// CORS setup
const allowedOrigins = [
  process.env.FRONTEND_URL || 'http://localhost:3000',
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'https://ss-pharmacy.vercel.app',
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(null, true); // Allow all in dev
      }
    },
    credentials: true,
  })
);

// Body parsers (allow up to 25MB for prescription images)
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Root & Health check routes
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to Pharmacy Modular Backend API',
    status: 'healthy',
    timestamp: new Date().toISOString(),
    endpoints: {
      health: '/api/health',
      auth: '/api/auth',
      user: '/api/user',
      owner: '/api/owner',
    },
  });
});

app.get('/api', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Pharmacy Modular Backend API is running',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'My-Pharmacy Modular Backend (Owner & User Structure)',
  });
});

// ========================================================
// 📦 MOUNT MODULAR ROUTES (Role & Feature Separated)
// ========================================================
app.use('/api/auth', authRoutes);     // Staff, Owner & Customer authentication
app.use('/api/otp', otpRoutes);       // Email OTP & Password Reset
app.use('/api/owner', ownerRoutes);   // Business Owner & Staff Management APIs
app.use('/api/user', userRoutes);     // Customer & Storefront Public/User APIs

// Error Handling
app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🚀 Pharmacy Modular Backend running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  console.log(`🌐 Base API URL: http://localhost:${PORT}/api`);
  console.log(`👑 Owner API Root: http://localhost:${PORT}/api/owner`);
  console.log(`👤 User API Root:  http://localhost:${PORT}/api/user`);
});

export default app;
