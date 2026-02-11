const Submission = require('../models/Submission');
const Hackathon = require('../models/Hackathon');
const { analyzeSubmission } = require('../services/aiEvaluationService');
const Team = require('../models/Team');

// @desc    Submit work for a round
// @route   POST /api/submissions/submit
// @access  Private (Participant Leader)
const submitWork = async (req, res) => {
    try {
        const { hackathonId, roundIndex, notesText, githubUrl, demoVideoUrl } = req.body;

        // Files are in req.files (array) or req.file (single) - we likely used .fields() in route
        const files = req.files || {};

        if (!hackathonId || roundIndex === undefined) {
            return res.status(400).json({ message: 'Hackathon ID and Round Index are required' });
        }

        // 1. Verify User & Team
        // Find user's team for this hackathon
        const team = await Team.findOne({
            hackathon: hackathonId,
            members: req.user.id
        });

        if (!team) {
            return res.status(404).json({ message: 'You are not part of any team for this hackathon' });
        }

        if (team.leader.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Only the team leader can submit work' });
        }

        // 2. Validate Hackathon & Round & Deadline
        const hackathon = await Hackathon.findById(hackathonId);
        if (!hackathon) return res.status(404).json({ message: 'Hackathon not found' });

        const round = hackathon.rounds.find(r => r.order === parseInt(roundIndex)); // Assuming roundIndex matches order or array index? 
        // User requirements said "roundIndex". Let's assume it maps to the rounds array index for simplicity or 'order'.
        // Let's use array index to match "roundIndex" usually implying 0-based index. 
        // However, user said "Read round deadline from hackathon round config". 
        // Our Hackathon model "rounds" schema doesn't strictly have a "deadline" field in the PREVIOUS implementation I saw.
        // Let's check Hackathon model again. The provided Hackathon file view showed name, order, maxScore, criteria. NO explicit deadline per round.
        // Usually hackathon has end date. User might imply Hackathon End Date OR I missed a field.
        // REQUIREMENT: "Read round deadline from hackathon round config."
        // ISSUE: Previous Hackathon schema DOES NOT have deadline per round. 
        // FIX: I will use Hackathon End Date as the absolute deadline for now, OR I should add deadline to round. 
        // Since I can't easily change the schema/UI for Hackathon creation right now without scope creep, I will use Hackathon.endDate as the global deadline.
        // OR I can assume the user meant "if round has deadline". 
        // Let's stick to: Check Hackathon End Date.

        // Check done later with round deadline logic

        // STRICT STATUS CHECK
        const { resolveEffectiveRoundStatus } = require('../utils/roundStatusHelper');
        const effectiveStatus = resolveEffectiveRoundStatus(round);

        // If round status is NOT 'open', block submission
        if (round && effectiveStatus !== 'open') {
            return res.status(403).json({ message: `Round is currently ${effectiveStatus}. Submissions are not allowed.` });
        }

        // 2.5. Verify Participant Profile
        const HackathonParticipantProfile = require('../models/HackathonParticipantProfile'); // Lazy load
        const profile = await HackathonParticipantProfile.findOne({
            user: req.user.id,
            hackathon: hackathonId,
            status: 'completed'
        });

        if (!profile) {
            return res.status(403).json({ message: 'You must complete your participant profile for this hackathon before submitting.' });
        }

        // 3. Process Files
        let pptUrl = '';
        let documentUrl = '';

        if (files.ppt && files.ppt.length > 0) {
            pptUrl = `/uploads/${files.ppt[0].filename}`;
        }
        if (files.document && files.document.length > 0) {
            documentUrl = `/uploads/${files.document[0].filename}`;
        }

        // 4. Check for existing submission
        let submission = await Submission.findOne({
            team: team._id,
            hackathon: hackathonId,
            roundIndex: parseInt(roundIndex)
        });

        // 5. Build submissionData from Schema
        let submissionData = {};
        if (round.submissionSchema && round.submissionSchema.length > 0) {
            for (const field of round.submissionSchema) {
                const { fieldKey, required, label, type } = field;
                let value = req.body[fieldKey];

                // Handle files
                if (type === 'file' || type === 'ppt') {
                    if (files[fieldKey] && files[fieldKey].length > 0) {
                        value = `/uploads/${files[fieldKey][0].filename}`;
                    } else if (submission && submission.submissionData && submission.submissionData[fieldKey]) {
                        // Keep existing file if not re-uploaded
                        value = submission.submissionData[fieldKey];
                    }
                }

                if (required && !value) {
                    return res.status(400).json({ message: `Field "${label}" is required` });
                }
                if (value) submissionData[fieldKey] = value;
            }
        } else {
            // Fallback to legacy fields
            submissionData = {
                pptFileUrl: pptUrl,
                documentUrl: documentUrl,
                githubUrl,
                demoVideoUrl,
                notesText
            };
        }

        // VALIDATE DEADLINE
        const roundDeadline = round.deadline ? new Date(round.deadline) : new Date(hackathon.endDate);
        const now = new Date();
        const isLate = now > roundDeadline;

        if (isLate) {
            return res.status(400).json({ message: 'Submission deadline has passed. Round is locked.' });
        }

        let savedSubmission;
        if (submission) {
            // Update existing
            if (submission.isLocked) {
                return res.status(403).json({ message: 'Submission is locked and cannot be edited.' });
            }

            // Versioning
            submission.version += 1;
            submission.lastUpdatedAt = now;
            submission.submittedAt = now;
            submission.submittedBy = req.user.id;

            // Merge or replace submissionData
            submission.submissionData = { ...submission.submissionData, ...submissionData };

            // Basic values (backward compatibility)
            submission.notesText = notesText || submission.notesText;
            submission.githubUrl = githubUrl || submission.githubUrl;
            submission.demoVideoUrl = demoVideoUrl || submission.demoVideoUrl;
            submission.status = 'resubmitted';

            if (pptUrl) submission.pptUrl = pptUrl;
            if (documentUrl) submission.documentUrl = documentUrl;

            savedSubmission = await submission.save();

            // --- AI TRIGGER ---
            if (round && round.criteria) {
                analyzeSubmission(savedSubmission, round.criteria).then(aiResult => {
                    if (aiResult) {
                        savedSubmission.aiScore = aiResult;
                        savedSubmission.markModified('aiScore');
                        savedSubmission.save();
                    }
                }).catch(console.error);
            }
            return res.status(200).json(savedSubmission);
        } else {
            // Create new
            const roundName = round ? round.name : `Round ${roundIndex}`;

            savedSubmission = await Submission.create({
                hackathon: hackathonId,
                roundIndex,
                roundName,
                team: team._id,
                submittedBy: req.user.id,
                submissionData,
                // Legacy fields for compat
                pptUrl,
                documentUrl,
                githubUrl,
                demoVideoUrl,
                notesText,
                version: 1,
                isLate: false,
                isLocked: false
            });

            // --- AI TRIGGER FOR NEW SUBMISSION ---
            if (round && round.criteria) {
                analyzeSubmission(savedSubmission, round.criteria).then(aiResult => {
                    if (aiResult) {
                        savedSubmission.aiScore = aiResult;
                        savedSubmission.markModified('aiScore');
                        savedSubmission.save();
                    }
                }).catch(console.error);
            }

            return res.status(201).json(savedSubmission);
        }

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error processing submission' });
    }
};

