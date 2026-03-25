'use client';

import { useRef } from 'react';
import { useWaveform } from '@/hooks/useWaveform';

export interface WaveformVisualizerProps {
  /** Whether the visualizer is visible. Default: true */
  visible?: boolean;
  /** Waveform line color. Default: 'rgba(255, 255, 255, 0.6)' */
  strokeColor?: string;
  /** Waveform line width. Default: 2 */
  lineWidth?: number;
  /** Canvas width. Default: 300 */
  width?: number;
  /** Canvas height. Default: 100 */
  height?: number;
}

export default function WaveformVisualizer({
  visible = true,
  strokeColor = 'rgba(255, 255, 255, 0.6)',
  lineWidth = 2,
  width = 300,
  height = 100,
}: WaveformVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useWaveform(canvasRef, { strokeColor, lineWidth });

  if (!visible) return null;

  return (
    <div className="flex items-center justify-center">
      <canvas
        ref={canvasRef}
        data-testid="waveform-canvas"
        width={width}
        height={height}
        className="rounded-lg opacity-80"
        aria-hidden="true"
      />
    </div>
  );
}
