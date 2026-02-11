import React from 'react';

const AIFeedbackPanel = ({ aiScore }) => {
    if (!aiScore) return null;

    const {
        totalAiScore,
        summary,
        aiScores,
        strengths,
        weaknesses,
        improvementTips,
        innovationScore,
        riskFlags
    } = aiScore;

    // Helper for score color
    const getScoreColor = (score, max) => {
        const percentage = (score / max) * 100;
        if (percentage >= 80) return 'bg-green-500';
        if (percentage >= 60) return 'bg-yellow-500';
        return 'bg-red-500';
    };

    return (
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-6 mt-6 shadow-lg">
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h3 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">
                        🤖 AI Analysis Report
                    </h3>
                    <p className="text-gray-400 text-sm mt-1">Automated pre-evaluation insights</p>
                </div>
                <div className="text-right">
                    <div className="text-3xl font-bold text-white">{totalAiScore}</div>
                    <div className="text-xs text-gray-500 uppercase tracking-wider">Total AI Score</div>
                </div>
            </div>

            {/* Summary & Innovation */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="md:col-span-2 bg-slate-900/50 p-4 rounded-lg border border-slate-700/50">
                    <h4 className="text-sm font-bold text-gray-300 mb-2">Summary</h4>
                    <p className="text-gray-400 text-sm leading-relaxed">{summary}</p>
                </div>
                <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700/50 text-center">
                    <h4 className="text-sm font-bold text-gray-300 mb-2">Innovation Score</h4>
                    <div className="relative w-24 h-24 mx-auto flex items-center justify-center">
                        <svg className="w-full h-full" viewBox="0 0 36 36">
                            <path
                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                fill="none"
                                stroke="#1e293b"
                                strokeWidth="3"
                            />
                            <path
                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                fill="none"
                                stroke="#a855f7"
                                strokeWidth="3"
                                strokeDasharray={`${innovationScore * 10}, 100`}
                            />
                        </svg>
                        <span className="absolute text-xl font-bold text-white">{innovationScore}</span>
                    </div>
                </div>
            </div>

            {/* Criteria Scores */}
            <div className="mb-8">
                <h4 className="text-sm font-bold text-gray-300 mb-4">Criteria Breakdown</h4>
                <div className="space-y-4">
                    {aiScores && aiScores.map((score, idx) => (
                        <div key={idx}>
                            <div className="flex justify-between text-sm mb-1">
                                <span className="text-gray-300">{score.criteriaTitle}</span>
                                <span className="text-gray-400">{score.score}</span>
                            </div>
                            <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                                <div
                                    className={`h-full ${getScoreColor(score.score, 10)}`} // Assuming max 10 for bar color logic, adjust if maxMarks varies
                                    style={{ width: `${Math.min((score.score / 20) * 100, 100)}%` }} // Normalizing to visual % (assuming ~20 is typical max)
                                ></div>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">{score.reason}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Lists */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {strengths && strengths.length > 0 && (
                    <div>
                        <h4 className="text-sm font-bold text-green-400 mb-3">Strengths</h4>
                        <ul className="space-y-2">
                            {strengths.map((s, i) => (
                                <li key={i} className="flex items-start text-sm text-gray-400">
                                    <span className="text-green-500 mr-2">✓</span> {s}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {improvementTips && improvementTips.length > 0 && (
                    <div>
                        <h4 className="text-sm font-bold text-yellow-400 mb-3">Improvement Tips</h4>
                        <ul className="space-y-2">
                            {improvementTips.map((t, i) => (
                                <li key={i} className="flex items-start text-sm text-gray-400">
                                    <span className="text-yellow-500 mr-2">💡</span> {t}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>

            {/* Risks */}
            {riskFlags && riskFlags.length > 0 && (
                <div className="mt-6 bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                    <h4 className="text-sm font-bold text-red-400 mb-2">Risk Flags</h4>
                    <ul className="space-y-1">
                        {riskFlags.map((flag, i) => (
                            <li key={i} className="text-xs text-red-300">• {flag}</li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default AIFeedbackPanel;
