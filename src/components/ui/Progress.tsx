import React from 'react';
import { cn } from '@/lib/utils/cn';

interface ProgressProps {
  value: number;
  max?: number;
  className?: string;
  variant?: 'primary' | 'secondary';
  showLabel?: boolean;
}

export const Progress = ({ 
  value, 
  max = 100, 
  className, 
  variant = 'primary',
  showLabel = false 
}: ProgressProps) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
  
  const colors = {
    primary: "bg-primary shadow-[0_0_10px_rgba(0,245,255,0.5)]",
    secondary: "bg-secondary shadow-[0_0_10px_rgba(123,47,255,0.5)]",
  };

  return (
    <div className={cn("w-full space-y-1", className)}>
      <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/5 relative">
        <div 
          className={cn("h-full transition-all duration-1000 ease-out", colors[variant])}
          style={{ width: `${percentage}%` }}
        />
        {/* Scanning Glint */}
        <div 
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent w-1/4 animate-scan"
          style={{ left: '-25%' }}
        />
      </div>
      {showLabel && (
        <div className="flex justify-between font-mono text-[8px] text-foreground/40 uppercase tracking-widest">
          <span>Processing_Progress</span>
          <span className={cn(variant === 'primary' ? 'text-primary' : 'text-secondary')}>
            {Math.round(percentage)}%
          </span>
        </div>
      )}
    </div>
  );
};
