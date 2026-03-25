let audioContext: AudioContext | null = null;
let gainNode: GainNode | null = null;

export async function initAudioContext(): Promise<AudioContext> {
  if (!audioContext) {
    audioContext = new AudioContext();
    gainNode = audioContext.createGain();
    gainNode.connect(audioContext.destination);
  }

  if (audioContext.state === 'suspended') {
    await audioContext.resume();
  }

  return audioContext;
}

export function getAudioContext(): AudioContext | null {
  return audioContext;
}

export function getGainNode(): GainNode | null {
  return gainNode;
}

export async function resetAudioContext(): Promise<void> {
  if (audioContext) {
    await audioContext.close();
    audioContext = null;
    gainNode = null;
  }
}
