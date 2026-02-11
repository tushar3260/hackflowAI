import { useState, useEffect } from 'react';
import { useHackathons } from './useHackathons';
import { useTeams } from './useTeams';
import { useSubmissions } from './useSubmissions';

// Aggregates data from other hooks to provide a dashboard summary
export const useDashboardStats = (role) => {
    const { hackathons, loading: hackathonsLoading } = useHackathons();
    const { myTeam, loading: teamsLoading } = useTeams();
    const { mySubmissions, loading: submissionsLoading } = useSubmissions();

    const [stats, setStats] = useState({
        activeHackathons: 0,
        teamStatus: 'No Team',
        submissionsCount: 0,
        pendingReviews: 0 // Placeholder
    });

    const loading = hackathonsLoading || teamsLoading || submissionsLoading;

    useEffect(() => {
        if (!loading) {
            setStats({
                activeHackathons: hackathons.length,
                teamStatus: myTeam ? 'Active' : 'No Team',
                submissionsCount: mySubmissions.length,
                pendingReviews: 0 // Would need a dedicated endpoint for judges
            });
        }
    }, [loading, hackathons, myTeam, mySubmissions]);

    return { stats, loading };
};
