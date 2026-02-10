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