import mongoose from 'mongoose';
import { faker } from '@faker-js/faker';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

// Models
import User from './src/models/User.js';
import Hackathon from './src/models/Hackathon.js';
import Team from './src/models/Team.js';
import Submission from './src/models/Submission.js';
import Evaluation from './src/models/Evaluation.js';

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/hackflow';

// --- CONFIG ---
const PASS = 'password123';
const HASHED_PASS = PASS; // Let the model handle hashing via pre-save hook

const NUM_PARTICIPANTS = 10;
const NUM_TEAMS_PER_HACKATHON = 5;

// --- DATA LISTS ---
const users = [];
const hackathons = [];
const teams = [];

const connectDB = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('✅ Connected to MongoDB');
    } catch (err) {
        console.error('❌ DB Connection Error:', err);
        process.exit(1);
    }
};

const clearDB = async () => {
    console.log('🗑️  Clearing Database...');
    await User.deleteMany({});
    await Hackathon.deleteMany({});
    await Team.deleteMany({});
    await Submission.deleteMany({});
    await Evaluation.deleteMany({});
    console.log('✅ Database Cleared.');
};

const createUsers = async () => {
    console.log('👤 Creating Users...');

    // 1. Organizer
    const organizer = await User.create({
        name: 'Alice Organizer',
        email: 'organizer@hackflow.com',
        password: HASHED_PASS,
        role: 'organizer',
        avatar: faker.image.avatar()
    });
    users.push(organizer);

    // 2. Judges
    for (let i = 1; i <= 3; i++) {
        const judge = await User.create({
            name: `Judge ${faker.person.firstName()}`,
            email: `judge${i}@hackflow.com`,
            password: HASHED_PASS,
            role: 'judge',
            avatar: faker.image.avatar()
        });
        users.push(judge);
    }

    // 3. Participants
    for (let i = 1; i <= NUM_PARTICIPANTS; i++) {
        const participant = await User.create({
            name: faker.person.fullName(),
            email: `user${i}@hackflow.com`,
            password: HASHED_PASS,
            role: 'participant',
            avatar: faker.image.avatar()
        });
        users.push(participant);
    }

    console.log(`✅ Created ${users.length} Users.`);
    return users;
};

const createHackathons = async (organizerId, judgeIds) => {
    console.log('🏆 Creating Hackathons...');

    // 1. Active Hackathon
    const activeHackathon = await Hackathon.create({
        organizer: organizerId,
        createdBy: organizerId,
        title: 'Global AI Challenge 2024',
        description: 'Build the future of Artificial Intelligence. Solve real-world problems with generative AI.',
        theme: 'Artificial Intelligence',
        startDate: new Date(),
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Ends in 7 days
        status: 'active',
        judges: judgeIds,
        rounds: [
            {
                name: 'Idea Submission',
                order: 1,
                maxScore: 30,
                criteria: [
                    { title: 'Innovation', maxMarks: 10 },
                    { title: 'Feasibility', maxMarks: 10 },
                    { title: 'Impact', maxMarks: 10 }
                ],
                weightagePercent: 30
            },
            {
                name: 'Prototype Demo',
                order: 2,
                maxScore: 50,
                criteria: [
                    { title: 'Code Quality', maxMarks: 20 },
                    { title: 'UI/UX', maxMarks: 20 },
                    { title: 'Presentation', maxMarks: 10 }
                ],
                weightagePercent: 70
            }
        ],
        prizes: [
            { title: '1st Place', reward: '$5,000' },
            { title: '2nd Place', reward: '$2,500' },
            { title: 'Best UI', reward: 'iPad Pro' }
        ]
    });
    hackathons.push(activeHackathon);

    // 2. Past Hackathon
    const pastHackathon = await Hackathon.create({
        organizer: organizerId,
        createdBy: organizerId,
        title: 'Web3 DeFi Summit',
        description: 'Revolutionize finance with decentralized applications.',
        theme: 'DeFi & Blockchain',
        startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Started 30 days ago
        endDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // Ended 2 days ago
        status: 'completed',
        judges: judgeIds,
        rounds: [
            {
                name: 'Final Pitch',
                order: 1,
                maxScore: 100,
                criteria: [
                    { title: 'Smart Contract Security', maxMarks: 50 },
                    { title: 'Innovation', maxMarks: 50 }
                ],
                weightagePercent: 100
            }
        ]
    });
    hackathons.push(pastHackathon);

    // 3. Upcoming Hackathon
    const upcomingHackathon = await Hackathon.create({
        organizer: organizerId,
        createdBy: organizerId,
        title: 'Green Tech Future',
        description: 'Sustainable solutions for a better planet.',
        theme: 'Environmental Sustainability',
        startDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // Starts in 14 days
        endDate: new Date(Date.now() + 16 * 24 * 60 * 60 * 1000),
        status: 'upcoming',
        judges: list = [judgeIds[0]] // Only 1 judge so far
    });
    hackathons.push(upcomingHackathon);

    console.log(`✅ Created ${hackathons.length} Hackathons.`);
    return hackathons;
};

