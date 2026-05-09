import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { VersionProvider } from '@/contexts/VersionContext';
import VersionSelector from '../VersionSelector';
import type { ReactNode } from 'react';

function renderWithProvider(ui: ReactNode) {
  return render(
    <VersionProvider>{ui}</VersionProvider>
  );
}

describe('VersionSelector', () => {
  it('renders with V1 selected by default', () => {
    renderWithProvider(<VersionSelector onContinue={() => {}} />);
    const v1 = screen.getByTestId('version-v1');
    expect(v1).toHaveAttribute('aria-pressed', 'true');
  });

  it('calls setVersion when V2 is clicked', () => {
    renderWithProvider(<VersionSelector onContinue={() => {}} />);
    const v2 = screen.getByTestId('version-v2');
    expect(v2).toHaveAttribute('aria-pressed', 'false');

    fireEvent.click(v2);
    expect(v2).toHaveAttribute('aria-pressed', 'true');

    const v1 = screen.getByTestId('version-v1');
    expect(v1).toHaveAttribute('aria-pressed', 'false');
  });

  it('calls onContinue when Continuar is clicked', () => {
    const onContinue = vi.fn();
    renderWithProvider(<VersionSelector onContinue={onContinue} />);

    fireEvent.click(screen.getByTestId('version-continue'));
    expect(onContinue).toHaveBeenCalledTimes(1);
  });

  it('shows both version options', () => {
    renderWithProvider(<VersionSelector onContinue={() => {}} />);
    expect(screen.getByTestId('version-v1')).toBeTruthy();
    expect(screen.getByTestId('version-v2')).toBeTruthy();
  });

  it('has data-testid=version-selector on root', () => {
    renderWithProvider(<VersionSelector onContinue={() => {}} />);
    expect(screen.getByTestId('version-selector')).toBeTruthy();
  });
});
