const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { getMyProfile, updateProfile } = require('../controllers/userController');

const router = express.Router();

// All /api/user/* endpoints require a verified JWT
router.use(protect);

router.get('/me', getMyProfile);
router.put('/update', updateProfile);

module.exports = router;

