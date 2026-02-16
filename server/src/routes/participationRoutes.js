
import express from 'express';
const router = express.Router();
import { protect } from '../middleware/authMiddleware.js';
import { getParticipationData } from '../controllers/participationController.js';

router.get('/:hackathonId/me', protect, getParticipationData);

export default router;
