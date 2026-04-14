import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useVoiceChoice, type ChoiceConfig } from '../useVoiceChoice';
import type { UseMicrophoneReturn } from '../useMicrophone';
import type { STTService } from '@/services/stt';
import type { NLUService, ClassificationResult } from '@/services/nlu';

// Mock dependencies
vi.mock('../useMicrophone');
vi.mock('@/services/stt');
vi.mock('@/services/nlu');

describe('useVoiceChoice', () => {
  let mockUseMicrophone: UseMicrophoneReturn;
  let mockSTTService: STTService;
  let mockNLUService: NLUService;
  let mockStartRecording: ReturnType<typeof vi.fn>;
  let mockStopRecording: ReturnType<typeof vi.fn>;
  let mockTranscribe: ReturnType<typeof vi.fn>;
  let mockClassify: ReturnType<typeof vi.fn>;

  const defaultConfig: ChoiceConfig = {
    questionContext: 'Portal choice: voices or silence',
    options: { A: 'vozes', B: 'silêncio' },
    eventMap: { A: 'CHOICE_A', B: 'CHOICE_B' },
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    mockStartRecording = vi.fn().mockResolvedValue(undefined);
    mockStopRecording = vi.fn();
    mockTranscribe = vi.fn().mockResolvedValue('vozes');
    mockClassify = vi.fn().mockResolvedValue({
      choice: 'A',
      confidence: 0.85,
      reasoning: 'Clear match for option A',
    } as ClassificationResult);

    mockUseMicrophone = {
      isRecording: false,
      audioBlob: null,
      error: null,
      startRecording: mockStartRecording,
      stopRecording: mockStopRecording,
    };

    mockSTTService = {
      transcribe: mockTranscribe,
    };

    mockNLUService = {
      classify: mockClassify,
    };

    const { useMicrophone } = await import('../useMicrophone');
    const { createSTTService } = await import('@/services/stt');
    const { createNLUService } = await import('@/services/nlu');

    vi.mocked(useMicrophone).mockReturnValue(mockUseMicrophone);
    vi.mocked(createSTTService).mockReturnValue(mockSTTService);
    vi.mocked(createNLUService).mockReturnValue(mockNLUService);
  });

  it('accepts choiceConfig with questionContext, options, and eventMap', () => {
    const { result } = renderHook(() => useVoiceChoice(defaultConfig, false));

    expect(result.current).toBeDefined();
    expect(result.current.startListening).toBeDefined();
    expect(result.current.stopListening).toBeDefined();
    expect(result.current.reset).toBeDefined();
  });

  it('startListening begins microphone recording and sets isListening=true', async () => {
    const { result } = renderHook(() => useVoiceChoice(defaultConfig, false));

    expect(result.current.isListening).toBe(false);

    await act(async () => {
      await result.current.startListening();
    });

    expect(mockStartRecording).toHaveBeenCalledTimes(1);

    // Simulate microphone starting
    mockUseMicrophone.isRecording = true;
    const { result: result2 } = renderHook(() => useVoiceChoice(defaultConfig, false));
    expect(result2.current.isListening).toBe(true);
  });

  it('stopListening stops recording and triggers transcription + classification pipeline', async () => {
    const { result, rerender } = renderHook(() => useVoiceChoice(defaultConfig, false));

    await act(async () => {
      await result.current.startListening();
    });

    // Simulate stopRecording produces audioBlob
    const mockBlob = new Blob(['audio data'], { type: 'audio/webm' });

    await act(async () => {
      result.current.stopListening();
      mockUseMicrophone.audioBlob = mockBlob;
      rerender();
    });

    expect(mockStopRecording).toHaveBeenCalled();

    // Wait for async processing
    await waitFor(() => {
      expect(mockTranscribe).toHaveBeenCalledWith(mockBlob, expect.any(String));
    });

    await waitFor(() => {
      expect(mockClassify).toHaveBeenCalledWith(
        'vozes',
        defaultConfig.questionContext,
        defaultConfig.options,
        defaultConfig.keywords
      );
    });
  });

  it('returns choiceResult with mapped event type when NLU confidence >= 0.7', async () => {
    mockClassify.mockResolvedValue({
      choice: 'A',
      confidence: 0.85,
      reasoning: 'Clear match',
    } as ClassificationResult);

    const { result, rerender } = renderHook(() => useVoiceChoice(defaultConfig, false));

    await act(async () => {
      await result.current.startListening();
    });

    const mockBlob = new Blob(['audio data'], { type: 'audio/webm' });

    await act(async () => {
      result.current.stopListening();
      mockUseMicrophone.audioBlob = mockBlob;
      rerender();
    });

    await waitFor(() => {
      expect(result.current.choiceResult).toEqual({
        eventType: 'CHOICE_A',
        confidence: 0.85,
        transcript: 'vozes',
        wasDefault: false,
      });
    });
  });

  it('sets needsFallback=true on first low-confidence attempt (< 0.7)', async () => {
    mockClassify.mockResolvedValue({
      choice: 'A',
      confidence: 0.5,
      reasoning: 'Ambiguous',
    } as ClassificationResult);

    const { result, rerender } = renderHook(() => useVoiceChoice(defaultConfig, false));

    await act(async () => {
      await result.current.startListening();
    });

    const mockBlob = new Blob(['audio data'], { type: 'audio/webm' });

    await act(async () => {
      result.current.stopListening();
      mockUseMicrophone.audioBlob = mockBlob;
      rerender();
    });

    await waitFor(() => {
      expect(result.current.needsFallback).toBe(true);
      expect(result.current.attemptCount).toBe(1);
      expect(result.current.choiceResult).toBeNull();
    });
  });

  it('returns default choice after 2 failed attempts (confidence < 0.7)', async () => {
    mockClassify.mockResolvedValue({
      choice: 'A',
      confidence: 0.5,
      reasoning: 'Ambiguous',
    } as ClassificationResult);

    const { result, rerender } = renderHook(() => useVoiceChoice(defaultConfig, false));

    // First attempt
    await act(async () => {
      await result.current.startListening();
    });

    const mockBlob1 = new Blob(['audio data 1'], { type: 'audio/webm' });
    await act(async () => {
      result.current.stopListening();
      mockUseMicrophone.audioBlob = mockBlob1;
      rerender();
    });

    await waitFor(() => {
      expect(result.current.attemptCount).toBe(1);
      expect(result.current.needsFallback).toBe(true);
    });

    // Reset audioBlob for second attempt
    mockUseMicrophone.audioBlob = null;
    rerender();

    // Second attempt
    await act(async () => {
      await result.current.startListening();
    });

    const mockBlob2 = new Blob(['audio data 2'], { type: 'audio/webm' });
    await act(async () => {
      result.current.stopListening();
      mockUseMicrophone.audioBlob = mockBlob2;
      rerender();
    });

    await waitFor(() => {
      expect(result.current.attemptCount).toBe(2);
      expect(result.current.choiceResult).toEqual({
        eventType: 'CHOICE_B', // default is eventMap.B
        confidence: 0.5,
        transcript: 'vozes',
        wasDefault: true,
      });
    });
  });

  it('returns null choiceResult while processing (isProcessing=true)', async () => {
    // Mock slow processing
    mockTranscribe.mockImplementation(
      () => new Promise(resolve => setTimeout(() => resolve('vozes'), 100))
    );

    const { result, rerender } = renderHook(() => useVoiceChoice(defaultConfig, false));

    await act(async () => {
      await result.current.startListening();
    });

    const mockBlob = new Blob(['audio data'], { type: 'audio/webm' });

    await act(async () => {
      result.current.stopListening();
      mockUseMicrophone.audioBlob = mockBlob;
      rerender();
    });

    // Should be processing
    expect(result.current.isProcessing).toBe(true);
    expect(result.current.choiceResult).toBeNull();

    // Wait for completion
    await waitFor(() => {
      expect(result.current.isProcessing).toBe(false);
      expect(result.current.choiceResult).not.toBeNull();
    });
  });

  it('resets state when reset() is called', async () => {
    mockClassify.mockResolvedValue({
      choice: 'A',
      confidence: 0.85,
      reasoning: 'Clear match',
    } as ClassificationResult);

    const { result, rerender } = renderHook(() => useVoiceChoice(defaultConfig, false));

    await act(async () => {
      await result.current.startListening();
    });

    const mockBlob = new Blob(['audio data'], { type: 'audio/webm' });
    await act(async () => {
      result.current.stopListening();
      mockUseMicrophone.audioBlob = mockBlob;
      rerender();
    });

    await waitFor(() => {
      expect(result.current.choiceResult).not.toBeNull();
    });

    // Reset
    act(() => {
      result.current.reset();
    });

    expect(result.current.choiceResult).toBeNull();
    expect(result.current.needsFallback).toBe(false);
    expect(result.current.attemptCount).toBe(0);
    expect(result.current.error).toBeNull();
    expect(result.current.isProcessing).toBe(false);
  });

  it('handles STT errors gracefully (sets error state)', async () => {
    mockTranscribe.mockRejectedValue(new Error('STT service unavailable'));

    const { result, rerender } = renderHook(() => useVoiceChoice(defaultConfig, false));

    await act(async () => {
      await result.current.startListening();
    });

    const mockBlob = new Blob(['audio data'], { type: 'audio/webm' });
    await act(async () => {
      result.current.stopListening();
      mockUseMicrophone.audioBlob = mockBlob;
      rerender();
    });

    await waitFor(() => {
      expect(result.current.error).toBe('STT service unavailable');
      expect(result.current.needsFallback).toBe(true);
    });
  });

  it('handles NLU errors gracefully (sets error state)', async () => {
    mockClassify.mockRejectedValue(new Error('NLU service unavailable'));

    const { result, rerender } = renderHook(() => useVoiceChoice(defaultConfig, false));

    await act(async () => {
      await result.current.startListening();
    });

    const mockBlob = new Blob(['audio data'], { type: 'audio/webm' });
    await act(async () => {
      result.current.stopListening();
      mockUseMicrophone.audioBlob = mockBlob;
      rerender();
    });

    await waitFor(() => {
      expect(result.current.error).toBe('NLU service unavailable');
      expect(result.current.needsFallback).toBe(true);
    });
  });

  it('respects max 2 fallback attempts per STT-03', async () => {
    mockClassify.mockResolvedValue({
      choice: 'A',
      confidence: 0.5,
      reasoning: 'Ambiguous',
    } as ClassificationResult);

    const { result, rerender } = renderHook(() =>
      useVoiceChoice({ ...defaultConfig, maxAttempts: 2 }, false)
    );

    // Attempt 1
    await act(async () => {
      await result.current.startListening();
    });
    const blob1 = new Blob(['audio 1'], { type: 'audio/webm' });
    await act(async () => {
      result.current.stopListening();
      mockUseMicrophone.audioBlob = blob1;
      rerender();
    });

    await waitFor(() => expect(result.current.attemptCount).toBe(1));
    mockUseMicrophone.audioBlob = null;
    rerender();

    // Attempt 2
    await act(async () => {
      await result.current.startListening();
    });
    const blob2 = new Blob(['audio 2'], { type: 'audio/webm' });
    await act(async () => {
      result.current.stopListening();
      mockUseMicrophone.audioBlob = blob2;
      rerender();
    });

    await waitFor(() => {
      expect(result.current.attemptCount).toBe(2);
      expect(result.current.choiceResult?.wasDefault).toBe(true);
    });
  });

  it('handles empty transcript as silence (triggers fallback or default)', async () => {
    mockTranscribe.mockResolvedValue('');

    const { result, rerender } = renderHook(() => useVoiceChoice(defaultConfig, false));

    await act(async () => {
      await result.current.startListening();
    });

    const mockBlob = new Blob(['audio data'], { type: 'audio/webm' });
    await act(async () => {
      result.current.stopListening();
      mockUseMicrophone.audioBlob = mockBlob;
      rerender();
    });

    await waitFor(() => {
      expect(result.current.needsFallback).toBe(true);
      expect(mockClassify).not.toHaveBeenCalled();
    });
  });

  it('uses custom confidenceThreshold when provided', async () => {
    mockClassify.mockResolvedValue({
      choice: 'A',
      confidence: 0.65,
      reasoning: 'Borderline',
    } as ClassificationResult);

    const { result, rerender } = renderHook(() =>
      useVoiceChoice({ ...defaultConfig, confidenceThreshold: 0.6 }, false)
    );

    await act(async () => {
      await result.current.startListening();
    });

    const mockBlob = new Blob(['audio data'], { type: 'audio/webm' });
    await act(async () => {
      result.current.stopListening();
      mockUseMicrophone.audioBlob = mockBlob;
      rerender();
    });

    await waitFor(() => {
      expect(result.current.choiceResult).toEqual({
        eventType: 'CHOICE_A',
        confidence: 0.65,
        transcript: 'vozes',
        wasDefault: false,
      });
    });
  });

  it('uses custom defaultEvent when provided', async () => {
    mockClassify.mockResolvedValue({
      choice: 'A',
      confidence: 0.5,
      reasoning: 'Ambiguous',
    } as ClassificationResult);

    const { result, rerender } = renderHook(() =>
      useVoiceChoice({
        ...defaultConfig,
        defaultEvent: 'TIMEOUT',
        maxAttempts: 1,
      }, false)
    );

    await act(async () => {
      await result.current.startListening();
    });

    const mockBlob = new Blob(['audio data'], { type: 'audio/webm' });
    await act(async () => {
      result.current.stopListening();
      mockUseMicrophone.audioBlob = mockBlob;
      rerender();
    });

    await waitFor(() => {
      expect(result.current.choiceResult?.eventType).toBe('TIMEOUT');
      expect(result.current.choiceResult?.wasDefault).toBe(true);
    });
  });

  it('maps choice B correctly to eventMap.B', async () => {
    mockClassify.mockResolvedValue({
      choice: 'B',
      confidence: 0.9,
      reasoning: 'Clear B',
    } as ClassificationResult);

    const { result, rerender } = renderHook(() => useVoiceChoice(defaultConfig, false));

    await act(async () => {
      await result.current.startListening();
    });

    const mockBlob = new Blob(['audio data'], { type: 'audio/webm' });
    await act(async () => {
      result.current.stopListening();
      mockUseMicrophone.audioBlob = mockBlob;
      rerender();
    });

    await waitFor(() => {
      expect(result.current.choiceResult?.eventType).toBe('CHOICE_B');
    });
  });

  it('exposes microphone error through error field', async () => {
    mockUseMicrophone.error = 'Microphone access denied';

    const { result } = renderHook(() => useVoiceChoice(defaultConfig, false));

    expect(result.current.error).toBe('Microphone access denied');
  });

  describe('lifecycle states', () => {
    it('exposes lifecycle and dispatch from hook return', () => {
      const { result } = renderHook(() => useVoiceChoice(defaultConfig, false));

      expect(result.current.lifecycle).toBeDefined();
      expect(result.current.dispatch).toBeDefined();
      expect(typeof result.current.dispatch).toBe('function');
    });

    it('initial state is idle when active=false', () => {
      const { result } = renderHook(() => useVoiceChoice(defaultConfig, false));

      expect(result.current.lifecycle.phase).toBe('idle');
    });

    it('setting active=true transitions from idle to listening', async () => {
      const { result, rerender } = renderHook(
        ({ active }) => useVoiceChoice(defaultConfig, active),
        { initialProps: { active: false } }
      );

      expect(result.current.lifecycle.phase).toBe('idle');

      // Activate
      await act(async () => {
        rerender({ active: true });
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      expect(result.current.lifecycle.phase).toBe('listening');
      expect(result.current.isListening).toBe(false); // Mic hasn't started yet in this test
    });

    it('setting active=false dispatches reset', async () => {
      const { result, rerender } = renderHook(
        ({ active }) => useVoiceChoice(defaultConfig, active),
        { initialProps: { active: true } }
      );

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 10));
      });

      // Deactivate
      await act(async () => {
        rerender({ active: false });
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      expect(result.current.lifecycle.phase).toBe('idle');
      expect(result.current.choiceResult).toBeNull();
    });

    it('audioBlob arrival transitions from listening to processing', async () => {
      // Mock slow transcription to capture processing state
      mockTranscribe.mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve('vozes'), 200))
      );

      const { result, rerender } = renderHook(() => useVoiceChoice(defaultConfig, true));

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 10));
      });

      expect(result.current.lifecycle.phase).toBe('listening');

      // Simulate audioBlob arrival
      const mockBlob = new Blob(['audio data'], { type: 'audio/webm' });
      await act(async () => {
        mockUseMicrophone.audioBlob = mockBlob;
        rerender();
        await new Promise(resolve => setTimeout(resolve, 10));
      });

      // Should transition to processing
      await waitFor(() => {
        expect(result.current.lifecycle.phase).toBe('processing');
        expect(result.current.isProcessing).toBe(true);
      });
    });

    it('high confidence classification transitions from processing to decided', async () => {
      mockClassify.mockResolvedValue({
        choice: 'A',
        confidence: 0.85,
        reasoning: 'Clear match',
      } as ClassificationResult);

      const { result, rerender } = renderHook(() => useVoiceChoice(defaultConfig, true));

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      const mockBlob = new Blob(['audio data'], { type: 'audio/webm' });
      await act(async () => {
        mockUseMicrophone.audioBlob = mockBlob;
        rerender();
      });

      await waitFor(() => {
        expect(result.current.lifecycle.phase).toBe('decided');
        expect(result.current.choiceResult).not.toBeNull();
      });
    });

    it('low confidence + attempt < maxAttempts transitions from processing to fallback', async () => {
      mockClassify.mockResolvedValue({
        choice: 'A',
        confidence: 0.5,
        reasoning: 'Ambiguous',
      } as ClassificationResult);

      const { result, rerender } = renderHook(() => useVoiceChoice(defaultConfig, true));

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      const mockBlob = new Blob(['audio data'], { type: 'audio/webm' });
      await act(async () => {
        mockUseMicrophone.audioBlob = mockBlob;
        rerender();
      });

      await waitFor(() => {
        expect(result.current.lifecycle.phase).toBe('fallback');
        expect(result.current.needsFallback).toBe(true);
      });
    });

    it('startListening from fallback transitions back to listening (retry cycle)', async () => {
      mockClassify.mockResolvedValue({
        choice: 'A',
        confidence: 0.5,
        reasoning: 'Ambiguous',
      } as ClassificationResult);

      const { result, rerender } = renderHook(() => useVoiceChoice(defaultConfig, true));

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      const mockBlob = new Blob(['audio data'], { type: 'audio/webm' });
      await act(async () => {
        mockUseMicrophone.audioBlob = mockBlob;
        rerender();
      });

      await waitFor(() => {
        expect(result.current.lifecycle.phase).toBe('fallback');
      });

      // Reset audioBlob for retry
      mockUseMicrophone.audioBlob = null;
      rerender();

      // Start listening again (manual retry simulation)
      await act(async () => {
        await result.current.startListening();
      });

      expect(result.current.lifecycle.phase).toBe('listening');
    });

    it('reset from decided transitions to idle', async () => {
      mockClassify.mockResolvedValue({
        choice: 'A',
        confidence: 0.85,
        reasoning: 'Clear',
      } as ClassificationResult);

      const { result, rerender } = renderHook(() => useVoiceChoice(defaultConfig, true));

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      const mockBlob = new Blob(['audio data'], { type: 'audio/webm' });
      await act(async () => {
        mockUseMicrophone.audioBlob = mockBlob;
        rerender();
      });

      await waitFor(() => {
        expect(result.current.lifecycle.phase).toBe('decided');
      });

      act(() => {
        result.current.reset();
      });

      expect(result.current.lifecycle.phase).toBe('idle');
    });

    it('backward compatibility: derived flags match lifecycle phase', async () => {
      const { result, rerender } = renderHook(() => useVoiceChoice(defaultConfig, false));

      // Idle
      expect(result.current.lifecycle.phase).toBe('idle');
      expect(result.current.isListening).toBe(false);
      expect(result.current.isProcessing).toBe(false);
      expect(result.current.needsFallback).toBe(false);

      // Activate to listening
      await act(async () => {
        rerender();
      });

      // Note: In real implementation, listening phase correlates with isListening from useMicrophone
      // These tests verify the derived flags are consistent with lifecycle.phase
    });
  });
});
