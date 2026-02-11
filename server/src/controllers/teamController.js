const Team = require('../models/Team');
const User = require('../models/User');
const Hackathon = require('../models/Hackathon');

// Helper to generate random 6-char uppercase code
const generateTeamCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
};

// @desc    Create new team
// @route   POST /api/teams/create
// @access  Private (Participant only)
const createTeam = async (req, res) => {
    try {
        const { name, hackathonId, invites } = req.body;

        if (!name || !hackathonId) {
            return res.status(400).json({ message: 'Please provide team name and hackathon ID' });
        }

        // Check if user is already in a team for this hackathon using the members array
        const existingTeam = await Team.findOne({
            hackathon: hackathonId,
            members: req.user.id
        });

        if (existingTeam) {
            return res.status(400).json({ message: 'You are already in a team for this hackathon' });
        }

        let membersToAdd = [req.user.id];

        // Process invites if provided
        if (invites && Array.isArray(invites) && invites.length > 0) {
            // Find users by email
            const invitedUsers = await User.find({ email: { $in: invites } });

            for (const invitedUser of invitedUsers) {
                // Skip if invited user is the creator (already added)
                if (invitedUser._id.toString() === req.user.id) continue;

                // Check if invited user is already in a team for this hackathon
                const isAlreadyInTeam = await Team.findOne({
                    hackathon: hackathonId,
                    members: invitedUser._id
                });

                if (!isAlreadyInTeam) {
                    membersToAdd.push(invitedUser._id);
                }
                // If they are in a team, we just skip them for now to avoid blocking creation
                // In a real app, we might return a warning
            }

            // Cap at 4 members
            if (membersToAdd.length > 4) {
                return res.status(400).json({ message: 'Team cannot exceed 4 members including you.' });
            }
        }

        let teamCode;
        let isUnique = false;
        while (!isUnique) {
            teamCode = generateTeamCode();
            const check = await Team.findOne({ teamCode });
            if (!check) isUnique = true;
        }

        const team = await Team.create({
            name,
            teamCode,
            hackathon: hackathonId,
            leader: req.user.id,
            members: membersToAdd
        });

        res.status(201).json(team);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Join team by code
// @route   POST /api/teams/join
// @access  Private (Participant only)
const joinTeamByCode = async (req, res) => {
    try {
        const { teamCode } = req.body;

        if (!teamCode) {
            return res.status(400).json({ message: 'Please provide a team code' });
        }

        const team = await Team.findOne({ teamCode });

        if (!team) {
            return res.status(404).json({ message: 'Team not found with that code' });
        }

        // Check if team is full (Configurable max size, defaulting to 4)
        if (team.members.length >= 4) {
            return res.status(400).json({ message: 'Team is full (Max 4 members)' });
        }

        // Check if user is already in THIS team
        if (team.members.includes(req.user.id)) {
            return res.status(400).json({ message: 'You are already in this team' });
        }

        // Check if user is in ANY team for this hackathon
        const existingTeam = await Team.findOne({
            hackathon: team.hackathon,
            members: req.user.id
        });

        if (existingTeam) {
            return res.status(400).json({ message: 'You are already in another team for this hackathon' });
        }

        // Add user
        team.members.push(req.user.id);
        await team.save();

        res.status(200).json(team);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Leave team
// @route   POST /api/teams/leave
// @access  Private (Participant only)
const leaveTeam = async (req, res) => {
    try {
        const { teamId } = req.body;

        const team = await Team.findById(teamId);

        if (!team) {
            return res.status(404).json({ message: 'Team not found' });
        }

        if (!team.members.includes(req.user.id)) {
            return res.status(400).json({ message: 'You are not a member of this team' });
        }

        // Remove user
        team.members = team.members.filter(member => member.toString() !== req.user.id);

        // If no members left, delete team
        if (team.members.length === 0) {
            await team.deleteOne();
            return res.status(200).json({ message: 'Team deleted as last member left' });
        }

        // If leader leaves, assign new leader (next member)
        if (team.leader.toString() === req.user.id) {
            team.leader = team.members[0];
        }

        await team.save();
        res.status(200).json(team);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Get my team for a hackathon OR all my teams
// @route   GET /api/teams/my
// @access  Private
const getMyTeams = async (req, res) => {
    try {
        // Can filter by ?hackathonId=...
        const query = { members: req.user.id };
        if (req.query.hackathonId) {
            query.hackathon = req.query.hackathonId;
        }

        const teams = await Team.find(query)
            .populate('hackathon', 'title theme startDate')
            .populate('members', 'name email')
            .populate('leader', 'name');

        res.status(200).json(teams);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Get teams by hackathon
// @route   GET /api/teams/hackathon/:hackathonId
// @access  Private (Organizer only)
const getTeamsByHackathon = async (req, res) => {
    try {
        const teams = await Team.find({ hackathon: req.params.hackathonId })
            .populate('members', 'name email')
            .populate('leader', 'name');

        res.status(200).json(teams);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Get my team for a SPECIFIC hackathon (simple check)
// @route   GET /api/teams/my/by-hackathon/:hackathonId
// @access  Private
const getMyTeamForHackathon = async (req, res) => {
    try {
        const team = await Team.findOne({
            hackathon: req.params.hackathonId,
            members: req.user.id
        }).select('name _id teamCode role');

        if (!team) {
            return res.json(null);
        }

        // Determine role (leader or member)
        const role = team.leader?.toString() === req.user.id ? 'leader' : 'member';

        res.json({
            _id: team._id,
            name: team.name,
            teamCode: team.teamCode,
            role
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

module.exports = {
    createTeam,
    joinTeamByCode,
    leaveTeam,
    getMyTeams,
    getTeamsByHackathon,
    getMyTeamForHackathon
};
