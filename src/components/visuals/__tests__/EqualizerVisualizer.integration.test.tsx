import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import EqualizerVisualizer from '../EqualizerVisualizer';

// Mock ONLY the audio infrastructure — NOT the hooks.
// This lets useAudioAnalyser and useAnimationFrame run for real,
// verifying the full pipeline: AnalyserNode -> frequency data -> Canvas draw.
const mockGetByteFrequencyData = vi.fn((dataArray: Uint8Array) => {
  // Simulate non-zero frequency data (as if TTS audio is playing)
  for (let i = 0; i < dataArray.length; i++) {
    dataArray[i] = Math.floor(Math.random() * 200) + 50; // 50-250 range
  }
});

const mockAnalyser = {
  fftSize: 0,
  smoothingTimeConstant: 0,
  frequencyBinCount: 256,
  connect: vi.fn(),
  disconnect: vi.fn(),
  getByteFrequencyData: mockGetByteFrequencyData,
  getByteTimeDomainData: vi.fn(),
};

const mockGainNode = {
  connect: vi.fn(),
};

const mockAudioContext = {
  createAnalyser: vi.fn(() => mockAnalyser),
};

vi.mock('@/lib/audio/audioContext', () => ({
  getAudioContext: vi.fn(() => mockAudioContext),
  getGainNode: vi.fn(() => mockGainNode),
}));

describe('EqualizerVisualizer integration (VIS-01)', () => {
  let rafCallbacks: Map<number, (time: number) => void>;
  let rafId: number;

  beforeEach(() => {
    vi.clearAllMocks();
    rafCallbacks = new Map();
    rafId = 0;

    // Control requestAnimationFrame so we can manually trigger frames
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => {
      const id = ++rafId;
      rafCallbacks.set(id, cb);
      return id;
    });
    vi.spyOn(window, 'cancelAnimationFrame').mockImplementation((id) => {
      rafCallbacks.delete(id);
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('connects AnalyserNode to GainNode and creates frequency data buffer', () => {
    render(<EqualizerVisualizer phase="INFERNO" isPlaying={true} />);

    // useAudioAnalyser should have created an AnalyserNode
    expect(mockAudioContext.createAnalyser).toHaveBeenCalled();
    // AnalyserNode should be connected to the main GainNode
    expect(mockGainNode.connect).toHaveBeenCalledWith(mockAnalyser);
    // fftSize should be set (512 as configured in EqualizerVisualizer)
    expect(mockAnalyser.fftSize).toBe(512);
  });

  it('reads frequency data and draws to canvas when animation frame fires', () => {
    render(<EqualizerVisualizer phase="INFERNO" isPlaying={true} />);

    const canvas = screen.getByTestId('equalizer-canvas') as HTMLCanvasElement;

    // Set canvas dimensions (needed for drawing to happen)
    canvas.width = 800;
    canvas.height = 600;

    const ctx = canvas.getContext('2d');

    // Spy on canvas drawing methods AFTER render (vitest-canvas-mock provides them)
    const fillSpy = vi.spyOn(ctx!, 'fill');
    const beginPathSpy = vi.spyOn(ctx!, 'beginPath');

    // Trigger animation frame — this should call draw() which calls getByteFrequencyData
    // then draws bars to canvas
    const latestCallback = Array.from(rafCallbacks.values()).pop();
    if (latestCallback) {
      act(() => {
        latestCallback(1000); // Simulate frame at t=1000ms
      });
    }

    // Verify the full pipeline executed:
    // 1. getByteFrequencyData was called (reads AnalyserNode data)
    expect(mockGetByteFrequencyData).toHaveBeenCalled();
    // 2. Canvas draw methods were called (bars were drawn)
    // beginPath is called once per visible bar
    expect(beginPathSpy).toHaveBeenCalled();
    expect(fillSpy).toHaveBeenCalled();
  });

  it('does not draw when isPlaying is false', () => {
    render(<EqualizerVisualizer phase="INFERNO" isPlaying={false} />);

    // With isPlaying=false, useAnimationFrame should NOT start the loop
    // No rAF callback should have been registered by the animation hook
    // (only the resize effect may call rAF indirectly, but useAnimationFrame won't)
    expect(mockGetByteFrequencyData).not.toHaveBeenCalled();
  });

  it('disconnects AnalyserNode on unmount (cleanup)', () => {
    const { unmount } = render(<EqualizerVisualizer phase="INFERNO" isPlaying={true} />);
    unmount();
    expect(mockAnalyser.disconnect).toHaveBeenCalled();
  });
});
