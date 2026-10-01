/**
 * Makes the dotted background glow around your mouse.
 */

'use client';

import { useEffect } from 'react';

/**
 * Tracks your pointer and hands its position to the background, at most once
 * per frame. It draws nothing itself.
 */
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
