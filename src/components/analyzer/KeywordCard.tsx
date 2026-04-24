"use client";

import { Check, X } from "lucide-react";

interface KeywordCardProps {
  keyword: string;
  isMatched: boolean;
}

export const KeywordCard = ({ keyword, isMatched }: KeywordCardProps) => {
  return (
    <div className={`
      flex items-center gap-3 px-4 py-2 rounded-lg border transition-all duration-300
      ${isMatched 
        ? 'bg-green-500/5 border-green-500/20 text-green-400 hover:bg-green-500/10' 
        : 'bg-red-500/5 border-red-500/20 text-red-400 hover:bg-red-500/10'}
    `}>
      {isMatched ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
      <span className="text-sm font-medium font-[family-name:var(--font-instrument)]">{keyword}</span>
    </div>
  );
};
