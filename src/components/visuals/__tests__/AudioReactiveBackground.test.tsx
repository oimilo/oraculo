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

  it('has 3000ms transition-colors class for phase crossfade (VIS-03)', () => {
    render(<AudioReactiveBackground phase="INFERNO" isPlaying={false} />);
    const bg = screen.getByTestId('audio-reactive-background');
    expect(bg.className).toContain('transition-colors');
    expect(bg.className).toContain('duration-[3000ms]');
  });

  it('sets background color from VISUAL_THEMES for INFERNO', () => {
    render(<AudioReactiveBackground phase="INFERNO" isPlaying={false} />);
    const bg = screen.getByTestId('audio-reactive-background');
    expect(bg.style.backgroundColor).toBe('rgb(74, 14, 14)'); // #4a0e0e
  });

  it('sets background color from VISUAL_THEMES for PURGATORIO', () => {
    render(<AudioReactiveBackground phase="PURGATORIO" isPlaying={false} />);
    const bg = screen.getByTestId('audio-reactive-background');
    expect(bg.style.backgroundColor).toBe('rgb(61, 79, 92)'); // #3d4f5c
  });

  it('sets background color from VISUAL_THEMES for PARAISO', () => {
    render(<AudioReactiveBackground phase="PARAISO" isPlaying={false} />);
    const bg = screen.getByTestId('audio-reactive-background');
    expect(bg.style.backgroundColor).toBe('rgb(92, 74, 42)'); // #5c4a2a
  });

  it('shows EqualizerVisualizer when isPlaying=true', () => {
    render(<AudioReactiveBackground phase="INFERNO" isPlaying={true} />);
    expect(screen.getByTestId('mock-equalizer')).toBeInTheDocument();
    expect(screen.queryByTestId('mock-idle')).not.toBeInTheDocument();
  });

  it('shows IdleAnimation when isPlaying=false (VIS-04)', () => {
    render(<AudioReactiveBackground phase="INFERNO" isPlaying={false} />);
    expect(screen.getByTestId('mock-idle')).toBeInTheDocument();
    expect(screen.queryByTestId('mock-equalizer')).not.toBeInTheDocument();
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
