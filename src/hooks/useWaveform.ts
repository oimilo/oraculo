import { useEffect, useRef, type RefObject } from 'react';
import { getAudioContext, getGainNode } from '@/lib/audio/audioContext';

export interface UseWaveformOptions {
  /** Custom AudioContext (for testing or alternate sources) */
  audioContext?: AudioContext | null;
  /** Custom source node to analyze (defaults to main GainNode) */
  sourceNode?: AudioNode | null;
  /** Line color for waveform. Default: 'rgba(255, 255, 255, 0.6)' */
  strokeColor?: string;
  /** Line width. Default: 2 */
  lineWidth?: number;
  /** FFT size. Default: 2048 */
  fftSize?: number;
}

export function useWaveform(
  canvasRef: RefObject<HTMLCanvasElement | null>,
  options: UseWaveformOptions = {}
): void {
  const animationIdRef = useRef<number | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const audioContext = options.audioContext ?? getAudioContext();
    if (!audioContext) return;

    const sourceNode = options.sourceNode ?? getGainNode();
    if (!sourceNode) return;

    const analyser = audioContext.createAnalyser();
    analyser.fftSize = options.fftSize ?? 2048;
    analyserRef.current = analyser;

    // Connect source -> analyser (AnalyserNode doesn't modify audio, just reads it)
    sourceNode.connect(analyser);

    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    const strokeColor = options.strokeColor ?? 'rgba(255, 255, 255, 0.6)';
    const lineWidth = options.lineWidth ?? 2;

    function draw() {
      animationIdRef.current = requestAnimationFrame(draw);

      // Check if analyser still exists (may be null after cleanup)
      if (!analyserRef.current) return;

      analyserRef.current.getByteTimeDomainData(dataArray);

      // Clear canvas with transparent background
      ctx!.clearRect(0, 0, canvas!.width, canvas!.height);

      ctx!.lineWidth = lineWidth;
      ctx!.strokeStyle = strokeColor;
      ctx!.beginPath();

      const sliceWidth = canvas!.width / dataArray.length;
      let x = 0;

      for (let i = 0; i < dataArray.length; i++) {
        const v = dataArray[i] / 128.0;
        const y = (v * canvas!.height) / 2;

        if (i === 0) {
          ctx!.moveTo(x, y);
        } else {
          ctx!.lineTo(x, y);
        }

        x += sliceWidth;
      }

      ctx!.lineTo(canvas!.width, canvas!.height / 2);
      ctx!.stroke();
    }

    draw();

    return () => {
      if (animationIdRef.current !== null) {
        cancelAnimationFrame(animationIdRef.current);
        animationIdRef.current = null;
      }
      // Disconnect analyser to prevent memory leaks
      analyser.disconnect();
      analyserRef.current = null;
    };
  }, [canvasRef, options.audioContext, options.sourceNode, options.strokeColor, options.lineWidth, options.fftSize]);
}
