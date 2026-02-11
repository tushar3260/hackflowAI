const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
    hackathon: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Hackathon',
        required: true
    },
    roundIndex: {
        type: Number,
        required: true
    },
    roundName: {
        type: String,
        required: true
    },
    team: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Team',
        required: true
    },
    submittedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    // Content
    pptUrl: { type: String },
    documentUrl: { type: String },
    githubUrl: { type: String },
    demoVideoUrl: { type: String },
    notesText: { type: String },

    // Dynamic Content
    submissionData: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    },

    // Meta
    version: {
        type: Number,
        default: 1
    },
    isLocked: {
        type: Boolean,
        default: false
    },
    lockedAt: {
        type: Date
    },
    lastUpdatedAt: {
        type: Date
    },
    submittedAt: {
        type: Date,
        default: Date.now
    },
    isLate: {
        type: Boolean,
        default: false
    },
    status: {
        type: String,
        enum: ['submitted', 'resubmitted', 'locked'],
        default: 'submitted'
    },
    // Placeholders for future scoring
    aiScore: {
        type: Object,
        default: {}
    },
    judgeScore: {
        type: Object,
        default: {}
    }
});

module.exports = mongoose.model('Submission', submissionSchema);
