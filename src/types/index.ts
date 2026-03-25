/** Segment of speech with optional pause after */
export interface SpeechSegment {
  text: string;
  pauseAfter?: number; // milliseconds
}

/** Narrative phases matching PRD Section 6 */
export type NarrativePhase =
  | 'APRESENTACAO'
  | 'INFERNO'
  | 'PURGATORIO'
  | 'PARAISO'
  | 'DEVOLUCAO'
  | 'ENCERRAMENTO';

/** Inferno choice: Vozes (A) or Silencio (B) */
export type Choice1 = 'A' | 'B' | null;

/** Purgatorio choice depends on path */
export type Choice2 = 'FICAR' | 'EMBORA' | 'PISAR' | 'CONTORNAR' | null;

/** Complete path through experience */
export type ExperiencePath = 'A_FICAR' | 'A_EMBORA' | 'B_PISAR' | 'B_CONTORNAR';

/** Voice direction per phase for SpeechSynthesis approximation (per CONTEXT.md) */
export interface VoiceDirection {
  rate: number;   // SpeechSynthesis rate (0.1-10, default 1)
  pitch: number;  // SpeechSynthesis pitch (0-2, default 1)
  description: string;
}

/** Phase background colors per CONTEXT.md locked decision */
export const PHASE_COLORS: Record<NarrativePhase, string> = {
  APRESENTACAO: '#000000',     // Black
  INFERNO: '#4a0e0e',         // Bordo (dark red)
  PURGATORIO: '#3d4f5c',     // Azul acinzentado (slate blue)
  PARAISO: '#5c4a2a',        // Dourado/ambar (golden brown)
  DEVOLUCAO: '#5c4a2a',      // Continue Paraiso color
  ENCERRAMENTO: '#000000',    // Black
};

/** Voice direction per phase -- SpeechSynthesis approximation of PRD Section 5.1 ElevenLabs settings */
export const VOICE_DIRECTIONS: Record<NarrativePhase, VoiceDirection> = {
  APRESENTACAO: { rate: 0.9, pitch: 1.0, description: 'Calmo, pausado' },
  INFERNO: { rate: 0.8, pitch: 0.8, description: 'Mais grave, mais lento' },
  PURGATORIO: { rate: 0.9, pitch: 0.9, description: 'Intimo, confessional' },
  PARAISO: { rate: 0.85, pitch: 1.1, description: 'Suave, quase sussurro' },
  DEVOLUCAO: { rate: 0.85, pitch: 1.0, description: 'Espelho, voz se dissolve' },
  ENCERRAMENTO: { rate: 0.9, pitch: 1.0, description: 'Retorno ao tom inicial, definitivo' },
};
