const axios = require('axios');

const API_URL = 'http://localhost:5000/api';

async function check() {
    try {
        console.log('--- Checking Hackathons Response ---');
        const res = await axios.get(`${API_URL}/hackathons`);
        console.log('Response Structure:', Object.keys(res.data));
        console.log('Is Array?', Array.isArray(res.data));
        if (Array.isArray(res.data) && res.data.length > 0) {
            console.log('First Hackathon:', JSON.stringify(res.data[0], null, 2));
        } else if (res.data.data && Array.isArray(res.data.data)) {
            console.log('Data Array found under .data property');
            if (res.data.data.length > 0) console.log('First Hackathon:', JSON.stringify(res.data.data[0], null, 2));
        } else {
            console.log('Hackathons data:', JSON.stringify(res.data, null, 2));
        }

    } catch (error) {
        console.error('Check Failed:', error.message);
    }
}

check();
