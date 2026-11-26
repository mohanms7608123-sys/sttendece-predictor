import express from 'express';
import http from 'http';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

import { connectDB, getMongoConnectionStatus } from './config/db.js';
import { initSocket } from './socket.js';
import { authenticateToken, optionalAuth, requireRole } from './middleware/auth.js';

import * as authCtrl from './controllers/authController.js';
import * as menuCtrl from './controllers/menuController.js';
import * as slotCtrl from './controllers/slotController.js';
import * as orderCtrl from './controllers/orderController.js';
import * as paymentCtrl from './controllers/paymentController.js';
import * as settingCtrl from './controllers/settingController.js';
import * as auditCtrl from './controllers/auditController.js';
import * as ratingCtrl from './controllers/ratingController.js';
import * as notifCtrl from './controllers/notificationController.js';
import attendanceRoutes from './routes/attendanceRoutes.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);

// Initialize Socket.IO
initSocket(server);

// Production-ready CORS handling for Netlify, Render, Vercel, and localhost
const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (/^http:\/\/localhost(:\d+)?$/.test(origin)) return callback(null, true);
    if (/^https:\/\/.*\.netlify\.app$/.test(origin)) return callback(null, true);
    if (/^https:\/\/.*\.vercel\.app$/.test(origin)) return callback(null, true);
    if (/^https:\/\/.*\.onrender\.com$/.test(origin)) return callback(null, true);
    if (process.env.FRONTEND_URL && origin.replace(/\/$/, '') === process.env.FRONTEND_URL.replace(/\/$/, '')) {
      return callback(null, true);
    }
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Ensure /api prefix compatibility on serverless platforms (e.g. Vercel)
app.use((req, res, next) => {
  if (!req.url.startsWith('/api') && !req.url.startsWith('/uploads') && !req.url.startsWith('/socket.io')) {
    req.url = '/api' + (req.url.startsWith('/') ? req.url : '/' + req.url);
  }
  next();
});

// Static directory for uploaded images
const uploadPath = path.join(process.cwd(), 'public', 'uploads');
app.use('/uploads', express.static(uploadPath));

// Health check endpoint
app.get(['/api/health', '/health'], (req, res) => {
  const isMongo = getMongoConnectionStatus();
  res.json({
    status: 'ok',
    service: 'Smart Student Attendance and Predictor System',
    database: isMongo ? 'mongodb_connected' : 'embedded_store_active',
    databaseStatus: isMongo ? 'MongoDB Atlas Cloud Online' : 'Embedded Persistent Store Active',
    timestamp: new Date().toISOString(),
    uptime: Math.round(process.uptime()),
    version: '1.0.0',
  });
});

// Smart Student Attendance and Predictor System API
app.use('/api/attendance', attendanceRoutes);

// Auth routes
app.post('/api/auth/signup', authCtrl.signUp);
app.post('/api/auth/signin', authCtrl.signIn);
app.get('/api/auth/me', authenticateToken, authCtrl.getMe);
app.put('/api/auth/profile', authenticateToken, authCtrl.updateProfile);

// Menu routes
app.get('/api/menu', menuCtrl.getMenuItems);
app.post('/api/menu', authenticateToken, requireRole('admin', 'canteen_owner'), menuCtrl.createMenuItem);
app.put('/api/menu/:id', authenticateToken, requireRole('admin', 'canteen_owner'), menuCtrl.updateMenuItem);
app.delete('/api/menu/:id', authenticateToken, requireRole('admin', 'canteen_owner'), menuCtrl.deleteMenuItem);
app.post('/api/upload', authenticateToken, requireRole('admin', 'canteen_owner'), menuCtrl.uploadImage);

// Time Slots routes
app.get('/api/time-slots', slotCtrl.getTimeSlots);
app.post('/api/time-slots', authenticateToken, requireRole('admin', 'canteen_owner'), slotCtrl.createTimeSlot);
app.put('/api/time-slots/:id', authenticateToken, requireRole('admin', 'canteen_owner'), slotCtrl.updateTimeSlot);
app.delete('/api/time-slots/:id', authenticateToken, requireRole('admin', 'canteen_owner'), slotCtrl.deleteTimeSlot);

// Order routes
app.post('/api/orders', optionalAuth, orderCtrl.createOrder);
app.get('/api/orders/student/:userId', orderCtrl.getStudentOrders);
app.get('/api/orders/canteen', authenticateToken, requireRole('admin', 'canteen_owner'), orderCtrl.getCanteenOrders);
app.get('/api/orders/:id', orderCtrl.getOrderById);
app.put('/api/orders/:id/status', authenticateToken, requireRole('admin', 'canteen_owner'), orderCtrl.updateOrderStatus);

// Payment routes
app.post('/api/payments/create-order', paymentCtrl.createRazorpayOrder);
app.post('/api/payments/verify', optionalAuth, paymentCtrl.verifyRazorpayPayment);

// Settings routes
app.get('/api/settings', settingCtrl.getSettings);
app.put('/api/settings', authenticateToken, requireRole('admin'), settingCtrl.updateSetting);

// Audit logs routes
app.get('/api/audit-logs', authenticateToken, requireRole('admin'), auditCtrl.getAuditLogs);
app.get('/api/audit-logs/event-types', authenticateToken, requireRole('admin'), auditCtrl.getAuditLogEventTypes);

// Ratings routes
app.get('/api/ratings/menu', ratingCtrl.getMenuItemRatings);
app.get('/api/ratings/user', optionalAuth, ratingCtrl.getUserRatings);
app.post('/api/ratings', optionalAuth, ratingCtrl.submitRating);
app.delete('/api/ratings', optionalAuth, ratingCtrl.deleteRating);

// Notification routes
app.post('/api/notifications/sms', notifCtrl.sendSmsNotification);
app.post('/api/notifications/email', notifCtrl.sendEmailNotification);
app.post('/api/notifications/push', notifCtrl.sendPushNotification);
app.post('/api/push/subscriptions', notifCtrl.savePushSubscription);
app.delete('/api/push/subscriptions', notifCtrl.deletePushSubscription);
app.get('/api/push/vapid-key', (req, res) => {
  res.json({ vapidPublicKey: 'BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgD zk8zL0T99k9iYwU303c7W1uXn0Q2Zc74' });
});

// Serve Frontend build in production / single-service deployments
const distPath = path.join(process.cwd(), 'dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.use((req, res, next) => {
    if (req.method === 'GET' && !req.path.startsWith('/api') && !req.path.startsWith('/uploads') && !req.path.startsWith('/socket.io')) {
      return res.sendFile(path.join(distPath, 'index.html'));
    }
    next();
  });
}

// Start server
const PORT = process.env.PORT || 5000;

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.log(`[i] Port ${PORT} already active, reusing existing backend server.`);
  } else {
    console.error('Server error:', err);
  }
});

async function start() {
  await connectDB();
  server.listen(PORT, () => {
    console.log(`[+] CampusBite Backend running on port ${PORT}`);
    console.log(`[+] API available at http://localhost:${PORT}/api`);
    console.log(`[+] Realtime Socket.IO initialized`);
  });
}

// Only listen on port when not running as a serverless function (e.g. Vercel)
if (!process.env.VERCEL && !process.env.AWS_LAMBDA_FUNCTION_NAME) {
  start();
}

export default app;
export { app, server };
