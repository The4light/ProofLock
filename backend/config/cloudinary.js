const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const { Readable } = require('stream');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Custom storage using memory storage + manual Cloudinary upload
const storage = multer.memoryStorage();
const upload = multer({ storage });

module.exports = { cloudinary, upload };