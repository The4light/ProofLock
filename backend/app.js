const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const morgan = require('morgan');
const authRoutes = require('./routes/authRoutes');
const alarmRoutes = require('./routes/alarmRoutes');
const errorHandler = require('./middleware/errorMiddleware');

// Load env vars
dotenv.config();

const app = express();

// 1. MIDDLEWARE (Must come first)
app.use(express.json());
app.use(cors());

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// 2. ROUTES
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/alarms', alarmRoutes);

// Simple health checks
app.get('/', (req, res) => {
  res.send('ProofLock API is running...');
});

// 3. ERROR HANDLER (Must be last)
app.use(errorHandler);

module.exports = app;