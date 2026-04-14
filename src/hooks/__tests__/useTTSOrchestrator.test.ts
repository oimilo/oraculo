import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useTTSOrchestrator } from '../useTTSOrchestrator';
import type { TTSService } from '@/services/tts';
import type { SpeechSegment } from '@/types';

// Mock TTS service
vi.mock('@/services/tts');

describe('useTTSOrchestrator', () => {
  let mockTTSService: TTSService;
  let mockSpeak: ReturnType<typeof vi.fn>;
  let mockCancel: ReturnType<typeof vi.fn>;

  const testSegments: SpeechSegment[] = [
    { text: 'Test segment 1', pauseAfter: 500 },
    { text: 'Test segment 2' },
  ];

  beforeEach(async () => {
    vi.clearAllMocks();

    mockSpeak = vi.fn().mockResolvedValue(undefined);
    mockCancel = vi.fn();

    mockTTSService = {
      speak: mockSpeak,
      cancel: mockCancel,
    };

    const { createTTSService } = await import('@/services/tts');
    vi.mocked(createTTSService).mockReturnValue(mockTTSService);
  });

  it('initializes with isSpeaking=false', () => {
    const { result } = renderHook(() => useTTSOrchestrator());

    expect(result.current.isSpeaking).toBe(false);
  });

  it('exposes initTTS, speak, cancel methods', () => {
    const { result } = renderHook(() => useTTSOrchestrator());

    expect(result.current.initTTS).toBeDefined();
    expect(result.current.speak).toBeDefined();
    expect(result.current.cancel).toBeDefined();
  });

  it('initTTS creates TTS service', async () => {
    const { result } = renderHook(() => useTTSOrchestrator());

    act(() => {
      result.current.initTTS();
    });

    const { createTTSService } = await import('@/services/tts');
    expect(createTTSService).toHaveBeenCalledTimes(1);
  });

  it('speak calls ttsService.speak with correct segments and voice settings', async () => {
    const { result } = renderHook(() => useTTSOrchestrator());

    act(() => {
      result.current.initTTS();
    });

    await act(async () => {
      await result.current.speak(testSegments, 'INFERNO');
    });

    expect(mockSpeak).toHaveBeenCalledTimes(1);
    expect(mockSpeak).toHaveBeenCalledWith(
      testSegments,
      expect.objectContaining({ phase: 'INFERNO' }),
      undefined
    );
  });

  it('isSpeaking is true during speak, false after completion', async () => {
    // Mock slow speak to capture intermediate state
    let resolveSpeakPromise: () => void;
    const slowSpeakPromise = new Promise<void>((resolve) => {
      resolveSpeakPromise = resolve;
    });
    mockSpeak.mockReturnValueOnce(slowSpeakPromise);

    const { result } = renderHook(() => useTTSOrchestrator());

    act(() => {
      result.current.initTTS();
    });

    // Start speak (don't await yet)
    let speakPromise: Promise<void>;
    act(() => {
      speakPromise = result.current.speak(testSegments, 'INFERNO');
    });

    // Should be speaking
    await waitFor(() => {
      expect(result.current.isSpeaking).toBe(true);
    });

    // Complete the speak
    await act(async () => {
      resolveSpeakPromise!();
      await speakPromise;
    });

    expect(result.current.isSpeaking).toBe(false);
  });

  it('cancel calls ttsService.cancel', () => {
    const { result } = renderHook(() => useTTSOrchestrator());

    act(() => {
      result.current.initTTS();
    });

    act(() => {
      result.current.cancel();
    });

    expect(mockCancel).toHaveBeenCalledTimes(1);
  });

  it('speak during existing speech cancels previous and starts new', async () => {
    let resolveFirst: () => void;
    const firstSpeakPromise = new Promise<void>((resolve) => {
      resolveFirst = resolve;
    });
    mockSpeak.mockImplementationOnce(() => firstSpeakPromise);

    const { result } = renderHook(() => useTTSOrchestrator());

    act(() => {
      result.current.initTTS();
    });

    // Start first speak
    let firstPromise: Promise<void>;
    await act(async () => {
      firstPromise = result.current.speak(testSegments, 'INFERNO');
    });

    expect(result.current.isSpeaking).toBe(true);
    expect(mockSpeak).toHaveBeenCalledTimes(1);

    // Start second speak while first is ongoing
    mockSpeak.mockResolvedValueOnce(undefined);
    await act(async () => {
      const secondPromise = result.current.speak(testSegments, 'PURGATORIO');
      resolveFirst!(); // Resolve the first to unblock
      await Promise.race([firstPromise, secondPromise]);
    });

    // Should have cancelled and started new
    expect(mockCancel).toHaveBeenCalled();
    expect(mockSpeak).toHaveBeenCalledTimes(2);
  });

  it('speak resolves after ttsService.speak completes', async () => {
    const { result } = renderHook(() => useTTSOrchestrator());

    act(() => {
      result.current.initTTS();
    });

    let resolved = false;
    await act(async () => {
      await result.current.speak(testSegments, 'INFERNO').then(() => {
        resolved = true;
      });
    });

    expect(resolved).toBe(true);
    expect(result.current.isSpeaking).toBe(false);
  });

  it('handles speak errors gracefully', async () => {
    mockSpeak.mockRejectedValueOnce(new Error('TTS failed'));

    const { result } = renderHook(() => useTTSOrchestrator());

    act(() => {
      result.current.initTTS();
    });

    await act(async () => {
      await expect(result.current.speak(testSegments, 'INFERNO')).rejects.toThrow('TTS failed');
    });

    // isSpeaking should be false after error
    expect(result.current.isSpeaking).toBe(false);
  });
});
