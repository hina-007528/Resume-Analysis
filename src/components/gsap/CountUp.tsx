'use client';

import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';

export const CountUp = ({ end, duration = 2, delay = 0 }: { end: number, duration?: number, delay?: number }) => {
  const countRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const element = countRef.current;
    if (!element) return;

    const obj = { value: 0 };
    gsap.to(obj, {
      value: end,
      duration: duration,
      delay: delay,
      ease: 'power4.out',
      onUpdate: () => {
        element.innerText = Math.round(obj.value).toString();
      },
    });
  }, [end, duration, delay]);

  return <span ref={countRef}>0</span>;
};
