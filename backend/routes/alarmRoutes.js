const express = require('express');
const { createAlarm, getMyAlarms, updateAlarmStatus } = require('../controllers/alarmController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// All routes here require the 'protect' middleware (must be logged in)
router.use(protect);

router
  .route('/')
  .get(getMyAlarms)
  .post(createAlarm);

router.patch('/:id/status', updateAlarmStatus); 

module.exports = router;