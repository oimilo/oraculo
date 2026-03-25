import type { SpeechSegment, VoiceDirection } from '@/types';

let currentReject: ((reason: Error) => void) | null = null;

export function waitForVoices(): Promise<SpeechSynthesisVoice[]> {
  return new Promise((resolve) => {
    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      resolve(voices);
    } else {
      window.speechSynthesis.onvoiceschanged = () => {
        resolve(window.speechSynthesis.getVoices());
      };
    }
  });
}

export async function speakSegments(
  segments: SpeechSegment[],
  voiceDirection: VoiceDirection = { rate: 0.9, pitch: 1.0, description: '' },
  voiceLang: string = 'pt-BR',
): Promise<void> {
  const synth = window.speechSynthesis;
  const voices = await waitForVoices();
  const voice = voices.find(v => v.lang.startsWith(voiceLang)) || voices[0];

  return new Promise<void>((resolve, reject) => {
    currentReject = reject;

    (async () => {
      for (const segment of segments) {
        await new Promise<void>((segResolve, segReject) => {
          const utterance = new SpeechSynthesisUtterance(segment.text);
          utterance.voice = voice;
          utterance.rate = voiceDirection.rate;
          utterance.pitch = voiceDirection.pitch;
          utterance.lang = voiceLang;
          utterance.onend = () => segResolve();
          utterance.onerror = (err) => segReject(err);
          synth.speak(utterance);
        });

        if (segment.pauseAfter && segment.pauseAfter > 0) {
          await new Promise(r => setTimeout(r, segment.pauseAfter));
        }
      }
      currentReject = null;
      resolve();
    })().catch(reject);
  });
}

export function cancelSpeech(): void {
  window.speechSynthesis.cancel();
  if (currentReject) {
    currentReject(new Error('Speech cancelled'));
    currentReject = null;
  }
}
