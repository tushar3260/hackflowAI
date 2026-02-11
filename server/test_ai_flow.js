const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');
const path = require('path');

const API_URL = 'http://localhost:5000/api';

// --- DATA ---
// Reuse p1 from seeding OR create new if needed. 
// Assuming seeding was successful, we can use p1 credentials: alex.j@uni.edu / password123

const participant = {
    email: 'alex.j@uni.edu',
    password: 'password123'
};

const runTest = async () => {
    try {
        console.log('🤖 INITIALIZING AI FLOW TEST...');

        // 1. Login
        console.log('🔑 Logging in as Participant...');
        let token;
        try {
            const loginRes = await axios.post(`${API_URL}/auth/login`, participant);
            token = loginRes.data.token;
        } catch (e) {
            console.error('Login failed. Did you run realistic_seed.js?');
            process.exit(1);
        }

        // 2. Get Hackathon & Round
        // We need a hackathon ID. Let's fetch list.
        const hRes = await axios.get(`${API_URL}/hackathons`);
        const hackathon = hRes.data[0];
        if (!hackathon) {
            console.error('No hackathon found.');
            process.exit(1);
        }
        console.log(`   - Hackathon: ${hackathon.title}`);

        // 3. Submit Work (Update existing or new?)
        // Let's submit to Round 2 (if available) or update Round 1.
        // Round 1 was submitted in seeding. Let's update it to trigger AI again.

        console.log('📤 Submitting Project for AI Analysis...');
        const dummyFilePath = path.join(__dirname, 'ai_test_doc.pdf');
        fs.writeFileSync(dummyFilePath, 'AI Test Project Content PDF with Innovation and Blockchain keywords.');

        const formData = new FormData();
        formData.append('title', 'AI Test Submission');
        formData.append('hackathonId', hackathon._id);
        formData.append('roundIndex', '1');
        formData.append('description', 'This project uses Generative AI and Blockchain to revolutionize the market. It has a scalable microservices architecture using Docker and Kubernetes. High ROI and huge market fit.');
        formData.append('githubUrl', 'https://github.com/ai-test/repo');
        formData.append('demoVideoUrl', 'https://youtu.be/ai-test');
        formData.append('ppt', fs.createReadStream(dummyFilePath));

        const subRes = await axios.post(`${API_URL}/submissions/submit`, formData, {
            headers: {
                Authorization: `Bearer ${token}`,
                ...formData.getHeaders()
            }
        });

        console.log(`   - Submission Saved (ID: ${subRes.data._id})`);
        console.log('   - AI Check: Waiting for async process...');

        // 4. Poll for AI Score
        // The backend triggers AI async. We need to wait a bit and fetch submission again.

        let attempts = 0;
        const maxAttempts = 5;

        const checkScore = async () => {
            if (attempts >= maxAttempts) {
                console.error('❌ AI Score not generated after timeout.');
                process.exit(1);
            }

            attempts++;
            console.log(`   - Polling attempt ${attempts}...`);
            await new Promise(r => setTimeout(r, 2000)); // Wait 2s

            // We need a route to get submission.
            // Using `getMyTeamSubmissions`? yes.
            const mySubRes = await axios.get(`${API_URL}/submissions/my`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            const sub = mySubRes.data.find(s => s._id === subRes.data._id);
            if (sub && sub.aiScore && sub.aiScore.totalAiScore !== undefined) {
                console.log('✅ AI Score Generated!');
                console.log('   - Total AI Score:', sub.aiScore.totalAiScore);
                console.log('   - Summary:', sub.aiScore.summary);
                console.log('   - Innovation Score:', sub.aiScore.innovationScore);
                process.exit(0);
            } else {
                checkScore();
            }
        };

        checkScore();

        // Cleanup
        if (fs.existsSync(dummyFilePath)) fs.unlinkSync(dummyFilePath);

    } catch (e) {
        console.error('❌ TEST FAILED:', e.response?.data || e.message);
        process.exit(1);
    }
};

runTest();
