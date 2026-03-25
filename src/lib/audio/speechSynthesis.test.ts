import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { speakSegments, cancelSpeech, waitForVoices } from './speechSynthesis';
import type { SpeechSegment, VoiceDirection } from '@/types';

// Mock SpeechSynthesis API
const mockUtterances: SpeechSynthesisUtterance[] = [];

const mockVoices: SpeechSynthesisVoice[] = [
  { lang: 'pt-BR', name: 'Google Portuguese', default: false } as SpeechSynthesisVoice,
  { lang: 'en-US', name: 'Google English', default: true } as SpeechSynthesisVoice,
];

const mockSynth = {
  speak: vi.fn((utterance: SpeechSynthesisUtterance) => {
    mockUtterances.push(utterance);
    // Simulate async completion
    setTimeout(() => {
      if (utterance.onend) {
        utterance.onend(new Event('end') as SpeechSynthesisEvent);
      }
    }, 10);
  }),
  cancel: vi.fn(() => {
    mockUtterances.length = 0;
  }),
  getVoices: vi.fn(() => mockVoices),
  onvoiceschanged: null as (() => void) | null,
};

describe('speechSynthesis wrapper', () => {
  beforeEach(() => {
    // Mock SpeechSynthesisUtterance constructor
    globalThis.SpeechSynthesisUtterance = vi.fn().mockImplementation((text: string) => {
      return {
        text,
        voice: null,
        rate: 1,
        pitch: 1,
        lang: '',
        onend: null,
        onerror: null,
      };
    }) as any;

    // Mock window.speechSynthesis
    Object.defineProperty(window, 'speechSynthesis', {
      value: mockSynth,
      writable: true,
      configurable: true,
    });

    // Reset mocks
    mockUtterances.length = 0;
    mockSynth.speak.mockClear();
    mockSynth.cancel.mockClear();
    vi.clearAllTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('Test 1: speakSegments() creates SpeechSynthesisUtterance for each segment and calls synth.speak()', async () => {
    const segments: SpeechSegment[] = [
      { text: 'First segment' },
      { text: 'Second segment' },
    ];

    await speakSegments(segments);

    expect(mockSynth.speak).toHaveBeenCalledTimes(2);
    expect(mockUtterances[0].text).toBe('First segment');
    expect(mockUtterances[1].text).toBe('Second segment');
  });

  it('Test 2: speakSegments() waits for utterance.onend before moving to next segment', async () => {
    const callOrder: string[] = [];

    const customMockSynth = {
      ...mockSynth,
      speak: vi.fn((utterance: SpeechSynthesisUtterance) => {
        callOrder.push(`speak:${utterance.text}`);
        setTimeout(() => {
          callOrder.push(`end:${utterance.text}`);
          if (utterance.onend) {
            utterance.onend(new Event('end') as SpeechSynthesisEvent);
          }
        }, 50);
      }),
      getVoices: vi.fn(() => mockVoices),
    };

    Object.defineProperty(window, 'speechSynthesis', {
      value: customMockSynth,
      writable: true,
      configurable: true,
    });

    const segments: SpeechSegment[] = [
      { text: 'First' },
      { text: 'Second' },
    ];

    await speakSegments(segments);

    // Verify sequential execution: speak1 -> end1 -> speak2 -> end2
    expect(callOrder).toEqual(['speak:First', 'end:First', 'speak:Second', 'end:Second']);
  });

  it('Test 3: speakSegments() inserts pause (setTimeout) between segments when pauseAfter is specified', async () => {
    vi.useFakeTimers();

    const segments: SpeechSegment[] = [
      { text: 'First', pauseAfter: 1000 },
      { text: 'Second' },
    ];

    const promise = speakSegments(segments);

    // Advance through first utterance
    await vi.advanceTimersByTimeAsync(10);
    expect(mockSynth.speak).toHaveBeenCalledTimes(1);

    // Advance through pause
    await vi.advanceTimersByTimeAsync(1000);

    // Advance through second utterance
    await vi.advanceTimersByTimeAsync(10);
    expect(mockSynth.speak).toHaveBeenCalledTimes(2);

    await promise;
  });

  it('Test 4: speakSegments() sets voice to pt-BR when available', async () => {
    const segments: SpeechSegment[] = [{ text: 'Test' }];

    await speakSegments(segments);

    expect(mockUtterances[0].voice?.lang).toBe('pt-BR');
  });

  it('Test 5: speakSegments() applies rate and pitch from VoiceDirection parameter', async () => {
    const segments: SpeechSegment[] = [{ text: 'Test' }];
    const voiceDirection: VoiceDirection = { rate: 0.8, pitch: 0.9, description: 'Test voice' };

    await speakSegments(segments, voiceDirection);

    expect(mockUtterances[0].rate).toBe(0.8);
    expect(mockUtterances[0].pitch).toBe(0.9);
  });

  it('Test 6: speakSegments() resolves Promise after last segment completes', async () => {
    const segments: SpeechSegment[] = [
      { text: 'First' },
      { text: 'Second' },
    ];

    let resolved = false;
    const promise = speakSegments(segments).then(() => {
      resolved = true;
    });

    // Should not be resolved immediately
    expect(resolved).toBe(false);

    await promise;
    expect(resolved).toBe(true);
  });

  it('Test 7: cancelSpeech() calls synth.cancel() and rejects the pending speakSegments Promise', async () => {
    vi.useFakeTimers();

    const segments: SpeechSegment[] = [
      { text: 'First', pauseAfter: 5000 },
      { text: 'Second' },
    ];

    let errorCaught = false;
    const promise = speakSegments(segments).catch((err) => {
      errorCaught = true;
      expect(err.message).toBe('Speech cancelled');
    });

    // Start speaking
    await vi.advanceTimersByTimeAsync(10);
    expect(mockSynth.speak).toHaveBeenCalledTimes(1);

    // Cancel mid-pause
    cancelSpeech();
    expect(mockSynth.cancel).toHaveBeenCalled();

    await promise;
    expect(errorCaught).toBe(true);
  });

  it('Test 8: waitForVoices() resolves immediately when voices already loaded', async () => {
    const voices = await waitForVoices();
    expect(voices).toEqual(mockVoices);
    expect(voices.length).toBeGreaterThan(0);
  });

  it('Test 9: waitForVoices() waits for voiceschanged event when voices list is empty', async () => {
    // Mock empty voices initially
    const emptyMockSynth = {
      ...mockSynth,
      getVoices: vi.fn()
        .mockReturnValueOnce([])
        .mockReturnValueOnce(mockVoices),
    };

    Object.defineProperty(window, 'speechSynthesis', {
      value: emptyMockSynth,
      writable: true,
      configurable: true,
    });

    const voicesPromise = waitForVoices();

    // Trigger voiceschanged event
    setTimeout(() => {
      if (window.speechSynthesis.onvoiceschanged) {
        window.speechSynthesis.onvoiceschanged(new Event('voiceschanged'));
      }
    }, 10);

    const voices = await voicesPromise;
    expect(voices).toEqual(mockVoices);
  });
});
