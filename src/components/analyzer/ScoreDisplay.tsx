"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

interface ScoreDisplayProps {
  score: number;
  label: string;
}

export const ScoreDisplay = ({ score, label }: ScoreDisplayProps) => {
  const countRef = useRef<HTMLSpanElement>(null);
  const circleRef = useRef<SVGCircleElement>(null);

  useEffect(() => {
    // Count up animation
    gsap.fromTo(countRef.current, 
      { innerText: 0 },
      { 
        innerText: score, 
        duration: 2, 
        snap: { innerText: 1 },
        ease: "power2.out"
      }
    );

    // Circle stroke animation
    const circumference = 2 * Math.PI * 110;
    const offset = circumference - (score / 100) * circumference;

    
    gsap.fromTo(circleRef.current,
      { strokeDashoffset: circumference },
      { strokeDashoffset: offset, duration: 2, ease: "power2.out" }
    );
  }, [score]);

  const getScoreColor = () => {
    if (score >= 80) return "text-green-400";
    if (score >= 60) return "text-[var(--primary)]";
    if (score >= 40) return "text-[var(--accent)]";
    return "text-red-500";
  };

  const getStrokeColor = () => {
    if (score >= 80) return "#4ade80";
    if (score >= 60) return "#00F5FF";
    if (score >= 40) return "#FFB800";
    return "#ef4444";
  };

  return (
    <div className="flex flex-col items-center justify-center p-6 sm:p-8 glass-card">
      <div className="relative w-full max-w-[240px] aspect-square flex items-center justify-center mb-6">
        <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 256 256">
          <circle
            cx="128"
            cy="128"
            r="110"
            stroke="currentColor"
            strokeWidth="12"
            fill="transparent"
            className="text-gray-800"
          />
          <circle
            ref={circleRef}
            cx="128"
            cy="128"
            r="110"
            stroke={getStrokeColor()}
            strokeWidth="12"
            fill="transparent"
            strokeDasharray={2 * Math.PI * 110}
            className="transition-all duration-1000"
          />
        </svg>
        
        <div className="text-center z-10 px-4">
          <div className="text-[10px] sm:text-xs font-[family-name:var(--font-jetbrains)] text-gray-500 uppercase mb-1">Match Score</div>
          <div className={`text-5xl sm:text-7xl font-[family-name:var(--font-syne)] ${getScoreColor()}`}>
            <span ref={countRef}>0</span>%
          </div>
        </div>
      </div>

      
      <div className="px-6 py-2 rounded-full border border-[var(--card-border)] bg-[rgba(255,255,255,0.03)] font-bold text-sm uppercase tracking-widest">
        {label}
      </div>
    </div>
  );
};
