import express from 'express';
const router = express.Router();
import {
    submitWork,
    getMyTeamSubmissions,
    getSubmissionsByRound,
    getSubmissionById
} from '../controllers/submissionController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';
import { judgeHackathonGuard } from '../middleware/judgeMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';

// Configure upload fields
const uploadFields = upload.fields([
    { name: 'ppt', maxCount: 1 },
    { name: 'document', maxCount: 1 }
]);

router.post('/submit', protect, uploadFields, submitWork);
router.get('/my', protect, getMyTeamSubmissions);
router.get('/:id', protect, getSubmissionById);
router.get('/hackathon/:hackathonId/round/:roundIndex', protect, authorize('organizer', 'judge'), judgeHackathonGuard, getSubmissionsByRound);

export default router;
