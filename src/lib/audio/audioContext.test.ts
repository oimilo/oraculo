import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { initAudioContext, getAudioContext, getGainNode, resetAudioContext } from './audioContext';

// Mock AudioContext API
const createMockAudioContext = () => {
  let state: 'suspended' | 'running' | 'closed' = 'suspended';

  const mockGainNode = {
    connect: vi.fn(),
    gain: { value: 1 },
  };

  const mockAudioContext = {
    get state() {
      return state;
    },
    resume: vi.fn().mockImplementation(async () => {
      state = 'running';
    }),
    close: vi.fn().mockImplementation(async () => {
      state = 'closed';
    }),
    createGain: vi.fn(() => mockGainNode),
    destination: {},
  };

  return mockAudioContext;
};

describe('audioContext singleton', () => {
  beforeEach(() => {
    // Mock global AudioContext
    globalThis.AudioContext = vi.fn(() => createMockAudioContext()) as any;
  });

  afterEach(async () => {
    // Clean up singleton after each test
    await resetAudioContext();
  });

  it('Test 1: initAudioContext() creates a new AudioContext when none exists', async () => {
    const ctx = await initAudioContext();
    expect(ctx).toBeDefined();
    expect(globalThis.AudioContext).toHaveBeenCalledTimes(1);
  });

  it('Test 2: initAudioContext() returns the same AudioContext on subsequent calls (singleton)', async () => {
    const ctx1 = await initAudioContext();
    const ctx2 = await initAudioContext();
    expect(ctx1).toBe(ctx2);
    expect(globalThis.AudioContext).toHaveBeenCalledTimes(1);
  });

  it('Test 3: initAudioContext() calls audioContext.resume() when state is suspended', async () => {
    const ctx = await initAudioContext();
    expect(ctx.resume).toHaveBeenCalled();
  });

  it('Test 4: initAudioContext() resolves with AudioContext in state running after resume', async () => {
    const ctx = await initAudioContext();
    expect(ctx.state).toBe('running');
  });

  it('Test 5: initAudioContext() creates a GainNode connected to AudioContext.destination', async () => {
    const ctx = await initAudioContext();
    expect(ctx.createGain).toHaveBeenCalled();
    const gainNode = getGainNode();
    expect(gainNode).toBeDefined();
    expect(gainNode?.connect).toHaveBeenCalledWith(ctx.destination);
  });

  it('Test 6: getAudioContext() returns null before initialization', () => {
    const ctx = getAudioContext();
    expect(ctx).toBeNull();
  });

  it('Test 7: getAudioContext() returns the AudioContext after initialization', async () => {
    await initAudioContext();
    const ctx = getAudioContext();
    expect(ctx).toBeDefined();
    expect(ctx).not.toBeNull();
  });

  it('Test 8: getGainNode() returns the GainNode after initialization', async () => {
    await initAudioContext();
    const gainNode = getGainNode();
    expect(gainNode).toBeDefined();
    expect(gainNode).not.toBeNull();
  });

  it('Test 9: resetAudioContext() closes existing context and resets to null', async () => {
    const ctx = await initAudioContext();
    await resetAudioContext();
    expect(ctx.close).toHaveBeenCalled();
    expect(getAudioContext()).toBeNull();
    expect(getGainNode()).toBeNull();
  });
});
