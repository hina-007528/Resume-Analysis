"use client";

import { useAnalyzer } from "@/hooks/useAnalyzer";
import { ResumeDropzone } from "@/components/analyzer/ResumeDropzone";
import { JobDescriptionInput } from "@/components/analyzer/JobDescriptionInput";
import { Loader2, Rocket, ShieldAlert, Info } from "lucide-react";
import gsap from "gsap";
import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function AnalyzePage() {
  const [user, setUser] = useState<any>(null);
  const { 
    file, setFile, 
    jobDescription, setJobDescription, 
    status, error, handleAnalyze 
  } = useAnalyzer();

  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);


  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const tl = gsap.timeline();
    
    tl.fromTo(containerRef.current,
      { opacity: 0 },
      { opacity: 1, duration: 1 }
    )
    .fromTo(".analyze-header",
      { y: -30, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8, ease: "power3.out" },
      "-=0.5"
    )
    .fromTo(".grid-item",
      { scale: 0.95, opacity: 0, y: 20 },
      { scale: 1, opacity: 1, y: 0, duration: 0.6, stagger: 0.2, ease: "back.out(1.2)" },
      "-=0.4"
    );

    gsap.to(".analyze-card", {
      y: 10,
      repeat: -1,
      yoyo: true,
      duration: 3,
      ease: "sine.inOut"
    });
  }, []);

  const isDisabled = status === 'loading' || !file || jobDescription.length < 50;

  return (
    <main ref={containerRef} className="min-h-screen pt-32 pb-12 px-4 flex flex-col items-center">
      <div className="max-w-6xl w-full">
        <header className="analyze-header mb-12 text-center">
          <h1 className="text-3xl sm:text-5xl mb-4 font-bold tracking-tight">Neural <span className="text-[var(--primary)]">Analyzer</span></h1>
          <p className="text-sm sm:text-lg text-gray-400 font-[family-name:var(--font-instrument)] max-w-2xl mx-auto">
            Upload your resume and paste the job description to get a semantic match score.
          </p>
          {!user && (
            <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--secondary)]/10 border border-[var(--secondary)]/20 text-[var(--secondary)] text-xs font-[family-name:var(--font-jetbrains)]">
              <Info className="w-3.5 h-3.5" />
              Sign in to save your analysis history
            </div>
          )}
        </header>

        {error && (
          <div className="mb-8 p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-3 text-red-400 font-mono text-xs">
            <ShieldAlert className="w-5 h-5 mt-0.5 flex-shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {/* PDF tip */}
        <div className="mb-6 p-3 bg-white/3 border border-white/10 rounded-lg flex items-start gap-3 text-gray-500 text-[11px] font-[family-name:var(--font-jetbrains)]">
          <Info className="w-4 h-4 mt-0.5 flex-shrink-0 text-[var(--primary)]/50" />
          <span>
            <span className="text-gray-300 font-bold">PDF Requirements:</span> Must be text-based (not scanned/image-only). 
            If exported from Canva or Photoshop, re-save from Word, Google Docs, or a text PDF editor. Max 5MB.
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
          <div className="grid-item">
            <ResumeDropzone 
              onFileSelect={setFile} 
              selectedFile={file} 
            />
          </div>
          <div className="grid-item">
            <JobDescriptionInput 
              value={jobDescription} 
              onChange={setJobDescription} 
            />
          </div>
        </div>

        <div className="flex flex-col items-center gap-4">
          <button
            onClick={() => handleAnalyze(user?.id || 'guest')}
            disabled={isDisabled}
            id="analyze-btn"
            className={`
              btn-primary px-16 py-4 flex items-center gap-4 text-sm
              ${isDisabled ? 'opacity-50 grayscale cursor-not-allowed shadow-none' : ''}
            `}
          >
            {status === 'loading' ? (
              <>
                <Loader2 className="w-6 h-6 animate-spin" />
                <span className="tracking-[0.2em]">Processing Neural Data...</span>
              </>
            ) : (
              <>
                <Rocket className="w-5 h-5" />
                <span className="tracking-[0.2em]">Initialize Match Engine</span>
              </>
            )}
          </button>
          {!file && (
            <p className="text-[11px] text-gray-600 font-[family-name:var(--font-jetbrains)]">↑ Upload a PDF resume to continue</p>
          )}
          {file && jobDescription.length < 50 && (
            <p className="text-[11px] text-gray-600 font-[family-name:var(--font-jetbrains)]">↑ Job description needs at least 50 characters ({jobDescription.length}/50)</p>
          )}
        </div>
      </div>
    </main>
  );
}
