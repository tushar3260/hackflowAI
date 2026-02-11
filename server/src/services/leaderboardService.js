const LeaderboardSnapshot = require('../models/LeaderboardSnapshot');
const Team = require('../models/Team');
const Submission = require('../models/Submission');
const Evaluation = require('../models/Evaluation');
const Hackathon = require('../models/Hackathon');

// CONFIG: Split between Judge and AI scores
const JUDGE_WEIGHT = 0.7; // 70%
const AI_WEIGHT = 0.3;    // 30%

const generateLeaderboard = async (hackathonId) => {
    try {
        const hackathon = await Hackathon.findById(hackathonId);
        if (!hackathon) throw new Error('Hackathon not found');

        // 1. Fetch all teams participating in this hackathon
        const teams = await Team.find({ hackathon: hackathonId })
            .populate('members', 'name email');

        const leaderboardRows = [];

        // 2. Process each team
        for (const team of teams) {
            let totalWeightedScore = 0;
            const roundScores = [];

            // 3. Process each round configured in the hackathon
            for (const round of hackathon.rounds) {
                // Fetch submission for this round
                const submission = await Submission.findOne({
                    team: team._id,
                    hackathon: hackathonId,
                    roundIndex: round.order
                });

                let judgeAverage = 0;
                let aiScore = 0;

                // Fetch Evaluations
                if (submission) {
                    const evaluations = await Evaluation.find({ submission: submission._id });
                    if (evaluations.length > 0) {
                        const sumJudges = evaluations.reduce((acc, curr) => acc + curr.finalTotal, 0);
                        judgeAverage = sumJudges / evaluations.length;
                    }

                    // AI Score (stored directly on submission)
                    if (submission.aiScore && submission.aiScore.totalAiScore) {
                        aiScore = submission.aiScore.totalAiScore;
                    }
                }

                // 4. Calculate Round Score
                // Formula: (AvgJudge * 0.7) + (AI * 0.3)
                // Normalize to round max score if needed, but let's assume raw scores align with maxMarks

                const judgeContribution = judgeAverage * JUDGE_WEIGHT;
                const aiContribution = aiScore * AI_WEIGHT;
                const finalRoundScore = judgeContribution + aiContribution;

                // 5. Apply Hackathon Round Weightage
                // e.g. Round 1 is 30%, Round 2 is 70%
                const weightedRoundScore = (finalRoundScore * round.weightagePercent) / 100;

                totalWeightedScore += weightedRoundScore;

                roundScores.push({
                    roundIndex: round.order,
                    roundName: round.name,
                    maxRoundScore: round.maxScore,
                    weightagePercent: round.weightagePercent,
                    totalJudgeScore: judgeAverage, // Storing average here for display simplicity
                    averageJudgeScore: judgeAverage,
                    aiScore,
                    judgeContribution,
                    aiContribution,
                    finalRoundScore,
                    weightedRoundScore
                });
            }

            leaderboardRows.push({
                team: {
                    _id: team._id,
                    name: team.name,
                    teamCode: team.teamCode,
                    members: team.members
                },
                roundScores,
                totalScore: Number(totalWeightedScore.toFixed(2)),
                rank: 0 // Assign later
            });
        }

        // 6. Sort by Total Score (Descending)
        leaderboardRows.sort((a, b) => b.totalScore - a.totalScore);

        // 7. Assign Ranks
        leaderboardRows.forEach((row, index) => {
            row.rank = index + 1;
        });

        // 8. Save Snapshot
        const snapshot = await LeaderboardSnapshot.create({
            hackathon: hackathonId,
            rows: leaderboardRows
        });

        return snapshot;

    } catch (error) {
        console.error('Error generating leaderboard:', error);
        throw error;
    }
};

const getLatestSnapshot = async (hackathonId) => {
    return await LeaderboardSnapshot.findOne({ hackathon: hackathonId })
        .sort({ generatedAt: -1 });
};

module.exports = {
    generateLeaderboard,
    getLatestSnapshot
};
