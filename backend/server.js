const app = require('./app');
const connectDB = require('./config/db');

// 1. Connect to the Database
connectDB();

// 2. Define the Port
const PORT = process.env.PORT || 5000;

// 3. Start the Server
const server = app.listen(PORT, () => {
  console.log(`
🚀 ProofLock Server Initialized
📡 Mode: ${process.env.NODE_ENV}
🔗 URL: http://localhost:${PORT}
  `);
});

// 4. Handle unhandled promise rejections (e.g., if DB fails later)
process.on('unhandledRejection', (err, promise) => {
  console.log(`❌ Error: ${err.message}`);
  // Close server & exit process
  server.close(() => process.exit(1));
});