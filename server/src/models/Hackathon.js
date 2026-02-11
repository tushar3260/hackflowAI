const mongoose = require('mongoose');

const criteriaSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    maxMarks: {
        type: Number,
        required: true
    },
    description: {
        type: String
    }
});

const roundSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    order: {
        type: Number,
        required: true
    },
    maxScore: {
        type: Number,
        required: true
    },
    weightagePercent: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['draft', 'open', 'submission_closed', 'judging', 'published'],
        default: 'draft'
    },
    scoringMode: {
        type: String,
        enum: ['hybrid', 'ai_only', 'judge_only'],
        default: 'hybrid'
    },
    aiWeight: {
        type: Number,
        default: 0.3,
        min: 0,
        max: 1
    },
    judgeWeight: {
        type: Number,
        default: 0.7,
        min: 0,
        max: 1
    },
    deadline: {
        type: Date
    },
    startTime: {
        type: Date
    },
    endTime: {
        type: Date
    },
    autoTimeControlEnabled: {
        type: Boolean,
        default: true
    },
    submissionSchema: [{
        fieldKey: { type: String, required: true },
        label: { type: String, required: true },
        type: {
            type: String,
            enum: ['file', 'text', 'textarea', 'url', 'github', 'ppt', 'video'],
            required: true
        },
        required: { type: Boolean, default: false },
        maxFiles: { type: Number, default: 1 },
        allowedFileTypes: [String],
        placeholder: { type: String },
        helpText: { type: String }
    }],
    criteria: [criteriaSchema]
});

const hackathonSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please add a title']
    },
    description: {
        type: String,
        required: [true, 'Please add a description']
    },
    theme: {
        type: String,
        required: [true, 'Please add a theme']
    },
    startDate: {
        type: Date,
        required: [true, 'Please add a start date']
    },
    endDate: {
        type: Date,
        required: [true, 'Please add an end date']
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    organizer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    students: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    judges: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    // Optional: Map round order to specific judges
    // Structure: { "1": [userId, userId], "2": [userId] }
    roundJudges: {
        type: Map,
        of: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
        default: {}
    },
    status: {
        type: String,
        default: 'upcoming' // Assuming a default status like 'upcoming'
    },
    isActive: {
        type: Boolean,
        default: true
    },
    difficulty: {
        type: String,
        enum: ['Beginner', 'Intermediate', 'Advanced'],
        default: 'Intermediate'
    },
    rounds: [roundSchema],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Hackathon', hackathonSchema);
