const LeaderboardSnapshot = require('../models/LeaderboardSnapshot');
const Team = require('../models/Team');

// @desc    Shortlist top N teams for next round
// @param   hackathonId
// @param   count (Number of teams to shortlist)
const shortlistTeams = async (hackathonId, count) => {
    try {
        // Get latest leaderboard
        const snapshot = await LeaderboardSnapshot.findOne({ hackathon: hackathonId })
            .sort({ generatedAt: -1 });

        if (!snapshot) {
            throw new Error('Leaderboard not generated yet');
        }

        // Get Top N rows
        const topTeams = snapshot.rows.slice(0, count);
        const teamIds = topTeams.map(r => r.team._id);

        // Update Team Status (assuming we add a status field, or just return them)
        // For now, let's just return them. 
        // In a real app, we might set `team.status = 'shortlisted'`

        return topTeams;
    } catch (error) {
        console.error('Shortlist Error:', error);
        throw error;
    }
};

module.exports = {
    shortlistTeams
};
