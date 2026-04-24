'use client';

import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { GlassCard } from './GlassCard';
import { HUDButton } from './HUDButton';
import { cn } from '@/lib/utils/cn';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export const Modal = ({ isOpen, onClose, title, children }: ModalProps) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-background/80 backdrop-blur-md animate-in fade-in duration-300"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative z-10 w-full max-w-2xl animate-in zoom-in-95 duration-300">
        <GlassCard className="border-primary/30 p-0 overflow-hidden shadow-[0_0_50px_rgba(0,245,255,0.1)]">
          {/* Header */}
          <div className="px-6 py-4 border-b border-white/10 flex justify-between items-center bg-primary/5">
            <h3 className="font-syne font-bold uppercase tracking-widest text-white text-sm">
              {title}
            </h3>
            <button 
              onClick={onClose}
              className="p-1 hover:bg-white/10 rounded-sm transition-colors text-foreground/50 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          {/* Body */}
          <div className="p-6 max-h-[70vh] overflow-y-auto font-instrument">
            {children}
          </div>
          
          {/* Footer */}
          <div className="px-6 py-4 border-t border-white/10 flex justify-end">
            <HUDButton variant="outline" size="sm" onClick={onClose}>
              CLOSE_PROTOCOL
            </HUDButton>
          </div>
        </GlassCard>
      </div>
    </div>
  );
};
