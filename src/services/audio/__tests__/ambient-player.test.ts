import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AmbientPlayer, AMBIENT_URLS } from '../ambientPlayer';
import type { NarrativePhase } from '@/types';

// Mock fetch and AudioContext
const createMockAudioBuffer = () => ({
  duration: 30,
  length: 1323000,
  numberOfChannels: 2,
  sampleRate: 44100,
});

const createMockBufferSourceNode = () => {
  const node = {
    buffer: null,
    loop: false,
    connect: vi.fn(),
    disconnect: vi.fn(),
    start: vi.fn(),
    stop: vi.fn(),
  };
  return node as unknown as AudioBufferSourceNode;
};

const createMockGainNode = () => {
  const gainNode = {
    gain: {
      value: 0,
      setValueAtTime: vi.fn(),
      linearRampToValueAtTime: vi.fn(),
    },
    connect: vi.fn(),
    disconnect: vi.fn(),
  };
  return gainNode as unknown as GainNode;
};

const createMockAudioContext = () => {
  const sources: AudioBufferSourceNode[] = [];
  const gains: GainNode[] = [];

  const ctx = {
    currentTime: 0,
    destination: {} as AudioDestinationNode,
    decodeAudioData: vi.fn().mockResolvedValue(createMockAudioBuffer()),
    createBufferSource: vi.fn(() => {
      const source = createMockBufferSourceNode();
      sources.push(source);
      return source;
    }),
    createGain: vi.fn(() => {
      const gain = createMockGainNode();
      gains.push(gain);
      return gain;
    }),
    _sources: sources,
    _gains: gains,
  };

  return ctx as unknown as AudioContext;
};

