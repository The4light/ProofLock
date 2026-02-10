const express = require('express');
const router = express.Router();
const { updateAvatar } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const { upload } = require('../config/cloudinary'); // We'll create this next

// POST /api/v1/user/update-avatar
router.post('/update-avatar', protect, upload.single('avatar'), updateAvatar);

module.exports = router;    