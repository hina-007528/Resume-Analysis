'use client';

import { ParticleField } from '@/components/three/ParticleField';
import { GlassCard } from '@/components/ui/GlassCard';
import { HUDButton } from '@/components/ui/HUDButton';
import { Progress } from '@/components/ui/Progress';
import { Badge } from '@/components/ui/Badge';
import { ChevronLeft, Share2, Download, TrendingUp, Cpu, Activity, ShieldCheck, Zap } from 'lucide-react';
import Link from 'next/link';
import { ScrollReveal } from '@/components/gsap/ScrollReveal';
import { Suspense, useState } from 'react';
import { Canvas } from '@react-three/fiber';

export default function ResultsPage() {
  const score = 84;
  
  const [isFixing, setIsFixing] = useState(false);

  const handleFix = () => {
    setIsFixing(true);
    setTimeout(() => setIsFixing(false), 2000);
  };

  const handleDownload = () => {
    window.print();
  };

  return (
    <main className="relative min-h-screen flex flex-col p-8 lg:p-12 overflow-x-hidden">
      <div className="absolute inset-0 z-0 pointer-events-none">
        <Canvas>
          <Suspense fallback={null}>
            <ParticleField />
          </Suspense>
        </Canvas>
      </div>
      
      {/* Top Bar */}
      <nav className="relative z-20 flex justify-between items-center mb-12">
        <Link href="/analyze" className="group flex items-center gap-2 text-primary font-mono text-xs tracking-tighter hover:glow-primary transition-all">
          <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          RE_INITIALIZE_SCAN
        </Link>
        <div className="flex gap-4">
          <HUDButton variant="outline" size="sm">
            <Share2 className="w-3 h-3 mr-2" /> EXPORT_DATA
          </HUDButton>
          <HUDButton onClick={handleDownload} variant="outline" size="sm">
            <Download className="w-3 h-3 mr-2" /> SAVE_ARCHIVE
          </HUDButton>
        </div>
      </nav>

      <div className="relative z-20 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Metrics */}
        <div className="lg:col-span-4 space-y-8">
          <ScrollReveal>
            <GlassCard className="p-10 border-primary/30 flex flex-col items-center text-center relative overflow-hidden">
              <div className="absolute top-0 right-0 p-2 font-mono text-[8px] text-primary/30 uppercase tracking-widest">Node: Omega-12</div>
              <h2 className="font-mono text-[10px] text-primary mb-8 tracking-[0.4em] uppercase">ANALYTICAL_REPORT_S04</h2>
              
              <div className="relative w-48 h-48 mb-8">
                <svg className="w-full h-full -rotate-90">
                  <circle
                    cx="96" cy="96" r="88"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="4"
                    className="text-white/5"
                  />
                  <circle
                    cx="96" cy="96" r="88"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="4"
                    strokeDasharray={553}
                    strokeDashoffset={553 - (553 * score) / 100}
                    className="text-primary glow-primary transition-all duration-1000 ease-out"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="font-syne text-6xl font-extrabold text-white">{score}</span>
                  <span className="font-mono text-[8px] text-primary uppercase">Neural_Sync</span>
                </div>
              </div>

              <div className="w-full space-y-4">
                <div className="flex justify-between items-end">
                  <span className="font-mono text-[10px] text-foreground/40 uppercase">Ats_Trajectory</span>
                  <span className="font-mono text-xs text-white">OPTIMAL</span>
                </div>
                <Progress value={84} variant="primary" />
              </div>
            </GlassCard>
          </ScrollReveal>

          <ScrollReveal delay={0.2}>
            <GlassCard className="p-6 space-y-6">
              <h3 className="font-mono text-[10px] text-primary/70 tracking-widest uppercase flex items-center gap-2">
                <Cpu className="w-4 h-4" /> Neural_Key_Nodes
              </h3>
              <div className="flex flex-wrap gap-2">
                {['DISTRIBUTED_SYSTEMS', 'CLOUD_ARCH', 'NEURAL_NETS', 'K8S', 'REACT_V19', 'RUST_CORE'].map(skill => (
                  <Badge key={skill} variant="primary">{skill}</Badge>
                ))}
              </div>
            </GlassCard>
          </ScrollReveal>
        </div>

        {/* Right Column: Insights */}
        <div className="lg:col-span-8 space-y-8">
          <ScrollReveal delay={0.3}>
            <section className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-secondary/10 border border-secondary/20 rounded-sm">
                  <Activity className="w-6 h-6 text-secondary" />
                </div>
                <div>
                  <h2 className="font-syne text-3xl font-bold uppercase tracking-tight">SYSTEM_OPTIMIZATIONS</h2>
                  <p className="font-instrument text-xs text-foreground/40 italic uppercase tracking-widest">Recommended adjustments for maximum uplink frequency</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <GlassCard glow className="border-secondary/20 p-8 space-y-4 group hover:border-secondary transition-colors">
                  <div className="flex justify-between items-start">
                    <h4 className="font-syne font-bold text-lg text-white group-hover:text-secondary transition-colors uppercase">Synthesize Core Values</h4>
                    <Badge variant="secondary">Critical</Badge>
                  </div>
                  <p className="font-instrument text-sm text-foreground/60 leading-relaxed">
                    The neural engine suggests condensing section 4.2 to emphasize 'Kinetic Flow'. This will decrease cognitive load for recruiter-class entities.
                  </p>
                  <HUDButton onClick={handleFix} disabled={isFixing} variant="outline" size="sm" className="w-full">
                    {isFixing ? 'CALIBRATING...' : 'INITIALIZE_CALIBRATION'}
                  </HUDButton>
                </GlassCard>

                <GlassCard glow className="border-tertiary/20 p-8 space-y-4 group hover:border-tertiary transition-colors">
                  <div className="flex justify-between items-start">
                    <h4 className="font-syne font-bold text-lg text-white group-hover:text-tertiary transition-colors uppercase">Calibrate Meta-Data</h4>
                    <Badge variant="tertiary">Urgent</Badge>
                  </div>
                  <p className="font-instrument text-sm text-foreground/60 leading-relaxed">
                    Missing schema identifiers in 'Project Zero' may lead to indexing fragmentation. Standardize your role titles to align with target sector benchmarks.
                  </p>
                  <HUDButton variant="outline" size="sm" className="w-full">EXECUTE_RE_INDEX</HUDButton>
                </GlassCard>
              </div>
            </section>
          </ScrollReveal>

          <ScrollReveal delay={0.4}>
            <GlassCard className="p-8 border-white/5 bg-white/[0.02]">
              <div className="flex items-center gap-3 mb-6">
                <TrendingUp className="text-primary w-5 h-5" />
                <h3 className="font-syne font-bold text-sm text-white uppercase tracking-widest">Projected_Career_Orbit</h3>
              </div>
              <div className="h-48 w-full bg-gradient-to-t from-primary/5 to-transparent relative rounded-sm overflow-hidden border border-white/5">
                {/* Mock Graph Decor */}
                <div className="absolute inset-0 flex items-end px-4 pb-4 gap-2">
                  {[40, 65, 45, 80, 55, 90, 70, 85].map((h, i) => (
                    <div 
                      key={i} 
                      className="flex-1 bg-primary/20 border-t border-primary/40 transition-all hover:bg-primary/40" 
                      style={{ height: `${h}%` }}
                    />
                  ))}
                </div>
                <div className="absolute top-4 left-4 font-mono text-[8px] text-primary/40 uppercase">Trajectory_Projection_Active</div>
              </div>
            </GlassCard>
          </ScrollReveal>
        </div>
      </div>
    </main>
  );
}
