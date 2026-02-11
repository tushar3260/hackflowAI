const express = require('express');
const router = express.Router();
const {
    submitWork,
    getMyTeamSubmissions,
    getSubmissionsByRound,
    getSubmissionById
} = require('../controllers/submissionController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { judgeHackathonGuard } = require('../middleware/judgeMiddleware');
const upload = require('../middleware/uploadMiddleware');

// Configure upload fields
const uploadFields = upload.fields([
    { name: 'ppt', maxCount: 1 },
    { name: 'document', maxCount: 1 }
]);

router.post('/submit', protect, uploadFields, submitWork);
router.get('/my', protect, getMyTeamSubmissions);
router.get('/:id', protect, getSubmissionById);
router.get('/hackathon/:hackathonId/round/:roundIndex', protect, authorize('organizer', 'judge'), judgeHackathonGuard, getSubmissionsByRound);

module.exports = router;
