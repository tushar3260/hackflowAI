
const HackathonParticipantProfile = require('../models/HackathonParticipantProfile');

// @desc    Create or Update Participant Profile for a Hackathon
// @route   POST /api/participant-profile/:hackathonId
// @access  Private
const createOrUpdateProfile = async (req, res) => {
    try {
        const { hackathonId } = req.params;
        const {
            fullName,
            collegeName,
            course,
            yearOfStudy,
            phone,
            skills,
            githubUrl,
            linkedinUrl
        } = req.body;

        const profileFields = {
            user: req.user.id,
            hackathon: hackathonId,
            fullName,
            collegeName,
            course,
            yearOfStudy,
            phone,
            skills: skills ? skills.split(',').map(s => s.trim()) : [],
            githubUrl,
            linkedinUrl,
            status: 'completed'
        };

        if (req.file) {
            profileFields.resumeUrl = `/uploads/${req.file.filename}`;
        }

        let profile = await HackathonParticipantProfile.findOne({
            user: req.user.id,
            hackathon: hackathonId
        });

        if (profile) {
            // Update
            profile = await HackathonParticipantProfile.findOneAndUpdate(
                { user: req.user.id, hackathon: hackathonId },
                { $set: profileFields },
                { new: true }
            );
            return res.json(profile);
        }

        // Create
        profile = new HackathonParticipantProfile(profileFields);
        await profile.save();
        res.status(201).json(profile);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get Participant Profile Status
// @route   GET /api/participant-profile/:hackathonId/status
// @access  Private
const getProfileStatus = async (req, res) => {
    try {
        const profile = await HackathonParticipantProfile.findOne({
            user: req.user.id,
            hackathon: req.params.hackathonId
        });

        res.json({ exists: !!profile });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Get My Profile for a hackathon
// @route   GET /api/participant-profile/:hackathonId/me
// @access  Private
const getMyProfile = async (req, res) => {
    try {
        const profile = await HackathonParticipantProfile.findOne({
            user: req.user.id,
            hackathon: req.params.hackathonId
        });

        if (!profile) {
            return res.status(404).json({ message: 'Profile not found' });
        }

        res.json(profile);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = {
    createOrUpdateProfile,
    getProfileStatus,
    getMyProfile
};
