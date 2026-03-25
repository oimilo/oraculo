import { describe, it, expect, beforeEach } from 'vitest';
import type { STTService } from '../index';
import { createSTTService } from '../index';

describe('STT Service Interface', () => {
  let sttService: STTService;

  beforeEach(() => {
    sttService = createSTTService();
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

  it('should return mock implementation when NEXT_PUBLIC_USE_REAL_APIS is not true', () => {
    const service = createSTTService();
    expect(service).toBeDefined();
    expect(service.constructor.name).toBe('MockSTTService');
  });
});
