import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { TTSService, VoiceSettings } from '../index';
import { createTTSService, PHASE_VOICE_SETTINGS } from '../index';

describe('TTS Service Interface', () => {
  let ttsService: TTSService;

  beforeEach(() => {
    // Mock window.speechSynthesis
    global.window = {
      speechSynthesis: {
        getVoices: vi.fn(() => []),
        speak: vi.fn(),
        cancel: vi.fn(),
      } as any,
    } as any;

    ttsService = createTTSService();
  });

  it('should create a TTSService with speak and cancel methods', () => {
    expect(ttsService).toBeDefined();
    expect(typeof ttsService.speak).toBe('function');
    expect(typeof ttsService.cancel).toBe('function');
  });

  it('should accept speak(segments, voiceSettings) and return Promise<void>', async () => {
    const segments = [{ text: 'Hello', pauseAfter: 100 }];
    const voiceSettings: VoiceSettings = {
      stability: 0.5,
      similarity_boost: 0.8,
      style: 0.3,
      speed: 0.9,
      phase: 'APRESENTACAO',
    };

    const result = ttsService.speak(segments, voiceSettings);
    expect(result).toBeInstanceOf(Promise);
  });

  it('should have VoiceSettings type with all required fields', () => {
    const settings: VoiceSettings = {
      stability: 0.5,
      similarity_boost: 0.8,
      style: 0.3,
      speed: 0.9,
      phase: 'APRESENTACAO',
    };

    expect(settings.stability).toBe(0.5);
    expect(settings.similarity_boost).toBe(0.8);
    expect(settings.style).toBe(0.3);
    expect(settings.speed).toBe(0.9);
    expect(settings.phase).toBe('APRESENTACAO');
  });

  it('should export PHASE_VOICE_SETTINGS with all 6 phases', () => {
    expect(PHASE_VOICE_SETTINGS).toBeDefined();
    expect(PHASE_VOICE_SETTINGS.APRESENTACAO).toBeDefined();
    expect(PHASE_VOICE_SETTINGS.INFERNO).toBeDefined();
    expect(PHASE_VOICE_SETTINGS.PURGATORIO).toBeDefined();
    expect(PHASE_VOICE_SETTINGS.PARAISO).toBeDefined();
    expect(PHASE_VOICE_SETTINGS.DEVOLUCAO).toBeDefined();
    expect(PHASE_VOICE_SETTINGS.ENCERRAMENTO).toBeDefined();
  });

  it('should return mock implementation when NEXT_PUBLIC_USE_REAL_APIS is not true', () => {
    // Factory should return mock by default
    const service = createTTSService();
    expect(service).toBeDefined();
    expect(service.constructor.name).toBe('MockTTSService');
  });
});
