import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './src/config/db.js';

import authRoutes from './src/routes/authRoutes.js';
import hackathonRoutes from './src/routes/hackathonRoutes.js';
import teamRoutes from './src/routes/teamRoutes.js';
import submissionRoutes from './src/routes/submissionRoutes.js';
import evaluationRoutes from './src/routes/evaluationRoutes.js';
import leaderboardRoutes from './src/routes/leaderboardRoutes.js';
import participantProfileRoutes from './src/routes/participantProfileRoutes.js';
import participationRoutes from './src/routes/participationRoutes.js';
import debugRoutes from './src/routes/debugRoutes.js';

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
app.use('/api/auth', authRoutes);
app.use('/api/hackathons', hackathonRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/submissions', submissionRoutes);
app.use('/api/evaluations', evaluationRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/participant-profile', participantProfileRoutes);
app.use('/api/participation', participationRoutes);
app.use('/api/debug', debugRoutes);
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
