'use client';

import { useRef, useEffect, useCallback } from 'react';
import { useAnimationFrame } from '@/hooks/useAnimationFrame';
import { VISUAL_THEMES } from '@/lib/audio/visualConfig';
import type { NarrativePhase } from '@/types';

interface Star {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  baseOpacity: number;
  twinkleSpeed: number;
  twinkleOffset: number;
  points: number; // 4 or 6 pointed star
}

interface IdleAnimationProps {
  phase: NarrativePhase;
}

function createStar(width: number, height: number): Star {
  const baseOpacity = Math.random() * 0.4 + 0.1;
  return {
    x: Math.random() * width,
    y: Math.random() * height,
    vx: (Math.random() - 0.5) * 0.3,
    vy: (Math.random() - 0.5) * 0.3,
    size: Math.random() * 2.5 + 0.8,
    opacity: baseOpacity,
    baseOpacity,
    twinkleSpeed: Math.random() * 2 + 0.5,
    twinkleOffset: Math.random() * Math.PI * 2,
    points: Math.random() > 0.4 ? 4 : 6,
  };
}

function createStars(width: number, height: number, count: number): Star[] {
  return Array.from({ length: count }, () => createStar(width, height));
}

/** Draw a star shape with inner/outer radius */
function drawStar(
  ctx: CanvasRenderingContext2D,
  x: number, y: number,
  points: number,
  outerR: number,
  innerR: number,
  rotation: number
) {
  ctx.beginPath();
  for (let i = 0; i < points * 2; i++) {
    const angle = (i * Math.PI) / points + rotation;
    const r = i % 2 === 0 ? outerR : innerR;
    const px = x + Math.cos(angle) * r;
    const py = y + Math.sin(angle) * r;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
}

export default function IdleAnimation({ phase }: IdleAnimationProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const starsRef = useRef<Star[]>([]);
  const phaseRef = useRef(phase);
  const timeRef = useRef(0);

  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  // Initialize stars and handle resize
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
      starsRef.current = createStars(rect.width, rect.height, theme.particleCount);
    }

    init();
    window.addEventListener('resize', init);
    return () => window.removeEventListener('resize', init);
  }, []);

  // Smoothly adjust star count on phase change
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const theme = VISUAL_THEMES[phase];
    const targetCount = theme.particleCount;
    const current = starsRef.current;
    const dpr = window.devicePixelRatio || 1;
    const cssWidth = canvas.width / dpr;
    const cssHeight = canvas.height / dpr;

    if (current.length < targetCount) {
      const newStars = Array.from(
        { length: targetCount - current.length },
        () => createStar(cssWidth, cssHeight)
      );
      starsRef.current = [...current, ...newStars];
    } else if (current.length > targetCount) {
      starsRef.current = current.slice(0, targetCount);
    }
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
    const stars = starsRef.current;

    timeRef.current += deltaTime * 0.001;
    const t = timeRef.current;

    ctx.clearRect(0, 0, cssWidth, cssHeight);

    const timeFactor = deltaTime * 0.01;

    stars.forEach((s) => {
      // Drift
      s.x += s.vx * theme.motionIntensity * timeFactor;
      s.y += s.vy * theme.motionIntensity * timeFactor;

      // Wrap edges
      if (s.x < -5) s.x = cssWidth + 5;
      if (s.x > cssWidth + 5) s.x = -5;
      if (s.y < -5) s.y = cssHeight + 5;
      if (s.y > cssHeight + 5) s.y = -5;

      // Twinkle
      const twinkle = Math.sin(t * s.twinkleSpeed + s.twinkleOffset);
      s.opacity = s.baseOpacity * (0.5 + twinkle * 0.5);

      // Soft glow halo
      const glowRadius = s.size * 4;
      const glowGrad = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, glowRadius);
      glowGrad.addColorStop(0, theme.primaryColor.replace(/[\d.]+\)$/, `${s.opacity * 0.3})`));
      glowGrad.addColorStop(1, theme.primaryColor.replace(/[\d.]+\)$/, '0)'));
      ctx.fillStyle = glowGrad;
      ctx.beginPath();
      ctx.arc(s.x, s.y, glowRadius, 0, Math.PI * 2);
      ctx.fill();

      // Star shape
      ctx.fillStyle = theme.primaryColor.replace(/[\d.]+\)$/, `${s.opacity})`);
      const outerR = s.size * 1.2;
      const innerR = s.size * 0.4;
      drawStar(ctx, s.x, s.y, s.points, outerR, innerR, t * 0.3 + s.twinkleOffset);
      ctx.fill();

      // Bright core
      ctx.fillStyle = `rgba(255, 255, 255, ${s.opacity * 0.7})`;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.size * 0.3, 0, Math.PI * 2);
      ctx.fill();
    });
  }, []);

  useAnimationFrame(draw, true);

  return (
    <canvas
      ref={canvasRef}
      data-testid="idle-canvas"
      className="absolute inset-0 w-full h-full"
      aria-hidden="true"
    />
  );
}
