import React, { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Users, Trophy, ArrowRight, Tag, Clock } from 'lucide-react';
import Badge from './Badge';

const HackathonCard = ({ hackathon }) => {
    const { _id, title, description, theme, startDate, endDate, difficulty, participants } = hackathon;
    
    const cardRef = useRef(null);
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const [isHovered, setIsHovered] = useState(false);

    const start = new Date(startDate);
    const end = new Date(endDate);
    const now = new Date();

    const isActive = end > now && start <= now;
    const isUpcoming = start > now;
    const isEnded = end < now;

    let statusVariant = 'default';
    let statusLabel = 'Ended';
    if (isActive) { statusVariant = 'success'; statusLabel = 'Live'; }
    else if (isUpcoming) { statusVariant = 'primary'; statusLabel = 'Upcoming'; }

    const prize = hackathon.prize || "₹50,000 Prize Pool";

    // Progress calculation
    let progress = 0;
    if (isEnded) progress = 100;
    else if (isActive) {
        const total = end.getTime() - start.getTime();
        const elapsed = now.getTime() - start.getTime();
        progress = Math.min(100, Math.max(0, (elapsed / total) * 100));
    }

    // Days left calculation
    let timeText = 'Ended';
    if (isUpcoming) {
        const days = Math.ceil((start.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        timeText = `Starts in ${days}d`;
    } else if (isActive) {
        const days = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        timeText = `${days}d left`;
    }

    const handleMouseMove = (e) => {
        if (!cardRef.current) return;
        const rect = cardRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        setMousePos({ x, y });
    };

    // Calculate rotation based on mouse position
    const calculateRotation = () => {
        if (!cardRef.current || !isHovered) return 'rotateX(0deg) rotateY(0deg)';
        const rect = cardRef.current.getBoundingClientRect();
        const x = mousePos.x;
        const y = mousePos.y;
        
        // Max rotation of 5 degrees
        const rotateY = ((x / rect.width) - 0.5) * 10;
        const rotateX = ((y / rect.height) - 0.5) * -10;
        
        return `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    };

    return (
        <div 
            ref={cardRef}
            className="h-full relative group transition-all duration-300 ease-out will-change-transform"
            style={{
                transform: isHovered ? `translateY(-4px) ${calculateRotation()}` : 'translateY(0) perspective(1000px) rotateX(0deg) rotateY(0deg)',
                transformStyle: 'preserve-3d',
            }}
            onMouseMove={handleMouseMove}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => {
                setIsHovered(false);
            }}
        >
            {/* Spotlight Glow Effect */}
            <div 
                className="absolute -inset-0.5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm z-0 pointer-events-none"
                style={{
                    background: `radial-gradient(circle at ${mousePos.x}px ${mousePos.y}px, rgba(var(--color-primary-rgb), 0.5) 0%, transparent 50%)`
                }}
            />
            
            {/* Main Card Container */}
            <div className="relative h-full flex flex-col bg-[var(--color-bg-surface)] rounded-2xl border border-[var(--color-border-default)] overflow-hidden shadow-sm group-hover:shadow-[0_20px_40px_-15px_rgba(var(--color-primary-rgb),0.2)] group-hover:border-[rgba(var(--color-primary-rgb),0.5)] transition-all duration-300 z-10 w-full">
                
                {/* Subtle overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                <div className="flex flex-col h-full p-6 relative z-10">
                    
                    {/* Header */}
                    <div className="flex justify-between items-start mb-5">
                        <Badge variant={statusVariant}>{statusLabel}</Badge>
                        {difficulty && (
                            <span className={`text-xs font-semibold px-2.5 py-1 rounded-md border ${
                                difficulty === 'Beginner' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' :
                                difficulty === 'Intermediate' ? 'bg-amber-50 text-amber-600 border-amber-200' :
                                'bg-rose-50 text-rose-600 border-rose-200'
                            }`}>
                                {difficulty}
                            </span>
                        )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 flex flex-col mb-2">
                        <h3 className="text-xl font-bold mb-2 group-hover:text-[var(--color-primary)] transition-colors line-clamp-1">
                            {title}
                        </h3>
                        <p className="text-sm text-[var(--color-text-secondary)] mb-5 line-clamp-2 min-h-[40px] leading-relaxed">
                            {description}
                        </p>

                        {/* Tags */}
                        <div className="flex flex-wrap gap-2 mb-6">
                            <div className="inline-flex items-center text-xs font-semibold text-[var(--color-text-secondary)] bg-[var(--color-bg-muted)] px-3 py-1.5 rounded-full border border-[var(--color-border-default)] transition-colors group-hover:border-[rgba(var(--color-primary-rgb),0.3)]">
                                <Tag size={12} className="mr-1.5 text-[var(--color-primary)]" />
                                {theme}
                            </div>
                            <div className="inline-flex items-center text-xs font-semibold text-[var(--color-text-secondary)] bg-[var(--color-bg-muted)] px-3 py-1.5 rounded-full border border-[var(--color-border-default)] transition-colors group-hover:border-[var(--color-warning)]">
                                <Trophy size={12} className="mr-1.5 text-[var(--color-warning)]" />
                                {prize}
                            </div>
                        </div>

                        {/* Progress Indicator */}
                        <div className="mb-6 w-full">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-xs font-medium text-[var(--color-text-secondary)] flex items-center gap-1">
                                    <Clock size={12} /> {timeText}
                                </span>
                                <span className="text-xs font-medium text-[var(--color-primary)]">{Math.round(progress)}%</span>
                            </div>
                            <div className="h-1.5 w-full bg-[var(--color-bg-muted)] rounded-full overflow-hidden">
                                <div 
                                    className="h-full bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)] rounded-full transition-all duration-1000 ease-out"
                                    style={{ width: `${progress}%` }}
                                />
                            </div>
                        </div>

                        {/* Meta Grid */}
                        <div className="grid grid-cols-2 gap-4 mb-6 mt-auto">
                            <div className="flex flex-col p-3 rounded-xl bg-[rgba(var(--color-bg-muted-rgb),0.5)] border border-[var(--color-border-default)] group-hover:bg-[var(--color-bg-surface)] transition-colors">
                                <span className="text-xs text-[var(--color-text-muted)] mb-1 flex items-center gap-1"><Calendar size={12} /> Deadline</span>
                                <span className="text-sm font-semibold text-[var(--color-text-primary)]">
                                    {end.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                </span>
                            </div>
                            <div className="flex flex-col p-3 rounded-xl bg-[rgba(var(--color-bg-muted-rgb),0.5)] border border-[var(--color-border-default)] group-hover:bg-[var(--color-bg-surface)] transition-colors">
                                <span className="text-xs text-[var(--color-text-muted)] mb-1 flex items-center gap-1"><Users size={12} /> Applied</span>
                                <span className="text-sm font-semibold text-[var(--color-text-primary)]">
                                    {hackathon.students?.length || 0} Teams
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Action Button */}
                    <div className="mt-auto pt-2">
                        <Link to={`/hackathon/${_id}`} className="block w-full">
                            <div className="relative w-full overflow-hidden rounded-xl border border-[var(--color-primary)] bg-[var(--color-bg-surface)] px-6 py-3 text-center font-semibold text-[var(--color-primary)] transition-all duration-300 group-hover:text-white group-hover:shadow-[0_0_20px_rgba(var(--color-primary-rgb),0.3)]">
                                <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)] translate-y-[100%] transition-transform duration-300 ease-out group-hover:translate-y-0" />
                                <div className="relative z-10 flex items-center justify-center gap-2">
                                    View Details 
                                    <ArrowRight size={16} className="transition-transform duration-300 ease-out group-hover:translate-x-1" />
                                </div>
                            </div>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HackathonCard;
