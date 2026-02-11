const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');
const path = require('path');

const API_URL = 'http://localhost:5000/api';
const TIMESTAMP = Date.now();

// Test Users
const ORGANIZER = {
    name: `Test Organizer ${TIMESTAMP}`,
    email: `organizer_${TIMESTAMP}@test.com`,
    password: 'password123',
    role: 'organizer'
};

const PARTICIPANT = {
    name: `Test Participant ${TIMESTAMP}`,
    email: `participant_${TIMESTAMP}@test.com`,
    password: 'password123',
    role: 'participant'
};

let organizerToken;
let participantToken;
let hackathonId;
let submissionId;

const log = (msg) => console.log(`[TEST] ${msg}`);
const error = (msg) => console.error(`[ERROR] ${msg}`);

const runVerification = async () => {
    try {
        log('Starting AI System Verification...');

        // 1. Register Users
        log('Registering Organizer...');
        const orgRes = await axios.post(`${API_URL}/auth/register`, ORGANIZER);
        organizerToken = orgRes.data.token;

        log('Registering Participant...');
        const partRes = await axios.post(`${API_URL}/auth/register`, PARTICIPANT);
        participantToken = partRes.data.token;

        // 2. Create Hackathon
        log('Creating Hackathon...');
        const hackathonData = {
            title: `AI Test Hackathon ${TIMESTAMP}`,
            description: 'A test hackathon for AI verification',
            theme: 'AI',
            startDate: new Date(),
            endDate: new Date(Date.now() + 86400000), // Tomorrow
            rounds: [
                {
                    name: 'Round 1',
                    order: 1,
                    maxScore: 100,
                    weightagePercent: 100,
                    status: 'open',
                    startTime: new Date(),
                    endTime: new Date(Date.now() + 86400000),
                    autoTimeControlEnabled: false,
                    criteria: [
                        { title: 'Project Documentation', maxMarks: 50 },
                        { title: 'Code Quality', maxMarks: 50 }
                    ]
                }
            ]
        };

        const hRes = await axios.post(`${API_URL}/hackathons`, hackathonData, {
            headers: { Authorization: `Bearer ${organizerToken}` }
        });
        hackathonId = hRes.data.data._id; // Response structure might be { success: true, data: {...} } or just {...}
        // Check structure
        if (!hackathonId && hRes.data._id) hackathonId = hRes.data._id;

        log(`Hackathon Created: ${hackathonId}`);

        // 3. Create Team
        log('Creating Team...');
        const teamRes = await axios.post(`${API_URL}/teams/create`, {
            name: `AI Test Team ${TIMESTAMP}`,
            hackathonId: hackathonId
        }, {
            headers: { Authorization: `Bearer ${participantToken}` }
        });
        const teamId = teamRes.data._id;
        log(`Team Created: ${teamId}`);

        // 3.5 Complete Profile (Required by guard)
        log('Completing Profile...');
        // We need to attach a dummy resume.
        const dummyResumePath = path.join(__dirname, 'dummy_resume.pdf');
        fs.writeFileSync(dummyResumePath, 'Dummy Resume Content');
        const profileForm = new FormData();
        profileForm.append('collegeName', 'Test Uni');
        profileForm.append('yearOfStudy', '2024');
        profileForm.append('resume', fs.createReadStream(dummyResumePath));

        await axios.post(`${API_URL}/participant-profile/${hackathonId}`, profileForm, {
            headers: {
                Authorization: `Bearer ${participantToken}`,
                ...profileForm.getHeaders()
            }
        });

        // 4. Submit Work
        log('Submitting Project...');
        const subForm = new FormData();
        subForm.append('hackathonId', hackathonId);
        subForm.append('roundIndex', 1);
        subForm.append('notesText', 'This project features comprehensive documentation and high quality code. It is an innovative AI solution.');
        subForm.append('githubUrl', 'https://github.com/test/repo');

        const subRes = await axios.post(`${API_URL}/submissions/submit`, subForm, {
            headers: {
                Authorization: `Bearer ${participantToken}`,
                ...subForm.getHeaders()
            }
        });
        submissionId = subRes.data._id;
        log(`Submission Created: ${submissionId}`);

        // 5. Poll for AI Score (Automated Trigger)
        log('Waiting for AI Analysis (5s)...');
        await new Promise(r => setTimeout(r, 5000));

        let submission = (await axios.get(`${API_URL}/submissions/${submissionId}`, {
            headers: { Authorization: `Bearer ${participantToken}` }
        })).data;

        if (submission.aiScore && submission.aiScore.totalAiScore !== undefined) {
            log('✅ PASS: Automated AI Trigger worked!');
            log(`   Score: ${submission.aiScore.totalAiScore}`);
        } else {
            error('❌ FAIL: Automated AI Trigger did NOT produce a score.');
        }

        // 6. Test Debug Endpoint
        log('Testing Debug Endpoint...');
        // Reset score logic? No, just overwrite.
        const debugRes = await axios.post(`${API_URL}/debug/run-ai/${submissionId}`, {}, {
            headers: { Authorization: `Bearer ${organizerToken}` }
        });

        if (debugRes.status === 200 && debugRes.data.aiScore) {
            log('✅ PASS: Debug Endpoint worked!');
            log(`   Score: ${debugRes.data.aiScore.totalAiScore}`);
        } else {
            error('❌ FAIL: Debug Endpoint failed.');
        }

        log('Verification Complete.');

        // Cleanup paths
        if (fs.existsSync(dummyResumePath)) fs.unlinkSync(dummyResumePath);

    } catch (e) {
        error(`Test Failed: ${e.message}`);
        if (e.response) {
            console.error('Response Data:', e.response.data);
        }
    }
};

runVerification();
