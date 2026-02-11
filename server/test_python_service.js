const axios = require('axios');

const run = async () => {
    try {
        console.log('Testing Python Service at http://localhost:8000/analyze-submission');
        const res = await axios.post('http://localhost:8000/analyze-submission', {
            notesText: "This is a test submission with innovation and blockchain.",
            criteria: [{ title: "Innovation", maxMarks: 10 }]
        });
        console.log('✅ Status:', res.status);
        console.log('✅ Data:', res.data);
    } catch (e) {
        console.error('❌ Failed:', e.message);
        if (e.response) console.error('   Data:', e.response.data);
    }
};
run();
