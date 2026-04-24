'use client';

import { useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';

export const useGSAP = (
  callback: (context: gsap.Context) => void,
  dependencies: any[] = []
) => {
  const contextRef = useRef<gsap.Context | null>(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(callback);
    contextRef.current = ctx;

    return () => ctx.revert();
  }, dependencies);

  return contextRef;
};
