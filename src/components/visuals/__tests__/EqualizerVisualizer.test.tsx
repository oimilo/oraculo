import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import EqualizerVisualizer from '../EqualizerVisualizer';

// Mock hooks
vi.mock('@/hooks/useAudioAnalyser', () => ({
  useAudioAnalyser: () => ({
    analyserRef: { current: { getByteFrequencyData: vi.fn(), frequencyBinCount: 256 } },
    dataArrayRef: { current: new Uint8Array(256) },
    frequencyBinCount: 256,
  }),
}));

const mockUseAnimationFrame = vi.hoisted(() => vi.fn());
vi.mock('@/hooks/useAnimationFrame', () => ({
  useAnimationFrame: mockUseAnimationFrame,
}));

describe('EqualizerVisualizer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders a canvas element with data-testid equalizer-canvas', () => {
    render(<EqualizerVisualizer phase="INFERNO" isPlaying={true} />);
    expect(screen.getByTestId('equalizer-canvas')).toBeInTheDocument();
  });

  it('canvas has aria-hidden=true (decorative element)', () => {
    render(<EqualizerVisualizer phase="INFERNO" isPlaying={true} />);
    expect(screen.getByTestId('equalizer-canvas')).toHaveAttribute('aria-hidden', 'true');
  });

  it('canvas has full-screen CSS classes', () => {
    render(<EqualizerVisualizer phase="INFERNO" isPlaying={true} />);
    const canvas = screen.getByTestId('equalizer-canvas');
    expect(canvas.className).toContain('absolute');
    expect(canvas.className).toContain('inset-0');
    expect(canvas.className).toContain('w-full');
    expect(canvas.className).toContain('h-full');
  });

  it('calls useAnimationFrame with isPlaying prop', () => {
    render(<EqualizerVisualizer phase="PARAISO" isPlaying={false} />);
    expect(mockUseAnimationFrame).toHaveBeenCalledWith(expect.any(Function), false);
  });

  it('calls useAnimationFrame with true when isPlaying', () => {
    render(<EqualizerVisualizer phase="INFERNO" isPlaying={true} />);
    expect(mockUseAnimationFrame).toHaveBeenCalledWith(expect.any(Function), true);
  });
});
