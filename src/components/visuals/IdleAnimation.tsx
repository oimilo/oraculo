'use client';

import { useRef, useEffect, useCallback } from 'react';
import { useAnimationFrame } from '@/hooks/useAnimationFrame';
import { VISUAL_THEMES } from '@/lib/audio/visualConfig';
import type { NarrativePhase } from '@/types';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
}

interface IdleAnimationProps {
  phase: NarrativePhase;
}

function createParticles(width: number, height: number, count: number): Particle[] {
  return Array.from({ length: count }, () => ({
    x: Math.random() * width,
    y: Math.random() * height,
    vx: (Math.random() - 0.5) * 0.5,
    vy: (Math.random() - 0.5) * 0.5,
    size: Math.random() * 2 + 1,
    opacity: Math.random() * 0.3 + 0.1,
  }));
}

export default function IdleAnimation({ phase }: IdleAnimationProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const phaseRef = useRef(phase);

  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  // Initialize particles and handle resize
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    function init() {
      if (!canvas) return;
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      const ctx = canvas.getContext('2d');
      if (ctx) ctx.scale(dpr, dpr);

      const theme = VISUAL_THEMES[phaseRef.current];
      particlesRef.current = createParticles(rect.width, rect.height, theme.particleCount);
    }

    init();
    window.addEventListener('resize', init);
    return () => window.removeEventListener('resize', init);
  }, []);

  // Recreate particles when phase changes (different count per phase)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const theme = VISUAL_THEMES[phase];
    const dpr = window.devicePixelRatio || 1;
    const cssWidth = canvas.width / dpr;
    const cssHeight = canvas.height / dpr;
    particlesRef.current = createParticles(cssWidth, cssHeight, theme.particleCount);
  }, [phase]);

  const draw = useCallback((deltaTime: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const theme = VISUAL_THEMES[phaseRef.current];
    const dpr = window.devicePixelRatio || 1;
    const cssWidth = canvas.width / dpr;
    const cssHeight = canvas.height / dpr;
    const particles = particlesRef.current;

    ctx.clearRect(0, 0, cssWidth, cssHeight);

    const timeFactor = deltaTime * 0.01; // Normalize to ~1 at 60fps

    particles.forEach((p) => {
      // Update position with phase-specific motion intensity
      p.x += p.vx * theme.motionIntensity * timeFactor;
      p.y += p.vy * theme.motionIntensity * timeFactor;

      // Wrap around edges
      if (p.x < 0) p.x = cssWidth;
      if (p.x > cssWidth) p.x = 0;
      if (p.y < 0) p.y = cssHeight;
      if (p.y > cssHeight) p.y = 0;

      // Draw particle as soft circle
      ctx.fillStyle = theme.primaryColor.replace(/[\d.]+\)$/, `${p.opacity})`);
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    });
  }, []);

  useAnimationFrame(draw, true); // Always running for idle animation

  return (
    <canvas
      ref={canvasRef}
      data-testid="idle-canvas"
      className="absolute inset-0 w-full h-full"
      aria-hidden="true"
    />
  );
}
