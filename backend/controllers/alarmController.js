const Alarm = require('../models/Alarm');

// @desc    Create new commitment
// @route   POST /api/v1/alarms
// @access  Private
exports.createAlarm = async (req, res) => {
  try {
    // Automatically link the commitment to the logged-in user
    req.body.user = req.user.id;

    const alarm = await Alarm.create(req.body);

    res.status(201).json({
      success: true,
      data: alarm
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
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