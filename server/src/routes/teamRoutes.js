import express from 'express';
const router = express.Router();
import {
    createTeam,
    joinTeamByCode,
    leaveTeam,
    getMyTeams,
    getTeamsByHackathon,
    getMyTeamForHackathon
} from '../controllers/teamController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

router.post('/create', protect, createTeam);
router.post('/join', protect, joinTeamByCode);
router.post('/leave', protect, leaveTeam);
router.get('/my', protect, getMyTeams);
router.get('/hackathon/:hackathonId', protect, authorize('organizer'), getTeamsByHackathon);
router.get('/my/by-hackathon/:hackathonId', protect, getMyTeamForHackathon);

export default router;
