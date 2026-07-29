require('dotenv').config();

if (!process.env.JWT_SECRET) {
  throw new Error("FATAL ERROR: JWT_SECRET is not defined in environment variables. Server cannot start.");
}

const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth.routes');
const toursRoutes = require('./routes/tours.routes');
const destinationsRoutes = require('./routes/destinations.routes');
const usersRoutes = require('./routes/users.routes');
const leadsRoutes = require('./routes/leads.routes');
const chatRoutes = require('./routes/chat.routes');
const ceoRoutes = require('./routes/ceo.routes');

const app = express();
const port = process.env.PORT || 5000;

const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175'
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin) || /^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin)) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'));
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Routes
app.use('/api', authRoutes);
app.use('/api/tours', toursRoutes);
app.use('/api/destinations', destinationsRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/leads', leadsRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/ceo', ceoRoutes);

if (require.main === module) {
  app.listen(port, () => {
    console.log(`Backend server running on port ${port}`);
  });
}

module.exports = app;

