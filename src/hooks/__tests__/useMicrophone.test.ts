import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useMicrophone } from '../useMicrophone';

// Mock BlobEvent (not available in jsdom)
class MockBlobEvent extends Event {
  data: Blob;
  constructor(type: string, init: { data: Blob }) {
    super(type);
    this.data = init.data;
  }
}

// Mock MediaRecorder API
const createMockMediaRecorder = () => {
  let state: 'inactive' | 'recording' | 'paused' = 'inactive';
  let ondataavailable: ((e: any) => void) | null = null;
  let onstop: (() => void) | null = null;

  const mockRecorder = {
    get state() {
      return state;
    },
    set ondataavailable(handler: (e: any) => void) {
      ondataavailable = handler;
    },
    set onstop(handler: () => void) {
      onstop = handler;
    },
    start: vi.fn(() => {
      state = 'recording';
    }),
    stop: vi.fn(() => {
      state = 'inactive';
      if (onstop) {
        // Simulate data available before stop
        if (ondataavailable) {
          ondataavailable(new MockBlobEvent('dataavailable', { data: new Blob(['test'], { type: 'audio/webm' }) }));
        }
        onstop();
      }
    }),
  };

  return mockRecorder;
};

describe('useMicrophone hook', () => {
  let mockStream: MediaStream;
  let mockTrack: MediaStreamTrack;

  beforeEach(() => {
    // Mock MediaStreamTrack
    mockTrack = {
      stop: vi.fn(),
      kind: 'audio',
      enabled: true,
    } as any;

    // Mock MediaStream
    mockStream = {
      getTracks: vi.fn(() => [mockTrack]),
    } as any;

    // Mock getUserMedia
    vi.stubGlobal('navigator', {
      mediaDevices: {
        getUserMedia: vi.fn().mockResolvedValue(mockStream),
      },
    });

    // Mock MediaRecorder
    const MockMediaRecorderClass = vi.fn(() => createMockMediaRecorder()) as any;
    MockMediaRecorderClass.isTypeSupported = vi.fn((mimeType: string) => {
      return mimeType === 'audio/webm;codecs=opus' || mimeType === 'audio/webm';
    });
    vi.stubGlobal('MediaRecorder', MockMediaRecorderClass);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('Test 1: useMicrophone returns { isRecording, audioBlob, error, startRecording, stopRecording }', () => {
    const { result } = renderHook(() => useMicrophone());

    expect(result.current).toHaveProperty('isRecording');
    expect(result.current).toHaveProperty('audioBlob');
    expect(result.current).toHaveProperty('error');
    expect(result.current).toHaveProperty('startRecording');
    expect(result.current).toHaveProperty('stopRecording');
  });

  it('Test 2: startRecording() sets isRecording to true', async () => {
    const { result } = renderHook(() => useMicrophone());

    expect(result.current.isRecording).toBe(false);

    await act(async () => {
      await result.current.startRecording();
    });

    expect(result.current.isRecording).toBe(true);
  });

  it('Test 3: stopRecording() sets isRecording to false and produces audioBlob', async () => {
    const { result } = renderHook(() => useMicrophone());

    await act(async () => {
      await result.current.startRecording();
    });

    expect(result.current.isRecording).toBe(true);
    expect(result.current.audioBlob).toBeNull();

    await act(() => {
      result.current.stopRecording();
    });

    await waitFor(() => {
      expect(result.current.isRecording).toBe(false);
      expect(result.current.audioBlob).not.toBeNull();
    });
  });

  it('Test 4: audioBlob is a Blob with type audio/webm after recording completes', async () => {
    const { result } = renderHook(() => useMicrophone());

    await act(async () => {
      await result.current.startRecording();
    });

    await act(() => {
      result.current.stopRecording();
    });

    await waitFor(() => {
      expect(result.current.audioBlob).toBeInstanceOf(Blob);
      expect(result.current.audioBlob?.type).toMatch(/audio\/webm/);
    });
  });

  it('Test 5: stopRecording releases media tracks (track.stop() called)', async () => {
    const { result } = renderHook(() => useMicrophone());

    await act(async () => {
      await result.current.startRecording();
    });

    await act(() => {
      result.current.stopRecording();
    });

    await waitFor(() => {
      expect(mockTrack.stop).toHaveBeenCalled();
    });
  });

  it('Test 6: unmount during recording calls stop and releases tracks', async () => {
    const { result, unmount } = renderHook(() => useMicrophone());

    await act(async () => {
      await result.current.startRecording();
    });

    expect(result.current.isRecording).toBe(true);

    unmount();

    expect(mockTrack.stop).toHaveBeenCalled();
  });

  it('Test 7: startRecording handles getUserMedia rejection gracefully (sets error)', async () => {
    // Override getUserMedia to reject
    vi.stubGlobal('navigator', {
      mediaDevices: {
        getUserMedia: vi.fn().mockRejectedValue(new Error('Permission denied')),
      },
    });

    const { result } = renderHook(() => useMicrophone());

    await act(async () => {
      await result.current.startRecording();
    });

    expect(result.current.isRecording).toBe(false);
    expect(result.current.error).toBe('Permission denied');
  });

  it('Test 8: MIME type fallback -- checks isTypeSupported before using audio/webm', async () => {
    const { result } = renderHook(() => useMicrophone());

    await act(async () => {
      await result.current.startRecording();
    });

    expect(MediaRecorder.isTypeSupported).toHaveBeenCalled();
    expect(MediaRecorder).toHaveBeenCalled();
  });
});
