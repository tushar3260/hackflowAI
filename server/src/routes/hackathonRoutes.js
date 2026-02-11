const express = require('express');
const router = express.Router();
const {
    createHackathon,
    getHackathons,
    getHackathonById,
    updateHackathon,
    deleteHackathon,
    addJudge,
    removeJudge,
    getJudgeHackathons,
    getOrganizerHackathons,
    getOrganizerStats,
    getJudgeStats,
    getParticipantStats,
    updateRoundStatus,
    publishLeaderboard
} = require('../controllers/hackathonController');
const { protect, authorize } = require('../middleware/authMiddleware');
const organizerOwnershipGuard = require('../middleware/organizerOwnershipGuard');

router.get('/stats/organizer', protect, authorize('organizer'), getOrganizerStats);
router.get('/stats/judge', protect, authorize('judge'), getJudgeStats);
router.get('/stats/participant', protect, getParticipantStats);

router.route('/')
    .get(getHackathons)
    .post(protect, authorize('organizer'), createHackathon);

router.get('/judge/my', protect, authorize('judge'), getJudgeHackathons);
router.get('/organizer/my', protect, authorize('organizer'), getOrganizerHackathons);

router.route('/:id')
    .get(getHackathonById)
    .put(protect, authorize('organizer'), organizerOwnershipGuard, updateHackathon)
    .delete(protect, authorize('organizer'), organizerOwnershipGuard, deleteHackathon);

router.put('/:id/round/:roundIndex/status', protect, authorize('organizer'), organizerOwnershipGuard, updateRoundStatus);
router.post('/:id/round/:roundIndex/publish-leaderboard', protect, authorize('organizer'), organizerOwnershipGuard, publishLeaderboard);

router.post('/:id/judges', protect, authorize('organizer'), organizerOwnershipGuard, addJudge);
router.delete('/:id/judges/:judgeId', protect, authorize('organizer'), organizerOwnershipGuard, removeJudge);

module.exports = router;
