"use client";

import { Canvas } from "@react-three/fiber";
import { Suspense, useEffect, useRef } from "react";
import { ParticleField } from "@/components/three/ParticleField";
import { HeroDocument } from "@/components/three/HeroDocument";
import { GSAPProvider } from "@/components/gsap/GSAPProvider";
import Link from "next/link";
import gsap from "gsap";
import { Rocket, ShieldCheck, Activity, Globe } from "lucide-react";


export default function Home() {
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const tl = gsap.timeline();
    
    tl.fromTo(titleRef.current, 
      { y: 50, opacity: 0, filter: "blur(10px)" },
      { y: 0, opacity: 1, filter: "blur(0px)", duration: 1.2, ease: "power4.out", delay: 0.5 }
    )
    .fromTo(subtitleRef.current,
      { y: 30, opacity: 0 },
      { y: 0, opacity: 1, duration: 1, ease: "power3.out" },
      "-=0.8"
    )
    .fromTo(".btn-reveal",
      { y: 20, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8, stagger: 0.2, ease: "back.out(1.7)" },
      "-=0.6"
    );
  }, []);


  return (
    <main className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
      {/* 3D Background */}
      <div className="absolute inset-0 z-0">
        <Canvas>
          <Suspense fallback={null}>
            <ParticleField />
            <HeroDocument />
          </Suspense>
        </Canvas>
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-4 max-w-4xl">
        <div className="inline-block px-3 py-1 mb-6 border border-[var(--primary)] rounded-full text-[10px] font-[family-name:var(--font-jetbrains)] text-[var(--primary)] uppercase tracking-widest animate-pulse">
         AI Resume Analyzer Neural Engine v1.0.4
        </div>
        
        <h1 ref={titleRef} className="text-4xl sm:text-6xl md:text-8xl mb-6 leading-tight sm:leading-none">
          Precision <span className="text-[var(--primary)]">Matching</span> <br className="hidden sm:block" />
          For Next-Gen <span className="text-[var(--secondary)]">Talent</span>
        </h1>
        
        <p ref={subtitleRef} className="text-base sm:text-lg md:text-xl text-gray-400 mb-8 sm:mb-12 max-w-2xl mx-auto font-[family-name:var(--font-instrument)]">
          The industry's first AI resume analyzer using neural semantic matching. 
          Upload your resume and bridge the gap between your skills and your dream job.
        </p>

        
        <div ref={ctaRef} className="flex flex-col sm:flex-row gap-6 justify-center">
          <Link 
            href="/analyze" 
            className="btn-reveal btn-primary"
          >
            <span className="relative z-10 flex items-center gap-2">
              <Rocket className="w-4 h-4" />
              Start Analysis
            </span>
          </Link>
          
          <Link 
            href="/login" 
            className="btn-reveal btn-glass"
          >
            Sign In to History
          </Link>
        </div>


      </div>

      {/* HUD Elements */}
      <div className="absolute bottom-10 left-10 hidden lg:block border-l-2 border-[var(--primary)] pl-4 opacity-50">
        <div className="text-[10px] font-[family-name:var(--font-jetbrains)] text-[var(--primary)] uppercase">Coordinates</div>
        <div className="text-xs">40.7128° N, 74.0060° W</div>
      </div>
      
      <div className="absolute bottom-10 right-10 hidden lg:block border-r-2 border-[var(--secondary)] pr-4 text-right opacity-50">
        <div className="text-[10px] font-[family-name:var(--font-jetbrains)] text-[var(--secondary)] uppercase">Status</div>
        <div className="text-xs">SYSTEMS OPERATIONAL</div>
      </div>
    </main>
  );
}
