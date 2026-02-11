import { useState, useEffect, useCallback } from 'react';
import api from '../config';
import { useAuth } from '../../context/AuthContext';

export const useEvaluations = (submissionId = null) => {
    const { user } = useAuth();
    const [evaluations, setEvaluations] = useState([]); // For a submission
    const [myEvaluations, setMyEvaluations] = useState([]); // For a judge
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch evaluations for a specific submission (Organizer/Judge view)
    const fetchEvaluationsBySubmission = useCallback(async () => {
        if (!submissionId) return;
        try {
            setLoading(true);
            const config = {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            };
            const { data } = await api.get(`/evaluate/submission/${submissionId}`, config);
            setEvaluations(data.data || []);
            setError(null);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to fetch evaluations');
        } finally {
            setLoading(false);
        }
    }, [submissionId]);

    // Fetch all evaluations done by the current judge (Dashboard stats)
    // Note: Backend might need a specific endpoint for this, roughly /evaluate/my
    // For now, we will handle this if the endpoint exists, or leave empty if not yet implemented.
    // Assuming we might need to add this endpoint later. 
    const fetchMyEvaluations = useCallback(async () => {
        if (user?.role !== 'judge') return;
        // Placeholder for future endpoint
        // try { ... } catch (err) { ... }
        setLoading(false);
    }, [user]);

    useEffect(() => {
        if (submissionId) {
            fetchEvaluationsBySubmission();
        } else {
            fetchMyEvaluations();
        }
    }, [submissionId, fetchEvaluationsBySubmission, fetchMyEvaluations]);

    const submitEvaluation = async (evaluationData) => {
        try {
            setLoading(true);
            const config = {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            };
            await api.post('/evaluate/submit', evaluationData, config);
            if (submissionId) fetchEvaluationsBySubmission();
            return { success: true };
        } catch (err) {
            return { success: false, error: err.response?.data?.message || 'Evaluation failed' };
        } finally {
            setLoading(false);
        }
    };

    return { evaluations, myEvaluations, loading, error, submitEvaluation, refetch: fetchEvaluationsBySubmission };
};
