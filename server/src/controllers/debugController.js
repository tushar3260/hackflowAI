import Submission from '../models/Submission.js';
import Hackathon from '../models/Hackathon.js';
import { analyzeSubmission } from '../services/aiEvaluationService.js';
import Evaluation from '../models/Evaluation.js';
import { calculateJudgeTotal, calculateFinalScore } from '../services/scoringService.js';

// @desc    Manually trigger AI analysis for a submission
// @route   POST /api/debug/run-ai/:submissionId
// @access  Private (Organizer/Admin)
export const runAiAnalysis = async (req, res) => {
    try {
        const { submissionId } = req.params;

        const submission = await Submission.findById(submissionId);
        if (!submission) {
            return res.status(404).json({ message: 'Submission not found' });
        }

        const hackathon = await Hackathon.findById(submission.hackathon);
        if (!hackathon) {
            return res.status(404).json({ message: 'Hackathon not found' });
        }

        // Find the round to get criteria
        const round = hackathon.rounds.find(r => r.order === submission.roundIndex);
        if (!round) {
            return res.status(404).json({ message: 'Round not found' });
        }

        console.log(`🔧 Debug: Manually triggering AI for submission ${submissionId}`);
        const aiResult = await analyzeSubmission(submission, round.criteria || []);

        // Calculate Judge Score for Debug Context
        const evaluations = await Evaluation.find({ submission: submissionId });
        let judgeTotal = 0;
        if (evaluations.length > 0) {
            // Average of judge totals
            const sum = evaluations.reduce((acc, curr) => acc + curr.totalScore, 0);
            judgeTotal = sum / evaluations.length;
        }

        let aiTotal = 0;
        if (aiResult) {
            submission.aiScore = aiResult;
            submission.markModified('aiScore');
            await submission.save();
            aiTotal = aiResult.totalAiScore || 0;
        }

        // Calculate Final Score Scenario
        const config = {
            mode: round.scoringMode || 'hybrid',
            aiWeight: round.aiWeight,
            judgeWeight: round.judgeWeight
        };

        const finalScore = calculateFinalScore(judgeTotal, aiTotal, config);

        if (aiResult) {
            return res.status(200).json({
                message: 'AI Analysis Completed Successfully',
                debugInfo: {
                    scoringMode: config.mode,
                    weights: { ai: config.aiWeight, judge: config.judgeWeight },
                    aiScore: aiTotal,
                    judgeScore: judgeTotal,
                    judgeCount: evaluations.length,
                    finalScore: finalScore,
                    finalScoreSource: config.mode === 'ai_only' ? 'AI' : (config.mode === 'judge_only' ? 'Judge' : 'Hybrid Weighted')
                },
                aiScore: aiResult
            });
        } else {
            return res.status(500).json({ message: 'AI Analysis Failed (returned null)' });
        }

    } catch (error) {
        console.error('Debug AI Error:', error);
        res.status(500).json({ message: error.message });
    }
};


