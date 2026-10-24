const express = require('express');
const cors = require('cors');
const connectDB = require('./_config/db');
const { ensureAdminExists } = require('./_controllers/authController');

// Safe fallbacks for production/serverless hosting
process.env.JWT_SECRET =
  process.env.JWT_SECRET || 'classsathi_super_secret_jwt_key_2026_father_attendance';
process.env.ADMIN_DEFAULT_EMAIL = process.env.ADMIN_DEFAULT_EMAIL || 'admin@classsathi.com';
process.env.ADMIN_DEFAULT_PASSWORD = process.env.ADMIN_DEFAULT_PASSWORD || 'admin123';

const app = express();

// Middlewares
app.use(
  cors({
    origin: true,
    credentials: true
  })
);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Ensure MongoDB connection before handling requests (for serverless/Vercel)
app.use(async (req, res, next) => {
  try {
    await connectDB();
    await ensureAdminExists();
    next();
  } catch (err) {
    console.error('Serverless DB middleware error:', err);
    next();
  }
});

// Health check endpoint
const healthHandler = (req, res) => {
  res.json({
    status: 'online',
    appName: 'ClassSathi Attendance System',
    timestamp: new Date().toISOString()
  });
};
app.get('/api/health', healthHandler);
app.get('/health', healthHandler);

// API Routes - mounted on both /api/* and /* to handle any serverless rewrite
const authRoutes = require('./_routes/authRoutes');
const studentRoutes = require('./_routes/studentRoutes');
const attendanceRoutes = require('./_routes/attendanceRoutes');
const dashboardRoutes = require('./_routes/dashboardRoutes');

app.use('/api/auth', authRoutes);
app.use('/auth', authRoutes);

app.use('/api/students', studentRoutes);
app.use('/students', studentRoutes);

app.use('/api/attendance', attendanceRoutes);
app.use('/attendance', attendanceRoutes);

app.use('/api/dashboard', dashboardRoutes);
app.use('/dashboard', dashboardRoutes);

// 404 handler for unmatched API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({ success: false, message: 'API Route Not Found' });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled serverless error:', err);
  res.status(500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

module.exports = app;
