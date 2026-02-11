const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');
const path = require('path');

const API_URL = 'http://localhost:5000/api';
const suffix = Math.floor(Math.random() * 10000);

// Users
const organizer = {
    name: 'Org User',
    email: `org_sub_${suffix}@test.com`,
    password: 'password123',
    role: 'organizer'
};

const participant = {
    name: 'Part User',
    email: `part_sub_${suffix}@test.com`,
    password: 'password123',
    role: 'participant'
};

let orgToken, partToken;
let hackathonId, teamCode;

const createDummyFile = (filename) => {
    const filePath = path.join(__dirname, filename);
    fs.writeFileSync(filePath, 'Dummy content for testing submission');
    return filePath;
};

const runVerification = async () => {
    try {
        console.log('--- STARTING SUBMISSION VERIFICATION ---');

        // 1. Auth & Setup
        console.log('1. Setting up Users...');
        await axios.post(`${API_URL}/auth/register`, organizer).catch(() => { });
        const orgLog = await axios.post(`${API_URL}/auth/login`, { email: organizer.email, password: organizer.password });
        orgToken = orgLog.data.token;

        await axios.post(`${API_URL}/auth/register`, participant).catch(() => { });
        const partLog = await axios.post(`${API_URL}/auth/login`, { email: participant.email, password: participant.password });
        partToken = partLog.data.token;

        // 2. Create Hackathon
        console.log('2. Creating Hackathon...');
        const hRes = await axios.post(`${API_URL}/hackathons`, {
            title: `Sub Test Hackathon ${suffix}`,
            description: 'Test',
            theme: 'Test',
            startDate: new Date(),
            endDate: new Date(Date.now() + 86400000),
            rounds: [{ name: 'Round 1', order: 1, maxScore: 100, weightagePercent: 100, criteria: [] }]
        }, { headers: { Authorization: `Bearer ${orgToken}` } });
        hackathonId = hRes.data._id;

        // 3. Create Team
        console.log('3. Creating Team...');
        const tRes = await axios.post(`${API_URL}/teams/create`, {
            name: `Sub Team ${suffix}`,
            hackathonId
        }, { headers: { Authorization: `Bearer ${partToken}` } });
        teamCode = tRes.data.teamCode;

        // 4. Submit Work
        console.log('4. Submitting Work...');
        const file1 = createDummyFile('test_ppt.pdf');
        const file2 = createDummyFile('test_doc.pdf');

        const form = new FormData();
        form.append('hackathonId', hackathonId);
        form.append('roundIndex', 1);
        form.append('notesText', 'This is a test submission');
        form.append('githubUrl', 'https://github.com/test/repo');
        form.append('ppt', fs.createReadStream(file1));
        form.append('document', fs.createReadStream(file2));

        const submitRes = await axios.post(`${API_URL}/submissions/submit`, form, {
            headers: {
                Authorization: `Bearer ${partToken}`,
                ...form.getHeaders()
            }
        });
        console.log(`✅ Submission ID: ${submitRes.data._id}`);

        // 5. Verify Submission
        console.log('5. Verifying Submission (Organizer View)...');
        const verifyRes = await axios.get(`${API_URL}/submissions/hackathon/${hackathonId}/round/1`, {
            headers: { Authorization: `Bearer ${orgToken}` }
        });

        if (verifyRes.data.length > 0 && verifyRes.data[0].notesText === 'This is a test submission') {
            console.log('✅ SUCCESS: Submission verified via API.');
        } else {
            console.error('❌ FAILURE: Submission not found or data mismatch.');
        }

        // Cleanup
        fs.unlinkSync(file1);
        fs.unlinkSync(file2);
        console.log('--- VERIFICATION COMPLETE ---');

    } catch (e) {
        console.error('❌ VERIFICATION FAILED:', e.response?.data || e.message);
    }
};

runVerification();
