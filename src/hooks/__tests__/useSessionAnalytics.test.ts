import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useSessionAnalytics } from '../useSessionAnalytics';
import { createAnalyticsService } from '@/services/analytics';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => { store[key] = value; },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; },
  };
})();

Object.defineProperty(global, 'window', {
  value: {
    localStorage: localStorageMock,
    location: { search: '' },
  },
  writable: true,
});

Object.defineProperty(global, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

describe('useSessionAnalytics', () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  it('startSession calls analytics service with correct sessionId and stationId', () => {
    const { result } = renderHook(() => useSessionAnalytics());

    act(() => {
      result.current.startSession('session-test-1');
    });

    // Verify via localStorage since that's the persistence mechanism
    const stored = localStorageMock.getItem('oraculo_analytics');
    expect(stored).not.toBeNull();
    const sessions = JSON.parse(stored!);
    expect(sessions.some((s: any) => s.id === 'session-test-1')).toBe(true);
    expect(result.current.stationId).toBe('station-1');
  });

  it('endSession derives path from choices (A + FICAR = A_FICAR)', () => {
    const { result } = renderHook(() => useSessionAnalytics());

    act(() => {
      result.current.startSession('session-path-1');
      result.current.endSession('session-path-1', 'A', 'FICAR', 0, true);
    });

    const stored = localStorageMock.getItem('oraculo_analytics');
    const sessions = JSON.parse(stored!);
    const session = sessions.find((s: any) => s.id === 'session-path-1');
    expect(session?.path).toBe('A_FICAR');
    expect(session?.status).toBe('completed');
  });

  it('endSession derives path from choices (B + PISAR = B_PISAR)', () => {
    const { result } = renderHook(() => useSessionAnalytics());

    act(() => {
      result.current.startSession('session-path-2');
      result.current.endSession('session-path-2', 'B', 'PISAR', 1, true);
    });

    const stored = localStorageMock.getItem('oraculo_analytics');
    const sessions = JSON.parse(stored!);
    const session = sessions.find((s: any) => s.id === 'session-path-2');
    expect(session?.path).toBe('B_PISAR');
  });

  it('endSession with null choices produces null path', () => {
    const { result } = renderHook(() => useSessionAnalytics());

    act(() => {
      result.current.startSession('session-path-3');
      result.current.endSession('session-path-3', null, null, 0, false);
    });

    const stored = localStorageMock.getItem('oraculo_analytics');
    const sessions = JSON.parse(stored!);
    const session = sessions.find((s: any) => s.id === 'session-path-3');
    expect(session?.path).toBeNull();
    expect(session?.status).toBe('abandoned');
  });

  it('recordFallback calls service.recordFallback', () => {
    const { result } = renderHook(() => useSessionAnalytics());

    act(() => {
      result.current.startSession('session-fallback');
      result.current.recordFallback('session-fallback');
    });

    const stored = localStorageMock.getItem('oraculo_analytics');
    const sessions = JSON.parse(stored!);
    const session = sessions.find((s: any) => s.id === 'session-fallback');
    expect(session?.fallbackCount).toBe(1);
  });

  it('stationId defaults to "station-1" when no query param', () => {
    const { result } = renderHook(() => useSessionAnalytics());
    expect(result.current.stationId).toBe('station-1');
  });
});
