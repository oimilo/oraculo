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

// Silence detection parameters
const SILENCE_CHECK_INTERVAL_MS = 100;  // How often to check audio level
const SILENCE_THRESHOLD = 0.015;        // RMS below this = silence
const SPEECH_THRESHOLD = 0.02;          // RMS above this = speech detected
const SILENCE_DURATION_MS = 1200;       // Stop after this much silence post-speech
const MIN_RECORDING_MS = 1200;          // Always record at least this long

export interface UseMicrophoneReturn {
  isRecording: boolean;
  audioBlob: Blob | null;
  error: string | null;
  startRecording: (maxDuration?: number) => Promise<void>;
  stopRecording: () => void;
  /** Pre-request getUserMedia so the stream is ready when startRecording is called */
  warmUp: () => void;
}

export function useMicrophone(): UseMicrophoneReturn {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [error, setError] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const warmStreamRef = useRef<MediaStream | null>(null);
  const autoStopRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const silenceIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  const releaseStream = useCallback(() => {
    logger.log('releaseStream', { hadStream: !!streamRef.current });
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  }, []);

  const releaseWarmStream = useCallback(() => {
    if (warmStreamRef.current) {
      warmStreamRef.current.getTracks().forEach(track => track.stop());
      warmStreamRef.current = null;
    }
  }, []);

  /** Pre-request getUserMedia so the stream is ready when startRecording is called. */
  const warmUp = useCallback(() => {
    // Already have a warm stream or actively recording — skip
    if (warmStreamRef.current || streamRef.current) return;

    logger.log('warmUp — requesting getUserMedia');
    navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: false,
        noiseSuppression: true,
        sampleRate: 44100,
      },
    })
      .then((stream) => {
        // If startRecording already ran before warmUp resolved, release this stream
        if (streamRef.current) {
          logger.log('warmUp — stream already active, releasing warm stream');
          stream.getTracks().forEach(track => track.stop());
          return;
        }
        warmStreamRef.current = stream;
        logger.log('warmUp — stream ready');
      })
      .catch((err) => {
        logger.error('warmUp — failed:', err instanceof Error ? err.message : err);
      });
  }, []);

  const clearSilenceDetection = useCallback(() => {
    if (silenceIntervalRef.current) {
      clearInterval(silenceIntervalRef.current);
      silenceIntervalRef.current = null;
    }
    analyserRef.current = null;
    // Don't close audioCtx — reuse across recordings
  }, []);

  const stopRecording = useCallback(() => {
    logger.log('stopRecording called', { hasRecorder: !!mediaRecorderRef.current, state: mediaRecorderRef.current?.state });
    // Clear auto-stop timer (always, whether it exists or not)
    if (autoStopRef.current) {
      clearTimeout(autoStopRef.current);
      autoStopRef.current = null;
    }
    clearSilenceDetection();
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
  }, [clearSilenceDetection]);

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

      // Reuse pre-warmed stream if available (saves ~100-300ms getUserMedia latency)
      let stream: MediaStream;
      if (warmStreamRef.current) {
        stream = warmStreamRef.current;
        warmStreamRef.current = null;
        logger.log('getUserMedia REUSED warm stream');
      } else {
        stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: false,
            noiseSuppression: true,
            sampleRate: 44100,
          },
        });
        logger.log('getUserMedia SUCCESS (cold)');
      }
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
      const recordingStartTime = Date.now();
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
          clearSilenceDetection();
          autoStopRef.current = null;
        }, maxDuration);
      }

      // Silence detection: stop recording early when speech ends
      try {
        if (!audioCtxRef.current || audioCtxRef.current.state === 'closed') {
          audioCtxRef.current = new AudioContext();
        }
        const actx = audioCtxRef.current;
        const source = actx.createMediaStreamSource(stream);
        const analyser = actx.createAnalyser();
        analyser.fftSize = 512;
        source.connect(analyser);
        analyserRef.current = analyser;

        const dataArray = new Float32Array(analyser.fftSize);
        let speechDetected = false;
        let silenceStart: number | null = null;

        silenceIntervalRef.current = setInterval(() => {
          // Guard: only process if THIS recorder is still active
          if (mediaRecorderRef.current !== recorder || recorder.state !== 'recording') {
            clearSilenceDetection();
            return;
          }

          analyser.getFloatTimeDomainData(dataArray);
          // Compute RMS
          let sum = 0;
          for (let i = 0; i < dataArray.length; i++) {
            sum += dataArray[i] * dataArray[i];
          }
          const rms = Math.sqrt(sum / dataArray.length);

          const elapsed = Date.now() - recordingStartTime;

          if (rms >= SPEECH_THRESHOLD) {
            if (!speechDetected) {
              speechDetected = true;
              logger.log('Speech detected', { rms: rms.toFixed(4), elapsedMs: elapsed });
            }
            silenceStart = null; // Reset silence timer
          } else if (speechDetected && rms < SILENCE_THRESHOLD) {
            // Speech was detected and now it's silent
            if (!silenceStart) {
              silenceStart = Date.now();
            } else if (Date.now() - silenceStart >= SILENCE_DURATION_MS && elapsed >= MIN_RECORDING_MS) {
              logger.log('Silence detected after speech — stopping early', {
                silenceDurationMs: Date.now() - silenceStart,
                totalRecordingMs: elapsed,
              });
              clearSilenceDetection();
              if (autoStopRef.current) {
                clearTimeout(autoStopRef.current);
                autoStopRef.current = null;
              }
              recorder.stop();
              setIsRecording(false);
            }
          }
        }, SILENCE_CHECK_INTERVAL_MS);
      } catch (silenceErr) {
        // Silence detection is best-effort; fall back to timer-based stop
        logger.log('Silence detection unavailable, using timer fallback', {
          error: silenceErr instanceof Error ? silenceErr.message : String(silenceErr),
        });
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Microphone access denied';
      logger.error('Error:', message);
      setError(message);
      setIsRecording(false);
      releaseStream();
    }
  }, [releaseStream, stopRecording, clearSilenceDetection]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (autoStopRef.current) {
        clearTimeout(autoStopRef.current);
        autoStopRef.current = null;
      }
      clearSilenceDetection();
      if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
        audioCtxRef.current.close();
        audioCtxRef.current = null;
      }
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
      releaseStream();
      releaseWarmStream();
    };
  }, [releaseStream, releaseWarmStream, clearSilenceDetection]);

  return { isRecording, audioBlob, error, startRecording, stopRecording, warmUp };
}
