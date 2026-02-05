const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan'); // Optional: for logging requests
const authRoutes = require('./routes/authRoutes');

// Load env vars
dotenv.config();

const app = express();

// Body parser: allows us to receive JSON in req.body
app.use(express.json());

// Dev logging middleware (prints requests to your terminal)
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Mount Routers
// This means all routes in authRoutes will start with /api/v1/auth
app.use('/api/v1/auth', authRoutes);

// Simple health check route
app.get('/', (req, res) => {
  res.send('ProofLock API is running...');
});

module.exports = app;