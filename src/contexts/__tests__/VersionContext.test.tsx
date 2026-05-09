import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { VersionProvider, useVersion } from '../VersionContext';
import type { ReactNode } from 'react';

function wrapper({ children }: { children: ReactNode }) {
  return <VersionProvider>{children}</VersionProvider>;
}

describe('VersionContext', () => {
  it('defaults to V1', () => {
    const { result } = renderHook(() => useVersion(), { wrapper });
    expect(result.current.version).toBe('V1');
  });

  it('can be initialized to V2', () => {
    const customWrapper = ({ children }: { children: ReactNode }) => (
      <VersionProvider initialVersion="V2">{children}</VersionProvider>
    );
    const { result } = renderHook(() => useVersion(), { wrapper: customWrapper });
    expect(result.current.version).toBe('V2');
  });

  it('setVersion updates the version', () => {
    const { result } = renderHook(() => useVersion(), { wrapper });
    expect(result.current.version).toBe('V1');
    act(() => {
      result.current.setVersion('V2');
    });
    expect(result.current.version).toBe('V2');
  });

  it('throws when used outside VersionProvider', () => {
    expect(() => {
      renderHook(() => useVersion());
    }).toThrow('useVersion must be used within a VersionProvider');
  });

  it('version persists across multiple reads (session persistence)', () => {
    const { result, rerender } = renderHook(() => useVersion(), { wrapper });
    act(() => {
      result.current.setVersion('V2');
    });
    rerender();
    expect(result.current.version).toBe('V2');
  });
});
