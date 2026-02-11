const Hackathon = require('../models/Hackathon');

const organizerOwnershipGuard = async (req, res, next) => {
    try {
        const hackathonId = req.params.id || req.params.hackathonId;

        if (!hackathonId) {
            return res.status(400).json({ message: 'Hackathon ID is required' });
        }

        const hackathon = await Hackathon.findById(hackathonId);

        if (!hackathon) {
            return res.status(404).json({ message: 'Hackathon not found' });
        }

        // Strict Check: specific hackathon 'createdBy' must match logged in user
        if (hackathon.createdBy.toString() !== req.user.id) {
            return res.status(403).json({
                message: 'FORBIDDEN_NOT_OWNER: You can only manage hackathons you created.'
            });
        }

        // Attach hackathon to req to avoid refetching if needed (optional optimization)
        req.hackathon = hackathon;
        next();
    } catch (error) {
        console.error('Ownership Guard Error:', error);
        res.status(500).json({ message: 'Server error verifying ownership' });
    }
};

module.exports = organizerOwnershipGuard;