const createTeamsAndSubmissions = async (hackathon, participants, isPast = false) => {
    console.log(`⚔️  Creating Teams for "${hackathon.title}"...`);

    // Shuffle participants
    const shuffled = participants.sort(() => 0.5 - Math.random());
    const judges = users.filter(u => u.role === 'judge').map(j => j._id);

    // Create 5 teams
    for (let i = 0; i < 5; i++) {
        // Take 2 participants
        const member1 = shuffled[i * 2];
        const member2 = shuffled[i * 2 + 1];
        if (!member1 || !member2) break;

        const teamName = `${faker.word.adjective()} ${faker.animal.type()}s`;
        const code = faker.string.alphanumeric({ length: 6, casing: 'upper' });

        const team = await Team.create({
            name: teamName,
            teamCode: code,
            hackathon: hackathon._id,
            leader: member1._id,
            members: [member1._id, member2._id]
        });

        // Create Submission
        const roundName = hackathon.rounds.find(r => r.order === 1)?.name || 'Round 1';

        const submission = await Submission.create({
            team: team._id,
            hackathon: hackathon._id,
            roundIndex: 0,
            roundName: roundName,
            submittedBy: member1._id,
            notesText: `${teamName} Project Description: ${faker.lorem.paragraph()}`,
            githubUrl: 'https://github.com/hackflow/demo-project',
            demoVideoUrl: 'https://youtube.com/watch?v=demo',
            documentUrl: 'https://hackflow.com/files/project.pdf',
            status: isPast ? 'submitted' : 'submitted', // Past submissions are just submitted, evaluation is separate
            aiScore: {
                total: Math.floor(Math.random() * 40) + 60, // 60-100
                innovation: 90,
                codeQuality: 85,
                summary: 'Good start, but needs more polish.',
                strengths: ['Innovative idea', 'Clear code'],
                weaknesses: ['UI could be better']
            }
        });

        // Add Evaluations if Past or Active (simulate some judging)
        if (isPast || i < 2) { // Evaluate all past, and 2 active
            for (const judgeId of judges) {
                // Judge evaluates based on criteria
                const criteriaScores = hackathon.rounds[0].criteria.map(c => ({
                    criteriaId: c._id || new mongoose.Types.ObjectId(),
                    criteriaTitle: c.title,
                    maxMarks: c.maxMarks,
                    givenMarks: Math.floor(Math.random() * (c.maxMarks - 2)) + 2,
                    comment: 'Great work!'
                }));

                const totalScore = criteriaScores.reduce((acc, curr) => acc + curr.givenMarks, 0);

                await Evaluation.create({
                    judge: judgeId,
                    submission: submission._id,
                    hackathon: hackathon._id,
                    roundIndex: 0,
                    scores: criteriaScores,
                    judgeTotal: totalScore,
                    finalTotal: totalScore,
                    weightedScore: totalScore, // Simplified for seed
                    feedback: 'Excellent execution.'
                });
            }
        }
    }
};

const run = async () => {
    await connectDB();
    await clearDB();

    const allUsers = await createUsers();
    const organizer = allUsers.find(u => u.role === 'organizer');
    const judges = allUsers.filter(u => u.role === 'judge');
    const participants = allUsers.filter(u => u.role === 'participant');

    const allHackathons = await createHackathons(organizer._id, judges.map(j => j._id));

    // Seed Teams/Submissions for Active Hackathon
    await createTeamsAndSubmissions(allHackathons[0], participants);

    // Seed Teams/Submissions for Past Hackathon (reuse participants for simplicity, they can join multiple)
    await createTeamsAndSubmissions(allHackathons[1], participants, true);

    console.log('\n--- ✨ SEEDING COMPLETE ✨ ---');
    console.log('Login Credentials (Password for all: password123):');
    console.log('------------------------------------------------');
    console.log(`TYPE        EMAIL`);
    console.log(`Organizer   ${organizer.email}`);
    judges.forEach((j, i) => console.log(`Judge       ${j.email}`));
    participants.slice(0, 5).forEach((p, i) => console.log(`Participant user${i + 1}@hackflow.com`));
    console.log('(and 5 more participants...)');
    console.log('------------------------------------------------');

    process.exit(0);
};

run();
