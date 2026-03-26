import { useEffect, useCallback } from 'react';

export function useKeyboardShortcut(
  key: string,
  callback: () => void,
  modifiers?: { ctrl?: boolean; shift?: boolean; alt?: boolean }
) {
  const stableCallback = useCallback(callback, [callback]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (modifiers?.ctrl && !e.ctrlKey) return;
      if (modifiers?.shift && !e.shiftKey) return;
      if (modifiers?.alt && !e.altKey) return;
      if (e.key !== key) return;

      e.preventDefault();
      stableCallback();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [key, stableCallback, modifiers]);
}
