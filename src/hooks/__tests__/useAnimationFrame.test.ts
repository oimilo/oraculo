import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useAnimationFrame } from '../useAnimationFrame';

describe('useAnimationFrame', () => {
  let rafCallbacks: ((time: number) => void)[] = [];
  let rafId = 0;

  beforeEach(() => {
    rafCallbacks = [];
    rafId = 0;
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => {
      rafCallbacks.push(cb);
      return ++rafId;
    });
    vi.spyOn(window, 'cancelAnimationFrame').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('calls requestAnimationFrame when running is true', () => {
    const callback = vi.fn();
    renderHook(() => useAnimationFrame(callback, true));
    expect(window.requestAnimationFrame).toHaveBeenCalled();
  });

  it('does not call requestAnimationFrame when running is false', () => {
    const callback = vi.fn();
    renderHook(() => useAnimationFrame(callback, false));
    expect(window.requestAnimationFrame).not.toHaveBeenCalled();
  });

  it('calls callback with deltaTime on each frame', () => {
    const callback = vi.fn();
    renderHook(() => useAnimationFrame(callback, true));

    // Simulate first frame
    rafCallbacks[0](1000);
    expect(callback).toHaveBeenCalledWith(expect.any(Number));
  });

  it('cancels animation frame on unmount', () => {
    const callback = vi.fn();
    const { unmount } = renderHook(() => useAnimationFrame(callback, true));
    unmount();
    expect(window.cancelAnimationFrame).toHaveBeenCalled();
  });

  it('cancels animation frame when running changes to false', () => {
    const callback = vi.fn();
    const { rerender } = renderHook(
      ({ running }) => useAnimationFrame(callback, running),
      { initialProps: { running: true } }
    );
    rerender({ running: false });
    expect(window.cancelAnimationFrame).toHaveBeenCalled();
  });

  it('restarts animation when running toggles back to true', () => {
    const callback = vi.fn();
    const { rerender } = renderHook(
      ({ running }) => useAnimationFrame(callback, running),
      { initialProps: { running: true } }
    );
    rerender({ running: false });
    rerender({ running: true });
    // requestAnimationFrame called initially + again after restart
    expect((window.requestAnimationFrame as any).mock.calls.length).toBeGreaterThanOrEqual(2);
  });
});
