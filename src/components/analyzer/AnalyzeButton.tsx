'use client';

import React from 'react';

export const AnalyzeButton = ({ onClick, disabled }: { onClick: () => void, disabled?: boolean }) => {
  return (
    <div className="flex justify-center -my-3 relative z-10">
      <button 
        onClick={onClick}
        disabled={disabled}
        className="active-touch-gold group relative px-12 py-6 bg-black/80 rounded-full border border-tertiary-fixed-dim/50 transition-all active:scale-95 shadow-[0_0_40px_rgba(255,186,32,0.2)] overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <div className="absolute inset-0 bg-tertiary-fixed-dim/10 opacity-0 group-hover:opacity-100 transition-opacity blur-xl"></div>
        <div className="absolute inset-x-0 bottom-0 h-[3px] bg-gradient-to-r from-transparent via-tertiary-fixed-dim to-transparent shadow-[0_0_20px_#ffba20]"></div>
        <div className="flex items-center gap-4 relative">
          <span className="material-symbols-outlined text-tertiary-fixed-dim text-2xl">bolt</span>
          <span className="font-mono text-tertiary-fixed-dim tracking-[0.25em] text-base font-bold uppercase">INITIATE_ANALYSIS</span>
        </div>
      </button>
    </div>
  );
};
