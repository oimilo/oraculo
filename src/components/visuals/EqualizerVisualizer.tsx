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
  const { analyserRef, dataArrayRef } = useAudioAnalyser({ fftSize: 512 });
  const themeRef = useRef<VisualTheme>(VISUAL_THEMES[phase]);

  // Update theme ref when phase changes (avoids re-creating animation loop)
  useEffect(() => {
    themeRef.current = VISUAL_THEMES[phase];
  }, [phase]);

  // Handle canvas resize to match window (including devicePixelRatio)
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

  const draw = useCallback((_deltaTime: number) => {
    const canvas = canvasRef.current;
    const analyser = analyserRef.current;
    const dataArray = dataArrayRef.current;
    if (!canvas || !analyser || !dataArray) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    analyser.getByteFrequencyData(dataArray);

    const theme = themeRef.current;
    const dpr = window.devicePixelRatio || 1;
    const cssWidth = canvas.width / dpr;
    const cssHeight = canvas.height / dpr;

    ctx.clearRect(0, 0, cssWidth, cssHeight);

    const bufferLength = dataArray.length;
    // Show fewer bars for aesthetic (every other bin, centered)
    const barCount = Math.min(bufferLength, 64);
    const totalBarWidth = cssWidth * 0.8; // Use 80% of width
    const barWidth = totalBarWidth / barCount;
    const gap = barWidth * 0.2;
    const startX = (cssWidth - totalBarWidth) / 2;

    for (let i = 0; i < barCount; i++) {
      // Sample from lower frequency range (more musical content)
      const dataIndex = Math.floor(i * (bufferLength * 0.6) / barCount);
      const value = dataArray[dataIndex] / 255;
      const barHeight = value * cssHeight * 0.6; // Max 60% of canvas height

      if (barHeight < 1) continue; // Skip invisible bars

      const x = startX + i * barWidth;

      // Gradient from primary (top) to secondary (bottom)
      const gradient = ctx.createLinearGradient(
        0, cssHeight - barHeight,
        0, cssHeight
      );
      gradient.addColorStop(0, theme.primaryColor);
      gradient.addColorStop(1, theme.secondaryColor);
      ctx.fillStyle = gradient;

      // Draw bar from bottom up with rounded top
      const barActualWidth = barWidth - gap;
      const radius = Math.min(barActualWidth / 2, 3);
      ctx.beginPath();
      ctx.moveTo(x + radius, cssHeight - barHeight);
      ctx.lineTo(x + barActualWidth - radius, cssHeight - barHeight);
      ctx.quadraticCurveTo(x + barActualWidth, cssHeight - barHeight, x + barActualWidth, cssHeight - barHeight + radius);
      ctx.lineTo(x + barActualWidth, cssHeight);
      ctx.lineTo(x, cssHeight);
      ctx.lineTo(x, cssHeight - barHeight + radius);
      ctx.quadraticCurveTo(x, cssHeight - barHeight, x + radius, cssHeight - barHeight);
      ctx.closePath();
      ctx.fill();
    }
  }, [analyserRef, dataArrayRef]);

  useAnimationFrame(draw, isPlaying);

  return (
    <canvas
      ref={canvasRef}
      data-testid="equalizer-canvas"
      className="absolute inset-0 w-full h-full"
      aria-hidden="true"
    />
  );
}
