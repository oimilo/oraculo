'use client';

import { useEffect, useRef } from 'react';
import { getAudioContext, getGainNode } from '@/lib/audio/audioContext';

export interface UseAudioAnalyserOptions {
  /** FFT size (power of 2). Default: 256. Lower = fewer bins, better perf. */
  fftSize?: number;
  /** Smoothing constant (0-1). Higher = smoother. Default: 0.8 */
  smoothingTimeConstant?: number;
}

export interface AudioAnalyserResult {
  analyserRef: React.RefObject<AnalyserNode | null>;
  dataArrayRef: React.RefObject<Uint8Array | null>;
  /** Number of frequency bins (fftSize / 2) */
  frequencyBinCount: number;
}

export function useAudioAnalyser(
  options: UseAudioAnalyserOptions = {}
): AudioAnalyserResult {
  const { fftSize = 256, smoothingTimeConstant = 0.8 } = options;
  const analyserRef = useRef<AnalyserNode | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);
  const frequencyBinCountRef = useRef<number>(fftSize / 2);

  useEffect(() => {
    const audioContext = getAudioContext();
    const gainNode = getGainNode();
    if (!audioContext || !gainNode) return;

    const analyser = audioContext.createAnalyser();
    analyser.fftSize = fftSize;
    analyser.smoothingTimeConstant = smoothingTimeConstant;

    // Read-only tap — AnalyserNode doesn't modify the audio signal
    gainNode.connect(analyser);

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    analyserRef.current = analyser;
    dataArrayRef.current = dataArray;
    frequencyBinCountRef.current = bufferLength;

    return () => {
      analyser.disconnect();
      analyserRef.current = null;
      dataArrayRef.current = null;
    };
  }, [fftSize, smoothingTimeConstant]);

  return {
    analyserRef,
    dataArrayRef,
    frequencyBinCount: frequencyBinCountRef.current,
  };
}
