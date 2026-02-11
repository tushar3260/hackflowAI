const express = require('express');
const router = express.Router();
const {
    createTeam,
    joinTeamByCode,
    leaveTeam,
    getMyTeams,
    getTeamsByHackathon,
    getMyTeamForHackathon
} = require('../controllers/teamController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/create', protect, createTeam);
router.post('/join', protect, joinTeamByCode);
router.post('/leave', protect, leaveTeam);
router.get('/my', protect, getMyTeams);
router.get('/hackathon/:hackathonId', protect, authorize('organizer'), getTeamsByHackathon);
router.get('/my/by-hackathon/:hackathonId', protect, getMyTeamForHackathon);

module.exports = router;
