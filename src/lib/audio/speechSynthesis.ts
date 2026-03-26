import type { SpeechSegment, VoiceDirection } from '@/types';

let currentReject: ((reason: Error) => void) | null = null;
let cancelled = false;

export function waitForVoices(timeoutMs: number = 3000): Promise<SpeechSynthesisVoice[]> {
  const voicesPromise = new Promise<SpeechSynthesisVoice[]>((resolve) => {
    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      resolve(voices);
      return;
    }
    window.speechSynthesis.onvoiceschanged = () => {
      resolve(window.speechSynthesis.getVoices());
    };
  });

  const timeoutPromise = new Promise<SpeechSynthesisVoice[]>((resolve) => {
    setTimeout(() => resolve([]), timeoutMs);
  });

  return Promise.race([voicesPromise, timeoutPromise]);
}

export async function speakSegments(
  segments: SpeechSegment[],
  voiceDirection: VoiceDirection = { rate: 0.9, pitch: 1.0, description: '' },
  voiceLang: string = 'pt-BR',
): Promise<void> {
  const synth = window.speechSynthesis;
  const voices = await waitForVoices();

  if (voices.length === 0) {
    // No voices available (timeout or system without speech synthesis)
    // Resolve silently — caller (MockTTSService) handles fallback
    return;
  }

  const voice = voices.find(v => v.lang.startsWith(voiceLang)) || voices[0];

  cancelled = false;

  return new Promise<void>((resolve, reject) => {
    currentReject = reject;

    (async () => {
      for (const segment of segments) {
        if (cancelled) return;

        await new Promise<void>((segResolve) => {
          if (cancelled) { segResolve(); return; }
          const utterance = new SpeechSynthesisUtterance(segment.text);
          utterance.voice = voice;
          utterance.rate = voiceDirection.rate;
          utterance.pitch = voiceDirection.pitch;
          utterance.lang = voiceLang;
          utterance.onend = () => segResolve();
          utterance.onerror = () => segResolve(); // Resolve on error too — cancel handles rejection
          synth.speak(utterance);
        });

        if (cancelled) return;

        if (segment.pauseAfter && segment.pauseAfter > 0) {
          await new Promise<void>((r) => {
            const timer = setTimeout(r, segment.pauseAfter);
            // Check cancel during pause — poll every 100ms
            const check = setInterval(() => {
              if (cancelled) { clearTimeout(timer); clearInterval(check); r(); }
            }, 100);
            // Clean up checker when pause ends naturally
            setTimeout(() => clearInterval(check), segment.pauseAfter! + 10);
          });
        }
      }
      if (!cancelled) {
        currentReject = null;
        resolve();
      }
    })();
  });
}

export function cancelSpeech(): void {
  cancelled = true;
  window.speechSynthesis.cancel();
  if (currentReject) {
    currentReject(new Error('Speech cancelled'));
    currentReject = null;
  }
}
