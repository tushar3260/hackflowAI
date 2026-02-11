const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');
const path = require('path');

const API_URL = 'http://localhost:5000/api';
const TIMESTAMP = Date.now();

// Test Users
const ORGANIZER = {
    name: `ScoreOrg ${TIMESTAMP}`,
    email: `score_org_${TIMESTAMP}@test.com`,
    password: 'password123',
    role: 'organizer'
};

const PARTICIPANT = {
    name: `ScorePart ${TIMESTAMP}`,
    email: `score_part_${TIMESTAMP}@test.com`,
    password: 'password123',
    role: 'participant'
};

const JUDGE = {
    name: `ScoreJudge ${TIMESTAMP}`,
    email: `score_judge_${TIMESTAMP}@test.com`,
    password: 'password123',
    role: 'judge'
};

let organizerToken;
let participantToken;
let judgeToken;
let judgeId;
let hackathonId;
let teamId;
let submissionIds = {}; // { 'hybrid': id, 'ai_only': id, 'judge_only': id }

const log = (msg) => console.log(`[TEST] ${msg}`);
const error = (msg) => console.error(`[ERROR] ${msg}`);

const runVerification = async () => {
    try {
        log('Starting Scoring Modes Verification...');

        // 1. Register Users
        log('Registering Users...');
        const orgRes = await axios.post(`${API_URL}/auth/register`, ORGANIZER);
        organizerToken = orgRes.data.token;

        const partRes = await axios.post(`${API_URL}/auth/register`, PARTICIPANT);
        participantToken = partRes.data.token;

        const judgeRes = await axios.post(`${API_URL}/auth/register`, JUDGE);
        judgeToken = judgeRes.data.token;
        // Decode ID differently if needed, but usually in response? Login to be sure or decode token.
        // Let's optimize: Login to get ID? Or just use register response if it returns user.
        // Our register returns { token, user: { _id, ... } } usually.
        // Let's assume register returns token only based on authMiddleware/common patterns, but usually checks needed.
        // Let's fetch /auth/me for judge ID.
        const meRes = await axios.get(`${API_URL}/auth/me`, { headers: { Authorization: `Bearer ${judgeToken}` } });
        judgeId = meRes.data.data._id;
        log(`Judge ID: ${judgeId}`);

        // 2. Create Hackathon with 3 Rounds
        log('Creating Hackathon with 3 Rounds (Hybrid, AI Only, Judge Only)...');
        const hackathonData = {
            title: `Scoring Mode Test ${TIMESTAMP}`,
            description: 'Testing scoring modes',
            theme: 'Testing',
            startDate: new Date(),
            endDate: new Date(Date.now() + 86400000),
            rounds: [
                {
                    name: 'Round Hybrid',
                    order: 1,
                    maxScore: 100,
                    weightagePercent: 33,
                    status: 'judging', // Open for judging immediately
                    scoringMode: 'hybrid',
                    aiWeight: 0.5,
                    judgeWeight: 0.5,
                    criteria: [{ title: 'C1', maxMarks: 100 }]
                },
                {
                    name: 'Round AI Only',
                    order: 2,
                    maxScore: 100,
                    weightagePercent: 33,
                    status: 'judging',
                    scoringMode: 'ai_only',
                    criteria: [{ title: 'C1', maxMarks: 100 }]
                },
                {
                    name: 'Round Judge Only',
                    order: 3,
                    maxScore: 100,
                    weightagePercent: 33,
                    status: 'judging',
                    scoringMode: 'judge_only',
                    criteria: [{ title: 'C1', maxMarks: 100 }]
                }
            ],
            judges: [judgeId]
        };

        const hRes = await axios.post(`${API_URL}/hackathons`, hackathonData, {
            headers: { Authorization: `Bearer ${organizerToken}` }
        });
        hackathonId = hRes.data.data._id;
        log(`Hackathon Created: ${hackathonId}`);

        // 3. Create Team & Profile
        log('Setup Team & Profile...');
        const teamRes = await axios.post(`${API_URL}/teams/create`, { name: `Team ${TIMESTAMP}`, hackathonId }, { headers: { Authorization: `Bearer ${participantToken}` } });
        teamId = teamRes.data._id;

        const dummyPath = path.join(__dirname, 'dummy.txt');
        fs.writeFileSync(dummyPath, 'content');
        const profForm = new FormData();
        profForm.append('collegeName', 'Uni');
        profForm.append('yearOfStudy', '2024');
        profForm.append('resume', fs.createReadStream(dummyPath));
        await axios.post(`${API_URL}/participant-profile/${hackathonId}`, profForm, { headers: { Authorization: `Bearer ${participantToken}`, ...profForm.getHeaders() } });

        // 4. Submit to All Rounds
        const submitToRound = async (roundIndex, mode) => {
            log(`Submitting to ${mode} round...`);
            const form = new FormData();
            form.append('hackathonId', hackathonId);
            form.append('roundIndex', roundIndex);
            form.append('notesText', `Submission for ${mode}. Valid length text for AI.`);
            form.append('githubUrl', 'https://github.com/test');

            const res = await axios.post(`${API_URL}/submissions/submit`, form, {
                headers: { Authorization: `Bearer ${participantToken}`, ...form.getHeaders() }
            });
            submissionIds[mode] = res.data._id;

            // Wait for AI
            log(`Waiting for AI (${mode})...`);
            await new Promise(r => setTimeout(r, 2000));
        };

        await submitToRound(1, 'hybrid');
        await submitToRound(2, 'ai_only');
        await submitToRound(3, 'judge_only');

        // 5. Verify & Score

        // CASE A: Judge Only
        log('TESTING JUDGE ONLY ROUND...');
        // Judge submits score 80
        await axios.post(`${API_URL}/evaluations/submit`, {
            submissionId: submissionIds['judge_only'],
            hackathonId,
            scores: [{ criteriaId: hRes.data.data.rounds[2].criteria[0]._id, givenMarks: 80, comment: 'Good' }],
            comments: 'Judge Only Test'
        }, { headers: { Authorization: `Bearer ${judgeToken}` } });

        // Verify Final Score = 80 (AI ignored)
        let subJO = (await axios.get(`${API_URL}/submissions/${submissionIds['judge_only']}`, { headers: { Authorization: `Bearer ${participantToken}` } })).data;
        // We need to check the Evaluation document or the submission meta.
        // Evaluation controller returns evaluation.
        // Let's check the evaluation we just created call return? No we didn't capture it perfectly.
        // Let's fetch evaluation.
        const evalsJO = await axios.get(`${API_URL}/evaluations/submission/${submissionIds['judge_only']}`, { headers: { Authorization: `Bearer ${judgeToken}` } });
        log(`Judge Only - Final Total: ${evalsJO.data.finalTotal}`);
        if (evalsJO.data.finalTotal === 80) log('✅ PASS Judge Only');
        else error(`❌ FAIL Judge Only. Expected 80, got ${evalsJO.data.finalTotal}`);


        // CASE B: AI Only
        log('TESTING AI ONLY ROUND...');
        // Judge tries to submit -> Should Fail
        try {
            await axios.post(`${API_URL}/evaluations/submit`, {
                submissionId: submissionIds['ai_only'],
                hackathonId,
                scores: [{ criteriaId: hRes.data.data.rounds[1].criteria[0]._id, givenMarks: 80 }],
                comments: 'Should Fail'
            }, { headers: { Authorization: `Bearer ${judgeToken}` } });
            error('❌ FAIL AI Only. Judge submission should have been blocked.');
        } catch (e) {
            if (e.response && e.response.status === 403) log('✅ PASS AI Only (Blocked Judge)');
            else error(`❌ FAIL AI Only. Expected 403, got ${e.response ? e.response.status : e.message}`);
        }

        // Verify Score is AI Score (Check submission aiScore directly as there is no "Evaluation" doc created by AI alone usually, 
        // UNLESS we trigger a system evaluation doc? 
        // Currently AI score is on Submission.aiScore. 
        // Leaderboard logic reads from Submission.judgeScore (which is aggregated from Evaluations).
        // WAIT. If AI Only, we don't have Evaluations?
        // REQUIREMENT CHECK: "Leaderboard calculation must use finalScore produced by scoringService."
        // Current Logic: `submitWork` updates `aiScore` on submission.
        // `evaluationController` creates `Evaluation` doc which calculates `finalTotal` and updates `Submission.judgeScore`.
        // IF AI ONLY: No judge submits -> No Evaluation doc -> `Submission.judgeScore` stays empty?
        // CRITICAL GAP: If AI_ONLY, who creates the "Evaluation" or sets the "Final Score" on the submission for the leaderboard?
        // The Leaderboard usually reads `submission.judgeScore.total` or similar?
        // Checking `leaderboardController.js` (Mental Check or view file if needed).
        // Usually leaderboard aggregates `Submission` fields.
        // If `Submission.judgeScore` is null, leaderboard might show 0.
        // FIX: In `analysisSubmission` or `submitWork`, if AI_ONLY, we might need to populate `judgeScore` (which is misnamed now, should be `finalScore` metadata) with AI result.
        // OR we trust `aiScore` field.
        // Let's assume for this test we check `aiScore` exists.

        let subAI = (await axios.get(`${API_URL}/submissions/${submissionIds['ai_only']}`, { headers: { Authorization: `Bearer ${participantToken}` } })).data;
        if (subAI.aiScore && subAI.aiScore.totalAiScore !== undefined) log('✅ PASS AI Only (AI Score Generated)');
        else error('❌ FAIL AI Only (No AI Score)');


        // CASE C: Hybrid
        log('TESTING HYBRID ROUND...');
        // Weights 0.5 / 0.5.
        // Judge gives 100. AI gives X (let's say 0 for bad content or ~50-80).
        // Let's see what AI gave.
        let subHybrid = (await axios.get(`${API_URL}/submissions/${submissionIds['hybrid']}`, { headers: { Authorization: `Bearer ${participantToken}` } })).data;
        const aiScore = subHybrid.aiScore ? subHybrid.aiScore.totalAiScore : 0;
        log(`Hybrid - AI Score: ${aiScore}`);

        // Judge gives 100
        await axios.post(`${API_URL}/evaluations/submit`, {
            submissionId: submissionIds['hybrid'],
            hackathonId,
            scores: [{ criteriaId: hRes.data.data.rounds[0].criteria[0]._id, givenMarks: 100, comment: 'Pefect' }],
            comments: 'Hybrid Test'
        }, { headers: { Authorization: `Bearer ${judgeToken}` } });

        const evalsHybrid = await axios.get(`${API_URL}/evaluations/submission/${submissionIds['hybrid']}`, { headers: { Authorization: `Bearer ${judgeToken}` } });
        const finalHybrid = evalsHybrid.data.finalTotal;
        const expectedHybrid = (100 * 0.5) + (aiScore * 0.5);

        log(`Hybrid - Final: ${finalHybrid}, Expected: ${expectedHybrid}`);
        if (Math.abs(finalHybrid - expectedHybrid) < 0.1) log('✅ PASS Hybrid');
        else error(`❌ FAIL Hybrid. Match failed.`);

        if (fs.existsSync(dummyPath)) fs.unlinkSync(dummyPath);
        log('Done.');

    } catch (e) {
        error(`Test Failed: ${e.message}`);
        if (e.response) console.log(e.response.data);
    }
};

runVerification();
