const Task = require('../models/Task');
const User = require('../models/User');

// @desc    Create a new ProofLock Commitment
// @route   POST /api/v1/tasks
// @access  Private
exports.createTask = async (req, res, next) => {
  try {
    req.body.user = req.user.id;

    const task = await Task.create(req.body);

    res.status(201).json({
      success: true,
      data: task
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all tasks for the logged-in user
// @route   GET /api/v1/tasks
// @access  Private
exports.getTasks = async (req, res, next) => {
  try {
    const tasks = await Task.find({ user: req.user.id }).sort('-scheduledTime');

    res.status(200).json({
      success: true,
      count: tasks.length,
      data: tasks
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update task status (General Update)
// @route   PUT /api/v1/tasks/:id
// @access  Private
exports.updateTask = async (req, res, next) => {
  try {
    let task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ success: false, error: 'Task not found' });
    }

    if (task.user.toString() !== req.user.id) {
      return res.status(401).json({ success: false, error: 'Not authorized' });
    }

    task = await Task.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({ success: true, data: task });
  } catch (error) {
    next(error);
  }
};

// @desc    Upload photo proof & Update User Stats
// @route   PUT /api/v1/tasks/:id/proof
// @access  Private
exports.uploadTaskProof = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task || task.user.toString() !== req.user.id) {
      return res.status(404).json({ success: false, error: 'Task not found' });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, error: 'Please upload an image' });
    }

    // 1. Update Task as Completed with the Cloudinary URL
    task.status = 'completed';
    task.proofImage = req.file.path; 
    await task.save();

    // 2. Update Alex's stats for the dashboard
    const user = await User.findById(req.user.id);
    user.streak += 1;
    user.totalTasksCompleted += 1;
    
    // Calculate new success rate
    const total = user.totalTasksCompleted + user.totalTasksFailed;
    user.successRate = Math.round((user.totalTasksCompleted / total) * 100);

    await user.save();

    res.status(200).json({
      success: true,
      data: task,
      userStats: {
        streak: user.streak,
        successRate: user.successRate
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a task
// @route   DELETE /api/v1/tasks/:id
// @access  Private
exports.deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task || task.user.toString() !== req.user.id) {
      return res.status(404).json({ success: false, error: 'Task not found' });
    }

    await task.deleteOne();

    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    next(error);
  }
};