import express from 'express';
const router = express.Router();
import { getLeaderboard, refreshLeaderboard } from '../controllers/leaderboardController.js';
import { protect } from '../middleware/authMiddleware.js';

router.get('/:hackathonId', protect, getLeaderboard);
router.post('/:hackathonId/refresh', protect, refreshLeaderboard);

export default router;
