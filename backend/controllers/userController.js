const User = require('../models/User');
const { cloudinary } = require('../config/cloudinary');

exports.updateAvatar = async (req, res) => {
  try {
    console.log("--- Upload Attempt ---");
    
    if (!req.file) {
      console.log("❌ Multer did not receive a file.");
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    // Upload buffer to Cloudinary manually
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: 'peak_avatars',
        transformation: [{ width: 500, height: 500, crop: 'fill' }]
      },
      async (error, result) => {
        if (error) {
          console.log("❌ Cloudinary upload failed:", error);
          return res.status(500).json({ success: false, message: 'Cloudinary upload failed' });
        }

        console.log("✅ Image URL detected:", result.secure_url);

        const user = await User.findByIdAndUpdate(
          req.user.id,
          { avatar: result.secure_url },
          { new: true }
        );

        res.status(200).json({
          success: true,
          avatarUrl: result.secure_url 
        });
      }
    );

    // Pipe the buffer to Cloudinary
    const { Readable } = require('stream');
    const bufferStream = Readable.from(req.file.buffer);
    bufferStream.pipe(uploadStream);

  } catch (error) {
    console.error("🔥 Server Crash Prevented:", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
};