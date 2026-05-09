import type { VoiceType, ExperienceVersion } from '@/types';

/**
 * Derives voice type from script key name.
 * Classification rule:
 *   VOZ_PERGUNTA: APRESENTACAO, ENCERRAMENTO, *_PERGUNTA, FALLBACK_*, TIMEOUT_*, *_INTRO, *_SETUP
 *   VOZ_NARRATIVA: *_RESPOSTA_*, DEVOLUCAO_* (oracle's formulation/verdict after visitor's choice)
 */
export function getVoiceType(key: string): VoiceType {
  // Explicit bookend names
  if (key === 'APRESENTACAO' || key === 'ENCERRAMENTO') {
    return 'VOZ_PERGUNTA';
  }
  // Prefix matches
  if (key.startsWith('FALLBACK_') || key.startsWith('TIMEOUT_')) {
    return 'VOZ_PERGUNTA';
  }
  // Suffix matches — questions, intros, setups are guide narration (Voz 1)
  if (key.endsWith('_PERGUNTA') || key.endsWith('_INTRO') || key.endsWith('_SETUP')) {
    return 'VOZ_PERGUNTA';
  }
  // Respostas and devoluções are oracle's formulation (Voz 2 somber)
  return 'VOZ_NARRATIVA';
}

/**
 * Returns the ElevenLabs voice ID to use based on version and voice type.
 * V1: always returns ELEVENLABS_VOICE_ID (single voice for all segments).
 * V2: VOZ_PERGUNTA returns ELEVENLABS_VOICE_ID, VOZ_NARRATIVA returns ELEVENLABS_VOICE_ID_V2.
 */
export function getVoiceId(version: ExperienceVersion, voiceType: VoiceType): string {
  const v1Id = process.env.ELEVENLABS_VOICE_ID || '';
  const v2Id = process.env.ELEVENLABS_VOICE_ID_V2 || '';

  if (version === 'V1') {
    return v1Id;
  }
  // V2: questions use original voice, narrative uses somber voice
  return voiceType === 'VOZ_PERGUNTA' ? v1Id : v2Id;
}
