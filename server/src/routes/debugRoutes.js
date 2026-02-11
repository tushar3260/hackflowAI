const express = require('express');
const router = express.Router();
const { runAiAnalysis } = require('../controllers/debugController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Protect and only allow organizers (or add 'admin' if role exists)
router.post('/run-ai/:submissionId', protect, authorize('organizer'), runAiAnalysis);

module.exports = router;
