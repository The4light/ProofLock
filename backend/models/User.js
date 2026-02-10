const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Please add a username'],
    unique: true,
    trim: true,
    maxlength: [20, 'Username cannot be more than 20 characters']
  },
  email: {
    type: String,
    required: [true, 'Please add an email'],
    unique: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email'
    ]
  },
  password: {
    type: String,
    required: [true, 'Please add a password'],
    minlength: 6,
    select: false // Automatically excludes password from API responses for safety
  },
  behaviorScore: {
    type: Number,
    default: 100, // The core metric for ProofLock accountability
    min: 0,
    max: 100
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  // Add these to your existing UserSchema
  streak: {
    type: Number,
    default: 0
  },
  successRate: {
    type: Number,
    default: 100 // Starting at 100% success
  },
  totalTasksCompleted: {
    type: Number,
    default: 0
  },
totalTasksFailed: {
    type: Number,
    default: 0
  },
  avatar: {
    type: String,
    default: 'https://res.cloudinary.com/dl4b62svx/image/upload/v1/default-avatar.png' // Or any placeholder
  }
});

// ENCRYPTION: This "Hook" runs before we save a user to hash the password
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Check if entered password matches hashed password in database
UserSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);