const express = require('express');
const router = express.Router();
const { getLeaderboard, refreshLeaderboard } = require('../controllers/leaderboardController');
const { protect } = require('../middleware/authMiddleware');

router.get('/:hackathonId', protect, getLeaderboard);
router.post('/:hackathonId/refresh', protect, refreshLeaderboard);

module.exports = router;
