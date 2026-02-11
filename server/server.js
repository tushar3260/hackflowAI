const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./src/config/db');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Middleware
app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true
}));
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Routes
app.use('/api/auth', require('./src/routes/authRoutes'));
app.use('/api/hackathons', require('./src/routes/hackathonRoutes'));
app.use('/api/teams', require('./src/routes/teamRoutes'));
app.use('/api/submissions', require('./src/routes/submissionRoutes'));
app.use('/api/evaluations', require('./src/routes/evaluationRoutes'));
app.use('/api/leaderboard', require('./src/routes/leaderboardRoutes'));
app.use('/api/participant-profile', require('./src/routes/participantProfileRoutes'));
app.use('/api/participation', require('./src/routes/participationRoutes'));
app.use('/api/debug', require('./src/routes/debugRoutes'));
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
