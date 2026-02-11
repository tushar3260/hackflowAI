
const mongoose = require('mongoose');

const participantProfileSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    hackathon: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Hackathon',
        required: true
    },
    fullName: {
        type: String,
        required: [true, 'Full Name is required']
    },
    collegeName: {
        type: String,
        required: [true, 'College Name is required']
    },
    course: {
        type: String
    },
    yearOfStudy: {
        type: String,
        required: [true, 'Year of Study is required']
    },
    phone: {
        type: String,
        required: [true, 'Phone number is required']
    },
    skills: {
        type: [String],
        default: []
    },
    githubUrl: {
        type: String
    },
    linkedinUrl: {
        type: String
    },
    resumeUrl: {
        type: String
    },
    status: {
        type: String,
        enum: ['incomplete', 'completed'],
        default: 'completed'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Enforce unique profile per user per hackathon
participantProfileSchema.index({ user: 1, hackathon: 1 }, { unique: true });

module.exports = mongoose.model('HackathonParticipantProfile', participantProfileSchema);
