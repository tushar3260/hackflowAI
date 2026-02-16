import mongoose from 'mongoose';

const teamSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a team name'],
        trim: true
    },
    teamCode: {
        type: String,
        required: true,
        unique: true,
        uppercase: true,
        minlength: 6,
        maxlength: 6
    },
    leader: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    members: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    hackathon: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Hackathon',
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Ensure a user cannot be in multiple teams for the same hackathon
// Note: This is complex to enforce purely largely at schema level for 'members' array efficiently without compound indexes on subdocuments which Mongo doesn't fully support for "is member of ANY team in hackathon X".
// We will enforce the "one team per hackathon" rule strictly in the Controller logic.

export default mongoose.model('Team', teamSchema);
