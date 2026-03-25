import { useEffect, useRef } from 'react';
import type { NarrativePhase } from '@/types';
import { getAudioContext } from '@/lib/audio/audioContext';
import { AmbientPlayer } from '@/services/audio/ambientPlayer';

/**
 * Hook managing ambient audio lifecycle.
 * Crossfades between phase soundscapes when currentPhase changes.
 * Connects to the AudioContext from Phase 1 (separate path from TTS per AMB-03).
 */
export function useAmbientAudio(currentPhase: NarrativePhase, isActive: boolean): void {
  const playerRef = useRef<AmbientPlayer | null>(null);
  const loadedRef = useRef(false);

  // Initialize AmbientPlayer when AudioContext becomes available
  useEffect(() => {
    if (!isActive) return;

    const ctx = getAudioContext();
    if (!ctx) return;

    if (!playerRef.current) {
      playerRef.current = new AmbientPlayer(ctx);

      // Load tracks in background (don't block)
      playerRef.current.loadAllTracks()
        .then(() => { loadedRef.current = true; })
        .catch((err) => {
          console.warn('Failed to load ambient tracks (non-fatal):', err);
          // Ambient is enhancement, not required -- experience continues without it
        });
    }

    return () => {
      playerRef.current?.dispose();
      playerRef.current = null;
      loadedRef.current = false;
    };
  }, [isActive]);

  // Crossfade on phase change
  useEffect(() => {
    if (!isActive || !playerRef.current || !loadedRef.current) return;

    // Phases that get ambient: INFERNO, PURGATORIO, PARAISO
    // APRESENTACAO, DEVOLUCAO: no ambient (DEVOLUCAO continues previous)
    // ENCERRAMENTO: fade out
    if (currentPhase === 'ENCERRAMENTO') {
      playerRef.current.stop(2.5);
    } else if (currentPhase === 'INFERNO' || currentPhase === 'PURGATORIO' || currentPhase === 'PARAISO') {
      playerRef.current.crossfadeTo(currentPhase, 2.5);
    }
    // APRESENTACAO and DEVOLUCAO: no crossfade action
  }, [currentPhase, isActive]);
}
