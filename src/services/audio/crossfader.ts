/**
 * Equal-power crossfade between two GainNodes.
 * Uses linearRampToValueAtTime for frame-perfect timing.
 * Per AMB-02: transitions should be 2-3 seconds.
 */
export function crossfade(
  ctx: AudioContext,
  currentGain: GainNode,
  nextGain: GainNode,
  duration: number = 2.5
): void {
  const now = ctx.currentTime;
  currentGain.gain.setValueAtTime(currentGain.gain.value, now);
  currentGain.gain.linearRampToValueAtTime(0, now + duration);
  nextGain.gain.setValueAtTime(0, now);
  nextGain.gain.linearRampToValueAtTime(1, now + duration);
}

export function fadeIn(
  ctx: AudioContext,
  gainNode: GainNode,
  duration: number = 2.5
): void {
  const now = ctx.currentTime;
  gainNode.gain.setValueAtTime(0, now);
  gainNode.gain.linearRampToValueAtTime(1, now + duration);
}

export function fadeOut(
  ctx: AudioContext,
  gainNode: GainNode,
  duration: number = 2.5
): void {
  const now = ctx.currentTime;
  gainNode.gain.setValueAtTime(gainNode.gain.value, now);
  gainNode.gain.linearRampToValueAtTime(0, now + duration);
}
