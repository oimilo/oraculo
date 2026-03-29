import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import EqualizerVisualizer from '../EqualizerVisualizer';

// Mock R3F (no WebGL in jsdom) but let useAudioAnalyser run for real
vi.mock('@react-three/fiber', () => ({
  Canvas: ({ children }: any) => <div>{children}</div>,
  useFrame: vi.fn(),
}));

vi.mock('@react-three/postprocessing', () => ({
  EffectComposer: ({ children }: any) => <div>{children}</div>,
  Bloom: () => null,
}));

const mockAnalyser = {
  fftSize: 0,
  smoothingTimeConstant: 0,
  frequencyBinCount: 128,
  connect: vi.fn(),
  disconnect: vi.fn(),
  getByteFrequencyData: vi.fn(),
  getByteTimeDomainData: vi.fn(),
};

const mockGainNode = { connect: vi.fn() };
const mockAudioContext = { createAnalyser: vi.fn(() => mockAnalyser) };

vi.mock('@/lib/audio/audioContext', () => ({
  getAudioContext: vi.fn(() => mockAudioContext),
  getGainNode: vi.fn(() => mockGainNode),
}));

describe('EqualizerVisualizer integration (VIS-01)', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('connects AnalyserNode to GainNode with fftSize 256', () => {
    render(<EqualizerVisualizer phase="INFERNO" isPlaying={true} />);
    expect(mockAudioContext.createAnalyser).toHaveBeenCalled();
    expect(mockGainNode.connect).toHaveBeenCalledWith(mockAnalyser);
    expect(mockAnalyser.fftSize).toBe(256);
  });

  it('disconnects AnalyserNode on unmount', () => {
    const { unmount } = render(<EqualizerVisualizer phase="INFERNO" isPlaying={true} />);
    unmount();
    expect(mockAnalyser.disconnect).toHaveBeenCalled();
  });

  it('renders container regardless of isPlaying', () => {
    render(<EqualizerVisualizer phase="INFERNO" isPlaying={false} />);
    expect(screen.getByTestId('equalizer-canvas')).toBeInTheDocument();
  });
});
