import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useWaveform } from '../useWaveform';
import { useRef } from 'react';

describe('useWaveform hook', () => {
  let mockCanvas: HTMLCanvasElement;
  let mockContext: CanvasRenderingContext2D;
  let mockAudioContext: AudioContext;
  let mockAnalyser: AnalyserNode;
  let mockGainNode: GainNode;
  let animationFrameId: number = 0;

  beforeEach(() => {
    // Reset animation frame counter
    animationFrameId = 0;

    // Mock AnalyserNode
    mockAnalyser = {
      fftSize: 0,
      frequencyBinCount: 1024,
      getByteTimeDomainData: vi.fn((array: Uint8Array) => {
        // Fill with center line (128) for predictable waveform
        array.fill(128);
      }),
      connect: vi.fn(),
      disconnect: vi.fn(),
    } as any;

    // Mock GainNode
    mockGainNode = {
      connect: vi.fn(),
      disconnect: vi.fn(),
    } as any;

    // Mock AudioContext
    mockAudioContext = {
      createAnalyser: vi.fn(() => mockAnalyser),
      destination: {},
    } as any;

    // Mock Canvas 2D Context
    mockContext = {
      clearRect: vi.fn(),
      beginPath: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      stroke: vi.fn(),
      lineWidth: 0,
      strokeStyle: '',
    } as any;

    // Mock Canvas Element
    mockCanvas = {
      width: 800,
      height: 400,
      getContext: vi.fn(() => mockContext),
    } as any;

    // Mock requestAnimationFrame and cancelAnimationFrame
    vi.stubGlobal('requestAnimationFrame', vi.fn((callback: FrameRequestCallback) => {
      animationFrameId++;
      // Call callback immediately for testing
      setTimeout(() => callback(0), 0);
      return animationFrameId;
    }));

    vi.stubGlobal('cancelAnimationFrame', vi.fn((id: number) => {
      // Just track that it was called
    }));
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('Test 1: useWaveform accepts canvasRef and optional audioContext parameter', () => {
    const TestComponent = () => {
      const canvasRef = useRef<HTMLCanvasElement>(null);
      useWaveform(canvasRef);
      return null;
    };

    // Should not throw
    expect(() => {
      renderHook(() => {
        const canvasRef = useRef<HTMLCanvasElement>(null);
        useWaveform(canvasRef);
      });
    }).not.toThrow();
  });

  it('Test 2: useWaveform creates AnalyserNode with fftSize=2048', () => {
    const { unmount } = renderHook(() => {
      const canvasRef = useRef<HTMLCanvasElement>(mockCanvas);
      useWaveform(canvasRef, { audioContext: mockAudioContext, sourceNode: mockGainNode });
      return canvasRef;
    });

    expect(mockAudioContext.createAnalyser).toHaveBeenCalled();
    expect(mockAnalyser.fftSize).toBe(2048);

    unmount();
  });

  it('Test 3: useWaveform connects GainNode to AnalyserNode for audio monitoring', () => {
    const { unmount } = renderHook(() => {
      const canvasRef = useRef<HTMLCanvasElement>(mockCanvas);
      useWaveform(canvasRef, { audioContext: mockAudioContext, sourceNode: mockGainNode });
      return canvasRef;
    });

    expect(mockGainNode.connect).toHaveBeenCalledWith(mockAnalyser);

    unmount();
  });

  it('Test 4: useWaveform calls requestAnimationFrame to start drawing loop', async () => {
    const { unmount } = renderHook(() => {
      const canvasRef = useRef<HTMLCanvasElement>(mockCanvas);
      useWaveform(canvasRef, { audioContext: mockAudioContext, sourceNode: mockGainNode });
      return canvasRef;
    });

    // Wait for animation frame callback
    await new Promise(resolve => setTimeout(resolve, 10));

    expect(requestAnimationFrame).toHaveBeenCalled();

    unmount();
  });

  it('Test 5: useWaveform calls cancelAnimationFrame on cleanup', () => {
    const { unmount } = renderHook(() => {
      const canvasRef = useRef<HTMLCanvasElement>(mockCanvas);
      useWaveform(canvasRef, { audioContext: mockAudioContext, sourceNode: mockGainNode });
      return canvasRef;
    });

    unmount();

    expect(cancelAnimationFrame).toHaveBeenCalled();
  });

  it('Test 6: useWaveform handles null canvas gracefully', () => {
    const { unmount } = renderHook(() => {
      const canvasRef = useRef<HTMLCanvasElement>(null);
      useWaveform(canvasRef, { audioContext: mockAudioContext, sourceNode: mockGainNode });
      return canvasRef;
    });

    // Should not throw, should not create analyser
    expect(mockAudioContext.createAnalyser).not.toHaveBeenCalled();

    unmount();
  });

  it('Test 7: useWaveform handles null audioContext gracefully', () => {
    const { unmount } = renderHook(() => {
      const canvasRef = useRef<HTMLCanvasElement>(mockCanvas);
      useWaveform(canvasRef, { audioContext: null, sourceNode: mockGainNode });
      return canvasRef;
    });

    // Should not throw, should not create analyser
    expect(mockAudioContext.createAnalyser).not.toHaveBeenCalled();

    unmount();
  });
});
