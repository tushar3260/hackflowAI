
import express from 'express';
const router = express.Router();
import { protect } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';
import {
    createOrUpdateProfile,
    getProfileStatus,
    getMyProfile
} from '../controllers/participantProfileController.js';

router.post('/:hackathonId', protect, upload.single('resume'), createOrUpdateProfile);
router.get('/:hackathonId/status', protect, getProfileStatus);
router.get('/:hackathonId/me', protect, getMyProfile);

export default router;
