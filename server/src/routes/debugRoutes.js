import express from 'express';
const router = express.Router();
import { runAiAnalysis } from '../controllers/debugController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

// Protect and only allow organizers (or add 'admin' if role exists)
router.post('/run-ai/:submissionId', protect, authorize('organizer'), runAiAnalysis);

export default router;
