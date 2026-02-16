import express from 'express';
console.log('✅ Express imported');

import dotenv from 'dotenv';
dotenv.config();
console.log('✅ Dotenv loaded');

import connectDB from './src/config/db.js';
console.log('✅ ConnectDB imported');

try {
    const authRoutes = await import('./src/routes/authRoutes.js');
    console.log('✅ AuthRoutes imported');
} catch (e) {
    console.error('❌ AuthRoutes failed:', e);
}

try {
    const hackathonRoutes = await import('./src/routes/hackathonRoutes.js');
    console.log('✅ HackathonRoutes imported');
} catch (e) {
    console.error('❌ HackathonRoutes failed:', e);
}

try {
    const teamRoutes = await import('./src/routes/teamRoutes.js');
    console.log('✅ TeamRoutes imported');
} catch (e) {
    console.error('❌ TeamRoutes failed:', e);
}

try {
    const submissionRoutes = await import('./src/routes/submissionRoutes.js');
    console.log('✅ SubmissionRoutes imported');
} catch (e) {
    console.error('❌ SubmissionRoutes failed:', e);
}

try {
    const evaluationRoutes = await import('./src/routes/evaluationRoutes.js');
    console.log('✅ EvaluationRoutes imported');
} catch (e) {
    console.error('❌ EvaluationRoutes failed:', e);
}

try {
    const leaderboardRoutes = await import('./src/routes/leaderboardRoutes.js');
    console.log('✅ LeaderboardRoutes imported');
} catch (e) {
    console.error('❌ LeaderboardRoutes failed:', e);
}

try {
    const participantProfileRoutes = await import('./src/routes/participantProfileRoutes.js');
    console.log('✅ ParticipantProfileRoutes imported');
} catch (e) {
    console.error('❌ ParticipantProfileRoutes failed:', e);
}

try {
    const participationRoutes = await import('./src/routes/participationRoutes.js');
    console.log('✅ ParticipationRoutes imported');
} catch (e) {
    console.error('❌ ParticipationRoutes failed:', e);
}

try {
    const debugRoutes = await import('./src/routes/debugRoutes.js');
    console.log('✅ DebugRoutes imported');
} catch (e) {
    console.error('❌ DebugRoutes failed:', e);
}

console.log('🏁 Debug check complete');
process.exit(0);
