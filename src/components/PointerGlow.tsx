'use client';

import { useEffect } from 'react';

// Feeds the pointer position to the background grid glow in globals.css.
export function PointerGlow() {
  useEffect(() => {
    const style = document.documentElement.style;
    let frame = 0;

    const move = (e: PointerEvent) => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        style.setProperty('--pointer-x', `${e.clientX}px`);
        style.setProperty('--pointer-y', `${e.clientY}px`);
      });
    };
    const leave = () => {
      cancelAnimationFrame(frame);
      style.removeProperty('--pointer-x');
      style.removeProperty('--pointer-y');
    };

    window.addEventListener('pointermove', move);
    document.documentElement.addEventListener('pointerleave', leave);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('pointermove', move);
      document.documentElement.removeEventListener('pointerleave', leave);
    };
  }, []);

  return null;
}
