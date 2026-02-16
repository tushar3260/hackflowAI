import Hackathon from '../models/Hackathon.js';

export const judgeHackathonGuard = async (req, res, next) => {
    try {
        // 1. Verify Role
        if (req.user.role !== 'judge') {
            // Fallback if basic auth middleware didn't catch it, though authorize('judge') usually does.
            return res.status(403).json({ message: 'Access denied. Judges only.' });
        }

        // 2. Identify Hackathon
        // Could be in params :id or :hackathonId depending on route, or body, or query
        const hackathonId = req.params.id || req.params.hackathonId || req.body.hackathonId || req.query.hackathonId;

        if (!hackathonId) {
            // If strictly checking context, fail. But some list routes might not have ID.
            // This guard is for specific hackathon context.
            return res.status(400).json({ message: 'Hackathon context required for judge verification' });
        }

        const hackathon = await Hackathon.findById(hackathonId);
        if (!hackathon) {
            return res.status(404).json({ message: 'Hackathon not found' });
        }

        // 3. Verify Assignment
        const isAssigned = hackathon.judges.some(judgeId => judgeId.toString() === req.user.id);

        if (!isAssigned) {
            return res.status(403).json({ message: 'You are not an assigned judge for this hackathon.' });
        }

        // Attach hackathon to req for downstream use if needed
        req.hackathon = hackathon;
        next();

    } catch (error) {
        console.error('Judge Guard Error:', error);
        res.status(500).json({ message: 'Server error verifying judge access' });
    }
};


