import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import IdleAnimation from '../IdleAnimation';

const mockUseAnimationFrame = vi.hoisted(() => vi.fn());
vi.mock('@/hooks/useAnimationFrame', () => ({
  useAnimationFrame: mockUseAnimationFrame,
}));

describe('IdleAnimation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders a canvas element with data-testid idle-canvas', () => {
    render(<IdleAnimation phase="APRESENTACAO" />);
    expect(screen.getByTestId('idle-canvas')).toBeInTheDocument();
  });

  it('canvas has aria-hidden=true (decorative element)', () => {
    render(<IdleAnimation phase="APRESENTACAO" />);
    expect(screen.getByTestId('idle-canvas')).toHaveAttribute('aria-hidden', 'true');
  });

  it('canvas has full-screen CSS classes', () => {
    render(<IdleAnimation phase="APRESENTACAO" />);
    const canvas = screen.getByTestId('idle-canvas');
    expect(canvas.className).toContain('absolute');
    expect(canvas.className).toContain('inset-0');
  });

  it('calls useAnimationFrame with running=true (always animating)', () => {
    render(<IdleAnimation phase="INFERNO" />);
    expect(mockUseAnimationFrame).toHaveBeenCalledWith(expect.any(Function), true);
  });
});
