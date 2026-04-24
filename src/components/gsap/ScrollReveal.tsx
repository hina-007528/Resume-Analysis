'use client';

import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';

interface ScrollRevealProps {
  children: React.ReactNode;
  direction?: 'up' | 'down' | 'left' | 'right';
  delay?: number;
  duration?: number;
  distance?: number;
}

export const ScrollReveal = ({
  children,
  direction = 'up',
  delay = 0,
  duration = 1,
  distance = 50,
}: ScrollRevealProps) => {
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    let x = 0;
    let y = 0;

    switch (direction) {
      case 'up': y = distance; break;
      case 'down': y = -distance; break;
      case 'left': x = distance; break;
      case 'right': x = -distance; break;
    }

    gsap.fromTo(
      element,
      {
        opacity: 0,
        x: x,
        y: y,
      },
      {
        opacity: 1,
        x: 0,
        y: 0,
        duration: duration,
        delay: delay,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: element,
          start: 'top 85%',
          toggleActions: 'play none none none',
        },
      }
    );
  }, [direction, delay, duration, distance]);

  return <div ref={elementRef}>{children}</div>;
};
