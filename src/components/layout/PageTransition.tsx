"use client";

import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { usePathname } from "next/navigation";

export const PageTransition = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  const transitionRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const tl = gsap.timeline();

    // Reset transition layer
    gsap.set(transitionRef.current, { scaleY: 0, transformOrigin: "bottom" });

    // In-animation
    tl.to(transitionRef.current, {
      scaleY: 1,
      duration: 0.6,
      ease: "power4.inOut",
    })
    .to(contentRef.current, {
      opacity: 0,
      y: -20,
      duration: 0.3,
    }, "-=0.4")
    .set(contentRef.current, { y: 20 })
    .to(transitionRef.current, {
      scaleY: 0,
      transformOrigin: "top",
      duration: 0.6,
      ease: "power4.inOut",
      delay: 0.1,
    })
    .to(contentRef.current, {
      opacity: 1,
      y: 0,
      duration: 0.5,
      ease: "power3.out",
    }, "-=0.3");

    return () => {
      tl.kill();
    };
  }, [pathname]);

  return (
    <>
      <div 
        ref={transitionRef} 
        className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-3xl pointer-events-none"
      />

      <div ref={contentRef}>
        {children}
      </div>
    </>
  );
};
