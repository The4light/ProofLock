const express = require('express');
const dotenv = require('dotenv');

// 1. LOAD ENV VARS FIRST
dotenv.config(); 

// 2. NOW IMPORT ROUTES
const cors = require('cors');
const morgan = require('morgan');
const authRoutes = require('./routes/authRoutes');
const alarmRoutes = require('./routes/alarmRoutes');
const userRoutes = require('./routes/userRoutes');
const errorHandler = require('./middleware/errorMiddleware');

const app = express();

// ... rest of your middleware
// 1. MIDDLEWARE (Must come first)
app.use(cors());
// Allow larger payloads for base64 images (50mb is safe for photos)
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// 2. ROUTES
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/alarms', alarmRoutes);
app.use('/api/v1/user', userRoutes);

// Simple health checks
app.get('/', (req, res) => {
  res.send('ProofLock API is running...');
});

// 3. ERROR HANDLER (Must be last)
app.use(errorHandler);

module.exports = app;