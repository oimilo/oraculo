'use client';

import { useRef, useCallback, useEffect } from 'react';
import { useAudioAnalyser } from '@/hooks/useAudioAnalyser';
import { useAnimationFrame } from '@/hooks/useAnimationFrame';
import { VISUAL_THEMES, type VisualTheme } from '@/lib/audio/visualConfig';
import type { NarrativePhase } from '@/types';

// --- Icosahedron geometry (12 vertices, 30 edges) ---
const PHI = (1 + Math.sqrt(5)) / 2;
const ICO_VERTS: [number, number, number][] = [
  [-1, PHI, 0], [1, PHI, 0], [-1, -PHI, 0], [1, -PHI, 0],
  [0, -1, PHI], [0, 1, PHI], [0, -1, -PHI], [0, 1, -PHI],
  [PHI, 0, -1], [PHI, 0, 1], [-PHI, 0, -1], [-PHI, 0, 1],
];
// Normalize to unit sphere
const ICO_NORM = ICO_VERTS.map(([x, y, z]) => {
  const len = Math.sqrt(x * x + y * y + z * z);
  return [x / len, y / len, z / len] as [number, number, number];
});
const ICO_EDGES: [number, number][] = [
  [0, 1], [0, 5], [0, 7], [0, 10], [0, 11],
  [1, 5], [1, 7], [1, 8], [1, 9],
  [2, 3], [2, 4], [2, 6], [2, 10], [2, 11],
  [3, 4], [3, 6], [3, 8], [3, 9],
  [4, 5], [4, 9], [4, 11],
  [5, 9], [5, 11],
  [6, 7], [6, 8], [6, 10],
  [7, 8], [7, 10],
  [8, 9],
  [10, 11],
];

interface EqualizerVisualizerProps {
  phase: NarrativePhase;
  isPlaying: boolean;
}

export default function EqualizerVisualizer({ phase, isPlaying }: EqualizerVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { analyserRef, dataArrayRef } = useAudioAnalyser({ fftSize: 256, smoothingTimeConstant: 0.82 });
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

    timeRef.current += deltaTime * 0.001;
    const t = timeRef.current;

    ctx.clearRect(0, 0, w, h);

    // Compute energy bands
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
    bass /= bassEnd;
    mid /= (midEnd - bassEnd);
    high /= (len - midEnd);
    const energy = bass * 0.5 + mid * 0.3 + high * 0.2;

    // --- Rotating icosahedron ---
    const baseSize = Math.min(w, h) * 0.22;
    const size = baseSize * (0.8 + energy * 0.6);

    // Rotation angles (slow base + audio-reactive wobble)
    const rotY = t * 0.4 + bass * 0.3;
    const rotX = t * 0.25 + mid * 0.2;
    const rotZ = t * 0.15;

    // Rotation matrices
    const cosX = Math.cos(rotX), sinX = Math.sin(rotX);
    const cosY = Math.cos(rotY), sinY = Math.sin(rotY);
    const cosZ = Math.cos(rotZ), sinZ = Math.sin(rotZ);

    // Project 3D vertices to 2D with per-vertex audio distortion
    const projected: { x: number; y: number; z: number }[] = ICO_NORM.map((v, idx) => {
      // Distort radius based on frequency data mapped to vertex index
      const freqIdx = Math.floor((idx / ICO_NORM.length) * len * 0.6);
      const distort = 1 + (dataArray[freqIdx] / 255) * 0.35 * theme.motionIntensity;

      let x = v[0] * distort;
      let y = v[1] * distort;
      let z = v[2] * distort;

      // Rotate X
      const y1 = y * cosX - z * sinX;
      const z1 = y * sinX + z * cosX;
      // Rotate Y
      const x2 = x * cosY + z1 * sinY;
      const z2 = -x * sinY + z1 * cosY;
      // Rotate Z
      const x3 = x2 * cosZ - y1 * sinZ;
      const y3 = x2 * sinZ + y1 * cosZ;

      return { x: cx + x3 * size, y: cy + y3 * size, z: z2 };
    });

    // Subtle outer glow behind the shape
    const glowRadius = size * (1.3 + energy * 0.5);
    const glow = ctx.createRadialGradient(cx, cy, size * 0.3, cx, cy, glowRadius);
    glow.addColorStop(0, theme.primaryColor.replace(/[\d.]+\)$/, `${energy * 0.15})`));
    glow.addColorStop(1, theme.secondaryColor.replace(/[\d.]+\)$/, '0)'));
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(cx, cy, glowRadius, 0, Math.PI * 2);
    ctx.fill();

    // Draw edges with depth-based opacity
    ctx.lineCap = 'round';
    ICO_EDGES.forEach(([a, b]) => {
      const va = projected[a];
      const vb = projected[b];
      // Depth-based alpha (closer = brighter)
      const avgZ = (va.z + vb.z) / 2;
      const depthAlpha = 0.25 + (avgZ + 1.5) * 0.25; // range ~0.25-0.75
      const lineAlpha = Math.min(1, depthAlpha * (0.5 + energy * 0.8));

      ctx.strokeStyle = theme.primaryColor.replace(/[\d.]+\)$/, `${lineAlpha})`);
      ctx.lineWidth = 1 + energy * 1.5;
      ctx.beginPath();
      ctx.moveTo(va.x, va.y);
      ctx.lineTo(vb.x, vb.y);
      ctx.stroke();
    });

    // Draw vertices as small glowing dots
    projected.forEach((v) => {
      const depthAlpha = 0.3 + (v.z + 1.5) * 0.3;
      const dotRadius = 2 + energy * 2;

      // Glow
      const dotGlow = ctx.createRadialGradient(v.x, v.y, 0, v.x, v.y, dotRadius * 3);
      dotGlow.addColorStop(0, theme.primaryColor.replace(/[\d.]+\)$/, `${depthAlpha * 0.6})`));
      dotGlow.addColorStop(1, theme.primaryColor.replace(/[\d.]+\)$/, '0)'));
      ctx.fillStyle = dotGlow;
      ctx.beginPath();
      ctx.arc(v.x, v.y, dotRadius * 3, 0, Math.PI * 2);
      ctx.fill();

      // Core dot
      ctx.fillStyle = `rgba(255, 255, 255, ${depthAlpha * 0.8})`;
      ctx.beginPath();
      ctx.arc(v.x, v.y, dotRadius * 0.6, 0, Math.PI * 2);
      ctx.fill();
    });
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
