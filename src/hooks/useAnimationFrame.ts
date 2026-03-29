'use client';

import { useRef, useLayoutEffect } from 'react';

/**
 * Runs a callback at ~60fps using requestAnimationFrame.
 * Uses useLayoutEffect for synchronous cleanup (prevents frame leaks).
 *
 * @param callback - Called each frame with deltaTime in ms
 * @param running - Whether the animation loop is active
 */
export function useAnimationFrame(
  callback: (deltaTime: number) => void,
  running: boolean
): void {
  const frameIdRef = useRef<number | null>(null);
  const previousTimeRef = useRef<number>(0);
  const callbackRef = useRef(callback);

  // Keep callback ref current to avoid re-creating animation loop on callback change
  callbackRef.current = callback;

  useLayoutEffect(() => {
    if (!running) return;

    function animate(currentTime: number) {
      const deltaTime = previousTimeRef.current === 0
        ? 16.67 // Assume ~60fps for first frame
        : currentTime - previousTimeRef.current;
      previousTimeRef.current = currentTime;
      callbackRef.current(deltaTime);
      frameIdRef.current = requestAnimationFrame(animate);
    }

    previousTimeRef.current = 0;
    frameIdRef.current = requestAnimationFrame(animate);

    return () => {
      if (frameIdRef.current !== null) {
        cancelAnimationFrame(frameIdRef.current);
        frameIdRef.current = null;
      }
      previousTimeRef.current = 0;
    };
  }, [running]);
}
