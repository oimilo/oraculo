import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import AudioReactiveBackground from '../AudioReactiveBackground';

// Mock child components to isolate orchestrator logic
vi.mock('../EqualizerVisualizer', () => ({
  default: ({ phase, isPlaying }: any) => (
    <div data-testid="mock-equalizer" data-phase={phase} data-playing={isPlaying} />
  ),
}));

vi.mock('../IdleAnimation', () => ({
  default: ({ phase }: any) => (
    <div data-testid="mock-idle" data-phase={phase} />
  ),
}));

describe('AudioReactiveBackground', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders with data-testid audio-reactive-background', () => {
    render(<AudioReactiveBackground phase="INFERNO" isPlaying={false} />);
    expect(screen.getByTestId('audio-reactive-background')).toBeInTheDocument();
  });

  it('uses atmospheric gradient layers with 3000ms transition', () => {
    render(<AudioReactiveBackground phase="INFERNO" isPlaying={false} />);
    const bg = screen.getByTestId('audio-reactive-background');
    // Main container has gradient child layers, not flat backgroundColor
    const gradientLayers = bg.querySelectorAll('.transition-all');
    expect(gradientLayers.length).toBeGreaterThanOrEqual(3); // base + glow + vignette
    // Each layer has transition duration for smooth phase crossfade
    gradientLayers.forEach(layer => {
      expect(layer.className).toContain('duration-[3000ms]');
    });
  });

  it('renders gradient background for INFERNO phase', () => {
    render(<AudioReactiveBackground phase="INFERNO" isPlaying={false} />);
    const bg = screen.getByTestId('audio-reactive-background');
    const layers = bg.querySelectorAll('.transition-all');
    // Base layer should contain INFERNO gradient
    const baseLayer = layers[0];
    expect(baseLayer.getAttribute('style')).toContain('radial-gradient');
  });

  it('renders gradient background for PURGATORIO phase', () => {
    render(<AudioReactiveBackground phase="PURGATORIO" isPlaying={false} />);
    const bg = screen.getByTestId('audio-reactive-background');
    const layers = bg.querySelectorAll('.transition-all');
    const baseLayer = layers[0];
    expect(baseLayer.getAttribute('style')).toContain('radial-gradient');
  });

  it('renders gradient background for PARAISO phase', () => {
    render(<AudioReactiveBackground phase="PARAISO" isPlaying={false} />);
    const bg = screen.getByTestId('audio-reactive-background');
    const layers = bg.querySelectorAll('.transition-all');
    const baseLayer = layers[0];
    expect(baseLayer.getAttribute('style')).toContain('radial-gradient');
  });

  it('always shows IdleAnimation as ambient background (VIS-04)', () => {
    render(<AudioReactiveBackground phase="INFERNO" isPlaying={true} />);
    expect(screen.getByTestId('mock-idle')).toBeInTheDocument();
  });

  it('always shows EqualizerVisualizer (never unmounts between states)', () => {
    render(<AudioReactiveBackground phase="INFERNO" isPlaying={true} />);
    expect(screen.getByTestId('mock-equalizer')).toBeInTheDocument();
    expect(screen.getByTestId('mock-idle')).toBeInTheDocument();
  });

  it('keeps EqualizerVisualizer visible even when isPlaying=false', () => {
    render(<AudioReactiveBackground phase="INFERNO" isPlaying={false} />);
    expect(screen.getByTestId('mock-idle')).toBeInTheDocument();
    expect(screen.getByTestId('mock-equalizer')).toBeInTheDocument();
  });

  it('passes phase to EqualizerVisualizer', () => {
    render(<AudioReactiveBackground phase="PARAISO" isPlaying={true} />);
    expect(screen.getByTestId('mock-equalizer')).toHaveAttribute('data-phase', 'PARAISO');
  });

  it('passes phase to IdleAnimation', () => {
    render(<AudioReactiveBackground phase="PURGATORIO" isPlaying={false} />);
    expect(screen.getByTestId('mock-idle')).toHaveAttribute('data-phase', 'PURGATORIO');
  });

  it('renders children in z-10 content layer', () => {
    render(
      <AudioReactiveBackground phase="INFERNO" isPlaying={false}>
        <div data-testid="child-content">Hello</div>
      </AudioReactiveBackground>
    );
    expect(screen.getByTestId('child-content')).toBeInTheDocument();
  });
});
