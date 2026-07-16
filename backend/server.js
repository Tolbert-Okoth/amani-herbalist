const express = require('express');
const cors = require('cors');
const path = require('path');
const { Pool } = require('pg');
require('dotenv').config({ path: path.join(__dirname, '.env') });

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

const productRoutes      = require('./routes/productRoutes');
const orderRoutes        = require('./routes/orderRoutes');
const mpesaRoutes        = require('./routes/mpesaRoutes');
const blogRoutes         = require('./routes/blogRoutes');
const consultationRoutes = require('./routes/consultationRoutes');
const authRoutes         = require('./routes/authRoutes');
const settingsRoutes     = require('./routes/settingsRoutes');
const leadRoutes         = require('./routes/leadRoutes');
const franchiseRoutes    = require('./routes/franchiseRoutes');
const eventRoutes        = require('./routes/eventRoutes');
const adsRoutes          = require('./routes/adsRoutes');
const regionalAdsRoutes  = require('./routes/adRoutes');
const documentRoutes     = require('./routes/documentRoutes');


const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');

const app = express();

// 🟢 0. Trust Proxy (Required for Render/Heroku load balancers)
app.set('trust proxy', 1);

// 🟢 1. Security Headers (HSTS, CSP, etc.)
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// 🟢 2. Cookie Parsing (Essential for Secure JWT authentication)
app.use(cookieParser());

// 🟢 3. Performance: GZip Compression
app.use(compression());

// 🟢 4. Strict CORS (Required for HttpOnly Cookies)
const isProd = process.env.NODE_ENV === 'production';
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
  'http://localhost:5176',
  'https://www.fohowedenlife.co.ke',
  'https://fohowedenlife.co.ke',
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // allow requests with no origin (like mobile apps or local scripts)
    if (!origin) return callback(null, true);
    
    const isLocalhost = origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:');
    const isVercel = origin.endsWith('.vercel.app');
    const isAllowed = isLocalhost || isVercel || allowedOrigins.includes(origin);

    if (isAllowed) {
      callback(null, true);
    } else {
      console.error(`[CORS Blocked]: Origin ${origin} not allowed`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true // 🟢 MANDATORY FOR HTTPONLY COOKIES
}));


// 🟢 4. Rate Limiting (Protects public forms from bots/spam)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
  message: { error: "Too many attempts. Protect your qi—please wait 15 minutes." }
});

// Sensitive public endpoints
app.use('/api/auth', limiter);
app.use('/api/mpesa', limiter);
app.use('/api/orders/checkout', limiter);
app.use('/api/consultations', limiter);
app.use('/api/leads', limiter);
app.use('/api/ads/track', limiter);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// Serve the 'uploads' folder statically so the frontend can view images
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health Check Route (To verify the server is live)
app.get('/', (req, res) => {
    res.json({ message: "Amani Herbalists Backend is running perfectly! " });
});

// API Routes
app.use('/api/products',      productRoutes);
app.use('/api/orders',        orderRoutes);
app.use('/api/mpesa',         mpesaRoutes);
app.use('/api/blogs',         blogRoutes);
app.use('/api/consultations', consultationRoutes);
app.use('/api/auth',          authRoutes);
app.use('/api/settings',      settingsRoutes);
app.use('/api/leads',         leadRoutes);
app.use('/api/franchises',    franchiseRoutes);
app.use('/api/events',        eventRoutes);
app.use('/api/banners',       adsRoutes);
app.use('/api/regional-promos', regionalAdsRoutes);
app.use('/api/documents',     documentRoutes);


// 🟢 5. CRITICAL: Environment Validation (Refuse to start without core secrets)
const requiredEnv = ['DATABASE_URL', 'JWT_SECRET', 'PORT'];
const missingEnv = requiredEnv.filter(key => !process.env[key]);

if (missingEnv.length > 0) {
  console.error(`❌ CRITICAL ERROR: Missing environment variables: ${missingEnv.join(', ')}`);
  console.error(`Ensure your .env file is correctly configured for production.`);
  process.exit(1);
}


// Global Error Handler (Catches unhandled errors gracefully)
app.use((err, req, res, next) => {
    // 🟠 Production Hardening: Don't leak stack traces
    const isProd = process.env.NODE_ENV === 'production';
    
    if (err.message.includes("File upload only supports images")) {
      return res.status(400).json({ error: err.message });
    }

    console.error(`[SERVER ERROR] ${err.message}`);
    if (!isProd) console.error(err.stack);

    res.status(err.status || 500).json({ 
      error: isProd ? 'Internal Server Error' : err.message,
      ...(isProd ? {} : { stack: err.stack })
    });
});

// 404 Handler
app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

const PORT = process.env.PORT || 5001; // Change this to 5001 just for a second

const server = app.listen(PORT, () => {
  console.log(`Amani Backend running on port ${PORT}`);
});

// Handle server errors
server.on('error', (err) => {
  console.error('Server error:', err);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
  });
});