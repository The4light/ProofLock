const express = require('express');
const router = express.Router();

// Import the controller functions we just created
const { register, login } = require('../controllers/authController');

// Define the URLs
// These will be prefixed by /api/auth in our main server file

// @route   POST /api/auth/register
router.post('/register', register);

// @route   POST /api/auth/login
router.post('/login', login);

module.exports = router;