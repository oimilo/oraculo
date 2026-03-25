import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import ListeningIndicator from '../ListeningIndicator';

describe('ListeningIndicator', () => {
  it('renders nothing when isListening is false', () => {
    const { container } = render(<ListeningIndicator isListening={false} />);
    const indicator = screen.queryByTestId('listening-indicator');
    expect(indicator).not.toBeInTheDocument();
    expect(container.firstChild).toBeNull();
  });

  it('renders pulsing animation when isListening is true', () => {
    render(<ListeningIndicator isListening={true} />);
    const indicator = screen.getByTestId('listening-indicator');
    expect(indicator).toBeInTheDocument();
  });

  it('has data-testid="listening-indicator" when active', () => {
    render(<ListeningIndicator isListening={true} />);
    const indicator = screen.getByTestId('listening-indicator');
    expect(indicator).toBeInTheDocument();
  });

  it('uses CSS animation classes for pulsing effect', () => {
    render(<ListeningIndicator isListening={true} />);
    const indicator = screen.getByTestId('listening-indicator');
    // Check for animated bars (spans with animate-pulse)
    const animatedBars = indicator.querySelectorAll('.animate-pulse');
    expect(animatedBars.length).toBeGreaterThan(0);
  });

  it('renders exactly 5 pulsing bars', () => {
    render(<ListeningIndicator isListening={true} />);
    const indicator = screen.getByTestId('listening-indicator');
    const bars = indicator.querySelectorAll('span');
    expect(bars).toHaveLength(5);
  });

  it('does not display any visible text content (UI-05 compliance)', () => {
    const { container } = render(<ListeningIndicator isListening={true} />);
    // The component should only have aria-label for accessibility, no visible text
    const visibleText = container.textContent;
    expect(visibleText).toBe('');
  });

  it('has aria-label for accessibility', () => {
    render(<ListeningIndicator isListening={true} />);
    const indicator = screen.getByTestId('listening-indicator');
    expect(indicator).toHaveAttribute('aria-label', 'Ouvindo');
  });

  it('has role="status" for screen reader announcements', () => {
    render(<ListeningIndicator isListening={true} />);
    const indicator = screen.getByTestId('listening-indicator');
    expect(indicator).toHaveAttribute('role', 'status');
  });
});
