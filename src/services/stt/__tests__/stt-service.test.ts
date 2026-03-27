import { describe, it, expect, beforeEach } from 'vitest';
import type { STTService } from '../index';
import { createSTTService } from '../index';
import { MockSTTService } from '../mock';

describe('STT Service Interface', () => {
  let sttService: STTService;

  beforeEach(() => {
    // Use mock directly for interface tests (real service needs API)
    sttService = new MockSTTService();
  });

  it('should create an STTService with transcribe method', () => {
    expect(sttService).toBeDefined();
    expect(typeof sttService.transcribe).toBe('function');
  });

  it('should accept transcribe(audioBlob) and return Promise<string>', async () => {
    const blob = new Blob(['audio data'], { type: 'audio/wav' });
    const result = sttService.transcribe(blob);

    expect(result).toBeInstanceOf(Promise);
    const transcript = await result;
    expect(typeof transcript).toBe('string');
  });

  it('should return real STT in browser context (always real for voice input)', () => {
    const service = createSTTService();
    expect(service).toBeDefined();
    // In jsdom (window exists), factory returns real service
    expect(service.constructor.name).toBe('WhisperSTTService');
  });
});
