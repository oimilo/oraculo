import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useAudioAnalyser } from '../useAudioAnalyser';

// Create mock objects and functions
let mockAnalyser: any;
let mockGainNode: any;
let mockAudioContext: any;
let getAudioContextSpy: any;
let getGainNodeSpy: any;

// Mock audioContext module with factory that uses vi.fn() directly
vi.mock('@/lib/audio/audioContext', () => ({
  getAudioContext: vi.fn(),
  getGainNode: vi.fn(),
}));

describe('useAudioAnalyser', () => {
  beforeEach(async () => {
    // Import the mocked module to get access to the spy functions
    const audioContextModule = await import('@/lib/audio/audioContext');
    getAudioContextSpy = audioContextModule.getAudioContext as any;
    getGainNodeSpy = audioContextModule.getGainNode as any;

    // Reset and recreate mock objects for each test
    vi.clearAllMocks();

    mockAnalyser = {
      fftSize: 0,
      smoothingTimeConstant: 0,
      frequencyBinCount: 128,
      connect: vi.fn(),
      disconnect: vi.fn(),
      getByteFrequencyData: vi.fn(),
      getByteTimeDomainData: vi.fn(),
    };

    mockGainNode = {
      connect: vi.fn(),
    };

    mockAudioContext = {
      createAnalyser: vi.fn(() => mockAnalyser),
    };

    // Set default return values
    getAudioContextSpy.mockReturnValue(mockAudioContext);
    getGainNodeSpy.mockReturnValue(mockGainNode);
  });

  it('creates AnalyserNode with default fftSize 256', () => {
    const { result } = renderHook(() => useAudioAnalyser());
    expect(mockAudioContext.createAnalyser).toHaveBeenCalled();
    expect(mockAnalyser.fftSize).toBe(256);
  });

  it('creates AnalyserNode with custom fftSize', () => {
    renderHook(() => useAudioAnalyser({ fftSize: 512 }));
    expect(mockAnalyser.fftSize).toBe(512);
  });

  it('sets smoothingTimeConstant to 0.8 by default', () => {
    renderHook(() => useAudioAnalyser());
    expect(mockAnalyser.smoothingTimeConstant).toBe(0.8);
  });

  it('connects analyser to main GainNode', () => {
    renderHook(() => useAudioAnalyser());
    expect(mockGainNode.connect).toHaveBeenCalledWith(mockAnalyser);
  });

  it('returns analyserRef pointing to created AnalyserNode', () => {
    const { result } = renderHook(() => useAudioAnalyser());
    expect(result.current.analyserRef.current).toBe(mockAnalyser);
  });

  it('returns dataArrayRef with Uint8Array of correct length', () => {
    const { result } = renderHook(() => useAudioAnalyser());
    expect(result.current.dataArrayRef.current).toBeInstanceOf(Uint8Array);
    expect(result.current.dataArrayRef.current?.length).toBe(128);
  });

  it('disconnects analyser on unmount', () => {
    const { unmount } = renderHook(() => useAudioAnalyser());
    unmount();
    expect(mockAnalyser.disconnect).toHaveBeenCalled();
  });

  it('sets refs to null on unmount', () => {
    const { result, unmount } = renderHook(() => useAudioAnalyser());
    unmount();
    expect(result.current.analyserRef.current).toBeNull();
    expect(result.current.dataArrayRef.current).toBeNull();
  });

  it('returns early if no AudioContext available', () => {
    getAudioContextSpy.mockReturnValueOnce(null);
    const { result } = renderHook(() => useAudioAnalyser());
    expect(result.current.analyserRef.current).toBeNull();
  });

  it('returns early if no GainNode available', () => {
    getGainNodeSpy.mockReturnValueOnce(null);
    const { result } = renderHook(() => useAudioAnalyser());
    expect(result.current.analyserRef.current).toBeNull();
  });
});
