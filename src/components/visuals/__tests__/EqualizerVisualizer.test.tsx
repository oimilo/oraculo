import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import EqualizerVisualizer from '../EqualizerVisualizer';

// Mock R3F (no WebGL in jsdom)
vi.mock('@react-three/fiber', () => ({
  Canvas: ({ children }: any) => <div data-testid="r3f-canvas">{children}</div>,
  useFrame: vi.fn(),
}));

vi.mock('@react-three/postprocessing', () => ({
  EffectComposer: ({ children }: any) => <div>{children}</div>,
  Bloom: () => null,
}));

vi.mock('@/hooks/useAudioAnalyser', () => ({
  useAudioAnalyser: () => ({
    analyserRef: { current: null },
    dataArrayRef: { current: null },
    frequencyBinCount: 128,
  }),
}));

describe('EqualizerVisualizer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders a container with data-testid equalizer-canvas', () => {
    render(<EqualizerVisualizer phase="INFERNO" isPlaying={true} />);
    expect(screen.getByTestId('equalizer-canvas')).toBeInTheDocument();
  });

  it('container has aria-hidden=true (decorative element)', () => {
    render(<EqualizerVisualizer phase="INFERNO" isPlaying={true} />);
    expect(screen.getByTestId('equalizer-canvas')).toHaveAttribute('aria-hidden', 'true');
  });

  it('container has full-screen CSS classes', () => {
    render(<EqualizerVisualizer phase="INFERNO" isPlaying={true} />);
    const el = screen.getByTestId('equalizer-canvas');
    expect(el.className).toContain('absolute');
    expect(el.className).toContain('inset-0');
    expect(el.className).toContain('w-full');
    expect(el.className).toContain('h-full');
  });

  it('renders R3F Canvas inside container', () => {
    render(<EqualizerVisualizer phase="PARAISO" isPlaying={true} />);
    expect(screen.getByTestId('r3f-canvas')).toBeInTheDocument();
  });
});
