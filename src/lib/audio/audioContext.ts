let audioContext: AudioContext | null = null;
let gainNode: GainNode | null = null;
let effectsInputNode: GainNode | null = null;

export async function initAudioContext(): Promise<AudioContext> {
  if (!audioContext) {
    audioContext = new AudioContext();
    gainNode = audioContext.createGain();
    gainNode.connect(audioContext.destination);

    // Effects input — TTS sources connect here.
    // Default: passthrough direct to gainNode (no effects).
    // When effectsChain is initialized, it rewires this through EQ + reverb + delay.
    effectsInputNode = audioContext.createGain();
    effectsInputNode.connect(gainNode);
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

/**
 * Returns the effects input node. TTS sources should connect here
 * so audio flows through the effects chain before reaching the output.
 * Falls back to gainNode if effects input hasn't been created yet.
 */
export function getEffectsInput(): GainNode | null {
  return effectsInputNode || gainNode;
}

export async function resetAudioContext(): Promise<void> {
  if (audioContext) {
    await audioContext.close();
    audioContext = null;
    gainNode = null;
    effectsInputNode = null;
  }
}
