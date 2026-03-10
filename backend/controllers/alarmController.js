const Alarm = require('../models/Alarm');

// @desc    Create new commitment
// @route   POST /api/v1/alarms
// @access  Private
exports.createAlarm = async (req, res) => {
  try {
    req.body.user = req.user.id;
    req.body.type = 'basic'; // ← ADD THIS

    const alarm = await Alarm.create(req.body);
    res.status(201).json({ success: true, data: alarm });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};


// @desc    Get all commitments for the user
// @route   GET /api/v1/alarms
// @access  Private
exports.getMyAlarms = async (req, res) => {
  try {
    const alarms = await Alarm.find({ user: req.user.id }).sort('-startDate');

    res.status(200).json({
      success: true,
      count: alarms.length,
      data: alarms
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Update alarm status
// @route   PATCH /api/v1/alarms/:id/status
// @access  Private
exports.updateAlarmStatus = async (req, res) => {
  try {
    const { status } = req.body;
    
    const alarm = await Alarm.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id }, // Security: ensures only the owner can update it
      { status: status },
      { new: true, runValidators: true }
    );

    if (!alarm) {
      return res.status(404).json({ success: false, error: 'Alarm not found' });
    }

    res.status(200).json({ success: true, data: alarm });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// Get a single alarm by ID
exports.getAlarmById = async (req, res) => {
  try {
    const alarm = await Alarm.findById(req.params.id);

    if (!alarm) {
      return res.status(404).json({
        success: false,
        message: 'Alarm not found'
      });
    }

    // Security check: Ensure this alarm belongs to the user asking for it
    if (alarm.user.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to view this alarm'
      });
    }

    res.status(200).json({
      success: true,
      data: alarm
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

// backend/controllers/alarmController.js

exports.createAdvancedAlarm = async (req, res) => {
  try {
    req.body.user = req.user.id;

    const parseLocalDateTime = (dateStr, timeStr) => {
      // dateStr: "2026-03-10", timeStr: "17:28"
      // Split manually to avoid UTC interpretation
      const [year, month, day] = dateStr.split('-').map(Number);
      const [hours, minutes] = (timeStr || '00:00').split(':').map(Number);
      
      // new Date(year, month-1, day, hours, minutes) = LOCAL time, no UTC shift
      return new Date(year, month - 1, day, hours, minutes, 0, 0);
    };

    if (req.body.dates && req.body.dates.length > 0) {
      const sortedDates = [...req.body.dates].sort();
      const now = new Date();

      // Find the first date+time combo that is still in the future
      const nextFutureDate = sortedDates.find(dateStr => {
        const dt = parseLocalDateTime(dateStr, req.body.startTime);
        return dt > now;
      });

      // Use first future date, or fall back to the first date selected
      const targetDate = nextFutureDate || sortedDates[0];
      req.body.startDate = parseLocalDateTime(targetDate, req.body.startTime);

    } else if (req.body.isIndefinite) {
      const [hours, minutes] = (req.body.startTime || '00:00').split(':').map(Number);
      const now = new Date();
      const combined = new Date();
      combined.setHours(hours, minutes, 0, 0);

      // If today's time has already passed, schedule for tomorrow
      if (combined <= now) {
        combined.setDate(combined.getDate() + 1);
      }
      req.body.startDate = combined;

    } else {
      req.body.startDate = new Date();
    }

    const alarmData = {
      ...req.body,
      type: 'advanced',
      isRecurring: req.body.isIndefinite,
      sessionReminders: req.body.remindersEnabled,
      afterActionReportEnabled: req.body.aarEnabled
    };

    const alarm = await Alarm.create(alarmData);
    res.status(201).json({ success: true, data: alarm });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};
    // Add this to your alarmController.js
  exports.getAdvancedAlarm = async (req, res) => {
    try {
      const alarm = await Alarm.findOne({
        _id: req.params.id,
        user: req.user.id // Security: Ensure they can only see their own mission
      });

      if (!alarm) {
        return res.status(404).json({
          success: false,
          error: 'Mission not found'
        });
      }

      res.status(200).json({
        success: true,
        data: alarm
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'System failure retrieving mission data'
      });
    }
  };