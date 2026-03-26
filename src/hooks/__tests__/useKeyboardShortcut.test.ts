import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useKeyboardShortcut } from '../useKeyboardShortcut';

describe('useKeyboardShortcut', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fires callback when correct key combo is pressed', () => {
    const callback = vi.fn();
    renderHook(() => useKeyboardShortcut('D', callback, { ctrl: true, shift: true }));

    const event = new KeyboardEvent('keydown', {
      key: 'D',
      ctrlKey: true,
      shiftKey: true,
      bubbles: true,
    });
    window.dispatchEvent(event);

    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('does not fire callback when only partial modifiers are pressed', () => {
    const callback = vi.fn();
    renderHook(() => useKeyboardShortcut('D', callback, { ctrl: true, shift: true }));

    // Ctrl+D without Shift
    const event = new KeyboardEvent('keydown', {
      key: 'D',
      ctrlKey: true,
      shiftKey: false,
      bubbles: true,
    });
    window.dispatchEvent(event);

    expect(callback).not.toHaveBeenCalled();
  });

  it('does not fire callback when wrong key is pressed', () => {
    const callback = vi.fn();
    renderHook(() => useKeyboardShortcut('D', callback, { ctrl: true, shift: true }));

    // Ctrl+Shift+X instead of Ctrl+Shift+D
    const event = new KeyboardEvent('keydown', {
      key: 'X',
      ctrlKey: true,
      shiftKey: true,
      bubbles: true,
    });
    window.dispatchEvent(event);

    expect(callback).not.toHaveBeenCalled();
  });

  it('calls preventDefault when combo matches', () => {
    const callback = vi.fn();
    renderHook(() => useKeyboardShortcut('D', callback, { ctrl: true, shift: true }));

    const event = new KeyboardEvent('keydown', {
      key: 'D',
      ctrlKey: true,
      shiftKey: true,
      bubbles: true,
    });
    const preventDefaultSpy = vi.spyOn(event, 'preventDefault');

    window.dispatchEvent(event);

    expect(preventDefaultSpy).toHaveBeenCalled();
    expect(callback).toHaveBeenCalled();
  });

  it('removes listener on unmount', () => {
    const callback = vi.fn();
    const { unmount } = renderHook(() =>
      useKeyboardShortcut('D', callback, { ctrl: true, shift: true })
    );

    // Verify it works before unmount
    const event1 = new KeyboardEvent('keydown', {
      key: 'D',
      ctrlKey: true,
      shiftKey: true,
      bubbles: true,
    });
    window.dispatchEvent(event1);
    expect(callback).toHaveBeenCalledTimes(1);

    // Unmount the hook
    unmount();

    // Fire event again - callback should NOT be called
    const event2 = new KeyboardEvent('keydown', {
      key: 'D',
      ctrlKey: true,
      shiftKey: true,
      bubbles: true,
    });
    window.dispatchEvent(event2);

    expect(callback).toHaveBeenCalledTimes(1); // Still 1, not 2
  });
});
