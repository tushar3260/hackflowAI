export const resolveEffectiveRoundStatus = (round) => {
    // 1. If auto-control disabled, return raw status
    if (round.autoTimeControlEnabled === false) {
        return round.status;
    }

    // 2. Manual Overrides (High Priority)
    // If the organizer explicitly set these statuses, they override time logic
    const manualOverrides = ['draft', 'judging', 'published'];
    if (manualOverrides.includes(round.status)) {
        return round.status;
    }

    // 3. Time-based Logic
    // If dates are missing, fallback to raw status to avoid locking out accidentally
    if (!round.startTime || !round.endTime) {
        return round.status;
    }

    const now = new Date();
    const start = new Date(round.startTime);
    const end = new Date(round.endTime);

    if (now < start) {
        return 'draft'; // Or 'upcoming' if we had that status, but 'draft' hides it/blocks it
    } else if (now >= start && now <= end) {
        return 'open';
    } else {
        return 'submission_closed';
    }
};


