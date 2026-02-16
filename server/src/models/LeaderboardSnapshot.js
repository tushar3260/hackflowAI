import mongoose from 'mongoose';

const leaderboardSnapshotSchema = new mongoose.Schema({
    hackathon: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Hackathon',
        required: true
    },
    generatedAt: {
        type: Date,
        default: Date.now
    },
    rows: [{
        team: {
            _id: mongoose.Schema.Types.ObjectId,
            name: String,
            teamCode: String,
            members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
        },
        // Store breakdown per round
        roundScores: [{
            roundIndex: Number,
            roundName: String,
            maxRoundScore: Number,
            weightagePercent: Number,

            // Raw scores
            totalJudgeScore: Number, // Sum of all judge finals
            averageJudgeScore: Number, // Average
            aiScore: Number,

            // Calculation components
            judgeContribution: Number, // e.g. Avg * 0.7
            aiContribution: Number, // e.g. AI * 0.3

            finalRoundScore: Number, // Combined Raw 
            weightedRoundScore: Number // Applied weightage
        }],

        totalScore: {
            type: Number,
            required: true
        },
        rank: {
            type: Number,
            required: true
        }
    }]
});

// Index to quickly find latest snapshot for a hackathon
leaderboardSnapshotSchema.index({ hackathon: 1, generatedAt: -1 });

export default mongoose.model('LeaderboardSnapshot', leaderboardSnapshotSchema);
