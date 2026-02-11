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
  startTime: { 
    type: String,
    required: true
  },
  startDate: { 
    type: Date,
    required: true
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

// Add virtual 'time' field for frontend compatibility
AlarmSchema.virtual('time').get(function() {
  return this.startDate;
});

module.exports = mongoose.model('Alarm', AlarmSchema);