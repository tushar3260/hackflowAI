const analyzeSubmission = async (submission, criteria) => {
    try {
        console.log(`🤖 Starting Local AI Analysis for Submission: ${submission._id}`);

        // 1. Extract Content
        const textContent = submission.notesText || "";
        const links = [submission.githubUrl, submission.demoVideoUrl, submission.pptUrl, submission.documentUrl].filter(Boolean);

        let totalAiScore = 0;
        const criteriaScores = [];
        const feedbackList = [];

        // 2. Heuristic Scoring based on Criteria
        // If criteria exists, try to map heuristics. Otherwise use generic.
        if (criteria && criteria.length > 0) {
            criteria.forEach(c => {
                let score = 0;
                let feedback = "";
                const max = c.maxMarks;
                const titleLower = c.title.toLowerCase();

                // Heuristic A: Description/Documentation (Keywords & Length)
                if (titleLower.includes("doc") || titleLower.includes("desc") || titleLower.includes("concept")) {
                    const length = textContent.length;
                    if (length > 500) score = max;
                    else if (length > 200) score = max * 0.7;
                    else if (length > 50) score = max * 0.4;
                    else score = 0;

                    if (score < max * 0.5) feedback = `Expand on your ${c.title}. The description is too brief.`;
                    else feedback = `Good detail in ${c.title}.`;
                }
                // Heuristic B: Code/Technical (Links)
                else if (titleLower.includes("code") || titleLower.includes("repo") || titleLower.includes("tech")) {
                    if (submission.githubUrl) {
                        score = max; // Assume perfect if link exists for now (validated elsewhere?)
                        feedback = "Repository link provided.";
                    } else {
                        score = 0;
                        feedback = "Missing repository link.";
                    }
                }
                // Heuristic C: Demo/Presentation
                else if (titleLower.includes("demo") || titleLower.includes("video") || titleLower.includes("pitch")) {
                    if (submission.demoVideoUrl || submission.pptUrl) {
                        score = max;
                        feedback = "Demo material provided.";
                    } else {
                        score = 0;
                        feedback = "Missing demo video or presentation.";
                    }
                }
                // Fallback: Generic text check
                else {
                    score = textContent.length > 100 ? max * 0.8 : max * 0.5;
                    feedback = "Automated check completed.";
                }

                // Randomize slightly to simulate "Analysis" variance (0.9 - 1.0 factor)
                // score = Math.floor(score * (0.9 + Math.random() * 0.1)); 
                // Actually, let's keep it deterministic for "Audit" purposes.

                totalAiScore += score;
                criteriaScores.push({
                    criteriaId: c._id,
                    title: c.title,
                    maxMarks: max,
                    score: Math.min(score, max),
                    reason: feedback
                });
                if (feedback) feedbackList.push(feedback);
            });
        } else {
            // Default generic score if no criteria
            totalAiScore = 50;
            feedbackList.push("No specific criteria found. Default score assigned.");
        }

        // 3. Construct Result matching AIFeedbackPanel expectations
        const summary = `Evaluation based on ${criteria ? criteria.length : 0} criteria. Scored ${totalAiScore} points.`;

        let strengths = [];
        let improvementTips = [];
        let riskFlags = [];

        criteriaScores.forEach(cs => {
            if (cs.score >= cs.maxMarks * 0.8) {
                strengths.push(`Strong performance in ${cs.title}`);
            } else if (cs.score < cs.maxMarks * 0.5) {
                improvementTips.push(`${cs.reason} (${cs.title})`);
            }
        });

        if (textContent.length < 50) riskFlags.push("Very short description.");
        if (!submission.githubUrl) riskFlags.push("No GitHub URL provided.");

        const result = {
            totalAiScore: totalAiScore,
            summary: summary,
            aiScores: criteriaScores.map(cs => ({
                criteriaTitle: cs.title, // Map title to criteriaTitle
                score: cs.score,
                reason: cs.reason,
                maxMarks: cs.maxMarks
            })),
            strengths: strengths.length > 0 ? strengths : ["Submission structure meets basic requirements."],
            weaknesses: [], // Optional in UI?
            improvementTips: improvementTips.length > 0 ? improvementTips : ["Review criteria for potential bonus points."],
            innovationScore: Math.min(10, Math.floor(totalAiScore / 10)), // Mock innovation score derived from total
            riskFlags: riskFlags,
            confidence: 0.85,
            analyzedAt: new Date()
        };

        console.log('✅ AI Analysis Complete:', result.totalAiScore);
        return result;

    } catch (error) {
        console.error('AI Service Error:', error.message);
        return null; // Fail silently to allow fallback
    }
};

module.exports = { analyzeSubmission };
