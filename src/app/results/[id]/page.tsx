"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ScoreDisplay } from "@/components/analyzer/ScoreDisplay";
import { KeywordCard } from "@/components/analyzer/KeywordCard";
import { SuggestionPanel } from "@/components/analyzer/SuggestionPanel";
import { Loader2, Download, Share2, Rocket } from "lucide-react";
import gsap from "gsap";
import axios from "axios";
import { createClient } from "@/lib/supabase/client";

export default function ResultsPage() {
  const { id } = useParams();
  const analysisId = Array.isArray(id) ? id[0] : id;
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [shareLabel, setShareLabel] = useState("Share");

  useEffect(() => {
    let isMounted = true;

    const fetchData = async (retries = 3) => {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/api/v1/analysis/${analysisId}`,
          {
            headers: user ? { "X-User-ID": user.id } : {}
          }
        );
        if (isMounted) {
          setData(response.data);
          setLoading(false);
        }
        return;
      } catch (error: any) {
        const status = error?.response?.status;
        // 404 means this analysis id doesn't exist; don't keep retrying.
        if (status === 404) {
          if (isMounted) {
            setLoading(false);
          }
          return;
        }

        if (retries > 0) {
          setTimeout(() => {
            if (isMounted) fetchData(retries - 1);
          }, 1000);
          return;
        }

        if (isMounted) {
          setLoading(false);
        }
        if (status !== 404) {
          console.error('Error fetching analysis after retries:', error);
        }
      }
    };

    fetchData();
    return () => {
      isMounted = false;
    };
  }, [analysisId]);

  useEffect(() => {
    if (data) {
      const tl = gsap.timeline();

      tl.fromTo(".report-header",
        { x: -50, opacity: 0 },
        { x: 0, opacity: 1, duration: 1, ease: "power4.out" }
      )
        .fromTo(".score-panel",
          { scale: 0.8, opacity: 0 },
          { scale: 1, opacity: 1, duration: 1, ease: "back.out(1.7)" },
          "-=0.6"
        )
        .fromTo(".keyword-card",
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, stagger: 0.05, duration: 0.5, ease: "power2.out" },
          "-=0.4"
        );
    }
  }, [data]);

  const handleDownload = async () => {
    if (!analysisId || downloading) return;
    setDownloading(true);

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8001";

    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      // For maximum compatibility with download managers (like IDM), 
      // we use a direct link with a query parameter for authentication.
      // This prevents IDM from intercepting and breaking a fetch/blob request.
      const downloadUrl = new URL(`${apiUrl}/api/v1/report/${analysisId}`);
      if (user) {
        downloadUrl.searchParams.append("u", user.id);
      }

      console.log(`Initiating download: ${downloadUrl.toString()}`);
      
      // Use a hidden anchor to trigger the browser's native download
      const a = document.createElement("a");
      a.href = downloadUrl.toString();
      a.style.display = "none";
      document.body.appendChild(a);
      a.click();
      
      // Clean up after a short delay
      setTimeout(() => {
        if (document.body.contains(a)) {
          document.body.removeChild(a);
        }
        setDownloading(false);
      }, 1500);

    } catch (error: any) {
      console.error("Download Error Details:", error);
      alert(`Failed to initiate download: ${error.message || "Unknown error"}`);
      setDownloading(false);
    }
  };

  const handleShare = async () => {
    const link = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({
          title: "Resume Analysis Report",
          text: "View my resume analysis report",
          url: link,
        });
      } else if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(link);
      } else {
        const input = document.createElement("input");
        input.value = link;
        document.body.appendChild(input);
        input.select();
        document.execCommand("copy");
        input.remove();
      }
      setShareLabel("Copied!");
      setTimeout(() => setShareLabel("Share"), 1500);
    } catch {
      setShareLabel("Copy failed");
      setTimeout(() => setShareLabel("Share"), 1500);
    }
  };


  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <Loader2 className="w-12 h-12 text-[var(--primary)] animate-spin mb-4" />
        <p className="text-gray-400 font-[family-name:var(--font-jetbrains)] animate-pulse">Decrypting Analysis Data...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <h2 className="text-2xl mb-4">Analysis Not Found</h2>
        <p className="text-gray-400">The requested analysis ID does not exist or has been deleted.</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen pt-28 pb-20 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="report-header flex flex-col md:flex-row justify-between items-start md:items-end mb-8 sm:mb-12 gap-6">
          <div>
            <div className="text-[10px] font-[family-name:var(--font-jetbrains)] text-[var(--primary)] uppercase mb-2 tracking-[0.2em]">
              Analysis ID: {data.id.substring(0, 8)}...
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl">Match <span className="text-[var(--primary)]">Intelligence</span> Report</h1>
          </div>

          <div className="flex flex-wrap gap-3 w-full md:w-auto">
            <Link
              href="/analyze"
              className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-[var(--primary)] text-black rounded-lg hover:shadow-[0_0_20px_rgba(0,245,255,0.4)] transition-all text-sm font-bold uppercase tracking-wider"
            >
              <Rocket className="w-4 h-4" />
              New Analysis
            </Link>
            <button
              onClick={handleDownload}
              disabled={downloading}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-2.5 glass-card border-[var(--card-border)] hover:border-[var(--primary)] transition-all text-sm disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <Download className="w-4 h-4" />
              {downloading ? "Downloading..." : "Download"}
            </button>
            <button
              onClick={handleShare}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-2.5 glass-card border-[var(--card-border)] hover:border-[var(--secondary)] transition-all text-sm"
            >
              <Share2 className="w-4 h-4" />
              {shareLabel}
            </button>
          </div>
        </div>


        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Score */}
          <div className="score-panel lg:col-span-1">
            <ScoreDisplay
              score={Number(data.match_score)}
              label={data.score_label}
            />

            {/* Skill Coverage Bar */}
            {(data.matched_keywords.length > 0 || data.missing_keywords.length > 0) && (
              <div className="mt-6 glass-card p-5">
                <h4 className="text-xs font-[family-name:var(--font-jetbrains)] text-gray-500 uppercase mb-3 tracking-widest">Skill Coverage</h4>
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="text-green-400">{data.matched_keywords.length} matched</span>
                  <span className="text-gray-500">
                    {data.matched_keywords.length + data.missing_keywords.length} total in JD
                  </span>
                  <span className="text-red-400">{data.missing_keywords.length} missing</span>
                </div>
                <div className="h-2 rounded-full bg-gray-800 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-green-500 to-[var(--primary)] rounded-full transition-all duration-700"
                    style={{
                      width: `${data.matched_keywords.length + data.missing_keywords.length > 0
                          ? Math.round(
                            (data.matched_keywords.length /
                              (data.matched_keywords.length + data.missing_keywords.length)) *
                            100
                          )
                          : 0
                        }%`,
                    }}
                  />
                </div>
              </div>
            )}


            <div className="mt-6 glass-card p-6">
              <h4 className="text-xs font-[family-name:var(--font-jetbrains)] text-gray-500 uppercase mb-4 tracking-widest">Metadata</h4>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">File:</span>
                  <span className="text-gray-300 font-medium truncate max-w-[140px]" title={data.resume_filename}>{data.resume_filename}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Word Count:</span>
                  <span className="text-gray-300 font-medium">{data.resume_word_count?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Processed in:</span>
                  <span className="text-gray-300 font-medium">{data.processing_time_ms}ms</span>
                </div>
                {data.job_description_snippet && (
                  <div className="pt-2 border-t border-white/5">
                    <span className="text-gray-500 text-xs block mb-1">JD Preview:</span>
                    <p className="text-gray-400 text-xs leading-relaxed line-clamp-3">
                      {data.job_description_snippet}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Keywords & Suggestions */}
          <div className="lg:col-span-2 space-y-8">
            <div className="glass-card p-8">
              <h3 className="text-xl mb-6 flex items-center gap-3">
                Keyword <span className="text-[var(--primary)]">Vector Analysis</span>
              </h3>

              <div className="space-y-6">
                <div>
                  <h4 className="text-xs font-[family-name:var(--font-jetbrains)] text-green-400 uppercase mb-3 tracking-widest">Matched Assets</h4>
                  <div className="flex flex-wrap gap-3">
                    {data.matched_keywords.map((kw: string) => (
                      <div key={kw} className="keyword-card">
                        <KeywordCard keyword={kw} isMatched={true} />
                      </div>
                    ))}
                    {data.matched_keywords.length === 0 && <p className="text-gray-600 italic text-sm">No keyword matches found.</p>}
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-[family-name:var(--font-jetbrains)] text-red-400 uppercase mb-3 tracking-widest">Missing Criticals</h4>
                  <div className="flex flex-wrap gap-3">
                    {data.missing_keywords.map((kw: string) => (
                      <div key={kw} className="keyword-card">
                        <KeywordCard keyword={kw} isMatched={false} />
                      </div>
                    ))}
                    {data.missing_keywords.length === 0 && <p className="text-gray-600 italic text-sm">No missing keywords identified.</p>}
                  </div>
                </div>
              </div>
            </div>

            <SuggestionPanel suggestions={data.suggestions} />
          </div>
        </div>
      </div>
    </main>
  );
}
