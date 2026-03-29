'use client';

import { useRef, useCallback, useEffect } from 'react';
import { useAudioAnalyser } from '@/hooks/useAudioAnalyser';
import { useAnimationFrame } from '@/hooks/useAnimationFrame';
import { VISUAL_THEMES, type VisualTheme } from '@/lib/audio/visualConfig';
import type { NarrativePhase } from '@/types';

interface EqualizerVisualizerProps {
  phase: NarrativePhase;
  isPlaying: boolean;
}

export default function EqualizerVisualizer({ phase, isPlaying }: EqualizerVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { analyserRef, dataArrayRef } = useAudioAnalyser({ fftSize: 256, smoothingTimeConstant: 0.85 });
  const themeRef = useRef<VisualTheme>(VISUAL_THEMES[phase]);
  const timeRef = useRef(0);

  useEffect(() => {
    themeRef.current = VISUAL_THEMES[phase];
  }, [phase]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    function handleResize() {
      if (!canvas) return;
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      const ctx = canvas.getContext('2d');
      if (ctx) ctx.scale(dpr, dpr);
    }

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const draw = useCallback((deltaTime: number) => {
    const canvas = canvasRef.current;
    const analyser = analyserRef.current;
    const dataArray = dataArrayRef.current;
    if (!canvas || !analyser || !dataArray) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    analyser.getByteFrequencyData(dataArray);

    const theme = themeRef.current;
    const dpr = window.devicePixelRatio || 1;
    const w = canvas.width / dpr;
    const h = canvas.height / dpr;
    const cx = w / 2;
    const cy = h / 2;
    const maxRadius = Math.min(w, h) * 0.45;

    timeRef.current += deltaTime * 0.001;
    const t = timeRef.current;

    ctx.clearRect(0, 0, w, h);

    // Compute energy from frequency bands
    const len = dataArray.length;
    let bass = 0, mid = 0, high = 0;
    const bassEnd = Math.floor(len * 0.15);
    const midEnd = Math.floor(len * 0.5);
    for (let i = 0; i < len; i++) {
      const v = dataArray[i] / 255;
      if (i < bassEnd) bass += v;
      else if (i < midEnd) mid += v;
      else high += v;
    }
    bass = bass / bassEnd;
    mid = mid / (midEnd - bassEnd);
    high = high / (len - midEnd);

    // Overall energy drives size, bass drives intensity
    const energy = bass * 0.5 + mid * 0.3 + high * 0.2;

    // Parse primary and secondary colors for gradient use
    const primary = theme.primaryColor;
    const secondary = theme.secondaryColor;

    // Draw layered glowing orbs — celestial aura effect
    const ringCount = 5;
    for (let r = ringCount - 1; r >= 0; r--) {
      const ringRatio = (r + 1) / ringCount;
      // Each ring pulses slightly offset in time
      const pulse = Math.sin(t * (1.5 + r * 0.3)) * 0.15 + 0.85;
      const ringEnergy = energy * pulse;
      const radius = maxRadius * ringRatio * (0.4 + ringEnergy * 0.6);

      // Slight organic wobble per ring
      const wobbleX = Math.sin(t * 0.7 + r * 1.2) * 8 * ringEnergy;
      const wobbleY = Math.cos(t * 0.5 + r * 0.9) * 6 * ringEnergy;

      const grad = ctx.createRadialGradient(
        cx + wobbleX, cy + wobbleY, 0,
        cx + wobbleX, cy + wobbleY, radius
      );

      // Inner ring: brighter with primary color, fades to transparent
      const alpha = (0.15 + ringEnergy * 0.35) * (1 - r * 0.12);
      grad.addColorStop(0, primary.replace(/[\d.]+\)$/, `${alpha})`));
      grad.addColorStop(0.4, secondary.replace(/[\d.]+\)$/, `${alpha * 0.6})`));
      grad.addColorStop(1, secondary.replace(/[\d.]+\)$/, '0)'));

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(cx + wobbleX, cy + wobbleY, radius, 0, Math.PI * 2);
      ctx.fill();
    }

    // Central bright core — reacts strongly to bass
    const coreRadius = maxRadius * 0.12 * (0.5 + bass * 1.5);
    const coreGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, coreRadius);
    const coreAlpha = 0.3 + bass * 0.5;
    coreGrad.addColorStop(0, `rgba(255, 255, 255, ${coreAlpha})`);
    coreGrad.addColorStop(0.5, primary.replace(/[\d.]+\)$/, `${coreAlpha * 0.4})`));
    coreGrad.addColorStop(1, primary.replace(/[\d.]+\)$/, '0)'));
    ctx.fillStyle = coreGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, coreRadius, 0, Math.PI * 2);
    ctx.fill();

    // Outer halo — subtle bloom that expands with energy
    const haloRadius = maxRadius * (0.7 + energy * 0.5);
    const haloGrad = ctx.createRadialGradient(cx, cy, maxRadius * 0.3, cx, cy, haloRadius);
    haloGrad.addColorStop(0, secondary.replace(/[\d.]+\)$/, `${energy * 0.12})`));
    haloGrad.addColorStop(1, secondary.replace(/[\d.]+\)$/, '0)'));
    ctx.fillStyle = haloGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, haloRadius, 0, Math.PI * 2);
    ctx.fill();
  }, [analyserRef, dataArrayRef]);

  useAnimationFrame(draw, isPlaying);

  return (
    <canvas
      ref={canvasRef}
      data-testid="equalizer-canvas"
      className="absolute inset-0 w-full h-full"
      style={{ filter: `blur(${VISUAL_THEMES[phase].blurAmount}px)` }}
      aria-hidden="true"
    />
  );
}
