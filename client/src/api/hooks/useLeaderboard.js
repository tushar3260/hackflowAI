import { useState, useEffect, useCallback } from 'react';
import api from '../config';

export const useLeaderboard = (hackathonId) => {
    const [leaderboard, setLeaderboard] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchLeaderboard = useCallback(async () => {
        if (!hackathonId) return;

        try {
            setLoading(true);
            const config = {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            };
            const { data } = await api.get(`/leaderboard/${hackathonId}`, config);
            setLeaderboard(data.data);
            setError(null);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to fetch leaderboard');
        } finally {
            setLoading(false);
        }
    }, [hackathonId]);

    // Initial fetch
    useEffect(() => {
        fetchLeaderboard();
    }, [fetchLeaderboard]);

    // Polling every 30 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            fetchLeaderboard();
        }, 30000);
        return () => clearInterval(interval);
    }, [fetchLeaderboard]);

    return { leaderboard, loading, error, refetch: fetchLeaderboard };
};
