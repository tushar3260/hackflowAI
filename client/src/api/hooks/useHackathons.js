
import { useState, useEffect, useCallback } from 'react';
import api from '../config';
import { useAuth } from '../../context/AuthContext';

export const useHackathons = (filters = {}) => {
    const { user } = useAuth();
    const [hackathons, setHackathons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchHackathons = useCallback(async () => {
        try {
            setLoading(true);

            // Build query string from filters
            const params = new URLSearchParams();
            Object.entries(filters).forEach(([key, value]) => {
                if (value) params.append(key, value);
            });

            // If user is organizer and no specific filters (like for public landing), they might want their own?
            // BUT for this hook's general purpose (public listing), we stick to /hackathons.
            // If we need "My Hackathons" for organizers, we should probably use a different hook or explicit param.

            const config = {};
            const token = localStorage.getItem('token');
            if (token) {
                config.headers = { Authorization: `Bearer ${token}` };
            }

            const { data } = await api.get(`/hackathons?${params.toString()}`, config);

            // API returns { data: [], meta: {} } or []
            setHackathons(Array.isArray(data) ? data : (data.data || []));
            setError(null);
        } catch (err) {
            console.error("Error fetching hackathons:", err);
            setError(err.response?.data?.message || 'Failed to fetch hackathons');
        } finally {
            setLoading(false);
        }
    }, [JSON.stringify(filters)]); // Deep compare filters to avoid infinite loop if object reference changes

    useEffect(() => {
        fetchHackathons();
    }, [fetchHackathons]);

    return { hackathons, loading, error, refetch: fetchHackathons };
};
