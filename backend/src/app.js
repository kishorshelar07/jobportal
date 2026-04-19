require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const path = require('path');
const AppError = require('./utils/AppError');
const { formatError } = require('./utils/formatResponse');
const { generalLimiter } = require('./middleware/rateLimiter');

const app = express();

// ─── Security headers ──────────────────────────────────
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

// ─── CORS ──────────────────────────────────────────────
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// ─── Body parsing ──────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// ─── Logging ───────────────────────────────────────────
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan(process.env.NODE_ENV === 'development' ? 'dev' : 'combined'));
}

// ─── Rate limiting ─────────────────────────────────────
app.use('/api/', generalLimiter);

// ─── Static file serving (uploads) ────────────────────
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// ─── Routes ────────────────────────────────────────────
app.use('/api/v1/auth', require('./routes/v1/auth.routes'));
app.use('/api/v1/profile', require('./routes/v1/profile.routes'));
app.use('/api/v1/jobs', require('./routes/v1/jobs.routes'));
app.use('/api/v1/recruiter', require('./routes/v1/recruiter.routes'));
app.use('/api/v1/admin', require('./routes/v1/admin.routes'));
app.use('/api/v1/notifications', require('./routes/v1/notifications.routes'));

// ─── Health check ──────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'JobPortal API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  });
});

// ─── 404 handler ───────────────────────────────────────
app.all('*', (req, res) => {
  formatError(res, {
    statusCode: 404,
    message: `Route ${req.originalUrl} not found.`,
  });
});

// ─── Global error handler ──────────────────────────────
app.use((err, req, res, next) => {
  console.error(`❌ [${new Date().toISOString()}] ${err.message}`);
  if (process.env.NODE_ENV === 'development') {
    console.error(err.stack);
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {}).join(', ');
    return formatError(res, {
      statusCode: 409,
      message: `A record with that ${field} already exists.`,
    });
  }

  // Mongoose validation
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map((e) => ({
      field: e.path,
      message: e.message,
    }));
    return formatError(res, { statusCode: 422, message: 'Validation failed', errors });
  }

  // Mongoose cast error
  if (err.name === 'CastError') {
    return formatError(res, { statusCode: 400, message: 'Invalid ID format.' });
  }

  // Multer errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    return formatError(res, { statusCode: 400, message: 'File is too large.' });
  }

  // Operational errors
  if (err.isOperational) {
    return formatError(res, {
      statusCode: err.statusCode,
      message: err.message,
      errors: err.errors || [],
    });
  }

  // Unknown errors
  return formatError(res, {
    statusCode: 500,
    message: 'Something went wrong. Please try again later.',
  });
});

module.exports = app;
