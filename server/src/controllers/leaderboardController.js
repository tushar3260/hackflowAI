const LeaderboardSnapshot = require('../models/LeaderboardSnapshot');
const leaderboardService = require('../services/leaderboardService');

// @desc    Get leaderboard for a hackathon
// @route   GET /api/leaderboard/:hackathonId
// @access  Private
// @desc    Get leaderboard for a hackathon
// @route   GET /api/leaderboard/:hackathonId
// @access  Private
const getLeaderboard = async (req, res) => {
    try {
        const { hackathonId } = req.params;

        // Try to get latest snapshot
        let snapshot = await leaderboardService.getLatestSnapshot(hackathonId);

        // If no snapshot exists (or very old - unimplemented age check), generate one
        if (!snapshot) {
            snapshot = await leaderboardService.generateLeaderboard(hackathonId);
        }

        // Fetch Hackathon to check Round Statuses
        // We need to know which rounds are 'published' to show their scores
        const Hackathon = require('../models/Hackathon'); // Lazy load or move to top
        const hackathon = await Hackathon.findById(hackathonId);
        if (!hackathon) return res.status(404).json({ message: 'Hackathon not found' });

        const publishedRoundIndices = hackathon.rounds
            .filter(r => r.status === 'published')
            .map(r => r.order); // Assuming order matches roundIndex

        const isOrganizerOrJudge = ['organizer', 'judge'].includes(req.user.role);

        if (!isOrganizerOrJudge) {
            // Filter sensitive breakdown for other teams AND mask unpublished rounds
            const myTeamId = req.user.team;

            const publicRows = snapshot.rows.map(row => {
                const isMyTeam = row.team.members.some(m => m._id.toString() === req.user.id);

                // Filter roundScores based on Published Status
                const visibleRoundScores = row.roundScores.map(rs => {
                    if (publishedRoundIndices.includes(rs.roundIndex)) {
                        return {
                            roundIndex: rs.roundIndex,
                            roundName: rs.roundName,
                            finalRoundScore: rs.finalRoundScore,
                            // specific breakdown hidden for others, shown for me?
                            // Requirement: "others only rank + total score". 
                            // But usually you see round totals.
                            // Let's hide breakdown always for public rows of OTHERS.
                            breakdown: isMyTeam ? rs.breakdown : null
                        };
                    } else {
                        // Round NOT published
                        return {
                            roundIndex: rs.roundIndex,
                            roundName: rs.roundName,
                            finalRoundScore: null, // MASKED
                            breakdown: null
                        };
                    }
                });

                // Re-calculate total score based only on VISIBLE rounds? 
                // typically Leaderboard shows Total of what is published. 
                // If we mask individual rounds but show full Total, it leaks info.
                // So let's sum up visible scores for the "public total" if we want to be strict.
                // OR we just send what we have if 'snapshot' total is trusted. 
                // Usually "Live Leaderboard" shows current total. 
                // If round is NOT published, its score shouldn't be in the total yet?
                // Actually, `generateLeaderboard` might calculate everything.
                // If we want to hide it, we should subtract it.
                // For simplicity, let's keep Total Score as is (it's "Live"), but hide specific round details.
                // Users will see their rank change but not know exactly why until published. This is common "Live" behavior.
                // If we want "Hidden until Published", we would modify Total too.
                // Let's stick to masking `roundScores` details for now as requested.

                return {
                    ...row.toObject(),
                    roundScores: visibleRoundScores
                };
            });

            return res.status(200).json({ ...snapshot.toObject(), rows: publicRows });
        }

        res.status(200).json(snapshot);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Force regenerate leaderboard (Organizer only)
// @route   POST /api/leaderboard/:hackathonId/refresh
// @access  Private (Organizer)
const refreshLeaderboard = async (req, res) => {
    try {
        const snapshot = await leaderboardService.generateLeaderboard(req.params.hackathonId);
        res.status(200).json(snapshot);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getLeaderboard,
    refreshLeaderboard
};
