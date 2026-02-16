import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

// Random suffix to avoid duplicate email errors on re-runs
const suffix = Math.floor(Math.random() * 10000);

const organizer = {
    name: 'Org User',
    email: `org${suffix}@test.com`,
    password: 'password123',
    role: 'organizer'
};

const userA = {
    name: 'User A',
    email: `usera${suffix}@test.com`,
    password: 'password123',
    role: 'participant'
};

const userB = {
    name: 'User B',
    email: `userb${suffix}@test.com`,
    password: 'password123',
    role: 'participant'
};

let orgToken;
let userAToken;
let userBToken;
let hackathonId;
let teamCode;

const runVerification = async () => {
    try {
        console.log('--- STARTING VERIFICATION ---');

        // 1. Register Organizer
        console.log('1. Registering Organizer...');
        try {
            await axios.post(`${API_URL}/auth/register`, organizer);
        } catch (e) {
            // Ignore if already exists (unlikely with random suffix but good practice)
        }

        // Login Organizer
        const orgLogin = await axios.post(`${API_URL}/auth/login`, {
            email: organizer.email,
            password: organizer.password
        });
        orgToken = orgLogin.data.token;
        console.log('✅ Organizer Logged In');

        // 2. Create Hackathon
        console.log('2. Creating Hackathon...');
        const hackathonData = {
            title: `Test Hackathon ${suffix}`,
            description: 'A test hackathon',
            theme: 'Testing',
            startDate: new Date(),
            endDate: new Date(Date.now() + 86400000), // Tomorrow
            rounds: [
                {
                    name: 'Round 1',
                    order: 1,
                    maxScore: 100,
                    weightagePercent: 100,
                    criteria: [{ title: 'Criteria 1', maxMarks: 100 }]
                }
            ]
        };
        const hackRes = await axios.post(`${API_URL}/hackathons`, hackathonData, {
            headers: { Authorization: `Bearer ${orgToken}` }
        });
        hackathonId = hackRes.data._id;
        console.log(`✅ Hackathon Created: ${hackathonId}`);

        // 3. Register & Login Participant A
        console.log('3. Setting up Participant A...');
        await axios.post(`${API_URL}/auth/register`, userA);
        const loginA = await axios.post(`${API_URL}/auth/login`, { email: userA.email, password: userA.password });
        userAToken = loginA.data.token;
        console.log('✅ User A Logged In');

        // 4. Create Team (User A)
        console.log('4. User A Creating Team...');
        const teamRes = await axios.post(`${API_URL}/teams/create`, {
            name: `Team ${suffix}`,
            hackathonId: hackathonId
        }, {
            headers: { Authorization: `Bearer ${userAToken}` }
        });
        teamCode = teamRes.data.teamCode;
        console.log(`✅ Team Created. Code: ${teamCode}`);

        // 5. Register & Login Participant B
        console.log('5. Setting up Participant B...');
        await axios.post(`${API_URL}/auth/register`, userB);
        const loginB = await axios.post(`${API_URL}/auth/login`, { email: userB.email, password: userB.password });
        userBToken = loginB.data.token;
        console.log('✅ User B Logged In');

        // 6. Join Team (User B)
        console.log('6. User B Joining Team...');
        await axios.post(`${API_URL}/teams/join`, {
            teamCode: teamCode
        }, {
            headers: { Authorization: `Bearer ${userBToken}` }
        });
        console.log('✅ User B Joined Team');

        // 7. Verify Team Members (Organizer View)
        console.log('7. Verifying Team Composition (Organizer)...');
        const teamCheckRes = await axios.get(`${API_URL}/teams/hackathon/${hackathonId}`, {
            headers: { Authorization: `Bearer ${orgToken}` }
        });

        const team = teamCheckRes.data.find(t => t.teamCode === teamCode);
        if (team.members.length === 2) {
            console.log('✅ SUCCESS: Team has 2 members.');
        } else {
            console.error('❌ FAILURE: Team member count mismatch.', team.members.length);
        }

        console.log('--- VERIFICATION COMPLETE ---');

    } catch (error) {
        console.error('❌ VERIFICATION FAILED:', error.response?.data || error.message);
    }
};

runVerification();
