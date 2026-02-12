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
  category: { 
    type: String, 
    enum: ['Fitness', 'Study', 'Deep Work', 'General'], 
    default: 'General' 
  },
  startDate: { 
    type: Date, 
    required: true 
  },
  endDate: { type: Date },
  startTime: { 
    type: String,
    required: true
  },
  protocol: [{
    task: String,
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