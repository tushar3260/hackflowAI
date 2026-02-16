import express from 'express';
import dotenv from 'dotenv';
import connectDB from './src/config/db.js';
import { fileURLToPath } from 'url';
import path from 'path';

// Load env vars
dotenv.config();

console.log('✅ Environment variables loaded.');

// Try loading all routes to ensure strict ESM compliance
import authRoutes from './src/routes/authRoutes.js';
import hackathonRoutes from './src/routes/hackathonRoutes.js';
import teamRoutes from './src/routes/teamRoutes.js';
import submissionRoutes from './src/routes/submissionRoutes.js';
import evaluationRoutes from './src/routes/evaluationRoutes.js';
import leaderboardRoutes from './src/routes/leaderboardRoutes.js';
import participantProfileRoutes from './src/routes/participantProfileRoutes.js';
import participationRoutes from './src/routes/participationRoutes.js';
import debugRoutes from './src/routes/debugRoutes.js';

console.log('✅ All routes imported successfully.');

console.log('🎉 ESM Conversion Verification Passed! The server should start correctly.');
process.exit(0);
