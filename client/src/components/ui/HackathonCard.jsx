
import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Users, Trophy, ArrowRight, Tag } from 'lucide-react';
import PlatformCard from './PlatformCard';
import Badge from './Badge';
import Button from './Button';
import { CardContent, CardTitle } from './Card';

const HackathonCard = ({ hackathon }) => {
    const { _id, title, description, theme, startDate, endDate, difficulty, participants } = hackathon;

    const isActive = new Date(endDate) > new Date() && new Date(startDate) <= new Date();
    const isUpcoming = new Date(startDate) > new Date();
    const isEnded = new Date(endDate) < new Date();

    let statusVariant = 'default';
    let statusLabel = 'Ended';
    if (isActive) { statusVariant = 'success'; statusLabel = 'Active'; }
    else if (isUpcoming) { statusVariant = 'primary'; statusLabel = 'Upcoming'; }

    // Mock prize if not in schema yet, or handle properly if added later
    const prize = hackathon.prize || "₹50,000 Pool";

    return (
        <PlatformCard className="flex flex-col h-full group transition-all duration-300 hover:border-[var(--color-primary)] hover:shadow-lg" noPadding>
            <CardContent className="flex flex-col h-full pt-6">
                {/* Header: Status & Badge */}
                <div className="flex justify-between items-start mb-4">
                    <Badge variant={statusVariant}>{statusLabel}</Badge>
                    {difficulty && (
                        <span className={`text-xs font-semibold px-2 py-1 rounded-md border ${difficulty === 'Beginner' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' :
                            difficulty === 'Intermediate' ? 'bg-amber-50 text-amber-600 border-amber-200' :
                                'bg-rose-50 text-rose-600 border-rose-200'
                            }`}>
                            {difficulty}
                        </span>
                    )}
                </div>

                {/* Content */}
                <div className="flex-1 flex flex-col">
                    <CardTitle className="mb-2 group-hover:text-[var(--color-primary)] transition-colors line-clamp-1">
                        {title}
                    </CardTitle>
                    <p className="text-body-sm text-[var(--color-text-secondary)] mb-4 line-clamp-2 min-h-[40px]">
                        {description}
                    </p>

                    {/* Tags/Info */}
                    <div className="flex flex-wrap gap-2 mb-6">
                        <div className="inline-flex items-center text-xs font-medium text-[var(--color-text-secondary)] bg-[var(--color-bg-muted)] px-2.5 py-1 rounded-full border border-[var(--color-border-default)]">
                            <Tag size={12} className="mr-1.5 text-[var(--color-primary)]" />
                            {theme}
                        </div>
                        <div className="inline-flex items-center text-xs font-medium text-[var(--color-text-secondary)] bg-[var(--color-bg-muted)] px-2.5 py-1 rounded-full border border-[var(--color-border-default)]">
                            <Trophy size={12} className="mr-1.5 text-[var(--color-warning)]" />
                            {prize}
                        </div>
                    </div>

                    {/* Meta details grid */}
                    <div className="grid grid-cols-2 gap-3 mb-6 pt-4 border-t border-[var(--color-border-default)] mt-auto">
                        <div className="flex flex-col">
                            <span className="text-xs text-[var(--color-text-muted)] mb-1 flex items-center gap-1"><Calendar size={10} /> Deadline</span>
                            <span className="text-body-sm font-semibold text-[var(--color-text-primary)]">
                                {new Date(endDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                            </span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xs text-[var(--color-text-muted)] mb-1 flex items-center gap-1"><Users size={10} /> Applied</span>
                            <span className="text-body-sm font-semibold text-[var(--color-text-primary)]">
                                {hackathon.students?.length || 0} Teams
                            </span>
                        </div>
                    </div>
                </div>

                {/* Footer / Action */}
                <div className="mt-auto pt-4">
                    <Link to={`/hackathon/${_id}`} className="block">
                        <Button variant="primary" className="w-full justify-center group-hover:shadow-lg shadow-indigo-500/10">
                            View Details <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
                        </Button>
                    </Link>
                </div>
            </CardContent>
        </PlatformCard>
    );
};

export default HackathonCard;
