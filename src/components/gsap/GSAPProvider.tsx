"use client";

import { createContext, useContext, useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Note: SplitText and MorphSVG are premium plugins. 
// If they are not available, we should handle them gracefully.
// For this implementation, I will assume they are available or we use alternatives.

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const GSAPContext = createContext<any>(null);

export const GSAPProvider = ({ children }: { children: React.ReactNode }) => {
  const rootRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      // Global animations or defaults can be set here
    }, rootRef);
    
    return () => ctx.revert();
  }, []);

  return (
    <GSAPContext.Provider value={gsap}>
      <div ref={rootRef} className="gsap-root">
        {children}
      </div>
    </GSAPContext.Provider>
  );
};

export const useGSAPContext = () => useContext(GSAPContext);
