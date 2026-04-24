import React from 'react';
import { cn } from '@/lib/utils/cn';

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  glow?: boolean;
}

export const GlassCard = ({ children, className, glow = false, ...props }: GlassCardProps) => {
  return (
    <div 
      className={cn(
        "glass-panel relative overflow-hidden rounded-lg p-6",
        glow && "before:absolute before:inset-0 before:bg-primary/5 before:pointer-events-none",
        className
      )}
      {...props}
    >
      {/* HUD Corner Accents */}
      <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-primary/50" />
      <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-primary/50" />
      <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-primary/50" />
      <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-primary/50" />
      
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};
