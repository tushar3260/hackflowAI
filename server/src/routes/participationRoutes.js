
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { getParticipationData } = require('../controllers/participationController');

router.get('/:hackathonId/me', protect, getParticipationData);

module.exports = router;
