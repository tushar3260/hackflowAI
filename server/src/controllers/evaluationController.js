const Evaluation = require('../models/Evaluation');
const Submission = require('../models/Submission');
const Hackathon = require('../models/Hackathon');
const scoringService = require('../services/scoringService');

// @desc    Submit evaluation
// @route   POST /api/evaluations/submit
// @access  Private (Judge only)
const submitEvaluation = async (req, res) => {
    try {
        const { submissionId, scores, comments } = req.body;

        // 1. Fetch contents
        const submission = await Submission.findById(submissionId);
        if (!submission) return res.status(404).json({ message: 'Submission not found' });

        const hackathon = await Hackathon.findById(submission.hackathon);
        if (!hackathon) return res.status(404).json({ message: 'Hackathon not found' });

        // 2. Validate Round & Criteria
        const round = hackathon.rounds.find(r => r.order === submission.roundIndex);
        if (!round) return res.status(400).json({ message: 'Round configuration not found' });

        // STRICT STATUS CHECK
        if (round.status !== 'judging') {
            return res.status(403).json({ message: `Round is currently ${round.status}. Judging is not open.` });
        }

        // Check for AI_ONLY mode
        if (round.scoringMode === 'ai_only') {
            return res.status(403).json({ message: 'This round is evaluated by AI only. Manual judging is disabled.' });
        }

        // Check if user is an invited judge
        const isAssigned = hackathon.judges.some(j => j.toString() === req.user.id);
        if (!isAssigned) {
            return res.status(403).json({ message: 'You are not an invited judge for this hackathon' });
        }

        // Check Round Specific Assignment (Optional)
        if (hackathon.roundJudges && hackathon.roundJudges.size > 0) {
            const roundJudges = hackathon.roundJudges.get(String(submission.roundIndex));
            if (roundJudges && roundJudges.length > 0) {
                const isRoundAssigned = roundJudges.some(j => j.toString() === req.user.id);
                if (!isRoundAssigned) {
                    return res.status(403).json({ message: 'You are not assigned to judge this specific round.' });
                }
            }
        }

        // Validate scores match criteria
        const validScores = [];
        for (const criteria of round.criteria) {
            const given = scores.find(s => s.criteriaId === criteria._id.toString());
            if (!given) {
                return res.status(400).json({ message: `Missing score for criteria: ${criteria.title}` });
            }
            if (given.givenMarks > criteria.maxMarks) {
                return res.status(400).json({ message: `Marks for ${criteria.title} cannot exceed ${criteria.maxMarks}` });
            }
            validScores.push({
                criteriaId: criteria._id,
                criteriaTitle: criteria.title,
                maxMarks: criteria.maxMarks,
                givenMarks: Number(given.givenMarks),
                comment: given.comment || ''
            });
        }

        // 3. Calculate Scores
        const judgeTotal = scoringService.calculateJudgeTotal(validScores);

        // Extract AI Score if available
        const aiScoreVal = (submission.aiScore && typeof submission.aiScore.totalAiScore === 'number')
            ? submission.aiScore.totalAiScore
            : null;

        const scoreConfig = {
            mode: round.scoringMode || 'hybrid',
            aiWeight: round.aiWeight,
            judgeWeight: round.judgeWeight
        };

        const finalTotal = scoringService.calculateFinalScore(judgeTotal, aiScoreVal, scoreConfig);
        const weightedScore = scoringService.calculateWeightedScore(finalTotal, round.maxScore, round.weightagePercent);

        // Also update the evaluation's recorded AI total for transparency
        const aiTotalToSave = aiScoreVal !== null ? aiScoreVal : 0;

        // 4. Create/Update Evaluation

        // Check if already evaluated by this judge
        let evaluation = await Evaluation.findOne({
            submission: submissionId,
            judge: req.user.id
        });

        if (evaluation) {
            // Update
            evaluation.scores = validScores;
            evaluation.judgeTotal = judgeTotal;
            evaluation.aiTotal = aiTotalToSave;
            evaluation.finalTotal = finalTotal;
            evaluation.weightedScore = weightedScore;
            evaluation.comments = comments;
            await evaluation.save();
        } else {
            // Create
            evaluation = await Evaluation.create({
                submission: submissionId,
                hackathon: hackathon._id,
                roundIndex: submission.roundIndex,
                judge: req.user.id,
                scores: validScores,
                judgeTotal,
                aiTotal: aiTotalToSave,
                finalTotal,
                weightedScore,
                comments
            });
        }

        // 5. Aggregate logic (Calculate average score for submission)
        // Find all evaluations for this submission
        const allEvals = await Evaluation.find({ submission: submissionId });
        const avgScore = allEvals.reduce((acc, curr) => acc + curr.finalTotal, 0) / allEvals.length;

        // Update submission meta score
        submission.judgeScore = {
            total: avgScore,
            count: allEvals.length,
            status: 'scored'
        };
        await submission.save();

        res.status(200).json(evaluation);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get specific evaluation
// @route   GET /api/evaluations/:id
// @access  Private
const getEvaluation = async (req, res) => {
    try {
        const evaluation = await Evaluation.findById(req.params.id)
            .populate('judge', 'name email');

        if (!evaluation) return res.status(404).json({ message: 'Evaluation not found' });

        res.status(200).json(evaluation);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get evaluation for a submission by current judge
// @route   GET /api/evaluations/submission/:submissionId
// @access  Private (Judge)
const getMyEvaluationForSubmission = async (req, res) => {
    try {
        const evaluation = await Evaluation.findOne({
            submission: req.params.submissionId,
            judge: req.user.id
        });
        // Return null if not found (200 OK) so frontend knows to show blank form
        res.status(200).json(evaluation || null);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    submitEvaluation,
    getEvaluation,
    getMyEvaluationForSubmission
};
