import type { VoiceType, ExperienceVersion } from '@/types';

/**
 * Derives voice type from script key name (per D-01).
 * Classification rule (per D-02, D-03, D-04):
 *   VOZ_PERGUNTA: APRESENTACAO, ENCERRAMENTO, *_PERGUNTA, FALLBACK_*, TIMEOUT_*
 *   VOZ_NARRATIVA: everything else (*_INTRO, *_SETUP, *_RESPOSTA_*, DEVOLUCAO_*)
 */
export function getVoiceType(key: string): VoiceType {
  // Explicit bookend names (per D-04)
  if (key === 'APRESENTACAO' || key === 'ENCERRAMENTO') {
    return 'VOZ_PERGUNTA';
  }
  // Prefix matches (per D-03)
  if (key.startsWith('FALLBACK_') || key.startsWith('TIMEOUT_')) {
    return 'VOZ_PERGUNTA';
  }
  // Suffix match (per D-02)
  if (key.endsWith('_PERGUNTA')) {
    return 'VOZ_PERGUNTA';
  }
  // Default: narrative (per D-02)
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
