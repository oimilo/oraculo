import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import WaveformVisualizer from '../WaveformVisualizer';

// Mock the useWaveform hook since it's tested separately in Plan 03
vi.mock('@/hooks/useWaveform', () => ({
  useWaveform: vi.fn(),
}));

describe('WaveformVisualizer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders a canvas element with data-testid="waveform-canvas"', () => {
    render(<WaveformVisualizer />);
    const canvas = screen.getByTestId('waveform-canvas');
    expect(canvas).toBeInTheDocument();
    expect(canvas.tagName).toBe('CANVAS');
  });

  it('applies correct width and height attributes to canvas', () => {
    render(<WaveformVisualizer width={400} height={150} />);
    const canvas = screen.getByTestId('waveform-canvas') as HTMLCanvasElement;
    expect(canvas.width).toBe(400);
    expect(canvas.height).toBe(150);
  });

  it('applies default width and height when not provided', () => {
    render(<WaveformVisualizer />);
    const canvas = screen.getByTestId('waveform-canvas') as HTMLCanvasElement;
    expect(canvas.width).toBe(300);
    expect(canvas.height).toBe(100);
  });

  it('applies CSS classes for centering and styling', () => {
    render(<WaveformVisualizer />);
    const canvas = screen.getByTestId('waveform-canvas');
    expect(canvas).toHaveClass('rounded-lg', 'opacity-80');
  });

  it('passes canvasRef to useWaveform hook', () => {
    const { useWaveform } = require('@/hooks/useWaveform');
    render(<WaveformVisualizer />);

    expect(useWaveform).toHaveBeenCalledWith(
      expect.objectContaining({ current: expect.any(Object) }),
      expect.objectContaining({})
    );
  });

  it('accepts optional strokeColor and lineWidth props', () => {
    const { useWaveform } = require('@/hooks/useWaveform');
    render(
      <WaveformVisualizer
        strokeColor="rgba(0, 255, 0, 0.8)"
        lineWidth={3}
      />
    );

    expect(useWaveform).toHaveBeenCalledWith(
      expect.any(Object),
      expect.objectContaining({
        strokeColor: 'rgba(0, 255, 0, 0.8)',
        lineWidth: 3,
      })
    );
  });

  it('is hidden when visible prop is false', () => {
    const { container } = render(<WaveformVisualizer visible={false} />);
    const canvas = screen.queryByTestId('waveform-canvas');
    expect(canvas).not.toBeInTheDocument();
    expect(container.firstChild).toBeNull();
  });

  it('has aria-hidden="true" for accessibility (decorative element)', () => {
    render(<WaveformVisualizer />);
    const canvas = screen.getByTestId('waveform-canvas');
    expect(canvas).toHaveAttribute('aria-hidden', 'true');
  });

  it('does not display any text content (UI-05 compliance)', () => {
    const { container } = render(<WaveformVisualizer />);
    // Only canvas should exist, no text nodes
    const textContent = container.textContent;
    expect(textContent).toBe('');
  });
});
