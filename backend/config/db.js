const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // We use the MONGO_URI from your .env file
    // If it's not there, it falls back to your local instance
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/prooflock');

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    // Exit process with failure
    process.exit(1);
  }
};

module.exports = connectDB;