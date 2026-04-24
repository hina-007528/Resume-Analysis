import React from 'react';
import { cn } from '@/lib/utils/cn';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'tertiary' | 'outline';
  className?: string;
}

export const Badge = ({ children, variant = 'primary', className }: BadgeProps) => {
  const variants = {
    primary: "bg-primary/10 text-primary border-primary/20",
    secondary: "bg-secondary/10 text-secondary border-secondary/20",
    tertiary: "bg-tertiary/10 text-tertiary border-tertiary/20",
    outline: "bg-transparent text-white border-white/20",
  };

  return (
    <span className={cn(
      "px-2 py-0.5 border text-[8px] font-mono font-bold tracking-widest uppercase rounded-sm inline-flex items-center",
      variants[variant],
      className
    )}>
      {children}
    </span>
  );
};
