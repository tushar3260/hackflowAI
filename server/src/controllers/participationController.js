
const Hackathon = require('../models/Hackathon');
const Team = require('../models/Team');
const Submission = require('../models/Submission');
const Evaluation = require('../models/Evaluation');
const User = require('../models/User');
const HackathonParticipantProfile = require('../models/HackathonParticipantProfile');

// @desc    Get aggregated participation data for a user in a hackathon
// @route   GET /api/participation/:hackathonId/me
// @access  Private
const getParticipationData = async (req, res) => {
    try {
        const { hackathonId } = req.params;
        const userId = req.user.id;

        // 1. Fetch Hackathon (Basic Info + Rounds)
        const hackathon = await Hackathon.findById(hackathonId)
            .select('title theme startDate endDate status rounds')
            .lean();

        if (!hackathon) {
            return res.status(404).json({ message: 'Hackathon not found' });
        }

        // 2. Fetch User's Team for this Hackathon
        const team = await Team.findOne({
            hackathon: hackathonId,
            members: userId
        }).select('name teamCode leader members').lean();

        if (!team) {
            return res.status(403).json({ message: 'You are not part of a team for this hackathon', code: 'NO_TEAM' });
        }

        // 3. Fetch Participant Profile (Lazy Create if missing)
        let profile = await HackathonParticipantProfile.findOne({
            user: userId,
            hackathon: hackathonId
        }).select('fullName collegeName course yearOfStudy phone skills githubUrl linkedinUrl resumeUrl').lean();

        if (!profile) {
            // Check Global User Profile first
            const userFull = await User.findById(userId).lean();

            if (userFull && userFull.collegeName && userFull.yearOfStudy && userFull.phone) {
                // Global profile is complete enough, auto-create the hackathon-specific link
                const newProfile = new HackathonParticipantProfile({
                    user: userId,
                    hackathon: hackathonId,
                    fullName: userFull.name, // Use user.name as fallback or userFull.fullName if you add it
                    collegeName: userFull.collegeName,
                    course: userFull.course,
                    yearOfStudy: userFull.yearOfStudy,
                    phone: userFull.phone,
                    skills: userFull.skills,
                    githubUrl: userFull.githubUrl,
                    linkedinUrl: userFull.linkedinUrl,
                    resumeUrl: userFull.resumeUrl
                });
                await newProfile.save();
                profile = newProfile.toObject();
                console.log(`[GlobalProfileSync] Auto-created hackathon profile from global data for user ${userId}`);
            } else {
                // Fallback: Check if user has ANY existing profile from other hackathons (Legacy Sync)
                const latestProfile = await HackathonParticipantProfile.findOne({ user: userId })
                    .sort({ createdAt: -1 })
                    .lean();

                if (latestProfile) {
                    // Auto-create profile for this hackathon using previous data
                    const newProfile = new HackathonParticipantProfile({
                        user: userId,
                        hackathon: hackathonId,
                        fullName: latestProfile.fullName,
                        collegeName: latestProfile.collegeName,
                        course: latestProfile.course,
                        yearOfStudy: latestProfile.yearOfStudy,
                        phone: latestProfile.phone,
                        skills: latestProfile.skills,
                        githubUrl: latestProfile.githubUrl,
                        linkedinUrl: latestProfile.linkedinUrl,
                        resumeUrl: latestProfile.resumeUrl
                    });
                    await newProfile.save();
                    profile = newProfile.toObject();
                    console.log(`[LazyProfile] Auto-created profile for user ${userId} from legacy data`);
                } else {
                    return res.status(403).json({ message: 'Participant profile not found', code: 'NO_PROFILE' });
                }
            }
        }

        // 4. Fetch Submissions for this Team
        const submissions = await Submission.find({
            hackathon: hackathonId,
            team: team._id
        }).lean();

        // 5. Fetch Evaluations for these Submissions (if any)
        // Map submissionId -> Evaluation
        const submissionIds = submissions.map(s => s._id);
        const evaluations = await Evaluation.find({
            submission: { $in: submissionIds }
        }).lean();

        const evaluationMap = {};
        evaluations.forEach(ev => {
            evaluationMap[ev.submission.toString()] = ev;
        });

        // 6. Aggregate Data per Round
        const roundsData = hackathon.rounds.map(round => {
            // Find submission for this round (assuming 1 submission per round per team for now)
            // Or filter by roundIndex if stored
            const submission = submissions.find(s => s.roundIndex === round.order || s.roundName === round.name); // Prefer ID or Index match safely
            // Note: Submission model has roundIndex. Hackathon round has 'order'.

            const submissionData = submission ? {
                _id: submission._id,
                status: submission.status,
                submittedAt: submission.submittedAt,
                pptUrl: submission.pptUrl,
                githubUrl: submission.githubUrl,
                demoVideoUrl: submission.demoVideoUrl,
                documentUrl: submission.documentUrl
            } : null;

            const evaluation = submission ? evaluationMap[submission._id.toString()] : null;

            // Only show scores if round is PUBLISHED
            const isPublished = round.status === 'published';
            const showScore = evaluation && isPublished;

            return {
                roundIndex: round.order,
                name: round.name,
                description: round.description,
                maxScore: round.maxScore,
                status: round.status, // Return status to frontend
                submission: submissionData,
                score: showScore ? {
                    aiTotal: evaluation.aiTotal,
                    judgeTotal: evaluation.judgeTotal,
                    finalTotal: evaluation.finalTotal,
                    weightedScore: evaluation.weightedScore,
                    isPublished: true
                } : null
            };
        });

        // Determine Role
        const role = team.leader.toString() === userId ? 'leader' : 'member';

        res.json({
            hackathon: {
                _id: hackathon._id,
                title: hackathon.title,
                theme: hackathon.theme,
                status: hackathon.status,
                startDate: hackathon.startDate,
                endDate: hackathon.endDate
            },
            team: {
                _id: team._id,
                name: team.name,
                teamCode: team.teamCode,
                role
            },
            profile: {
                fullName: profile.fullName
            },
            rounds: roundsData
        });

    } catch (error) {
        console.error('Participation Data Error:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = {
    getParticipationData
};
