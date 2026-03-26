import { useState, useRef, useEffect, useCallback } from 'react';
import { createLogger } from '@/lib/debug/logger';

// MIME type fallback per Research Pitfall 3
const MIME_PREFERENCES = [
  'audio/webm;codecs=opus',
  'audio/webm',
  'audio/mp4',
  'audio/wav',
];

function getSupportedMimeType(): string {
  for (const mime of MIME_PREFERENCES) {
    if (typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported(mime)) {
      return mime;
    }
  }
  return ''; // Let browser choose default
}

const logger = createLogger('Mic');

export interface UseMicrophoneReturn {
  isRecording: boolean;
  audioBlob: Blob | null;
  error: string | null;
  startRecording: (maxDuration?: number) => Promise<void>;
  stopRecording: () => void;
}

export function useMicrophone(): UseMicrophoneReturn {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [error, setError] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const autoStopRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const releaseStream = useCallback(() => {
    logger.log('releaseStream', { hadStream: !!streamRef.current });
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  }, []);

  const stopRecording = useCallback(() => {
    logger.log('stopRecording called', { hasRecorder: !!mediaRecorderRef.current, state: mediaRecorderRef.current?.state });
    // Clear auto-stop timer (always, whether it exists or not)
    if (autoStopRef.current) {
      clearTimeout(autoStopRef.current);
      autoStopRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
  }, []);

  const startRecording = useCallback(async (maxDuration?: number) => {
    // Stop any previous recording first
    stopRecording();

    // Safety: release any lingering stream from previous recording
    // (handles edge case where onstop hasn't fired yet)
    releaseStream();

    try {
      setError(null);
      setAudioBlob(null);
      chunksRef.current = [];

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100,
        },
      });
      logger.log('getUserMedia SUCCESS');
      streamRef.current = stream;

      const mimeType = getSupportedMimeType();
      const options: MediaRecorderOptions = mimeType ? { mimeType } : {};
      const recorder = new MediaRecorder(stream, options);

      recorder.ondataavailable = (e: BlobEvent) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      recorder.onstop = () => {
        const type = mimeType || 'audio/webm';
        const blob = new Blob(chunksRef.current, { type });
        logger.log('Recording stopped, blob size:', blob.size);
        setAudioBlob(blob);
        chunksRef.current = [];
        releaseStream();
      };

      recorder.start();
      mediaRecorderRef.current = recorder;
      setIsRecording(true);
      logger.log('Recording started', { maxDuration, mimeType: mimeType || 'default' });

      // Set auto-stop timer inside startRecording — tied to THIS recorder
      if (maxDuration) {
        autoStopRef.current = setTimeout(() => {
          logger.log('Auto-stop timer fired');
          // Check that THIS recorder is still active (not replaced by another)
          if (mediaRecorderRef.current === recorder && recorder.state === 'recording') {
            recorder.stop();
            setIsRecording(false);
          }
          autoStopRef.current = null;
        }, maxDuration);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Microphone access denied';
      logger.error('Error:', message);
      setError(message);
      setIsRecording(false);
      releaseStream();
    }
  }, [releaseStream, stopRecording]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (autoStopRef.current) {
        clearTimeout(autoStopRef.current);
        autoStopRef.current = null;
      }
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
      releaseStream();
    };
  }, [releaseStream]);

  return { isRecording, audioBlob, error, startRecording, stopRecording };
}
