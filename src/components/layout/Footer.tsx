'use client';

import React from 'react';

export const Footer = () => {
  return (
    <footer className="max-w-7xl mx-auto px-8 py-16 border-t border-cyan-900/20">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
        <div className="space-y-4">
          <span className="font-mono text-xs text-cyan-400 tracking-[0.2em] font-bold uppercase">NETWORK</span>
          <ul className="space-y-2 text-xs font-mono text-cyan-900/80">
            <li><a className="hover:text-cyan-400 transition-colors" href="#">NODES_VIEW</a></li>
            <li><a className="hover:text-cyan-400 transition-colors" href="#">GATEWAY_7</a></li>
            <li><a className="hover:text-cyan-400 transition-colors" href="#">CORE_PROTOCOL</a></li>
          </ul>
        </div>
        <div className="space-y-4">
          <span className="font-mono text-xs text-cyan-400 tracking-[0.2em] font-bold uppercase">LEGAL</span>
          <ul className="space-y-2 text-xs font-mono text-cyan-900/80">
            <li><a className="hover:text-cyan-400 transition-colors" href="#">PRIVACY_ENCRYPTION</a></li>
            <li><a className="hover:text-cyan-400 transition-colors" href="#">TERM_OF_USE</a></li>
          </ul>
        </div>
        <div className="space-y-4 col-span-2 md:col-span-2 text-right">
          <span className="font-mono text-xs text-cyan-400 tracking-[0.2em] font-bold">© 2077_AI Resume Analyzer_INC</span>
          <p className="text-[11px] font-mono text-cyan-900/60 max-w-[250px] ml-auto leading-relaxed">ALL RIGHTS RESERVED IN THIS DIMENSION AND THE NEXT.</p>
        </div>
      </div>
    </footer>
  );
};
