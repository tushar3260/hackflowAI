/**
 * Calculates the total score given by a judge across all criteria
 * @param {Array} scores Array of { givenMarks }
 * @returns {Number} Sum of marks
 */
export const calculateJudgeTotal = (scores) => {
    return scores.reduce((acc, curr) => acc + (parseFloat(curr.givenMarks) || 0), 0);
};

/**
 * Calculates the final score combining Judge and AI scores (Extension hook)
 * Currently we assume 100% Judge weight for simplicity unless configured otherwise
 * @param {Number} judgeTotal 
 * @param {Number} aiTotal 
 * @returns {Number}
 */
export const calculateFinalScore = (judgeTotal, aiTotal = null, config = { mode: 'hybrid', aiWeight: 0.3, judgeWeight: 0.7 }) => {
    const { mode, aiWeight, judgeWeight } = config;

    // Default weights if missing
    const wAI = (aiWeight !== undefined) ? aiWeight : 0.3;
    const wJudge = (judgeWeight !== undefined) ? judgeWeight : 0.7;

    // AI ONLY Mode
    if (mode === 'ai_only') {
        return (aiTotal !== null) ? aiTotal : 0;
    }

    // JUDGE ONLY Mode
    if (mode === 'judge_only') {
        return judgeTotal;
    }

    // HYBRID Mode (Default)
    if (aiTotal === null || aiTotal === undefined) {
        // Fallback: If AI score is missing, Judge gets 100% weight to avoid penalizing
        return judgeTotal;
    }

    // Weighted Average
    return (judgeTotal * wJudge) + (aiTotal * wAI);
};

/**
 * Calculates the weighted score for the round based on hackathon config
 * @param {Number} finalTotal The raw score (e.g., 85/100)
 * @param {Number} roundMaxScore The max possible raw score (e.g., 100)
 * @param {Number} weightagePercent The weight of this round (e.g., 30%)
 * @returns {Number} Weighted score (e.g., 25.5)
 */
export const calculateWeightedScore = (finalTotal, roundMaxScore, weightagePercent) => {
    if (roundMaxScore === 0) return 0;
    const percentage = finalTotal / roundMaxScore;
    return percentage * weightagePercent;
};


