import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

import OrganizerDashboard from './dashboards/OrganizerDashboard';
import JudgeDashboard from './dashboards/JudgeDashboard';
import ParticipantDashboard from './dashboards/ParticipantDashboard';

export default function Dashboard() {
    const { user, loading } = useContext(AuthContext);

    if (loading) {
        return <div className="min-h-screen bg-[var(--color-bg-primary)] flex items-center justify-center text-[var(--color-primary)]">Loading...</div>;
    }

    if (!user) {
        return <Navigate to="/login" />;
    }

    if (user.role === 'organizer') return <OrganizerDashboard />;
    if (user.role === 'judge') return <JudgeDashboard />;
    return <ParticipantDashboard />;
}
