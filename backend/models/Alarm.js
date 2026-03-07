const mongoose = require('mongoose');

const AlarmSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  goal: { 
    type: String,
    required: [true, 'Please add a goal name'],
    trim: true
  },
  // ── NEW: distinguishes basic from advanced on the dashboard
  type: {
    type: String,
    enum: ['basic', 'advanced'],
    default: 'basic'
  },
  category: { 
    type: String, 
    enum: ['Fitness', 'Study', 'Deep Work', 'General'], 
    default: 'General' 
  },
  dates: [String],
  isRecurring: { 
    type: Boolean, 
    default: false 
  },
  startDate: { 
    type: Date, 
    required: true 
  },
  endDate: { type: Date },
  startTime: { 
    type: String
    // Not required globally — basic alarms don't use this
  },
  // ── NEW: advanced alarms send an endTime string e.g. "07:00"
  endTime: {
    type: String
  },
  protocol: [{
    task: { type: String, required: true },
    completed: { type: Boolean, default: false }
  }],
  sessionReminders: { 
    type: Boolean, 
    default: true
  },
  afterActionReportEnabled: { 
    type: Boolean, 
    default: true
  },
  aarContent: { 
    type: String, 
    default: "" 
  },
  proofMethod: { 
    type: String, 
    enum: ['photo', 'ai_chat', 'puzzle', 'qr'],
    default: 'photo'
  },
  penalty: {
    type: Number,
    default: 10 
  },
  status: {
    type: String,
    enum: ['upcoming', 'active', 'completed', 'failed'],
    default: 'upcoming'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

AlarmSchema.virtual('time').get(function() {
  return this.startDate;
});

module.exports = mongoose.model('Alarm', AlarmSchema);