// @desc    Get my team's submissions
// @route   GET /api/submissions/my
// @access  Private
const getMyTeamSubmissions = async (req, res) => {
    try {
        // Find teams user is in
        const teams = await Team.find({ members: req.user.id });
        const teamIds = teams.map(t => t._id);

        const submissions = await Submission.find({ team: { $in: teamIds } })
            .populate('hackathon', 'title')
            .sort('-submittedAt');

        res.status(200).json(submissions);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get submissions by hackathon and round (for Organizer/Judge)
// @route   GET /api/submissions/hackathon/:hackathonId/round/:roundIndex
// @access  Private (Organizer/Judge)
const getSubmissionsByRound = async (req, res) => {
    try {
        const { hackathonId, roundIndex } = req.params;

        const submissions = await Submission.find({
            hackathon: hackathonId,
            roundIndex: parseInt(roundIndex)
        })
            .populate('team', 'name teamCode')
            .populate('submittedBy', 'name email')
            .sort('-submittedAt');

        res.status(200).json(submissions);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get submission by ID
// @route   GET /api/submissions/:id
// @access  Private
const getSubmissionById = async (req, res) => {
    try {
        const submission = await Submission.findById(req.params.id)
            .populate('team', 'name teamCode');
        if (!submission) return res.status(404).json({ message: 'Submission not found' });
        res.status(200).json(submission);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    submitWork,
    getMyTeamSubmissions,
    getSubmissionsByRound,
    getSubmissionById
};
