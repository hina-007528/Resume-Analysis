import React from 'react';
import { cn } from '@/lib/utils/cn';

interface HUDButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
}

export const HUDButton = ({ 
  children, 
  className, 
  variant = 'primary', 
  size = 'md',
  ...props 
}: HUDButtonProps) => {
  const variants = {
    primary: "bg-primary/10 border-primary/50 text-primary hover:bg-primary/20 hover:border-primary shadow-[0_0_15px_rgba(0,245,255,0.2)]",
    secondary: "bg-secondary/10 border-secondary/50 text-secondary hover:bg-secondary/20 hover:border-secondary shadow-[0_0_15px_rgba(123,47,255,0.2)]",
    outline: "bg-transparent border-white/20 text-white hover:border-primary hover:text-primary",
  };

  const sizes = {
    sm: "px-3 py-1 text-xs",
    md: "px-6 py-2 text-sm",
    lg: "px-8 py-3 text-base",
  };

  return (
    <button 
      className={cn(
        "relative inline-flex items-center justify-center font-mono font-bold tracking-widest uppercase transition-all duration-300 border rounded-sm active:scale-95 group overflow-hidden",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {/* Glitch Overlay */}
      <span className="absolute inset-0 bg-white/5 -translate-x-full group-hover:translate-x-full transition-transform duration-500 skew-x-12" />
      
      <span className="relative z-10 flex items-center gap-2">
        {children}
      </span>
      
      {/* HUD corner accents for button */}
      <div className="absolute top-0 left-0 w-1 h-1 border-t border-l border-current opacity-50" />
      <div className="absolute bottom-0 right-0 w-1 h-1 border-b border-r border-current opacity-50" />
    </button>
  );
};
