'use client';

import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';

export const TextReveal = ({ children, delay = 0 }: { children: React.ReactNode, delay?: number }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;

    // Split text logic would normally use SplitText plugin (paid)
    // Here we use a simpler character split for accessibility and compatibility
    const text = element.innerText;
    element.innerHTML = '';
    
    text.split('').forEach((char) => {
      const span = document.createElement('span');
      span.innerText = char === ' ' ? '\u00A0' : char;
      span.style.display = 'inline-block';
      span.style.opacity = '0';
      element.appendChild(span);
    });

    gsap.to(element.children, {
      opacity: 1,
      y: 0,
      stagger: 0.02,
      duration: 0.8,
      delay: delay,
      ease: 'power4.out',
      startAt: { y: 20 },
    });
  }, [delay]);

  return <div ref={containerRef} className="inline-block">{children}</div>;
};
