import type { NarrativePhase } from '@/types';
import { crossfade, fadeIn, fadeOut } from './crossfader';

interface AmbientTrack {
  phase: NarrativePhase;
  buffer: AudioBuffer;
  source: AudioBufferSourceNode | null;
  gainNode: GainNode;
}

/** Default ambient audio URLs per phase. Place files in public/audio/ */
export const AMBIENT_URLS: Partial<Record<NarrativePhase, string>> = {
  APRESENTACAO: '/audio/ambient-apresentacao.mp3',
  INFERNO: '/audio/ambient-inferno.mp3',
  PURGATORIO: '/audio/ambient-purgatorio.mp3',
  PARAISO: '/audio/ambient-paraiso.mp3',
};

/** Per-phase volume (0-1). Tweak here to balance ambient against TTS voice. */
export const AMBIENT_VOLUMES: Partial<Record<NarrativePhase, number>> = {
  APRESENTACAO: 0.5,
  INFERNO: 1.0,
  PURGATORIO: 0.5,
  PARAISO: 0.25,
};

export class AmbientPlayer {
  private tracks: Map<NarrativePhase, AmbientTrack> = new Map();
  private currentPhase: NarrativePhase | null = null;
  private crossfadeDuration: number = 2.5; // AMB-02: 2-3 seconds

  constructor(private ctx: AudioContext) {}

  async loadTrack(phase: NarrativePhase, url: string): Promise<void> {
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    const buffer = await this.ctx.decodeAudioData(arrayBuffer);

    const gainNode = this.ctx.createGain();
    gainNode.gain.value = 0; // Start silent
    gainNode.connect(this.ctx.destination); // Separate path from TTS (AMB-03)

    this.tracks.set(phase, { phase, buffer, source: null, gainNode });
  }

  async loadAllTracks(): Promise<void> {
    const entries = Object.entries(AMBIENT_URLS) as [NarrativePhase, string][];
    await Promise.all(entries.map(([phase, url]) => this.loadTrack(phase, url)));
  }

  crossfadeTo(targetPhase: NarrativePhase, duration?: number): void {
    const fadeDuration = duration ?? this.crossfadeDuration;
    const targetTrack = this.tracks.get(targetPhase);

    if (!targetTrack) {
      // No ambient for this phase (DEVOLUCAO, ENCERRAMENTO)
      // Just fade out current if playing
      if (this.currentPhase) {
        const current = this.tracks.get(this.currentPhase);
        if (current) {
          fadeOut(this.ctx, current.gainNode, fadeDuration);
          const source = current.source;
          setTimeout(() => {
            source?.stop();
            if (current) current.source = null;
          }, fadeDuration * 1000);
        }
        this.currentPhase = null;
      }
      return;
    }

    // Create new source node (cannot be reused after stop)
    const source = this.ctx.createBufferSource();
    source.buffer = targetTrack.buffer;
    source.loop = true; // AMB-04: seamless loops
    source.connect(targetTrack.gainNode);
    source.start(0);
    targetTrack.source = source;

    const targetVolume = AMBIENT_VOLUMES[targetPhase] ?? 0.5;

    if (this.currentPhase && this.currentPhase !== targetPhase) {
      const currentTrack = this.tracks.get(this.currentPhase);
      if (currentTrack) {
        crossfade(this.ctx, currentTrack.gainNode, targetTrack.gainNode, fadeDuration, targetVolume);
        const oldSource = currentTrack.source;
        setTimeout(() => {
          oldSource?.stop();
          if (currentTrack) currentTrack.source = null;
        }, fadeDuration * 1000);
      }
    } else {
      // First track or same phase, just fade in
      fadeIn(this.ctx, targetTrack.gainNode, fadeDuration, targetVolume);
    }

    this.currentPhase = targetPhase;
  }

  stop(duration: number = 1.0): void {
    if (this.currentPhase) {
      const track = this.tracks.get(this.currentPhase);
      if (track) {
        fadeOut(this.ctx, track.gainNode, duration);
        const source = track.source;
        setTimeout(() => {
          source?.stop();
          if (track) track.source = null;
        }, duration * 1000);
      }
      this.currentPhase = null;
    }
  }

  /** Duck ambient volume while mic is active (prevents bleed into recording) */
  duck(duration: number = 0.5): void {
    if (!this.currentPhase) return;
    const track = this.tracks.get(this.currentPhase);
    if (track) {
      const now = this.ctx.currentTime;
      track.gainNode.gain.setValueAtTime(track.gainNode.gain.value, now);
      track.gainNode.gain.linearRampToValueAtTime(0.05, now + duration);
    }
  }

  /** Restore ambient volume after mic recording ends */
  unduck(duration: number = 0.5): void {
    if (!this.currentPhase) return;
    const track = this.tracks.get(this.currentPhase);
    if (track) {
      const targetVolume = AMBIENT_VOLUMES[this.currentPhase] ?? 0.5;
      const now = this.ctx.currentTime;
      track.gainNode.gain.setValueAtTime(track.gainNode.gain.value, now);
      track.gainNode.gain.linearRampToValueAtTime(targetVolume, now + duration);
    }
  }

  getCurrentPhase(): NarrativePhase | null {
    return this.currentPhase;
  }

  dispose(): void {
    this.stop(0);
    this.tracks.forEach((track) => {
      track.source?.stop();
      track.source?.disconnect();
      track.gainNode.disconnect();
    });
    this.tracks.clear();
  }
}
