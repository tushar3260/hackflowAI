import mongoose from 'mongoose';

const scoreSchema = new mongoose.Schema({
    criteriaId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    criteriaTitle: {
        type: String,
        required: true
    },
    maxMarks: {
        type: Number,
        required: true
    },
    givenMarks: {
        type: Number,
        required: true,
        min: 0
    },
    comment: {
        type: String
    }
});

const evaluationSchema = new mongoose.Schema({
    submission: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Submission',
        required: true
    },
    hackathon: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Hackathon',
        required: true
    },
    roundIndex: {
        type: Number,
        required: true
    },
    judge: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    scores: [scoreSchema],

    // Totals
    judgeTotal: {
        type: Number,
        required: true,
        default: 0
    },
    aiTotal: {
        type: Number,
        default: 0
    },
    finalTotal: {
        type: Number,
        required: true,
        default: 0
    },
    weightedScore: {
        type: Number,
        required: true,
        default: 0
    },

    comments: {
        type: String
    }
}, { timestamps: true });

// Compound index to ensure one judge per submission
evaluationSchema.index({ submission: 1, judge: 1 }, { unique: true });

export default mongoose.model('Evaluation', evaluationSchema);
