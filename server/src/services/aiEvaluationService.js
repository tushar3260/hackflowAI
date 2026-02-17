
import axios from 'axios';

export const analyzeSubmission = async (submission, criteria) => {
    try {
        console.log(`🤖 Starting AI Analysis for Submission: ${submission._id}`);

        // 1. Extract Content
        const textContent = submission.notesText || "";
        const links = [submission.githubUrl, submission.demoVideoUrl, submission.pptUrl, submission.documentUrl].filter(Boolean);
        const extractedText = `Links Provided: ${links.join(', ')}`;

        // 2. Try External AI Service
        if (process.env.AI_SERVICE_URL) {
            try {
                console.log(`Connecting to AI Service at ${process.env.AI_SERVICE_URL}...`);
                const response = await axios.post(`${process.env.AI_SERVICE_URL}/analyze-submission`, {
                    notesText: textContent,
                    extractedText: extractedText,
                    githubUrl: submission.githubUrl,
                    criteria: criteria.map(c => ({ title: c.title, maxMarks: c.maxMarks }))
                });

                if (response.data) {
                    console.log('✅ AI Service Response Received');
                    return {
                        ...response.data,
                        analyzedAt: new Date()
                    };
                }
            } catch (aiError) {
                console.warn('⚠️ External AI Service Failed. Falling back to local heuristics.', aiError.message);
            }
        }

        // --- FALLBACK HEURISTICS (If AI Service missing or failed) ---
        console.log("Using Local Heuristics Fallback...");

        let totalAiScore = 0;
        const criteriaScores = [];
        const feedbackList = [];

        if (criteria && criteria.length > 0) {
            criteria.forEach(c => {
                let score = 0;
                let feedback = "";
                const max = c.maxMarks;
                const titleLower = c.title.toLowerCase();

                if (titleLower.includes("doc") || titleLower.includes("desc") || titleLower.includes("concept")) {
                    const length = textContent.length;
                    if (length > 500) score = max;
                    else if (length > 200) score = max * 0.7;
                    else if (length > 50) score = max * 0.4;
                    else score = 0;

                    if (score < max * 0.5) feedback = `Expand on your ${c.title}. The description is too brief.`;
                    else feedback = `Good detail in ${c.title}.`;
                }
                else if (titleLower.includes("code") || titleLower.includes("repo") || titleLower.includes("tech")) {
                    if (submission.githubUrl) {
                        score = max;
                        feedback = "Repository link provided.";
                    } else {
                        score = 0;
                        feedback = "Missing repository link.";
                    }
                }
                else if (titleLower.includes("demo") || titleLower.includes("video") || titleLower.includes("pitch")) {
                    if (submission.demoVideoUrl || submission.pptUrl) {
                        score = max;
                        feedback = "Demo material provided.";
                    } else {
                        score = 0;
                        feedback = "Missing demo video or presentation.";
                    }
                }
                else {
                    score = textContent.length > 100 ? max * 0.8 : max * 0.5;
                    feedback = "Automated check completed.";
                }

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
            totalAiScore = 50;
            feedbackList.push("No specific criteria found. Default score assigned.");
        }

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

        if (textContent.length < 50) riskFlags.push("Top Description very short.");
        if (!submission.githubUrl) riskFlags.push("No GitHub URL provided.");

        const result = {
            totalAiScore: totalAiScore,
            summary: summary,
            aiScores: criteriaScores.map(cs => ({
                criteriaTitle: cs.title,
                score: cs.score,
                reason: cs.reason,
                maxMarks: cs.maxMarks
            })),
            strengths: strengths.length > 0 ? strengths : ["Submission structure meets requirements."],
            weaknesses: [],
            improvementTips: improvementTips.length > 0 ? improvementTips : ["Review criteria for bonus points."],
            innovationScore: Math.min(10, Math.floor(totalAiScore / 10)),
            riskFlags: riskFlags,
            confidence: 0.5,
            analyzedAt: new Date()
        };

        console.log('✅ Local Analysis Complete:', result.totalAiScore);
        return result;

    } catch (error) {
        console.error('AI Service Critical Error:', error.message);
        return null;
    }
};
