'use client';

import React, { useState, useEffect } from 'react';
import { Fingerprint, Key, Rocket, ShieldCheck, Eye, EyeOff, Loader2 } from "lucide-react";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import gsap from "gsap";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    gsap.fromTo(".auth-card", 
      { scale: 0.9, opacity: 0, y: 30 },
      { scale: 1, opacity: 1, y: 0, duration: 1, ease: "back.out(1.7)" }
    );
  }, []);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({ 
          email, 
          password,
          options: { emailRedirectTo: `${window.location.origin}/auth/callback` }
        });
        if (error) throw error;
        alert("Registration initiated. Check your neural link (email) for verification.");
      }
      const next = typeof window !== 'undefined'
        ? new URLSearchParams(window.location.search).get('next') || '/analyze'
        : '/analyze';
      router.push(next);
    } catch (err: any) {
      setError(err.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative z-10 w-full flex flex-col items-center justify-center min-h-screen px-4 sm:px-8 pt-32 pb-24">
      {/* Auth Card */}
      <div className="auth-card w-full max-w-[450px] glass-card p-6 sm:p-10 rounded-xl relative overflow-hidden transition-all duration-500 hover:shadow-[0_0_80px_rgba(0,245,255,0.15)] group/card">
        {/* Decorative Scanning Element */}
        <div className="absolute top-0 left-0 w-full h-[2px] bg-[var(--primary)] animate-scan opacity-40"></div>

        <div className="flex flex-col gap-8 sm:gap-10">
          {/* Header HUD */}
          <div className="space-y-3">
            <div className="flex justify-between items-end">
              <h2 className="text-xl sm:text-2xl font-[family-name:var(--font-syne)] text-[var(--primary)] uppercase tracking-tighter">
                {isLogin ? 'AUTHENTICATION' : 'REGISTRATION'}
              </h2>
              <span className="text-[10px] sm:text-[12px] font-[family-name:var(--font-jetbrains)] text-[var(--primary)]/60 uppercase">SYS_V7.2</span>
            </div>
            <div className="h-px w-full bg-gradient-to-r from-[var(--primary)]/50 to-transparent"></div>
          </div>

          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded text-red-500 text-[10px] font-mono uppercase tracking-widest animate-pulse">
              {error}
            </div>
          )}

          {/* Toggle Navigation */}
          <div className="flex p-1 bg-black/60 backdrop-blur-3xl rounded-xl border border-white/10 relative overflow-hidden shadow-[inset_0_0_20px_rgba(0,0,0,0.5)]">
            {/* Sliding Indicator Background */}
            <div 
              className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-[var(--primary)] rounded-lg transition-all duration-500 cubic-bezier(0.4, 0, 0.2, 1) ${isLogin ? 'left-1' : 'left-[calc(50%+2px)]'}`}
            ></div>
            
            <button
              type="button"
              onClick={() => { setIsLogin(true); setError(null); }}
              className={`flex-1 py-3 font-[family-name:var(--font-jetbrains)] text-xs sm:text-sm transition-all duration-300 uppercase relative z-10 font-bold tracking-widest ${isLogin ? 'text-black' : 'text-white/40 hover:text-white'}`}
            >
              LOGIN
            </button>
            <button
              type="button"
              onClick={() => { setIsLogin(false); setError(null); }}
              className={`flex-1 py-3 font-[family-name:var(--font-jetbrains)] text-xs sm:text-sm transition-all duration-300 uppercase relative z-10 font-bold tracking-widest ${!isLogin ? 'text-black' : 'text-white/40 hover:text-white'}`}
            >
              CREATE_ID
            </button>
          </div>



          {/* Input Fields */}
          <form className="space-y-6 sm:space-y-8" onSubmit={handleAuth}>
            <div className="space-y-3">
              <label className="font-[family-name:var(--font-jetbrains)] text-[10px] sm:text-xs text-[var(--primary)]/80 flex items-center gap-2 uppercase tracking-widest">
                <Fingerprint className="w-4 h-4" />
                NEURAL_LINK
              </label>
              <div className="relative group">
                <input
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-black/40 border-l-2 border-b-2 border-[var(--primary)]/40 border-t-0 border-r-0 p-4 sm:p-5 font-[family-name:var(--font-jetbrains)] text-[var(--primary)] focus:border-[var(--primary)] focus:ring-0 focus:bg-[var(--primary)]/5 transition-all placeholder:text-gray-700 uppercase text-xs sm:text-sm"
                  placeholder="NODE_ADDRESS@QUANTUM.NET"
                  type="email"
                />
                <div className="absolute bottom-0 left-0 h-[1px] w-0 bg-[var(--primary)] group-focus-within:w-full transition-all duration-700"></div>
              </div>
            </div>

            <div className="space-y-3">
              <label className="font-[family-name:var(--font-jetbrains)] text-[10px] sm:text-xs text-[var(--primary)]/80 flex items-center gap-2 uppercase tracking-widest">
                <Key className="w-4 h-4" />
                ACCESS_CODE
              </label>
              <div className="relative group">
                <input
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-black/40 border-l-2 border-b-2 border-[var(--primary)]/40 border-t-0 border-r-0 p-4 sm:p-5 font-[family-name:var(--font-jetbrains)] text-[var(--primary)] focus:border-[var(--primary)] focus:ring-0 focus:bg-[var(--primary)]/5 transition-all placeholder:text-gray-700 text-xs sm:text-sm pr-12"
                  placeholder="••••••••"
                  type={showPassword ? "text" : "password"}
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[var(--primary)] transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
                <div className="absolute bottom-0 left-0 h-[1px] w-0 bg-[var(--primary)] group-focus-within:w-full transition-all duration-700"></div>
              </div>
            </div>

            {/* HUD Button */}
            <button 
              disabled={loading}
              className="w-full mt-4 sm:mt-6 group relative overflow-hidden bg-transparent border border-[var(--primary)]/40 py-5 sm:py-6 rounded-lg transition-all active:scale-95 hover:border-[var(--primary)] hover:shadow-[0_0_20px_rgba(0,245,255,0.2)] disabled:opacity-50"
            >
              <div className="absolute inset-0 bg-[var(--primary)]/0 group-hover:bg-[var(--primary)]/10 transition-all duration-300"></div>
              <div className="relative flex items-center justify-center gap-4">
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin text-[var(--primary)]" />
                ) : (
                  <>
                    <span className="font-[family-name:var(--font-jetbrains)] text-xs sm:text-sm text-[var(--primary)] tracking-[0.45em] font-bold uppercase group-hover:text-white transition-colors">
                      {isLogin ? 'AUTHORIZE' : 'REGISTER'}
                    </span>
                    <Rocket className="w-4 h-4 text-[var(--primary)] group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                  </>
                )}
              </div>
              {/* Decorative Corners */}
              <div className="absolute top-0 left-0 w-2.5 h-2.5 border-t-2 border-l-2 border-[var(--primary)] group-hover:scale-125 transition-transform"></div>
              <div className="absolute bottom-0 right-0 w-2.5 h-2.5 border-b-2 border-r-2 border-[var(--primary)] group-hover:scale-125 transition-transform"></div>
            </button>
          </form>

          {/* Footer Telemetry */}
          <div className="flex flex-col sm:flex-row justify-between items-center text-[9px] sm:text-[10px] font-[family-name:var(--font-jetbrains)] text-gray-600 tracking-widest pt-6 opacity-70 gap-3 sm:gap-0 uppercase">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-[var(--primary)]/60 animate-pulse shadow-[0_0_8px_#00f5ff]"></div>
              <span className="flex items-center gap-1"><ShieldCheck className="w-3 h-3" /> ENCRYPTION_ACTIVE</span>
            </div>
            <div className="text-center sm:text-right">
              COORD: 40.7128° N, 74.0060° W
            </div>
          </div>
        </div>
      </div>

      {/* Secondary CTA */}
      <p className="mt-8 sm:mt-10 font-[family-name:var(--font-jetbrains)] text-[10px] sm:text-xs text-gray-500 flex items-center gap-3 pb-8 uppercase">
        LOST_ACCESS? <a className="text-[var(--primary)] hover:text-white transition-colors hover:underline underline-offset-4" href="#">RECOVER_LINK</a>
      </p>
    </main>
  );
}

