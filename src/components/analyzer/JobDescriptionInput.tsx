"use client";

interface JobDescriptionInputProps {
  value: string;
  onChange: (value: string) => void;
}

export const JobDescriptionInput = ({ value, onChange }: JobDescriptionInputProps) => {
  return (
    <div className="w-full">
      <h3 className="text-sm font-[family-name:var(--font-jetbrains)] text-[var(--secondary)] mb-4 uppercase tracking-widest">
        02. Step — Job Description
      </h3>
      
      <div className="relative glass-card">
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Paste the job description here..."
          className="w-full h-64 bg-transparent p-6 outline-none resize-none font-[family-name:var(--font-instrument)] text-sm leading-relaxed"
        />
        
        <div className="absolute bottom-4 right-4 flex items-center gap-3">
          <div className="text-[10px] font-[family-name:var(--font-jetbrains)] text-gray-500 uppercase">
            Character count
          </div>
          <div className={`text-xs font-bold ${value.length < 50 ? 'text-red-500' : 'text-[var(--primary)]'}`}>
            {value.length} / 50 min
          </div>
        </div>
        
        {/* Decorative corner */}
        <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-[var(--secondary)]" />
      </div>
    </div>
  );
};
