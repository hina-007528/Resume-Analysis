'use client';

import React, { Suspense } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils/cn';

const BottomNavContent = () => {
  const pathname = usePathname();

  const navItems = [
    { id: 'connect', name: 'CONNECT', href: '/', icon: 'hub' },
    { id: 'terminal', name: 'TERMINAL', href: '/analyze', icon: 'terminal' },
    { id: 'protocols', name: 'PROTOCOLS', href: '/history', icon: 'description' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 py-4 bg-black/60 backdrop-blur-2xl border-t border-cyan-500/20 rounded-t-xl shadow-[0_-10px_40px_rgba(0,245,255,0.1)]">
      {navItems.map((item) => {
        const isActive = pathname === item.href;

        return (
          <Link 
            key={item.id} 
            href={item.href} 
            className={cn(
              "flex flex-col items-center justify-center p-2 min-w-[80px] transition-all duration-300",
              isActive 
                ? "bg-cyan-500/20 text-cyan-300 rounded-xl shadow-[inset_0_0_15px_rgba(0,245,255,0.3)] border border-cyan-500/40" 
                : "text-cyan-400/40 hover:text-cyan-400"
            )}
          >
            <span className={cn(
              "material-symbols-outlined text-2xl transition-transform",
              isActive && "scale-110 drop-shadow-[0_0_8px_rgba(0,245,255,0.6)]"
            )}>
              {item.icon}
            </span>
            <span className="font-mono text-[10px] tracking-[0.2em] mt-1.5 font-bold uppercase">{item.name}</span>
          </Link>
        );
      })}
    </nav>
  );
};

export const BottomNav = () => {
  return (
    <Suspense fallback={<div className="fixed bottom-0 left-0 w-full h-20 bg-black/60 border-t border-cyan-500/20" />}>
      <BottomNavContent />
    </Suspense>
  );
};
