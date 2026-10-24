const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const connectDB = require('./config/db');
const { ensureAdminExists } = require('./controllers/authController');

// Load environment variables from server/.env
dotenv.config({ path: path.join(__dirname, '.env') });

// Safe fallbacks for production/serverless hosting
process.env.JWT_SECRET =
  process.env.JWT_SECRET || 'classsathi_super_secret_jwt_key_2026_father_attendance';
process.env.ADMIN_DEFAULT_EMAIL = process.env.ADMIN_DEFAULT_EMAIL || 'admin@classsathi.com';
process.env.ADMIN_DEFAULT_PASSWORD = process.env.ADMIN_DEFAULT_PASSWORD || 'admin123';

// Connect to MongoDB
connectDB().then(() => {
  // Ensure default admin user is initialized
  ensureAdminExists();
});

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

// Ensure MongoDB connection and admin exist for serverless requests
app.use(async (req, res, next) => {
  try {
    await connectDB();
    await ensureAdminExists();
    next();
  } catch (err) {
    console.error('DB middleware error:', err);
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
const authRoutes = require('./routes/authRoutes');
const studentRoutes = require('./routes/studentRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');

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
  console.error('Unhandled server error:', err);
  res.status(500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

const PORT = process.env.PORT || 5000;

if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`🚀 ClassSathi Server running on port ${PORT}`);
    console.log(`🔗 Health check available at http://localhost:${PORT}/api/health`);
  });
}

module.exports = app;
