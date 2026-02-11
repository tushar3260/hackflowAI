const mongoose = require('mongoose');
const Hackathon = require('./src/models/Hackathon');
const Team = require('./src/models/Team');
const Submission = require('./src/models/Submission');
const Evaluation = require('./src/models/Evaluation');
require('dotenv').config();

const run = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/hackflow-ai');
        console.log('Connected to DB');

        const hackathons = await Hackathon.find();
        if (hackathons.length === 0) { console.log('No hackathons'); return; }

        const h = hackathons[0];
        const t = await Team.findOne({ hackathon: h._id });
        const s = await Submission.findOne({ team: t._id });

        console.log(`Submission ID: ${s._id}`);
        console.log('AI Score (Raw):', s.aiScore);
        console.log('AI Score (JSON):', JSON.stringify(s.toObject().aiScore, null, 2));
        console.log('Total AI Score:', s.aiScore?.totalAiScore);

        // CREATE MOCK EVALUATION
        console.log('Creating Mock Evaluation...');
        // Need a judge. Let's find one or create dummy ID.
        // Assuming realistic_seed created a judge?
        // Let's just use a random ID if we don't care about auth here, but model references User.
        // We can use the hackathon.judges list if populated.

        // Let's use the first user found as judge for testing
        const User = require('./src/models/User');
        const judge = await User.findOne({ role: 'judge' });

        if (judge) {
            await Evaluation.deleteMany({ submission: s._id }); // Clear old

            const round = h.rounds.find(r => r.order === s.roundIndex);
            const validScores = round.criteria.map(c => ({
                criteriaId: c._id,
                criteriaTitle: c.title,
                maxMarks: c.maxMarks,
                givenMarks: c.maxMarks - 1,
                comment: 'Good'
            }));

            const judgeTotal = validScores.reduce((acc, c) => acc + c.givenMarks, 0);

            await Evaluation.create({
                submission: s._id,
                hackathon: h._id,
                roundIndex: s.roundIndex,
                judge: judge._id,
                scores: validScores,
                judgeTotal: judgeTotal,
                finalTotal: judgeTotal,
                weightedScore: 0, // Service calculates this mostly, but model has it.
                // In controller, we calculate it. Here we just want data for leaderboard.
                // Leaderboard service calculates from judgeTotal/finalTotal.
                comments: 'Test Eval'
            });
            console.log('✅ Mock Evaluation Created. Judge Total:', judgeTotal);
        } else {
            console.log('❌ No Judge found to create evaluation.');
        }

        process.exit();
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
};

run();
