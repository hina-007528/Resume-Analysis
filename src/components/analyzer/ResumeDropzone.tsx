"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { FileUp, FileText, X } from "lucide-react";
import gsap from "gsap";

interface ResumeDropzoneProps {
  onFileSelect: (file: File | null) => void;
  selectedFile: File | null;
}

export const ResumeDropzone = ({ onFileSelect, selectedFile }: ResumeDropzoneProps) => {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      onFileSelect(acceptedFiles[0]);
    }
  }, [onFileSelect]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    maxFiles: 1,
  });

  return (
    <div className="w-full">
      <h3 className="text-sm font-[family-name:var(--font-jetbrains)] text-[var(--primary)] mb-4 uppercase tracking-widest">
        01. Step — Resume Upload
      </h3>
      
      {!selectedFile ? (
        <div 
          {...getRootProps()} 
          className={`relative h-64 glass-card border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all ${
            isDragActive ? 'border-[var(--primary)] bg-[rgba(0,245,255,0.05)]' : 'border-[var(--card-border)]'
          }`}
        >
          <input {...getInputProps()} />
          <div className="p-4 rounded-full bg-[rgba(0,245,255,0.1)] mb-4">
            <FileUp className={`w-8 h-8 ${isDragActive ? 'text-[var(--primary)]' : 'text-gray-400'}`} />
          </div>
          <p className="text-center px-6">
            <span className="text-[var(--primary)] font-bold">Click to upload</span> or drag and drop<br />
            <span className="text-xs text-gray-500">PDF format only (max 5MB)</span>
          </p>
          
          {/* Decorative corners */}
          <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-[var(--primary)]" />
          <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-[var(--primary)]" />
          <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-[var(--primary)]" />
          <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-[var(--primary)]" />
        </div>
      ) : (
        <div className="glass-card p-6 flex items-center justify-between hud-border">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-[rgba(0,245,255,0.1)] text-[var(--primary)]">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <p className="font-bold truncate max-w-[200px]">{selectedFile.name}</p>
              <p className="text-xs text-gray-500">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
            </div>
          </div>
          <button 
            onClick={() => onFileSelect(null)}
            className="p-2 hover:bg-[rgba(255,255,255,0.05)] rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>
      )}
    </div>
  );
};
