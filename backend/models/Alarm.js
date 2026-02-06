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
    type: String, // Matches the "06:30 AM" in your design
    required: true
  },
  startDate: { 
    type: Date, // Handles "Oct 24" vs "Oct 25" from your design
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
});

module.exports = mongoose.model('Alarm', AlarmSchema);