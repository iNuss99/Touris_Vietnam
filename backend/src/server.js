require('dotenv').config();

if (!process.env.JWT_SECRET) {
  console.warn("WARNING: JWT_SECRET is not defined in environment variables. Using default fallback secret.");
  process.env.JWT_SECRET = 'touris_vietnam_jwt_secret_key_2026_fallback';
}

const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth.routes');
const toursRoutes = require('./routes/tours.routes');
const destinationsRoutes = require('./routes/destinations.routes');
const usersRoutes = require('./routes/users.routes');
const leadsRoutes = require('./routes/leads.routes');
const ceoRoutes = require('./routes/ceo.routes');

const app = express();
const port = process.env.PORT || 5000;

const allowedOrigins = [
  process.env.FRONTEND_URL,
  'https://tour-vietnam.vercel.app',
  'https://touris-vietnam-api.vercel.app',
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175'
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin) || /^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin) || /\.vercel\.app$/.test(origin)) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'));
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Root & Status Routes
app.get('/', (req, res) => {
  res.json({ success: true, message: 'Touris Vietnam API Server is running' });
});

app.get('/api', (req, res) => {
  res.json({ success: true, message: 'Touris Vietnam API Endpoints' });
});

// Routes
app.use('/api', authRoutes);
app.use('/api/tours', toursRoutes);
app.use('/api/destinations', destinationsRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/leads', leadsRoutes);
app.use('/api/ceo', ceoRoutes);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'API Endpoint Not Found' });
});

// Global Error Handler Middleware
app.use((err, req, res, next) => {
  console.error('[SERVER ERROR]', err.stack || err);
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

if (require.main === module) {
  app.listen(port, () => {
    console.log(`Backend server running on port ${port}`);
  });
}

module.exports = app;

