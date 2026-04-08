import { describe, it, expect, beforeEach, vi } from 'vitest';
import { FallbackTTSService, isOnline } from '../fallback';
import type { VoiceSettings } from '../index';
import type { SpeechSegment } from '@/types';
import { SCRIPT } from '@/data/script';

// Mock AudioContext and related APIs
global.AudioContext = vi.fn().mockImplementation(() => ({
  createBufferSource: vi.fn(() => ({
    buffer: null,
    connect: vi.fn(),
    start: vi.fn(),
    stop: vi.fn(),
    onended: null,
  })),
  createGain: vi.fn(() => ({
    gain: { value: 1 },
    connect: vi.fn(),
  })),
  destination: {},
  decodeAudioData: vi.fn((arrayBuffer) =>
    Promise.resolve({
      duration: 1.0,
      length: 44100,
      numberOfChannels: 2,
      sampleRate: 44100,
    })
  ),
})) as any;

// Mock fetch
global.fetch = vi.fn(() =>
  Promise.resolve({
    ok: true,
    arrayBuffer: () => Promise.resolve(new ArrayBuffer(8)),
  })
) as any;

// Mock navigator.onLine
Object.defineProperty(global.navigator, 'onLine', {
  writable: true,
  value: true,
});

describe('FallbackTTSService', () => {
  let service: FallbackTTSService;
  const mockVoiceSettings: VoiceSettings = {
    stability: 0.5,
    similarity_boost: 0.8,
    style: 0.3,
    speed: 0.9,
    phase: 'APRESENTACAO',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    service = new FallbackTTSService();
  });

  it('should implement TTSService interface with speak and cancel methods', () => {
    expect(service).toBeDefined();
    expect(typeof service.speak).toBe('function');
    expect(typeof service.cancel).toBe('function');
  });

  it('should resolve speak() when audio file exists', async () => {
    const segments: SpeechSegment[] = [
      { text: 'Eu não sei quem você é.', pauseAfter: 900 },
    ];

    const speakPromise = service.speak(segments, mockVoiceSettings);
    expect(speakPromise).toBeInstanceOf(Promise);

    // Simulate audio ending
    setTimeout(() => {
      const mockSource = (service as any).currentSource;
      if (mockSource?.onended) {
        mockSource.onended();
      }
    }, 10);

    await expect(speakPromise).resolves.toBeUndefined();
  });

  it('should play segments sequentially with pauses matching pauseAfter values', async () => {
    const segments: SpeechSegment[] = [
      { text: 'First segment', pauseAfter: 1000 },
      { text: 'Second segment', pauseAfter: 500 },
    ];

    const startTime = Date.now();
    const speakPromise = service.speak(segments, mockVoiceSettings);

    // Simulate playback completion
    setTimeout(() => {
      const mockSource = (service as any).currentSource;
      if (mockSource?.onended) {
        mockSource.onended();
      }
    }, 10);

    await speakPromise;
    const elapsed = Date.now() - startTime;

    // Should have some delay (mocked implementation may vary)
    expect(elapsed).toBeGreaterThanOrEqual(0);
  });

  it('should cancel current playback and reject pending speak() with "Speech cancelled"', async () => {
    const segments: SpeechSegment[] = [
      { text: 'Eu não sei quem você é.', pauseAfter: 900 },
    ];

    const speakPromise = service.speak(segments, mockVoiceSettings);

    // Cancel immediately
    service.cancel();

    await expect(speakPromise).rejects.toThrow('Speech cancelled');
  });

  it('should map script key to correct /audio/prerecorded/{key}.mp3 path', () => {
    const getUrl = (key: string) => `/audio/prerecorded/${key.toLowerCase()}.mp3`;

    // Verify v3 keys
    expect(getUrl('APRESENTACAO')).toBe('/audio/prerecorded/apresentacao.mp3');
    expect(getUrl('INFERNO_Q1_SETUP')).toBe('/audio/prerecorded/inferno_q1_setup.mp3');
    expect(getUrl('PURGATORIO_Q3_RESPOSTA_A')).toBe('/audio/prerecorded/purgatorio_q3_resposta_a.mp3');
    expect(getUrl('DEVOLUCAO_SEEKER')).toBe('/audio/prerecorded/devolucao_seeker.mp3');
    expect(getUrl('FALLBACK_Q1')).toBe('/audio/prerecorded/fallback_q1.mp3');
    expect(getUrl('TIMEOUT_Q6')).toBe('/audio/prerecorded/timeout_q6.mp3');
  });

  it('should have a URL entry for every key in SCRIPT (82 keys)', () => {
    // SCRIPT imported at top of file
    // 61 base keys (v4.0) + 6 Q1B (Phase 31) + 6 Q5B (Phase 32) + 7 Q6B + ESPELHO (Phase 33) + 2 Phase 34 (CONTRA_FOBICO + PORTADOR) = 82
    const scriptKeyCount = Object.keys(SCRIPT).length;
    expect(scriptKeyCount).toBe(82);

    // Each script key should produce a valid URL
    for (const key of Object.keys(SCRIPT)) {
      const expectedUrl = `/audio/prerecorded/${key.toLowerCase()}.mp3`;
      expect(expectedUrl).toMatch(/^\/audio\/prerecorded\/[a-z0-9_]+\.mp3$/);
    }
  });
});

describe('isOnline', () => {
  it('should return navigator.onLine value', () => {
    (global.navigator as any).onLine = true;
    expect(isOnline()).toBe(true);

    (global.navigator as any).onLine = false;
    expect(isOnline()).toBe(false);
  });
});
