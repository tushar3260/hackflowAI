import mongoose from 'mongoose';

const judgeInvitationSchema = new mongoose.Schema({
    hackathon: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Hackathon',
        required: true
    },
    organizer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    judgeEmail: {
        type: String,
        required: true,
        match: [
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            'Please add a valid email'
        ]
    },
    inviteToken: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'accepted', 'expired'],
        default: 'pending'
    },
    expiresAt: {
        type: Date,
        required: true
    },
    acceptedAt: {
        type: Date
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Compound index to prevent duplicate pending invites for same judge/hackathon
judgeInvitationSchema.index({ hackathon: 1, judgeEmail: 1, status: 1 }, { unique: true, partialFilterExpression: { status: 'pending' } });

export default mongoose.model('JudgeInvitation', judgeInvitationSchema);
