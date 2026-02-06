const express = require('express');
const { createAlarm, getMyAlarms } = require('../controllers/alarmController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// All routes here require the 'protect' middleware (must be logged in)
router.use(protect);

router
  .route('/')
  .get(getMyAlarms)
  .post(createAlarm);

module.exports = router;