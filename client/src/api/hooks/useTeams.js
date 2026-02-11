import { useState, useEffect, useCallback } from 'react';
import api from '../config';
import { useAuth } from '../../context/AuthContext';

export const useTeams = (hackathonId = null) => {
    const { user } = useAuth();
    const [teams, setTeams] = useState([]);
    const [myTeam, setMyTeam] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchMyTeams = useCallback(async () => {
        try {
            setLoading(true);
            const config = {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            };
            const { data } = await api.get(`/teams/my`, config);
            setMyTeam(data.data[0] || null); // Assuming single team per hackathon context for now, or just taking first
            setTeams(data.data || []);
            setError(null);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to fetch teams');
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchHackathonTeams = useCallback(async () => {
        if (!hackathonId) return;
        try {
            setLoading(true);
            const config = {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            };
            const { data } = await api.get(`/teams/hackathon/${hackathonId}`, config);
            setTeams(data.data || []);
            setError(null);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to fetch hackathon teams');
        } finally {
            setLoading(false);
        }
    }, [hackathonId]);

    useEffect(() => {
        if (user) {
            if (hackathonId && user.role === 'organizer') {
                fetchHackathonTeams();
            } else {
                fetchMyTeams();
            }
        }
    }, [user, hackathonId, fetchMyTeams, fetchHackathonTeams]);

    return { teams, myTeam, loading, error, refetch: hackathonId ? fetchHackathonTeams : fetchMyTeams };
};
