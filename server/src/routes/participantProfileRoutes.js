
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');
const {
    createOrUpdateProfile,
    getProfileStatus,
    getMyProfile
} = require('../controllers/participantProfileController');

router.post('/:hackathonId', protect, upload.single('resume'), createOrUpdateProfile);
router.get('/:hackathonId/status', protect, getProfileStatus);
router.get('/:hackathonId/me', protect, getMyProfile);

module.exports = router;
