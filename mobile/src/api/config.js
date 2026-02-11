
import axios from 'axios';

// Get base URL from env, default to localhost for emulator if missing
// Note: For Android Emulator use http://10.0.2.2:5000, for iOS Simulator http://localhost:5000
// For physical device, use your computer's local IP address e.g. http://192.168.1.5:5000
const BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:5000/api';

const api = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

export const SERVER_URL = BASE_URL.replace('/api', '');

export default api;
