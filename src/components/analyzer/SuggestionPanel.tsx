"use client";

import { Sparkles, ArrowRight } from "lucide-react";

interface SuggestionPanelProps {
  suggestions: string[];
}

export const SuggestionPanel = ({ suggestions }: SuggestionPanelProps) => {
  return (
    <div className="glass-card p-8 hud-border">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-[var(--secondary)]/10 text-[var(--secondary)]">
          <Sparkles className="w-5 h-5" />
        </div>
        <h3 className="text-xl">AI Optimization <span className="text-[var(--secondary)]">Insights</span></h3>
      </div>
      
      <div className="space-y-4">
        {suggestions.map((suggestion, index) => (
          <div key={index} className="flex gap-4 p-4 rounded-xl bg-white/5 border border-white/5 hover:border-[var(--secondary)]/30 transition-colors group">
            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[var(--secondary)]/20 flex items-center justify-center text-[var(--secondary)] text-xs font-bold">
              {index + 1}
            </div>
            <p className="text-gray-300 text-sm leading-relaxed font-[family-name:var(--font-instrument)]">
              {suggestion}
            </p>
            <ArrowRight className="w-4 h-4 text-[var(--secondary)] opacity-0 group-hover:opacity-100 transition-opacity ml-auto self-center" />
          </div>
        ))}
        
        {suggestions.length === 0 && (
          <p className="text-gray-500 italic">No major gaps identified. Your resume is well-aligned!</p>
        )}
      </div>
    </div>
  );
};
