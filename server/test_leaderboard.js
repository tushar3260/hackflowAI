const axios = require('axios');

async function testLeaderboard() {
    try {
        // 1. Need a valid Hackathon ID. Let's fetch the first one from DB via API (assuming public or dev)
        // Or hardcode if we know it. Let's try to list hackathons first (requires auth usually)
        // Actually, let's login first to get a token.

        console.log('🔑 Logging in as Organizer...');
        const authRes = await axios.post('http://localhost:5000/api/auth/login', {
            email: 'emily.chen@innovation.io', // From seed
            password: 'password123'
        });
        const token = authRes.data.token;
        console.log('✅ Logged in.');

        // 2. Get Hackathon ID (assuming Organizer has one)
        // We can use the endpoint to get organizer hackathons if it exists, or just create one.
        // Let's suspect "Global AI Innovation Challenge 2024" exists from seed.
        // We can fetch via /api/hackathons/organizer (if that route exists?) or just assume ID from previous logs?
        // previous logs had submission with ID... let's try to fetch submissions to get hackathon ID?
        // Let's use a known hackathon ID from seed if possible, or list them.

        // Let's try GET /api/hackathons (might return all?)
        // The implementation plan says GET /api/hackathons is protected for organizer.

        console.log('🔍 Fetching Hackathons...');
        const hackRes = await axios.get('http://localhost:5000/api/hackathons', {
            headers: { Authorization: `Bearer ${token}` }
        });

        if (hackRes.data.length === 0) {
            console.error('❌ No hackathons found. Please seed data first.');
            return;
        }

        const hackathonId = hackRes.data[0]._id;
        console.log(`✅ Using Hackathon ID: ${hackathonId}`);

        // 3. Trigger Leaderboard Refresh (POST)
        console.log('🏆 Refreshing Leaderboard...');
        const lbRes = await axios.post(`http://localhost:5000/api/leaderboard/${hackathonId}/refresh`, {}, {
            headers: { Authorization: `Bearer ${token}` }
        });

        console.log('✅ Leaderboard Response Status:', lbRes.status);
        console.log('📊 Rows Count:', lbRes.data.rows.length);

        if (lbRes.data.rows.length > 0) {
            const topTeam = lbRes.data.rows[0];
            console.log('🥇 Top Team:', topTeam.team.name);
            console.log('   Total Score:', topTeam.totalScore);
            console.log('   Rank:', topTeam.rank);
            if (topTeam.roundScores.length > 0) {
                console.log('   Round 1 Weighted:', topTeam.roundScores[0].weightedRoundScore);
            }
        } else {
            console.log('⚠️  Leaderboard is empty (No teams/submissions?)');
        }

    } catch (error) {
        console.error('❌ Test Failed:', error.message);
        if (error.response) {
            console.error('   Data:', error.response.data);
        }
    }
}

testLeaderboard();