describe('AmbientPlayer', () => {
  let ctx: AudioContext;

  beforeEach(() => {
    ctx = createMockAudioContext();
    global.fetch = vi.fn().mockResolvedValue({
      arrayBuffer: vi.fn().mockResolvedValue(new ArrayBuffer(100)),
    });
  });

  it('accepts AudioContext in constructor', () => {
    const player = new AmbientPlayer(ctx);
    expect(player).toBeDefined();
  });

  it('loadTrack fetches audio and decodes it', async () => {
    const player = new AmbientPlayer(ctx);
    const url = '/audio/test.mp3';

    await player.loadTrack('INFERNO', url);

    expect(global.fetch).toHaveBeenCalledWith(url);
    expect(ctx.decodeAudioData).toHaveBeenCalled();
  });

  it('loadTrack creates GainNode connected to destination', async () => {
    const player = new AmbientPlayer(ctx);

    await player.loadTrack('INFERNO', '/audio/test.mp3');

    expect(ctx.createGain).toHaveBeenCalled();
    const gainNode = (ctx as any)._gains[0];
    expect(gainNode.connect).toHaveBeenCalledWith(ctx.destination);
    expect(gainNode.gain.value).toBe(0); // Start silent
  });

  it('crossfadeTo creates AudioBufferSourceNode with loop=true', async () => {
    const player = new AmbientPlayer(ctx);
    await player.loadTrack('INFERNO', '/audio/inferno.mp3');

    player.crossfadeTo('INFERNO', 2.0);

    const source = (ctx as any)._sources[0];
    expect(source.loop).toBe(true);
  });

  it('crossfadeTo connects source to gain node', async () => {
    const player = new AmbientPlayer(ctx);
    await player.loadTrack('INFERNO', '/audio/inferno.mp3');

    player.crossfadeTo('INFERNO', 2.0);

    const source = (ctx as any)._sources[0];
    const gainNode = (ctx as any)._gains[0];
    expect(source.connect).toHaveBeenCalledWith(gainNode);
  });

  it('crossfadeTo starts source playback', async () => {
    const player = new AmbientPlayer(ctx);
    await player.loadTrack('INFERNO', '/audio/inferno.mp3');

    player.crossfadeTo('INFERNO', 2.0);

    const source = (ctx as any)._sources[0];
    expect(source.start).toHaveBeenCalledWith(0);
  });

  it('crossfadeTo fades in when no current phase is playing', async () => {
    const player = new AmbientPlayer(ctx);
    await player.loadTrack('INFERNO', '/audio/inferno.mp3');

    player.crossfadeTo('INFERNO', 2.0);

    const gainNode = (ctx as any)._gains[0];
    expect(gainNode.gain.setValueAtTime).toHaveBeenCalledWith(0, 0);
    expect(gainNode.gain.linearRampToValueAtTime).toHaveBeenCalledWith(1, 2.0);
  });

  it('crossfadeTo crossfades between two phases', async () => {
    const player = new AmbientPlayer(ctx);
    await player.loadTrack('INFERNO', '/audio/inferno.mp3');
    await player.loadTrack('PURGATORIO', '/audio/purgatorio.mp3');

    player.crossfadeTo('INFERNO', 1.0);
    (ctx as any).currentTime = 10;
    player.crossfadeTo('PURGATORIO', 2.0);

    const infernoGain = (ctx as any)._gains[0];
    const purgatorioGain = (ctx as any)._gains[1];

    // Inferno should fade out
    expect(infernoGain.gain.linearRampToValueAtTime).toHaveBeenCalledWith(0, 12.0);

    // Purgatorio should fade in
    expect(purgatorioGain.gain.linearRampToValueAtTime).toHaveBeenCalledWith(1, 12.0);
  });

  it('crossfadeTo handles phase without ambient track (fade out only)', async () => {
    const player = new AmbientPlayer(ctx);
    await player.loadTrack('INFERNO', '/audio/inferno.mp3');

    player.crossfadeTo('INFERNO', 1.0);
    player.crossfadeTo('APRESENTACAO', 1.0); // No ambient for APRESENTACAO

    const infernoGain = (ctx as any)._gains[0];
    expect(infernoGain.gain.linearRampToValueAtTime).toHaveBeenCalledWith(0, expect.any(Number));
  });

  it('stop fades out current track', async () => {
    const player = new AmbientPlayer(ctx);
    await player.loadTrack('INFERNO', '/audio/inferno.mp3');

    player.crossfadeTo('INFERNO', 1.0);
    player.stop(1.0);

    const gainNode = (ctx as any)._gains[0];
    expect(gainNode.gain.linearRampToValueAtTime).toHaveBeenCalledWith(0, 1.0);
  });

  it('getCurrentPhase returns null initially', () => {
    const player = new AmbientPlayer(ctx);
    expect(player.getCurrentPhase()).toBeNull();
  });

  it('getCurrentPhase returns active phase after crossfadeTo', async () => {
    const player = new AmbientPlayer(ctx);
    await player.loadTrack('PURGATORIO', '/audio/purgatorio.mp3');

    player.crossfadeTo('PURGATORIO', 1.0);

    expect(player.getCurrentPhase()).toBe('PURGATORIO');
  });

  it('getCurrentPhase returns null after stop', async () => {
    const player = new AmbientPlayer(ctx);
    await player.loadTrack('PARAISO', '/audio/paraiso.mp3');

    player.crossfadeTo('PARAISO', 1.0);
    player.stop(1.0);

    expect(player.getCurrentPhase()).toBeNull();
  });

  it('dispose cleans up all AudioNodes', async () => {
    const player = new AmbientPlayer(ctx);
    await player.loadTrack('INFERNO', '/audio/inferno.mp3');
    await player.loadTrack('PURGATORIO', '/audio/purgatorio.mp3');

    player.crossfadeTo('INFERNO', 1.0);
    player.dispose();

    const source = (ctx as any)._sources[0];
    const gains = (ctx as any)._gains;

    expect(source.disconnect).toHaveBeenCalled();
    gains.forEach((gain: any) => {
      expect(gain.disconnect).toHaveBeenCalled();
    });
  });
});

describe('AMBIENT_URLS constant', () => {
  it('defines URLs for INFERNO, PURGATORIO, and PARAISO', () => {
    expect(AMBIENT_URLS.INFERNO).toBe('/audio/ambient-inferno.mp3');
    expect(AMBIENT_URLS.PURGATORIO).toBe('/audio/ambient-purgatorio.mp3');
    expect(AMBIENT_URLS.PARAISO).toBe('/audio/ambient-paraiso.mp3');
  });

  it('does not define URLs for APRESENTACAO, DEVOLUCAO, ENCERRAMENTO', () => {
    expect(AMBIENT_URLS.APRESENTACAO).toBeUndefined();
    expect(AMBIENT_URLS.DEVOLUCAO).toBeUndefined();
    expect(AMBIENT_URLS.ENCERRAMENTO).toBeUndefined();
  });
});
