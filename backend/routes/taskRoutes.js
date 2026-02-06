const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');

// 1. Change this line to import from your new cloudinary config
const { upload } = require('../config/cloudinary'); 

const { 
    createTask, 
    getTasks, 
    updateTask, 
    uploadTaskProof 
} = require('../controllers/taskController');

router.use(protect);

router.route('/')
    .get(getTasks)
    .post(createTask);

// 2. This route now sends the file directly to the cloud!
router.put('/:id/proof', upload.single('image'), uploadTaskProof);

module.exports = router;