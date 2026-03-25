import { describe, it, expect, beforeEach, vi } from 'vitest';
import { crossfade, fadeIn, fadeOut } from '../crossfader';

// Mock AudioContext and GainNode
const createMockGainNode = (initialValue: number = 1) => {
  const mockGain = {
    value: initialValue,
    setValueAtTime: vi.fn(),
    linearRampToValueAtTime: vi.fn(),
  };

  return {
    gain: mockGain,
  } as unknown as GainNode;
};

const createMockAudioContext = (currentTime: number = 0) => {
  return {
    currentTime,
  } as AudioContext;
};

describe('crossfader utility', () => {
  describe('crossfade()', () => {
    it('schedules linearRampToValueAtTime on both gain nodes', () => {
      const ctx = createMockAudioContext(10.0);
      const currentGain = createMockGainNode(1.0);
      const nextGain = createMockGainNode(0.0);

      crossfade(ctx, currentGain, nextGain, 2.5);

      // Current should fade out
      expect(currentGain.gain.setValueAtTime).toHaveBeenCalledWith(1.0, 10.0);
      expect(currentGain.gain.linearRampToValueAtTime).toHaveBeenCalledWith(0, 12.5);

      // Next should fade in
      expect(nextGain.gain.setValueAtTime).toHaveBeenCalledWith(0, 10.0);
      expect(nextGain.gain.linearRampToValueAtTime).toHaveBeenCalledWith(1, 12.5);
    });

    it('uses default duration of 2.5 seconds when not specified', () => {
      const ctx = createMockAudioContext(5.0);
      const currentGain = createMockGainNode(0.8);
      const nextGain = createMockGainNode(0.0);

      crossfade(ctx, currentGain, nextGain);

      expect(currentGain.gain.linearRampToValueAtTime).toHaveBeenCalledWith(0, 7.5);
      expect(nextGain.gain.linearRampToValueAtTime).toHaveBeenCalledWith(1, 7.5);
    });

    it('respects current gain value for setValueAtTime', () => {
      const ctx = createMockAudioContext(0.0);
      const currentGain = createMockGainNode(0.5);
      const nextGain = createMockGainNode(0.0);

      crossfade(ctx, currentGain, nextGain, 3.0);

      expect(currentGain.gain.setValueAtTime).toHaveBeenCalledWith(0.5, 0.0);
    });
  });

  describe('fadeIn()', () => {
    it('ramps gain from 0 to 1', () => {
      const ctx = createMockAudioContext(2.0);
      const gainNode = createMockGainNode(0.0);

      fadeIn(ctx, gainNode, 2.5);

      expect(gainNode.gain.setValueAtTime).toHaveBeenCalledWith(0, 2.0);
      expect(gainNode.gain.linearRampToValueAtTime).toHaveBeenCalledWith(1, 4.5);
    });

    it('uses default duration of 2.5 seconds when not specified', () => {
      const ctx = createMockAudioContext(1.0);
      const gainNode = createMockGainNode(0.0);

      fadeIn(ctx, gainNode);

      expect(gainNode.gain.linearRampToValueAtTime).toHaveBeenCalledWith(1, 3.5);
    });
  });

  describe('fadeOut()', () => {
    it('ramps gain from current value to 0', () => {
      const ctx = createMockAudioContext(3.0);
      const gainNode = createMockGainNode(0.8);

      fadeOut(ctx, gainNode, 1.0);

      expect(gainNode.gain.setValueAtTime).toHaveBeenCalledWith(0.8, 3.0);
      expect(gainNode.gain.linearRampToValueAtTime).toHaveBeenCalledWith(0, 4.0);
    });

    it('uses default duration of 2.5 seconds when not specified', () => {
      const ctx = createMockAudioContext(5.0);
      const gainNode = createMockGainNode(1.0);

      fadeOut(ctx, gainNode);

      expect(gainNode.gain.linearRampToValueAtTime).toHaveBeenCalledWith(0, 7.5);
    });
  });
});
