import { useEffect, useRef, useState } from 'react';
import type { NarrativePhase } from '@/types';
import { getAudioContext } from '@/lib/audio/audioContext';
import { AmbientPlayer } from '@/services/audio/ambientPlayer';

const AMBIENT_PHASES: NarrativePhase[] = ['APRESENTACAO', 'INFERNO', 'PURGATORIO', 'PARAISO'];

/**
 * Hook managing ambient audio lifecycle.
 * Crossfades between phase soundscapes when currentPhase changes.
 * Ducks volume when mic is active to prevent bleed into recordings.
 */
export function useAmbientAudio(
  currentPhase: NarrativePhase,
  isActive: boolean,
  micActive: boolean = false,
): void {
  const playerRef = useRef<AmbientPlayer | null>(null);
  const [loaded, setLoaded] = useState(false);

  // Initialize AmbientPlayer when AudioContext becomes available
  useEffect(() => {
    if (!isActive) return;

    const ctx = getAudioContext();
    if (!ctx) return;

    if (!playerRef.current) {
      playerRef.current = new AmbientPlayer(ctx);

      // Load tracks in background (don't block)
      playerRef.current.loadAllTracks()
        .then(() => { setLoaded(true); })
        .catch((err) => {
          console.warn('Failed to load ambient tracks (non-fatal):', err);
          // Ambient is enhancement, not required -- experience continues without it
        });
    }

    return () => {
      playerRef.current?.dispose();
      playerRef.current = null;
      setLoaded(false);
    };
  }, [isActive]);

  // Crossfade on phase change (or when tracks finish loading)
  useEffect(() => {
    if (!isActive || !playerRef.current || !loaded) return;

    // DEVOLUCAO: continues previous phase's ambient
    // ENCERRAMENTO: fade out
    if (currentPhase === 'ENCERRAMENTO') {
      playerRef.current.stop(2.5);
    } else if (AMBIENT_PHASES.includes(currentPhase)) {
      playerRef.current.crossfadeTo(currentPhase, 2.5);
    }
  }, [currentPhase, isActive, loaded]);

  // Duck ambient when mic is active, restore when mic stops
  useEffect(() => {
    if (!playerRef.current || !loaded) return;

    if (micActive) {
      playerRef.current.duck(0.3);
    } else {
      playerRef.current.unduck(0.5);
    }
  }, [micActive, loaded]);
}
