const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Please add a task title'],
    trim: true,
    maxlength: [50, 'Title cannot be more than 50 characters']
  },
  scheduledTime: {
    type: Date,
    required: [true, 'Please set a time for the alarm']
  },
  proofType: {
    type: String,
    required: true,
    enum: ['photo', 'barcode', 'location', 'chat'],
    default: 'photo'
  },
  status: {
    type: String,
    enum: ['pending', 'active', 'completed', 'failed'],
    default: 'pending'
  },
  proofImage: {
    type: String, // This will store the Cloudinary URL
    default: ''
  },
  penalty: {
    type: Number,
    default: 10 // Points lost from success rate/streak on failure
  }
}, { 
  timestamps: true // Automatically adds createdAt and updatedAt fields
});

module.exports = mongoose.model('Task', TaskSchema);