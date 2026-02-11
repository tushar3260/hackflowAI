import { useState, useEffect, useCallback } from 'react';
import api from '../config';

export const useSubmissions = (hackathonId, roundIndex = null) => {
    const [submissions, setSubmissions] = useState([]);
    const [mySubmissions, setMySubmissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchMySubmissions = useCallback(async () => {
        try {
            setLoading(true);
            const config = {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            };
            const { data } = await api.get('/submit/my', config);
            setMySubmissions(data.data || []);
            setError(null);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to fetch my submissions');
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchRoundSubmissions = useCallback(async () => {
        if (!hackathonId || roundIndex === null) return;
        try {
            setLoading(true);
            const config = {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            };
            const { data } = await api.get(`/submit/hackathon/${hackathonId}/round/${roundIndex}`, config);
            setSubmissions(data.data || []);
            setError(null);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to fetch round submissions');
        } finally {
            setLoading(false);
        }
    }, [hackathonId, roundIndex]);

    useEffect(() => {
        if (hackathonId && roundIndex !== null) {
            fetchRoundSubmissions();
        } else {
            fetchMySubmissions();
        }
    }, [hackathonId, roundIndex, fetchMySubmissions, fetchRoundSubmissions]);

    return { submissions, mySubmissions, loading, error, refetch: (hackathonId && roundIndex !== null) ? fetchRoundSubmissions : fetchMySubmissions };
};
