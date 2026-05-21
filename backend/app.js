const express = require('express');
const cors = require('cors');
const path = require('path');
const morgan = require('morgan');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const rateLimit = require('express-rate-limit');
const { errorHandler, notFound } = require('./middleware/errorMiddleware');
const connectDB = require('./config/db');
require('./config/passport'); // Load Google OAuth strategy

// Routes
const authRoutes        = require('./routes/authRoutes');
const userRoutes        = require('./routes/userRoutes');
const jobRoutes         = require('./routes/jobRoutes');
const applicationRoutes = require('./routes/applicationRoutes');
const companyRoutes     = require('./routes/companyRoutes');
const resourceRoutes    = require('./routes/resourceRoutes');
const subscriberRoutes  = require('./routes/subscriberRoutes');
const adminRoutes       = require('./routes/adminRoutes');
const notificationRoutes = require('./routes/notificationRoutes');

const app = express();

// Trust proxy for rate limiter to work correctly behind Vercel
app.set('trust proxy', 1);

// Middleware: ensure MongoDB is connected before every request (critical for serverless)
// In traditional servers connectDB() runs once at startup; in Vercel serverless
// functions the module is re-initialized on cold starts, so we await here.
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error('DB connection failed:', err.message);
    return res.status(503).json({ success: false, message: 'Database unavailable. Please try again.' });
  }
});

// Initialize Passport (OAuth strategies)
const passport = require('passport');
app.use(passport.initialize());

// Security middleware
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(mongoSanitize());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: { success: false, message: 'Too many requests. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

// Auth rate limiter (stricter)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: { success: false, message: 'Too many auth attempts. Please try again later.' },
});
app.use('/api/auth/', authLimiter);

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// CORS
app.use(cors({
  origin: true, // Allow true to reflect origin (handles any Vercel preview domain dynamically)
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Static files (uploads)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Create an API router so we can mount it on multiple paths (local and Vercel)
const apiRouter = express.Router();

apiRouter.use('/auth', authLimiter, authRoutes);
apiRouter.use('/users', userRoutes);
apiRouter.use('/jobs', jobRoutes);
apiRouter.use('/applications', applicationRoutes);
apiRouter.use('/companies', companyRoutes);
apiRouter.use('/resources', resourceRoutes);
apiRouter.use('/subscribers', subscriberRoutes);
apiRouter.use('/admin', adminRoutes);
apiRouter.use('/notifications', notificationRoutes);

apiRouter.get('/health', (req, res) => {
  res.json({
    success: true,
    status: 'OK',
    message: 'JobPortal API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  });
});

// Mount on /api (works both locally and on Vercel)
app.use('/api', apiRouter);

// Error middleware (must be last)
app.use(notFound);
app.use(errorHandler);

module.exports = app;
