'use client';

import React, { createContext, useContext, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

const GSAPContext = createContext(null);

export const GSAPProvider = ({ children }: { children: React.ReactNode }) => {
  useEffect(() => {
    // Global GSAP settings if any
    gsap.config({
      nullTargetWarn: false,
    });
  }, []);

  return (
    <GSAPContext.Provider value={null}>
      {children}
    </GSAPContext.Provider>
  );
};

export const useGSAP = () => useContext(GSAPContext);
